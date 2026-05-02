import pool from '../config/database.js';

export class Classe {
    /**
     * Récupérer toutes les classes d'une année
     */
    static async findAll(annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(`
                SELECT c.id, CONCAT(n.numero, c.lettre) AS nom, n.libelle AS niveau,
                       c.annee_scolaire, COUNT(i.id) AS nb_eleves
                FROM classe c 
                JOIN niveau n ON n.id = c.id_niveau
                LEFT JOIN inscription i ON i.id_classe = c.id
                WHERE c.annee_scolaire = ? 
                GROUP BY c.id 
                ORDER BY n.numero DESC, c.lettre
            `, [annee]);
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer une classe par ID
     */
    static async findById(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query('SELECT * FROM classe WHERE id = ?', [id]);
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer tous les niveaux
     */
    static async getNiveaux() {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query('SELECT * FROM niveau ORDER BY numero DESC');
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les élèves d'une classe
     */
    static async getEleves(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(`
                SELECT e.id, e.nom, e.prenom, e.identifiant
                FROM inscription i 
                JOIN eleve e ON e.id = i.id_eleve
                WHERE i.id_classe = ? 
                ORDER BY e.nom
            `, [id]);
            return data;
        } finally {
            if (conn) conn.release();
        }
    }
}
