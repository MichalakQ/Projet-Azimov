import pool from '../config/database.js';

export class Parent {
    /**
     * Récupérer tous les parents
     */
    static async findAll() {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query('SELECT * FROM parent ORDER BY nom, prenom');
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
     * CORRECTION : la table `parent` contient nom/prenom/email/telephone/adresse
     * directement, pas de jointure avec `utilisateur`.
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
     * CORRECTION : la vue `v_publipostage_parents` n'existait pas dans le
     * schéma. On la remplace par une requête équivalente.
     */
    static async getPublipostage(annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(`
                SELECT
                    p.nom        AS nom_parent,
                    p.prenom     AS prenom_parent,
                    p.email      AS email_parent,
                    p.telephone  AS telephone_parent,
                    p.adresse    AS adresse_parent,
                    ep.lien,
                    e.id         AS id_eleve,
                    e.nom        AS nom_eleve,
                    e.prenom     AS prenom_eleve,
                    CONCAT(n.numero, c.lettre) AS classe,
                    i.annee_scolaire
                FROM parent p
                JOIN eleve_parent ep ON ep.id_parent = p.id
                JOIN eleve e         ON e.id = ep.id_eleve
                JOIN inscription i   ON i.id_eleve = e.id AND i.annee_scolaire = ?
                JOIN classe c        ON c.id = i.id_classe
                JOIN niveau n        ON n.id = c.id_niveau
                ORDER BY p.nom, p.prenom
            `, [annee]);
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