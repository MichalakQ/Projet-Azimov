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
     * Récupérer les options d'un élève pour une année
     */
    static async getByEleve(idEleve, annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(`
                SELECT o.*, eo.annee_scolaire 
                FROM eleve_option eo
                JOIN option_scolaire o ON o.id = eo.id_option
                WHERE eo.id_eleve = ? AND eo.annee_scolaire = ?
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
            await conn.query(`
                INSERT INTO eleve_option (id_eleve, id_option, annee_scolaire)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE id_option = ?
            `, [idEleve, idOption, annee, idOption]);
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
            const result = await conn.query(`
                DELETE FROM eleve_option 
                WHERE id_eleve = ? AND id_option = ? AND annee_scolaire = ?
            `, [idEleve, idOption, annee]);
            return result.affectedRows > 0;
        } finally {
            if (conn) conn.release();
        }
    }
}
