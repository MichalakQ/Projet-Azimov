import pool from '../config/database.js';

export default {
    readAll: async (req, res) => {
        console.log("GET /api/referents");
        try {
            let conn;
            try {
                conn = await pool.getConnection();
                const annee = req.query.annee_scolaire || '2025-2026';
                const data = await conn.query('SELECT * FROM v_eleves_referent WHERE annee_scolaire = ?', [annee]);
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    },

    readByEleve: async (req, res) => {
        console.log("GET /api/referents/eleve/:id");
        try {
            const id = parseInt(req.params.id);
            let conn;
            try {
                conn = await pool.getConnection();
                const annee = req.query.annee_scolaire || '2025-2026';
                const rows = await conn.query(`
                    SELECT r.*, ens.nom AS nom_enseignant, ens.prenom AS prenom_enseignant
                    FROM referent r JOIN enseignant ens ON ens.id = r.id_enseignant
                    WHERE r.id_eleve = ? AND r.annee_scolaire = ?
                `, [id, annee]);
                if (rows.length === 0) return res.status(404).json({ success: false, error: 'Aucun référent trouvé' });
                res.json({ success: true, data: rows[0] });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    },

    affecter: async (req, res) => {
        console.log("POST /api/referents");
        try {
            const { id_enseignant, id_eleve, annee_scolaire } = req.body;
            let conn;
            try {
                conn = await pool.getConnection();
                await conn.query(`
                    INSERT INTO referent (id_enseignant, id_eleve, annee_scolaire) VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE id_enseignant = ?
                `, [id_enseignant, id_eleve, annee_scolaire, id_enseignant]);
                res.status(201).json({ success: true, message: 'Référent affecté' });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    },

    roundRobin: async (req, res) => {
        console.log("POST /api/referents/round-robin");
        try {
            const { annee_scolaire } = req.body;
            if (!annee_scolaire) return res.status(400).json({ success: false, error: 'annee_scolaire requise' });
            let conn;
            try {
                conn = await pool.getConnection();
                const result = await conn.query('CALL sp_affecter_referents_round_robin(?)', [annee_scolaire]);
                res.json({ success: true, data: result, message: 'Affectation round-robin terminée' });
            } finally { if (conn) conn.release(); }
        } catch (error) { res.status(500).json({ success: false, error: 'Erreur', message: error.message }); }
    }
};
