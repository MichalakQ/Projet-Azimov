import pool from '../config/database.js';

export class Referent {
    /**
     * Récupérer tous les référents pour une année
     */
    static async findAll(annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(
                'SELECT * FROM v_eleves_referent WHERE annee_scolaire = ?', 
                [annee]
            );
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer le référent d'un élève pour une année
     */
    static async getByEleve(idEleve, annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query(`
                SELECT r.*, ens.nom AS nom_enseignant, ens.prenom AS prenom_enseignant
                FROM referent r 
                JOIN enseignant ens ON ens.id = r.id_enseignant
                WHERE r.id_eleve = ? AND r.annee_scolaire = ?
            `, [idEleve, annee]);
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Affecter un référent à un élève
     */
    static async assign(idEnseignant, idEleve, annee) {
        let conn;
        try {
            conn = await pool.getConnection();
            await conn.query(`
                INSERT INTO referent (id_enseignant, id_eleve, annee_scolaire) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE id_enseignant = ?
            `, [idEnseignant, idEleve, annee, idEnseignant]);
            return true;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Supprimer l'affectation d'un référent
     */
    static async unassign(idEleve, annee) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query(`
                DELETE FROM referent 
                WHERE id_eleve = ? AND annee_scolaire = ?
            `, [idEleve, annee]);
            return result.affectedRows > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Affectation round-robin (alterne les enseignants)
     */
    static async roundRobin(annee) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query('CALL sp_affecter_referents_round_robin(?)', [annee]);
            return result;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les statistiques sur les référents
     */
    static async getStatistics(annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(`
                SELECT r.id_enseignant, ens.nom, ens.prenom, COUNT(r.id_eleve) AS nb_eleves
                FROM referent r
                JOIN enseignant ens ON ens.id = r.id_enseignant
                WHERE r.annee_scolaire = ?
                GROUP BY r.id_enseignant
                ORDER BY nb_eleves DESC
            `, [annee]);
            return data;
        } finally {
            if (conn) conn.release();
        }
    }
}
