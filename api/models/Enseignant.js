import pool from '../config/database.js';

export class Enseignant {
    /**
     * Récupérer tous les enseignants
     */
    static async findAll() {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query('SELECT * FROM enseignant ORDER BY nom');
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
            const rows = await conn.query('SELECT * FROM enseignant WHERE id = ?', [id]);
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les élèves d'un enseignant (par les références)
     */
    static async getEleves(id, annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(`
                SELECT e.id, e.nom, e.prenom, CONCAT(n.numero, c.lettre) AS classe
                FROM referent r 
                JOIN eleve e ON e.id = r.id_eleve
                JOIN inscription i ON i.id_eleve = e.id AND i.annee_scolaire = r.annee_scolaire
                JOIN classe c ON c.id = i.id_classe 
                JOIN niveau n ON n.id = c.id_niveau
                WHERE r.id_enseignant = ? AND r.annee_scolaire = ? 
                ORDER BY e.nom
            `, [id, annee]);
            return data;
        } finally {
            if (conn) conn.release();
        }
    }
}
