import pool from '../config/database.js';

export class Option {
    /**
     * Récupérer toutes les options
     */
    static async findAll() {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query('SELECT * FROM option_scolaire ORDER BY categorie, libelle');
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer une option par ID
     */
    static async findById(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query('SELECT * FROM option_scolaire WHERE id = ?', [id]);
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * ✅ CORRIGÉ: Joindre avec annee_scolaire et comparer par libelle
     * Récupérer les options d'un élève pour une année
     */
    static async getByEleve(idEleve, annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            
            // ✅ CORRIGÉ: Joindre avec annee_scolaire
            // La table eleve_option stocke id_annee_scolaire (INT), pas annee_scolaire (STRING)
            const data = await conn.query(`
                SELECT o.id, o.libelle, o.categorie, a.libelle as annee_scolaire
                FROM eleve_option eo
                INNER JOIN option_scolaire o ON o.id = eo.id_option
                INNER JOIN annee_scolaire a ON a.id = eo.id_annee_scolaire  -- ✅ AJOUTER JOIN
                WHERE eo.id_eleve = ? AND a.libelle = ?  -- ✅ Comparer a.libelle
            `, [idEleve, annee]);
            
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Ajouter une option à un élève
     */
    static async addToEleve(idEleve, idOption, annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            
            // Récupérer l'id de l'année scolaire
            const anneeRows = await conn.query(
                'SELECT id FROM annee_scolaire WHERE libelle = ?',
                [annee]
            );
            
            if (anneeRows.length === 0) {
                throw new Error('Année scolaire inexistante');
            }
            
            const idAnneeScolaire = anneeRows[0].id;
            
            await conn.query(`
                INSERT INTO eleve_option (id_eleve, id_option, id_annee_scolaire)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE id_option = ?
            `, [idEleve, idOption, idAnneeScolaire, idOption]);
            
            return true;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retirer une option à un élève
     */
    static async removeFromEleve(idEleve, idOption, annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            
            // Récupérer l'id de l'année scolaire
            const anneeRows = await conn.query(
                'SELECT id FROM annee_scolaire WHERE libelle = ?',
                [annee]
            );
            
            if (anneeRows.length === 0) {
                throw new Error('Année scolaire inexistante');
            }
            
            const idAnneeScolaire = anneeRows[0].id;
            
            const result = await conn.query(`
                DELETE FROM eleve_option 
                WHERE id_eleve = ? AND id_option = ? AND id_annee_scolaire = ?
            `, [idEleve, idOption, idAnneeScolaire]);
            
            return result.affectedRows > 0;
        } finally {
            if (conn) conn.release();
        }
    }
}