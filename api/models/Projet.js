import pool from '../config/database.js';

export class Projet {
    /**
     * Récupérer tous les projets
     */
    static async findAll() {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(`
                SELECT p.*, e.nom AS responsable_nom, e.prenom AS responsable_prenom
                FROM projet p
                LEFT JOIN eleve e ON e.id = p.id_responsable
                ORDER BY p.date_creation DESC
            `);
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer un projet par ID avec ses participants
     */
    static async findById(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query('SELECT * FROM projet WHERE id = ?', [id]);

            if (rows.length === 0) return null;

            const participants = await conn.query(`
                SELECT e.id, e.nom, e.prenom, pp.date_debut, pp.date_fin, pp.commentaire
                FROM participation_projet pp
                JOIN eleve e ON e.id = pp.id_eleve
                WHERE pp.id_projet = ?
            `, [id]);

            return { ...rows[0], participants };
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer un nouveau projet
     */
    static async create(data) {
        const { titre, description, idResponsable } = data;

        let conn;
        try {
            conn = await pool.getConnection();

            const result = await conn.query(`
                INSERT INTO projet (titre, description, date_creation, statut, id_responsable)
                VALUES (?, ?, CURDATE(), 'en_attente', ?)
            `, [titre, description || null, idResponsable || null]);

            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Mettre à jour un projet
     */
    static async update(id, data) {
        const { titre, description, statut } = data;

        let conn;
        try {
            conn = await pool.getConnection();

            await conn.query(`
                UPDATE projet
                SET titre = ?, description = ?, statut = ?
                WHERE id = ?
            `, [titre, description, statut, id]);

            return await this.findById(id);
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Valider un projet
     * CORRECTION : la colonne s'appelle `valide_par` (pas `id_valideur`).
     */
    static async valider(id, idValideur) {
        let conn;
        try {
            conn = await pool.getConnection();

            await conn.query(
                'UPDATE projet SET statut = ?, valide_par = ? WHERE id = ?',
                ['valide', idValideur, id]
            );

            return await this.findById(id);
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Ajouter un élève à un projet
     */
    static async addParticipant(idProjet, idEleve, data = {}) {
        let conn;
        try {
            conn = await pool.getConnection();

            await conn.query(`
                INSERT INTO participation_projet (id_projet, id_eleve, date_debut, date_fin, commentaire)
                VALUES (?, ?, ?, ?, ?)
            `, [idProjet, idEleve, data.dateDebut || null, data.dateFin || null, data.commentaire || null]);

            return true;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Retirer un élève d'un projet
     */
    static async removeParticipant(idProjet, idEleve) {
        let conn;
        try {
            conn = await pool.getConnection();

            const result = await conn.query(`
                DELETE FROM participation_projet
                WHERE id_projet = ? AND id_eleve = ?
            `, [idProjet, idEleve]);

            return result.affectedRows > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Supprimer un projet
     */
    static async delete(id) {
        let conn;
        try {
            conn = await pool.getConnection();

            const result = await conn.query('DELETE FROM projet WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } finally {
            if (conn) conn.release();
        }
    }
}