import pool from '../config/database.js';

export default {
    readAll: async (req, res) => {
        console.log("GET /api/parents");
        try {
            let conn;
            try {
                conn = await pool.getConnection();
                const data = await conn.query('SELECT * FROM parent ORDER BY nom');
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    },

    readByEleve: async (req, res) => {
        console.log("GET /api/parents/eleve/:id");
        try {
            const id = parseInt(req.params.id);
            let conn;
            try {
                conn = await pool.getConnection();
                const data = await conn.query(`
                    SELECT p.*, ep.lien FROM parent p
                    JOIN eleve_parent ep ON ep.id_parent = p.id WHERE ep.id_eleve = ?
                `, [id]);
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    },

    readPublipostage: async (req, res) => {
        console.log("GET /api/parents/publipostage");
        try {
            let conn;
            try {
                conn = await pool.getConnection();
                const annee = req.query.annee_scolaire || '2025-2026';
                const data = await conn.query(
                    'SELECT * FROM v_publipostage_parents WHERE annee_scolaire = ? ORDER BY nom_parent',
                    [annee]
                );
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    }
};
