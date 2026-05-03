import pool from '../config/database.js';

export class Eleve {
    /**
     * ✅ CORRIGÉ: Joindre avec utilisateur pour récupérer nom/prenom
     * Récupérer tous les élèves avec pagination
     */
    static async findAll(page = 1, limit = 20) {
        let conn;
        try {
            conn = await pool.getConnection();
            const offset = (page - 1) * limit;
            
            // ✅ CORRIGÉ: Joindre avec utilisateur
            const data = await conn.query(`
                SELECT 
                    e.id,
                    u.nom,                      -- ✅ De utilisateur
                    u.prenom,                   -- ✅ De utilisateur
                    e.identifiant_csv AS identifiant,
                    e.date_naissance,
                    u.email,                    -- ✅ AJOUTÉ
                    u.telephone,                -- ✅ AJOUTÉ
                    CONCAT(n.numero, c.lettre) AS classe,
                    n.libelle AS niveau,
                    e.date_creation
                FROM eleve e
                INNER JOIN utilisateur u ON u.id = e.id_utilisateur  -- ✅ AJOUTER JOIN
                LEFT JOIN inscription i ON i.id_eleve = e.id
                LEFT JOIN classe c ON c.id = i.id_classe
                LEFT JOIN niveau n ON n.id = c.id_niveau
                GROUP BY e.id, u.id
                ORDER BY u.nom, u.prenom
                LIMIT ? OFFSET ?
            `, [limit, offset]);
            
            const countResult = await conn.query('SELECT COUNT(*) as total FROM eleve');
            const total = Number(countResult[0].total);
            
            return {
                data: data,
                count: total,
                page: page,
                totalPages: Math.ceil(total / limit)
            };
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * ✅ CORRIGÉ: Joindre avec utilisateur pour récupérer nom/prenom
     * Récupérer un élève par ID
     */
    static async findById(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            // ✅ CORRIGÉ: Joindre avec utilisateur
            const rows = await conn.query(`
                SELECT 
                    e.id,
                    u.nom,                      -- ✅ De utilisateur
                    u.prenom,                   -- ✅ De utilisateur
                    e.identifiant_csv AS identifiant,
                    e.date_naissance,
                    u.email,                    -- ✅ AJOUTÉ
                    u.telephone,                -- ✅ AJOUTÉ
                    CONCAT(n.numero, c.lettre) AS classe,
                    n.libelle AS niveau,
                    e.date_creation
                FROM eleve e
                INNER JOIN utilisateur u ON u.id = e.id_utilisateur  -- ✅ AJOUTER JOIN
                LEFT JOIN inscription i ON i.id_eleve = e.id
                LEFT JOIN classe c ON c.id = i.id_classe
                LEFT JOIN niveau n ON n.id = c.id_niveau
                WHERE e.id = ?
            `, [id]);
            
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * ✅ CORRIGÉ: Chercher dans utilisateur au lieu de eleve
     * Chercher des élèves par nom/prénom
     */
    static async search(query) {
        let conn;
        try {
            conn = await pool.getConnection();
            const searchTerm = `%${query}%`;
            
            // ✅ CORRIGÉ: Joindre avec utilisateur et chercher dans u.nom/u.prenom
            const data = await conn.query(`
                SELECT 
                    e.id,
                    u.nom,                      -- ✅ De utilisateur
                    u.prenom,                   -- ✅ De utilisateur
                    e.identifiant_csv AS identifiant,
                    e.date_naissance,
                    u.email,
                    u.telephone,
                    CONCAT(n.numero, c.lettre) AS classe,
                    n.libelle AS niveau
                FROM eleve e
                INNER JOIN utilisateur u ON u.id = e.id_utilisateur  -- ✅ AJOUTER JOIN
                LEFT JOIN inscription i ON i.id_eleve = e.id
                LEFT JOIN classe c ON c.id = i.id_classe
                LEFT JOIN niveau n ON n.id = c.id_niveau
                WHERE u.nom LIKE ? OR u.prenom LIKE ? OR e.identifiant_csv LIKE ?  -- ✅ Chercher dans utilisateur
                ORDER BY u.nom, u.prenom
            `, [searchTerm, searchTerm, searchTerm]);
            
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les statistiques COMPLÈTES d'un élève
     */
    static async getStatistiques(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const rows = await conn.query(`
                SELECT 
                    e.id,
                    u.nom,
                    u.prenom,
                    u.email,
                    u.telephone,
                    e.identifiant_csv AS identifiant,
                    e.date_naissance,
                    CONCAT(n.numero, c.lettre) AS classe,
                    n.libelle AS niveau,
                    u_ref.prenom AS prenom_referent,
                    u_ref.nom AS nom_referent
                FROM eleve e
                INNER JOIN utilisateur u ON u.id = e.id_utilisateur
                LEFT JOIN inscription i ON i.id_eleve = e.id
                LEFT JOIN classe c ON c.id = i.id_classe
                LEFT JOIN niveau n ON n.id = c.id_niveau
                LEFT JOIN referent r ON r.id_eleve = e.id
                LEFT JOIN enseignant ens ON ens.id = r.id_enseignant
                LEFT JOIN utilisateur u_ref ON u_ref.id = ens.id_utilisateur
                WHERE e.id = ?
                LIMIT 1
            `, [id]);
            
            if (rows.length === 0) return null;
            
            const eleve = rows[0];
            
            const moyennes = await conn.query(`
                SELECT 
                    m.id,
                    m.id_eleve,
                    m.valeur,
                    m.semestre,
                    a.libelle AS annee_scolaire,
                    m.validee,
                    m.date_saisie
                FROM moyenne m
                LEFT JOIN annee_scolaire a ON a.id = m.id_annee_scolaire
                WHERE m.id_eleve = ?
                ORDER BY a.libelle DESC, m.semestre DESC
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
                SELECT DISTINCT 
                    u.nom,
                    u.prenom,
                    u.email,
                    u.telephone,
                    ep.lien
                FROM eleve_parent ep
                INNER JOIN parent p ON p.id = ep.id_parent
                INNER JOIN utilisateur u ON u.id = p.id_utilisateur
                WHERE ep.id_eleve = ?
                ORDER BY ep.lien
            `, [id]);
            
            return {
                ...eleve,
                moyennes: moyennes.map(m => ({
                    ...m,
                    valeur: Number(m.valeur)
                })),
                options: options,
                parents: parents
            };
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * ✅ CORRIGÉ: N'insérer QUE id_utilisateur et identifiant_csv
     * Les colonnes nom/prenom n'existent PAS dans eleve !
     * L'utilisateur est créé AVANT par le controller
     */
    static async create(data) {
        const { identifiant, id_utilisateur, date_naissance } = data;
        
        if (!id_utilisateur || !identifiant) {
            throw new Error('Champs requis: id_utilisateur, identifiant');
        }
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            // ✅ CORRIGÉ: Insérer SEULEMENT dans les colonnes qui existent
            const result = await conn.query(`
                INSERT INTO eleve (id_utilisateur, identifiant_csv, date_naissance, date_creation)
                VALUES (?, ?, ?, NOW())
            `, [id_utilisateur, identifiant, date_naissance || null]);
            
            console.log("✅ Élève créé avec succès (id=" + result.insertId + ")");
            return result.insertId;
            
        } catch (error) {
            console.error("❌ Erreur création élève:", error.message);
            throw error;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Mettre à jour un élève
     */
    static async update(id, data) {
        const { date_naissance, classe } = data;
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            // Mettre à jour eleve
            if (date_naissance) {
                await conn.query(
                    'UPDATE eleve SET date_naissance = ? WHERE id = ?',
                    [date_naissance, id]
                );
            }
            
            // Mettre à jour inscription si classe changée
            if (classe) {
                const classeId = await conn.query(
                    'SELECT id FROM classe WHERE CONCAT(numero, lettre) = ?',
                    [classe]
                );
                
                if (classeId.length > 0) {
                    await conn.query(
                        'UPDATE inscription SET id_classe = ? WHERE id_eleve = ?',
                        [classeId[0].id, id]
                    );
                }
            }
            
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
     * Inscrire un élève à une classe
     */
    static async inscribeToClasse(idEleve, idClasse) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const result = await conn.query(`
                INSERT INTO inscription (id_eleve, id_classe)
                VALUES (?, ?)
            `, [idEleve, idClasse]);
            
            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }
}