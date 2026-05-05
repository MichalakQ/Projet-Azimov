import pool from '../config/database.js';

export class Moyenne {
    /**
     * Récupérer les moyennes d'un élève
     * CORRECTIONS :
     *  - `m.annee_scolaire` est une colonne VARCHAR
     *    (plus de jointure sur une table `annee_scolaire`)
     *  - on joint l'inscription sur la même année que la moyenne
     */
    static async findByEleve(idEleve) {
        let conn;
        try {
            conn = await pool.getConnection();

            const data = await conn.query(`
                SELECT
                    m.id,
                    m.valeur,
                    m.semestre,
                    m.annee_scolaire,
                    m.validee,
                    CONCAT(n.numero, c.lettre) AS classe
                FROM moyenne m
                LEFT JOIN inscription i
                       ON i.id_eleve = m.id_eleve
                      AND i.annee_scolaire = m.annee_scolaire
                LEFT JOIN classe c ON c.id = i.id_classe
                LEFT JOIN niveau n ON n.id = c.id_niveau
                WHERE m.id_eleve = ?
                ORDER BY m.annee_scolaire DESC, m.semestre DESC
            `, [idEleve]);

            return data.map(row => ({
                ...row,
                valeur: Number(row.valeur)
            }));
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les moyennes par niveau
     */
    static async findByNiveau(annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();

            const data = await conn.query(`
                SELECT
                    n.numero AS niveau,
                    n.libelle AS libelle_niveau,
                    m.semestre,
                    ROUND(AVG(m.valeur), 2) AS moyenne_niveau,
                    COUNT(DISTINCT m.id_eleve) AS nb_eleves,
                    m.annee_scolaire
                FROM moyenne m
                INNER JOIN inscription i
                       ON i.id_eleve = m.id_eleve
                      AND i.annee_scolaire = m.annee_scolaire
                INNER JOIN classe c ON c.id = i.id_classe
                INNER JOIN niveau n ON n.id = c.id_niveau
                WHERE m.annee_scolaire = ?
                  AND m.validee = TRUE
                GROUP BY n.id, n.numero, n.libelle, m.semestre, m.annee_scolaire
                ORDER BY n.numero DESC, m.semestre
            `, [annee]);

            return data.map(row => ({
                ...row,
                nb_eleves: Number(row.nb_eleves),
                moyenne_niveau: Number(row.moyenne_niveau)
            }));
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les moyennes en attente de validation
     * CORRECTION : nom/prenom de l'élève dans `eleve` directement
     */
    static async findEnAttente() {
        let conn;
        try {
            conn = await pool.getConnection();

            const data = await conn.query(`
                SELECT
                    m.id,
                    e.nom,
                    e.prenom,
                    CONCAT(n.numero, c.lettre) AS classe,
                    m.semestre,
                    m.valeur,
                    m.annee_scolaire,
                    m.validee,
                    m.date_saisie
                FROM moyenne m
                INNER JOIN eleve e ON e.id = m.id_eleve
                LEFT  JOIN inscription i
                       ON i.id_eleve = m.id_eleve
                      AND i.annee_scolaire = m.annee_scolaire
                LEFT  JOIN classe c ON c.id = i.id_classe
                LEFT  JOIN niveau n ON n.id = c.id_niveau
                WHERE m.validee = FALSE
                ORDER BY m.date_saisie
            `);

            return data.map(row => ({
                ...row,
                valeur: Number(row.valeur)
            }));
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer une moyenne par ID
     */
    static async findById(id) {
        let conn;
        try {
            conn = await pool.getConnection();

            const rows = await conn.query(`
                SELECT
                    m.id,
                    m.id_eleve,
                    m.valeur,
                    m.semestre,
                    m.annee_scolaire,
                    m.validee,
                    m.date_saisie,
                    m.date_validation,
                    m.saisie_par,
                    m.validee_par
                FROM moyenne m
                WHERE m.id = ?
            `, [id]);

            if (rows.length === 0) return null;

            return {
                ...rows[0],
                valeur: Number(rows[0].valeur)
            };
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer une nouvelle moyenne
     * CORRECTIONS :
     *  - colonne `saisie_par` (pas `id_saisie_par`)
     *  - colonne `annee_scolaire` (VARCHAR), pas `id_annee_scolaire`
     */
    static async create(data) {
        const { id_eleve, annee_scolaire, semestre, valeur, saisie_par } = data;

        if (valeur < 0 || valeur > 20) {
            throw new Error('Valeur entre 0 et 20');
        }

        if (![1, 2].includes(Number(semestre))) {
            throw new Error('Semestre : 1 ou 2');
        }

        if (!id_eleve || !annee_scolaire || !saisie_par) {
            throw new Error('Champs requis : id_eleve, annee_scolaire, saisie_par');
        }

        let conn;
        try {
            conn = await pool.getConnection();

            const result = await conn.query(`
                INSERT INTO moyenne
                    (id_eleve, annee_scolaire, semestre, valeur, saisie_par)
                VALUES (?, ?, ?, ?, ?)
            `, [id_eleve, annee_scolaire, semestre, valeur, saisie_par]);

            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Valider une moyenne
     * CORRECTION : la colonne s'appelle `validee_par` (pas `id_valide_par`).
     */
    static async valider(id, idValideur) {
        let conn;
        try {
            conn = await pool.getConnection();

            const result = await conn.query(`
                UPDATE moyenne
                SET validee = TRUE,
                    validee_par = ?,
                    date_validation = NOW()
                WHERE id = ? AND validee = FALSE
            `, [idValideur, id]);

            if (result.affectedRows === 0) {
                throw new Error('Moyenne introuvable ou déjà validée');
            }

            return await this.findById(id);
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Corriger une moyenne (la repasse en non-validée)
     */
    static async corriger(id, valeur) {
        if (valeur < 0 || valeur > 20) {
            throw new Error('Valeur entre 0 et 20');
        }

        let conn;
        try {
            conn = await pool.getConnection();

            await conn.query(`
                UPDATE moyenne
                SET valeur = ?,
                    validee = FALSE,
                    validee_par = NULL,
                    date_validation = NULL
                WHERE id = ?
            `, [valeur, id]);

            return await this.findById(id);
        } finally {
            if (conn) conn.release();
        }
    }
}