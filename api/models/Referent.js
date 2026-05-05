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
                ON DUPLICATE KEY UPDATE id_enseignant = VALUES(id_enseignant)
            `, [idEnseignant, idEleve, annee]);
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
     * Affectation round-robin (alterne les enseignants).
     * CORRECTION : la procédure stockée `sp_affecter_referents_round_robin`
     * n'existait pas dans le schéma. On implémente la logique directement
     * en JS, dans une transaction.
     *
     * Algo :
     *   1. on récupère la liste des enseignants (triée)
     *   2. on récupère la liste des élèves inscrits pour cette année
     *      qui n'ont pas encore de référent
     *   3. on les affecte à tour de rôle
     */
    static async roundRobin(annee) {
        let conn;
        try {
            conn = await pool.getConnection();
            await conn.beginTransaction();

            const enseignants = await conn.query(
                'SELECT id FROM enseignant ORDER BY id'
            );
            if (enseignants.length === 0) {
                await conn.rollback();
                throw new Error('Aucun enseignant disponible pour le round-robin');
            }

            const eleves = await conn.query(`
                SELECT i.id_eleve
                FROM inscription i
                LEFT JOIN referent r
                    ON r.id_eleve = i.id_eleve
                   AND r.annee_scolaire = i.annee_scolaire
                WHERE i.annee_scolaire = ?
                  AND r.id IS NULL
                ORDER BY i.id_eleve
            `, [annee]);

            let nbAffectes = 0;
            for (let i = 0; i < eleves.length; i++) {
                const idEnseignant = enseignants[i % enseignants.length].id;
                await conn.query(
                    `INSERT INTO referent (id_enseignant, id_eleve, annee_scolaire)
                     VALUES (?, ?, ?)`,
                    [idEnseignant, eleves[i].id_eleve, annee]
                );
                nbAffectes++;
            }

            await conn.commit();
            return { nbAffectes, nbEnseignants: enseignants.length };
        } catch (err) {
            if (conn) await conn.rollback();
            throw err;
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
                SELECT
                    r.id_enseignant,
                    ens.nom,
                    ens.prenom,
                    COUNT(r.id_eleve) AS nb_eleves
                FROM referent r
                JOIN enseignant ens ON ens.id = r.id_enseignant
                WHERE r.annee_scolaire = ?
                GROUP BY r.id_enseignant, ens.nom, ens.prenom
                ORDER BY nb_eleves DESC
            `, [annee]);

            // Conversion BigInt -> Number
            return data.map(row => ({
                ...row,
                nb_eleves: Number(row.nb_eleves)
            }));
        } finally {
            if (conn) conn.release();
        }
    }
}