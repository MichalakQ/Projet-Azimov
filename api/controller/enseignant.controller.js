import pool from '../config/database.js';

export default {
    readAll: async (req, res) => {
        console.log("GET /api/enseignants");
        try {
            let conn;
            try {
                conn = await pool.getConnection();
                const data = await conn.query('SELECT * FROM enseignant ORDER BY nom');
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    },

    readById: async (req, res) => {
        console.log("GET /api/enseignants/:id");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID invalide' });
            let conn;
            try {
                conn = await pool.getConnection();
                const rows = await conn.query('SELECT * FROM enseignant WHERE id = ?', [id]);
                if (rows.length === 0) return res.status(404).json({ success: false, error: 'Enseignant non trouvé' });
                res.json({ success: true, data: rows[0] });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    },

    readEleves: async (req, res) => {
        console.log("GET /api/enseignants/:id/eleves");
        try {
            const id = parseInt(req.params.id);
            const annee = req.query.annee_scolaire || '2025-2026';
            let conn;
            try {
                conn = await pool.getConnection();
                const data = await conn.query(`
                    SELECT e.id, e.nom, e.prenom, CONCAT(n.numero, c.lettre) AS classe
                    FROM referent r JOIN eleve e ON e.id = r.id_eleve
                    JOIN inscription i ON i.id_eleve = e.id AND i.annee_scolaire = r.annee_scolaire
                    JOIN classe c ON c.id = i.id_classe JOIN niveau n ON n.id = c.id_niveau
                    WHERE r.id_enseignant = ? AND r.annee_scolaire = ? ORDER BY e.nom
                `, [id, annee]);
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    }
};
