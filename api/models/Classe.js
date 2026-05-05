import pool from '../config/database.js';

export class Classe {
    /**
     * Récupérer toutes les classes d'une année
     * CORRECTIONS :
     *  - `annee_scolaire` est une colonne VARCHAR de `classe`
     *    (pas une table séparée à joindre)
     *  - on filtre les inscriptions sur la même année
     */
    static async findAll(annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();

            const data = await conn.query(`
                SELECT
                    c.id,
                    CONCAT(n.numero, c.lettre) AS nom,
                    n.libelle AS niveau,
                    c.annee_scolaire,
                    COUNT(DISTINCT i.id_eleve) AS nb_eleves
                FROM classe c
                INNER JOIN niveau n ON n.id = c.id_niveau
                LEFT  JOIN inscription i
                       ON i.id_classe = c.id
                      AND i.annee_scolaire = c.annee_scolaire
                WHERE c.annee_scolaire = ?
                GROUP BY c.id, n.numero, c.lettre, n.libelle, c.annee_scolaire
                ORDER BY n.numero DESC, c.lettre
            `, [annee]);

            return data.map(row => ({
                ...row,
                nb_eleves: Number(row.nb_eleves)
            }));
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

            const rows = await conn.query(`
                SELECT
                    c.id,
                    CONCAT(n.numero, c.lettre) AS nom,
                    n.libelle AS niveau,
                    c.annee_scolaire,
                    COUNT(DISTINCT i.id_eleve) AS nb_eleves
                FROM classe c
                INNER JOIN niveau n ON n.id = c.id_niveau
                LEFT  JOIN inscription i
                       ON i.id_classe = c.id
                      AND i.annee_scolaire = c.annee_scolaire
                WHERE c.id = ?
                GROUP BY c.id, n.numero, c.lettre, n.libelle, c.annee_scolaire
            `, [id]);

            if (rows.length === 0) return null;

            return {
                ...rows[0],
                nb_eleves: Number(rows[0].nb_eleves)
            };
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
            const data = await conn.query(`
                SELECT id, numero, libelle
                FROM niveau
                ORDER BY numero DESC
            `);
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les élèves d'une classe
     * CORRECTIONS :
     *  - `eleve.identifiant` (et non `identifiant_csv`)
     *  - nom/prenom directement depuis `eleve` (pas de jointure utilisateur)
     */
    static async getEleves(id) {
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
                FROM inscription i
                INNER JOIN eleve  e ON e.id = i.id_eleve
                INNER JOIN classe c ON c.id = i.id_classe
                INNER JOIN niveau n ON n.id = c.id_niveau
                WHERE i.id_classe = ?
                ORDER BY e.nom, e.prenom
            `, [id]);

            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer une classe
     * CORRECTION : `annee_scolaire` est un VARCHAR (ex: "2025-2026"),
     * pas un id de table externe.
     */
    static async create(data) {
        const { idNiveau, lettre, anneeScolaire } = data;

        if (!idNiveau || !lettre || !anneeScolaire) {
            throw new Error('Champs requis : idNiveau, lettre, anneeScolaire');
        }

        let conn;
        try {
            conn = await pool.getConnection();

            const result = await conn.query(`
                INSERT INTO classe (id_niveau, lettre, annee_scolaire)
                VALUES (?, ?, ?)
            `, [idNiveau, lettre, anneeScolaire]);

            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Supprimer une classe
     */
    static async delete(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query('DELETE FROM classe WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } finally {
            if (conn) conn.release();
        }
    }
}