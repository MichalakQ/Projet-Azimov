import pool from '../config/database.js';

export default {
    readAll: async (req, res) => {
        console.log("GET /api/options");
        try {
            let conn;
            try {
                conn = await pool.getConnection();
                const data = await conn.query('SELECT * FROM option_scolaire ORDER BY categorie, libelle');
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    },

    readByEleve: async (req, res) => {
        console.log("GET /api/options/eleve/:id");
        try {
            const id = parseInt(req.params.id);
            const annee = req.query.annee_scolaire || '2025-2026';
            let conn;
            try {
                conn = await pool.getConnection();
                const data = await conn.query(`
                    SELECT o.*, eo.annee_scolaire FROM eleve_option eo
                    JOIN option_scolaire o ON o.id = eo.id_option
                    WHERE eo.id_eleve = ? AND eo.annee_scolaire = ?
                `, [id, annee]);
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    }
};
