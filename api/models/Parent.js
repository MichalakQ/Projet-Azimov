import pool from '../config/database.js';

export class Parent {
    /**
     * Récupérer tous les parents
     */
    static async findAll() {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query('SELECT * FROM parent ORDER BY nom');
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer un parent par ID
     */
    static async findById(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query('SELECT * FROM parent WHERE id = ?', [id]);
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les parents d'un élève
     */
    static async getByEleve(idEleve) {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(`
                SELECT p.*, ep.lien 
                FROM parent p
                JOIN eleve_parent ep ON ep.id_parent = p.id 
                WHERE ep.id_eleve = ?
            `, [idEleve]);
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les données de publipostage (courriers parents)
     */
    static async getPublipostage(annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(
                'SELECT * FROM v_publipostage_parents WHERE annee_scolaire = ? ORDER BY nom_parent',
                [annee]
            );
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Ajouter un parent à un élève
     */
    static async addToEleve(idEleve, idParent, lien = 'parent') {
        let conn;
        try {
            conn = await pool.getConnection();
            await conn.query(`
                INSERT INTO eleve_parent (id_eleve, id_parent, lien)
                VALUES (?, ?, ?)
            `, [idEleve, idParent, lien]);
            return true;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retirer un parent d'un élève
     */
    static async removeFromEleve(idEleve, idParent) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query(`
                DELETE FROM eleve_parent 
                WHERE id_eleve = ? AND id_parent = ?
            `, [idEleve, idParent]);
            return result.affectedRows > 0;
        } finally {
            if (conn) conn.release();
        }
    }
}
