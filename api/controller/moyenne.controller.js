import pool from '../config/database.js';

export default {

    readByEleve: async (req, res) => {
        console.log("GET /api/moyennes/eleve/:id");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID invalide' });
            let conn;
            try {
                conn = await pool.getConnection();
                const data = await conn.query(`
                    SELECT m.*, CONCAT(n.numero, c.lettre) AS classe
                    FROM moyenne m
                    JOIN inscription i ON i.id_eleve = m.id_eleve AND i.annee_scolaire = m.annee_scolaire
                    JOIN classe c ON c.id = i.id_classe
                    JOIN niveau n ON n.id = c.id_niveau
                    WHERE m.id_eleve = ? ORDER BY m.annee_scolaire, m.semestre
                `, [id]);
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur lecture moyennes', message: error.message });
        }
    },

    readByNiveau: async (req, res) => {
        console.log("GET /api/moyennes/niveaux");
        try {
            let conn;
            try {
                conn = await pool.getConnection();
                const annee = req.query.annee_scolaire || '2025-2026';
                const data = await conn.query(
                    'SELECT * FROM v_moyennes_par_niveau WHERE annee_scolaire = ? ORDER BY niveau DESC, semestre', [annee]
                );
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur moyennes par niveau', message: error.message });
        }
    },

    readEnAttente: async (req, res) => {
        console.log("GET /api/moyennes/en-attente");
        try {
            let conn;
            try {
                conn = await pool.getConnection();
                const data = await conn.query(`
                    SELECT m.*, e.nom, e.prenom, CONCAT(n.numero, c.lettre) AS classe
                    FROM moyenne m
                    JOIN eleve e ON e.id = m.id_eleve
                    JOIN inscription i ON i.id_eleve = m.id_eleve AND i.annee_scolaire = m.annee_scolaire
                    JOIN classe c ON c.id = i.id_classe
                    JOIN niveau n ON n.id = c.id_niveau
                    WHERE m.validee = FALSE ORDER BY m.date_saisie
                `);
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur moyennes en attente', message: error.message });
        }
    },

    createMoyenne: async (req, res) => {
        console.log("POST /api/moyennes : createMoyenne");
        try {
            const { id_eleve, annee_scolaire, semestre, valeur } = req.body;
            if (!id_eleve || !annee_scolaire || !semestre || valeur === undefined) {
                return res.status(400).json({ success: false, error: 'Champs requis : id_eleve, annee_scolaire, semestre, valeur' });
            }
            if (valeur < 0 || valeur > 20) return res.status(400).json({ success: false, error: 'Valeur entre 0 et 20' });
            if (![1, 2].includes(semestre)) return res.status(400).json({ success: false, error: 'Semestre : 1 ou 2' });

            let conn;
            try {
                conn = await pool.getConnection();
                const result = await conn.query(`
                    INSERT INTO moyenne (id_eleve, annee_scolaire, semestre, valeur, saisie_par)
                    VALUES (?, ?, ?, ?, ?)
                `, [id_eleve, annee_scolaire, semestre, valeur, req.user.id]);
                const [created] = await conn.query('SELECT * FROM moyenne WHERE id = ?', [Number(result.insertId)]);
                res.status(201).json({ success: true, data: created, message: 'Moyenne saisie avec succès' });
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, error: 'Moyenne déjà saisie' });
                throw err;
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur saisie', message: error.message });
        }
    },

    validerMoyenne: async (req, res) => {
        console.log("PUT /api/moyennes/:id/valider");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID invalide' });
            let conn;
            try {
                conn = await pool.getConnection();
                const result = await conn.query(
                    'UPDATE moyenne SET validee = TRUE, validee_par = ?, date_validation = NOW() WHERE id = ? AND validee = FALSE',
                    [req.user.id, id]
                );
                if (result.affectedRows === 0) return res.status(400).json({ success: false, error: 'Moyenne introuvable ou déjà validée' });
                const [updated] = await conn.query('SELECT * FROM moyenne WHERE id = ?', [id]);
                res.json({ success: true, data: updated, message: 'Moyenne validée' });
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur validation', message: error.message });
        }
    },

    corrigerMoyenne: async (req, res) => {
        console.log("PUT /api/moyennes/:id/corriger");
        try {
            const id = parseInt(req.params.id);
            const { valeur } = req.body;
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID invalide' });
            if (valeur === undefined || valeur < 0 || valeur > 20) return res.status(400).json({ success: false, error: 'Valeur entre 0 et 20' });
            let conn;
            try {
                conn = await pool.getConnection();
                await conn.query('UPDATE moyenne SET valeur = ?, validee = FALSE, validee_par = NULL, date_validation = NULL WHERE id = ?', [valeur, id]);
                const [updated] = await conn.query('SELECT * FROM moyenne WHERE id = ?', [id]);
                res.json({ success: true, data: updated, message: 'Moyenne corrigée' });
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur correction', message: error.message });
        }
    }
};
