import pool from '../config/database.js';

export default {
    readAll: async (req, res) => {
        console.log("GET /api/classes");
        try {
            let conn;
            try {
                conn = await pool.getConnection();
                const annee = req.query.annee_scolaire || '2025-2026';
                const data = await conn.query(`
                    SELECT c.id, CONCAT(n.numero, c.lettre) AS nom, n.libelle AS niveau,
                           c.annee_scolaire, COUNT(i.id) AS nb_eleves
                    FROM classe c JOIN niveau n ON n.id = c.id_niveau
                    LEFT JOIN inscription i ON i.id_classe = c.id
                    WHERE c.annee_scolaire = ? GROUP BY c.id ORDER BY n.numero DESC, c.lettre
                `, [annee]);
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    },

    readNiveaux: async (req, res) => {
        console.log("GET /api/classes/niveaux");
        try {
            let conn;
            try {
                conn = await pool.getConnection();
                const data = await conn.query('SELECT * FROM niveau ORDER BY numero DESC');
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    },

    readEleves: async (req, res) => {
        console.log("GET /api/classes/:id/eleves");
        try {
            const id = parseInt(req.params.id);
            let conn;
            try {
                conn = await pool.getConnection();
                const data = await conn.query(`
                    SELECT e.id, e.nom, e.prenom, e.identifiant
                    FROM inscription i JOIN eleve e ON e.id = i.id_eleve
                    WHERE i.id_classe = ? ORDER BY e.nom
                `, [id]);
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    }
};
