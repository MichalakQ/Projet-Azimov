import pool from '../config/database.js';

export class Enseignant {
    /**
     * Récupérer tous les enseignants
     */
    static async findAll() {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const data = await conn.query(`
                SELECT 
                    e.id,
                    u.nom,
                    u.prenom,
                    u.email,
                    u.telephone
                FROM enseignant e
                INNER JOIN utilisateur u ON u.id = e.id_utilisateur
                ORDER BY u.nom, u.prenom
            `);
            
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer un enseignant par ID
     */
    static async findById(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const rows = await conn.query(`
                SELECT 
                    e.id,
                    u.nom,
                    u.prenom,
                    u.email,
                    u.telephone
                FROM enseignant e
                INNER JOIN utilisateur u ON u.id = e.id_utilisateur
                WHERE e.id = ?
            `, [id]);
            
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les élèves d'un enseignant (ses référents)
     */
    static async getEleves(id, annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const data = await conn.query(`
                SELECT DISTINCT
                    e.id,
                    u_eleve.nom,
                    u_eleve.prenom,
                    e.identifiant_csv AS identifiant,
                    CONCAT(n.numero, c.lettre) AS classe
                FROM referent r 
                INNER JOIN enseignant ens ON ens.id = r.id_enseignant
                INNER JOIN eleve e ON e.id = r.id_eleve
                INNER JOIN utilisateur u_eleve ON u_eleve.id = e.id_utilisateur
                LEFT JOIN inscription i ON i.id_eleve = e.id
                LEFT JOIN classe c ON c.id = i.id_classe 
                LEFT JOIN niveau n ON n.id = c.id_niveau
                WHERE ens.id = ? AND r.id_annee_scolaire = (
                    SELECT id FROM annee_scolaire WHERE libelle = ?
                )
                ORDER BY u_eleve.nom, u_eleve.prenom
            `, [id, annee]);
            
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer un enseignant
     */
    static async create(data) {
        const { nom, prenom, email, telephone, identifiant } = data;
        
        if (!nom || !prenom || !email || !identifiant) {
            throw new Error('Champs requis: nom, prenom, email, identifiant');
        }
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            // Créer utilisateur avec rôle enseignant (3)
            const userResult = await conn.query(`
                INSERT INTO utilisateur (identifiant, mot_de_passe, nom, prenom, email, telephone, id_role, actif)
                VALUES (?, ?, ?, ?, ?, ?, 3, 1)
            `, [identifiant, 'hashed_password', nom, prenom, email, telephone || null]);
            
            const userId = userResult.insertId;
            
            // Créer enseignant
            const result = await conn.query(`
                INSERT INTO enseignant (id_utilisateur)
                VALUES (?)
            `, [userId]);
            
            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Mettre à jour un enseignant
     */
    static async update(id, data) {
        const { nom, prenom, email, telephone } = data;
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            // Récupérer l'id_utilisateur
            const rows = await conn.query(
                'SELECT id_utilisateur FROM enseignant WHERE id = ?',
                [id]
            );
            
            if (rows.length === 0) {
                throw new Error('Enseignant non trouvé');
            }
            
            const userId = rows[0].id_utilisateur;
            
            // Mettre à jour l'utilisateur
            await conn.query(
                'UPDATE utilisateur SET nom = ?, prenom = ?, email = ?, telephone = ? WHERE id = ?',
                [nom, prenom, email, telephone || null, userId]
            );
            
            return await this.findById(id);
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Supprimer un enseignant
     */
    static async delete(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            // Récupérer l'id_utilisateur
            const rows = await conn.query(
                'SELECT id_utilisateur FROM enseignant WHERE id = ?',
                [id]
            );
            
            if (rows.length === 0) {
                throw new Error('Enseignant non trouvé');
            }
            
            const userId = rows[0].id_utilisateur;
            
            // Supprimer l'enseignant
            await conn.query('DELETE FROM enseignant WHERE id = ?', [id]);
            
            // Supprimer l'utilisateur
            await conn.query('DELETE FROM utilisateur WHERE id = ?', [userId]);
            
            return true;
        } finally {
            if (conn) conn.release();
        }
    }
}