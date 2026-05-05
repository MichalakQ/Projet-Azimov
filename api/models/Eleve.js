import pool from '../config/database.js';

export class Eleve {
    /**
     * Récupérer tous les élèves avec pagination
     * CORRECTIONS :
     *  - `e.identifiant` (et non `identifiant_csv`)
     *  - jointure inscription/classe filtrée sur l'année (sinon DISTINCT bizarre)
     */
    static async findAll(page = 1, limit = 20, annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            const offset = (page - 1) * limit;

            const data = await conn.query(`
                SELECT
                    e.id,
                    e.nom,
                    e.prenom,
                    e.identifiant,
                    e.date_naissance,
                    CONCAT(n.numero, c.lettre) AS classe,
                    n.libelle AS niveau,
                    e.date_creation
                FROM eleve e
                LEFT JOIN inscription i
                       ON i.id_eleve = e.id
                      AND i.annee_scolaire = ?
                LEFT JOIN classe c ON c.id = i.id_classe
                LEFT JOIN niveau n ON n.id = c.id_niveau
                ORDER BY e.nom, e.prenom
                LIMIT ? OFFSET ?
            `, [annee, limit, offset]);

            const countResult = await conn.query('SELECT COUNT(*) AS total FROM eleve');
            const total = Number(countResult[0].total);

            return {
                data,
                count: total,
                page,
                totalPages: Math.ceil(total / limit)
            };
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer un élève par ID
     */
    static async findById(id, annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query(`
                SELECT
                    e.id,
                    e.nom,
                    e.prenom,
                    e.identifiant,
                    e.date_naissance,
                    CONCAT(n.numero, c.lettre) AS classe,
                    n.libelle AS niveau,
                    e.date_creation
                FROM eleve e
                LEFT JOIN inscription i
                       ON i.id_eleve = e.id
                      AND i.annee_scolaire = ?
                LEFT JOIN classe c ON c.id = i.id_classe
                LEFT JOIN niveau n ON n.id = c.id_niveau
                WHERE e.id = ?
            `, [annee, id]);

            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Chercher des élèves par nom/prénom
     */
    static async search(query, annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            const searchTerm = `%${query}%`;

            const data = await conn.query(`
                SELECT
                    e.id,
                    e.nom,
                    e.prenom,
                    e.identifiant,
                    e.date_naissance,
                    CONCAT(n.numero, c.lettre) AS classe,
                    n.libelle AS niveau
                FROM eleve e
                LEFT JOIN inscription i
                       ON i.id_eleve = e.id
                      AND i.annee_scolaire = ?
                LEFT JOIN classe c ON c.id = i.id_classe
                LEFT JOIN niveau n ON n.id = c.id_niveau
                WHERE e.nom LIKE ? OR e.prenom LIKE ?
                ORDER BY e.nom, e.prenom
            `, [annee, searchTerm, searchTerm]);

            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les statistiques COMPLÈTES d'un élève
     * CORRECTIONS :
     *  - `e.identifiant`
     *  - le référent : on lit nom/prenom dans `enseignant` (pas via utilisateur)
     *  - les moyennes : `annee_scolaire` est une colonne directe
     *  - les parents : la table `parent` contient nom/prenom/email/telephone
     *    directement, pas de jointure utilisateur
     */
    static async getStatistiques(id, annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();

            const rows = await conn.query(`
                SELECT
                    e.id,
                    e.nom,
                    e.prenom,
                    e.identifiant,
                    e.date_naissance,
                    CONCAT(n.numero, c.lettre) AS classe,
                    n.libelle AS niveau,
                    ens.prenom AS prenom_referent,
                    ens.nom    AS nom_referent
                FROM eleve e
                LEFT JOIN inscription i
                       ON i.id_eleve = e.id
                      AND i.annee_scolaire = ?
                LEFT JOIN classe c    ON c.id = i.id_classe
                LEFT JOIN niveau n    ON n.id = c.id_niveau
                LEFT JOIN referent r
                       ON r.id_eleve = e.id
                      AND r.annee_scolaire = ?
                LEFT JOIN enseignant ens ON ens.id = r.id_enseignant
                WHERE e.id = ?
                LIMIT 1
            `, [annee, annee, id]);

            if (rows.length === 0) return null;

            const eleve = rows[0];

            const moyennes = await conn.query(`
                SELECT
                    m.id,
                    m.id_eleve,
                    m.valeur,
                    m.semestre,
                    m.annee_scolaire,
                    m.validee,
                    m.date_saisie
                FROM moyenne m
                WHERE m.id_eleve = ?
                ORDER BY m.annee_scolaire DESC, m.semestre DESC
            `, [id]);

            const options = await conn.query(`
                SELECT DISTINCT
                    o.id,
                    o.libelle,
                    o.categorie
                FROM eleve_option eo
                INNER JOIN option_scolaire o ON o.id = eo.id_option
                WHERE eo.id_eleve = ?
                ORDER BY o.categorie, o.libelle
            `, [id]);

            const parents = await conn.query(`
                SELECT
                    p.nom,
                    p.prenom,
                    p.email,
                    p.telephone,
                    p.adresse,
                    ep.lien
                FROM eleve_parent ep
                INNER JOIN parent p ON p.id = ep.id_parent
                WHERE ep.id_eleve = ?
                ORDER BY ep.lien
            `, [id]);

            return {
                ...eleve,
                moyennes: moyennes.map(m => ({
                    ...m,
                    valeur: Number(m.valeur)
                })),
                options,
                parents
            };
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer un élève (l'utilisateur doit déjà exister)
     * CORRECTION : la colonne s'appelle `identifiant` (pas `identifiant_csv`).
     */
    static async create(data) {
        const { nom, prenom, identifiant, id_utilisateur, date_naissance } = data;

        if (!nom || !prenom || !identifiant || !id_utilisateur) {
            throw new Error('Champs requis : nom, prenom, identifiant, id_utilisateur');
        }

        let conn;
        try {
            conn = await pool.getConnection();

            const result = await conn.query(`
                INSERT INTO eleve (id_utilisateur, nom, prenom, identifiant, date_naissance)
                VALUES (?, ?, ?, ?, ?)
            `, [id_utilisateur, nom, prenom, identifiant, date_naissance || null]);

            console.log("✅ Élève créé avec succès (id=" + result.insertId + ")");
            return result.insertId;
        } catch (error) {
            console.error("❌ Erreur création élève :", error.message);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Mettre à jour un élève
     * CORRECTION : on n'envoie pas `undefined` à MariaDB, on lit l'existant
     * pour préserver les valeurs non fournies.
     */
    static async update(id, data) {
        let conn;
        try {
            conn = await pool.getConnection();

            const rows = await conn.query('SELECT nom, prenom FROM eleve WHERE id = ?', [id]);
            if (rows.length === 0) throw new Error('Élève introuvable');

            const nom    = data.nom    ?? rows[0].nom;
            const prenom = data.prenom ?? rows[0].prenom;

            await conn.query(
                'UPDATE eleve SET nom = ?, prenom = ? WHERE id = ?',
                [nom, prenom, id]
            );

            return await this.findById(id);
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Supprimer un élève
     */
    static async delete(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            await conn.query('DELETE FROM eleve WHERE id = ?', [id]);
            return true;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Inscrire un élève dans une classe
     * CORRECTION : `annee_scolaire` est NOT NULL dans `inscription`,
     * il faut donc la fournir.
     */
    static async inscribeToClasse(idEleve, idClasse, annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();

            const result = await conn.query(`
                INSERT INTO inscription (id_eleve, id_classe, annee_scolaire)
                VALUES (?, ?, ?)
            `, [idEleve, idClasse, annee]);

            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }
}