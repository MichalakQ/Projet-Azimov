import pool from '../config/database.js';

export default {

    readRecherches: async (req, res) => {
        console.log("GET /api/stages/recherches/eleve/:id");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID invalide' });
            let conn;
            try {
                conn = await pool.getConnection();
                const data = await conn.query(`
                    SELECT rs.*, ent.nom AS entreprise_nom, ent.ville,
                           ce.nom AS contact_nom, ce.email AS contact_email
                    FROM recherche_stage rs
                    JOIN entreprise ent ON ent.id = rs.id_entreprise
                    LEFT JOIN contact_entreprise ce ON ce.id = rs.id_contact
                    WHERE rs.id_eleve = ? ORDER BY rs.date_creation DESC
                `, [id]);
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur lecture recherches', message: error.message });
        }
    },

    readSuivi: async (req, res) => {
        console.log("GET /api/stages/recherches/suivi");
        try {
            let conn;
            try {
                conn = await pool.getConnection();
                const annee = req.query.annee_scolaire || '2025-2026';
                const data = await conn.query(
                    'SELECT * FROM v_eleves_recherche_stage WHERE annee_scolaire = ? ORDER BY alerte DESC, nb_entreprises_contactees DESC',
                    [annee]
                );
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur suivi', message: error.message });
        }
    },

    createRecherche: async (req, res) => {
        console.log("POST /api/stages/recherches");
        try {
            const { id_eleve, id_entreprise, annee_scolaire } = req.body;
            if (!id_eleve || !id_entreprise || !annee_scolaire) {
                return res.status(400).json({ success: false, error: 'id_eleve, id_entreprise et annee_scolaire requis' });
            }
            let conn;
            try {
                conn = await pool.getConnection();
                const result = await conn.query(
                    'INSERT INTO recherche_stage (id_eleve, id_entreprise, annee_scolaire) VALUES (?, ?, ?)',
                    [id_eleve, id_entreprise, annee_scolaire]
                );
                const [created] = await conn.query('SELECT * FROM recherche_stage WHERE id = ?', [Number(result.insertId)]);
                res.status(201).json({ success: true, data: created, message: 'Recherche créée' });
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur création recherche', message: error.message });
        }
    },

    readConventions: async (req, res) => {
        console.log("GET /api/stages/conventions");
        try {
            let conn;
            try {
                conn = await pool.getConnection();
                const data = await conn.query(`
                    SELECT cs.*, e.nom AS eleve_nom, e.prenom AS eleve_prenom, ent.nom AS entreprise_nom
                    FROM convention_stage cs
                    JOIN eleve e ON e.id = cs.id_eleve
                    JOIN entreprise ent ON ent.id = cs.id_entreprise
                    ORDER BY cs.date_debut DESC
                `);
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur conventions', message: error.message });
        }
    },

    readEntreprises: async (req, res) => {
        console.log("GET /api/stages/entreprises");
        try {
            let conn;
            try {
                conn = await pool.getConnection();
                const data = await conn.query('SELECT * FROM entreprise ORDER BY nom');
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur entreprises', message: error.message });
        }
    }
};
