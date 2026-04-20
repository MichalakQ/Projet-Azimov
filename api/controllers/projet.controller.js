import pool from '../config/database.js';

export default {
    readAll: async (req, res) => {
        console.log("GET /api/projets");
        try {
            let conn;
            try {
                conn = await pool.getConnection();
                const data = await conn.query(`
                    SELECT p.*, e.nom AS responsable_nom, e.prenom AS responsable_prenom
                    FROM projet p LEFT JOIN eleve e ON e.id = p.id_responsable ORDER BY p.date_creation DESC
                `);
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    },

    readById: async (req, res) => {
        console.log("GET /api/projets/:id");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID invalide' });
            let conn;
            try {
                conn = await pool.getConnection();
                const rows = await conn.query('SELECT * FROM projet WHERE id = ?', [id]);
                if (rows.length === 0) return res.status(404).json({ success: false, error: 'Projet non trouvé' });
                const participants = await conn.query(`
                    SELECT e.id, e.nom, e.prenom, pp.date_debut, pp.date_fin
                    FROM participation_projet pp JOIN eleve e ON e.id = pp.id_eleve WHERE pp.id_projet = ?
                `, [id]);
                res.json({ success: true, data: { ...rows[0], participants } });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    },

    createProjet: async (req, res) => {
        console.log("POST /api/projets");
        try {
            const { titre, description } = req.body;
            if (!titre) return res.status(400).json({ success: false, error: 'Titre requis' });
            let conn;
            try {
                conn = await pool.getConnection();
                const result = await conn.query(
                    'INSERT INTO projet (titre, description, date_creation, statut) VALUES (?, ?, CURDATE(), ?)',
                    [titre, description || null, 'en_attente']
                );
                const [created] = await conn.query('SELECT * FROM projet WHERE id = ?', [Number(result.insertId)]);
                res.status(201).json({ success: true, data: created, message: 'Projet créé' });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    },

    validerProjet: async (req, res) => {
        console.log("PUT /api/projets/:id/valider");
        try {
            const id = parseInt(req.params.id);
            let conn;
            try {
                conn = await pool.getConnection();
                await conn.query('UPDATE projet SET statut = ?, valide_par = ? WHERE id = ?', ['valide', req.user.id, id]);
                const [updated] = await conn.query('SELECT * FROM projet WHERE id = ?', [id]);
                res.json({ success: true, data: updated, message: 'Projet validé' });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    }
};
