import pool from '../config/database.js';

export class Enseignant {
    /**
     * Récupérer tous les enseignants
     * CORRECTION : nom/prenom/email/telephone sont des colonnes
     * de `enseignant` directement (et `utilisateur` n'a pas de colonne
     * `telephone`).
     */
    static async findAll() {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(`
                SELECT id, nom, prenom, email, telephone
                FROM enseignant
                ORDER BY nom, prenom
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
                SELECT id, nom, prenom, email, telephone
                FROM enseignant
                WHERE id = ?
            `, [id]);
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les élèves d'un enseignant (ses référents)
     * CORRECTIONS :
     *  - `referent.annee_scolaire` est un VARCHAR direct
     *    (plus de table `annee_scolaire` ni de sous-requête)
     *  - `eleve.identifiant` (pas `identifiant_csv`)
     *  - nom/prenom de l'élève dans `eleve` directement
     */
    static async getEleves(id, annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();

            const data = await conn.query(`
                SELECT DISTINCT
                    e.id,
                    e.nom,
                    e.prenom,
                    e.identifiant,
                    CONCAT(n.numero, c.lettre) AS classe
                FROM referent r
                INNER JOIN eleve e ON e.id = r.id_eleve
                LEFT  JOIN inscription i
                       ON i.id_eleve = e.id
                      AND i.annee_scolaire = r.annee_scolaire
                LEFT  JOIN classe c ON c.id = i.id_classe
                LEFT  JOIN niveau n ON n.id = c.id_niveau
                WHERE r.id_enseignant = ?
                  AND r.annee_scolaire = ?
                ORDER BY e.nom, e.prenom
            `, [id, annee]);

            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer un enseignant
     * CORRECTIONS MAJEURES :
     *  - le rôle "enseignant" a id = 2 (pas 3, qui est "eleve")
     *  - `utilisateur` n'a PAS de colonne `telephone` → le telephone va
     *    dans `enseignant`
     *  - on insère explicitement nom/prenom/email/telephone dans `enseignant`
     *  - le mot de passe doit être un vrai hash bcrypt (placeholder ici,
     *    le controller doit le hasher avant)
     *  - on enveloppe les deux INSERT dans une transaction pour éviter
     *    qu'un utilisateur orphelin reste si le second INSERT échoue
     */
    static async create(data) {
        const {
            nom,
            prenom,
            email,
            telephone = null,
            identifiant,
            motDePasseHash // hash bcrypt déjà calculé par le controller
        } = data;

        if (!nom || !prenom || !email || !identifiant || !motDePasseHash) {
            throw new Error('Champs requis : nom, prenom, email, identifiant, motDePasseHash');
        }

        let conn;
        try {
            conn = await pool.getConnection();
            await conn.beginTransaction();

            // 1) Créer l'utilisateur (rôle enseignant = 2)
            const userResult = await conn.query(`
                INSERT INTO utilisateur
                    (identifiant, mot_de_passe, nom, prenom, email, id_role, actif)
                VALUES (?, ?, ?, ?, ?, 2, 1)
            `, [identifiant, motDePasseHash, nom, prenom, email]);

            const userId = userResult.insertId;

            // 2) Créer l'enseignant (avec son propre nom/prenom/email/telephone)
            const result = await conn.query(`
                INSERT INTO enseignant (nom, prenom, email, telephone, id_utilisateur)
                VALUES (?, ?, ?, ?, ?)
            `, [nom, prenom, email, telephone, userId]);

            await conn.commit();
            return result.insertId;
        } catch (err) {
            if (conn) await conn.rollback();
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Mettre à jour un enseignant
     * CORRECTION : on met à jour `enseignant` (et accessoirement
     * `utilisateur` pour garder la cohérence des nom/prenom/email).
     */
    static async update(id, data) {
        const { nom, prenom, email, telephone } = data;

        let conn;
        try {
            conn = await pool.getConnection();
            await conn.beginTransaction();

            const rows = await conn.query(
                'SELECT id_utilisateur FROM enseignant WHERE id = ?',
                [id]
            );

            if (rows.length === 0) {
                await conn.rollback();
                throw new Error('Enseignant introuvable');
            }

            const userId = rows[0].id_utilisateur;

            // Mettre à jour l'enseignant
            await conn.query(`
                UPDATE enseignant
                SET nom = ?, prenom = ?, email = ?, telephone = ?
                WHERE id = ?
            `, [nom, prenom, email, telephone || null, id]);

            // Mettre à jour l'utilisateur lié si présent (sans le téléphone, absent de la table)
            if (userId) {
                await conn.query(`
                    UPDATE utilisateur
                    SET nom = ?, prenom = ?, email = ?
                    WHERE id = ?
                `, [nom, prenom, email, userId]);
            }

            await conn.commit();
            return await this.findById(id);
        } catch (err) {
            if (conn) await conn.rollback();
            throw err;
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
            await conn.beginTransaction();

            const rows = await conn.query(
                'SELECT id_utilisateur FROM enseignant WHERE id = ?',
                [id]
            );

            if (rows.length === 0) {
                await conn.rollback();
                throw new Error('Enseignant introuvable');
            }

            const userId = rows[0].id_utilisateur;

            await conn.query('DELETE FROM enseignant WHERE id = ?', [id]);
            if (userId) {
                await conn.query('DELETE FROM utilisateur WHERE id = ?', [userId]);
            }

            await conn.commit();
            return true;
        } catch (err) {
            if (conn) await conn.rollback();
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }
}