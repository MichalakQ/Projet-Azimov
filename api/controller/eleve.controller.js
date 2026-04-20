import pool from '../config/database.js';
import bcrypt from 'bcrypt';

export default {

    readEleves: async (req, res) => {
        console.log("GET /api/eleves : readEleves");
        try {
            let conn;
            try {
                conn = await pool.getConnection();
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const offset = (page - 1) * limit;

                const [countResult] = await conn.query('SELECT COUNT(*) AS total FROM eleve');
                const total = Number(countResult.total);

                const data = await conn.query(`
                    SELECT e.id, e.nom, e.prenom, e.identifiant, e.date_naissance,
                           CONCAT(n.numero, c.lettre) AS classe, n.libelle AS niveau
                    FROM eleve e
                    LEFT JOIN inscription i ON i.id_eleve = e.id
                    LEFT JOIN classe c ON c.id = i.id_classe
                    LEFT JOIN niveau n ON n.id = c.id_niveau
                    ORDER BY e.nom, e.prenom
                    LIMIT ? OFFSET ?
                `, [limit, offset]);

                res.json({ success: true, data, count: total, page, totalPages: Math.ceil(total / limit) });
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur lecture élèves', message: error.message });
        }
    },

    readEleveId: async (req, res) => {
        console.log("GET /api/eleves/:id : readEleveId");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID invalide' });

            let conn;
            try {
                conn = await pool.getConnection();
                const rows = await conn.query('SELECT * FROM eleve WHERE id = ?', [id]);
                if (rows.length === 0) return res.status(404).json({ success: false, error: 'Élève non trouvé' });
                res.json({ success: true, data: rows[0] });
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur lecture élève', message: error.message });
        }
    },

    searchEleves: async (req, res) => {
        console.log("GET /api/eleves/search : searchEleves");
        try {
            const q = req.query.q;
            if (!q || q.length < 2) return res.status(400).json({ success: false, error: 'Minimum 2 caractères' });

            let conn;
            try {
                conn = await pool.getConnection();
                const data = await conn.query(`
                    SELECT e.id, e.nom, e.prenom, e.identifiant,
                           CONCAT(n.numero, c.lettre) AS classe
                    FROM eleve e
                    LEFT JOIN inscription i ON i.id_eleve = e.id
                    LEFT JOIN classe c ON c.id = i.id_classe
                    LEFT JOIN niveau n ON n.id = c.id_niveau
                    WHERE e.nom LIKE ? OR e.prenom LIKE ?
                    ORDER BY e.nom
                `, [`%${q}%`, `%${q}%`]);
                res.json({ success: true, data, count: data.length });
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur recherche', message: error.message });
        }
    },

    readStatistiques: async (req, res) => {
        console.log("GET /api/eleves/:id/statistiques : readStatistiques");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID invalide' });

            let conn;
            try {
                conn = await pool.getConnection();
                const [eleve] = await conn.query(`
                    SELECT e.id, e.nom, e.prenom, e.identifiant, e.date_naissance,
                           CONCAT(n.numero, c.lettre) AS classe_actuelle,
                           ens.nom AS nom_referent, ens.prenom AS prenom_referent
                    FROM eleve e
                    LEFT JOIN inscription i ON i.id_eleve = e.id
                    LEFT JOIN classe c ON c.id = i.id_classe
                    LEFT JOIN niveau n ON n.id = c.id_niveau
                    LEFT JOIN referent r ON r.id_eleve = e.id AND r.annee_scolaire = i.annee_scolaire
                    LEFT JOIN enseignant ens ON ens.id = r.id_enseignant
                    ORDER BY i.annee_scolaire DESC LIMIT 1
                `, [id]);

                if (!eleve) return res.status(404).json({ success: false, error: 'Élève non trouvé' });

                const moyennes = await conn.query(`
                    SELECT m.annee_scolaire, m.semestre, m.valeur, m.validee
                    FROM moyenne m WHERE m.id_eleve = ?
                    ORDER BY m.annee_scolaire, m.semestre
                `, [id]);

                const options = await conn.query(`
                    SELECT o.libelle, o.categorie, eo.annee_scolaire
                    FROM eleve_option eo JOIN option_scolaire o ON o.id = eo.id_option
                    WHERE eo.id_eleve = ?
                `, [id]);

                const parents = await conn.query(`
                    SELECT p.nom, p.prenom, p.email, ep.lien
                    FROM parent p JOIN eleve_parent ep ON ep.id_parent = p.id
                    WHERE ep.id_eleve = ?
                `, [id]);

                res.json({ success: true, data: { ...eleve, moyennes, options, parents } });
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur statistiques', message: error.message });
        }
    },

    createEleve: async (req, res) => {
        console.log("POST /api/eleves : createEleve");
        try {
            const { nom, prenom, identifiant, date_naissance } = req.body;

            if (!nom || !prenom || !identifiant) {
                return res.status(400).json({ success: false, error: 'nom, prenom et identifiant requis' });
            }

            let conn;
            try {
                conn = await pool.getConnection();
                await conn.beginTransaction();

                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash('changermotdepasse', salt);

                const userResult = await conn.query(`
                    INSERT INTO utilisateur (identifiant, mot_de_passe, email, id_role)
                    VALUES (?, ?, ?, (SELECT id FROM role WHERE libelle = 'eleve'))
                `, [identifiant, hash, `${identifiant}@eleve.asimov.edu`]);

                const eleveResult = await conn.query(`
                    INSERT INTO eleve (nom, prenom, identifiant, date_naissance, id_utilisateur)
                    VALUES (?, ?, ?, ?, ?)
                `, [nom.toUpperCase(), prenom, identifiant, date_naissance || null, Number(userResult.insertId)]);

                await conn.commit();

                const [created] = await conn.query('SELECT * FROM eleve WHERE id = ?', [Number(eleveResult.insertId)]);
                res.status(201).json({ success: true, data: created, message: 'Élève créé avec succès' });
            } catch (err) {
                if (conn) await conn.rollback();
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ success: false, error: 'Cet identifiant existe déjà' });
                }
                throw err;
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur création', message: error.message });
        }
    },

    updateEleve: async (req, res) => {
        console.log("PUT /api/eleves/:id : updateEleve");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID invalide' });

            let conn;
            try {
                conn = await pool.getConnection();
                const [existing] = await conn.query('SELECT * FROM eleve WHERE id = ?', [id]);
                if (!existing) return res.status(404).json({ success: false, error: 'Élève non trouvé' });

                const { nom, prenom, date_naissance } = req.body;
                await conn.query(`
                    UPDATE eleve SET nom = ?, prenom = ?, date_naissance = ? WHERE id = ?
                `, [
                    nom ? nom.toUpperCase() : existing.nom,
                    prenom || existing.prenom,
                    date_naissance || existing.date_naissance,
                    id
                ]);

                const [updated] = await conn.query('SELECT * FROM eleve WHERE id = ?', [id]);
                res.json({ success: true, data: updated, message: 'Élève modifié avec succès' });
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur modification', message: error.message });
        }
    },

    deleteEleve: async (req, res) => {
        console.log("DELETE /api/eleves/:id : deleteEleve");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID invalide' });

            let conn;
            try {
                conn = await pool.getConnection();
                const result = await conn.query('DELETE FROM eleve WHERE id = ?', [id]);
                if (result.affectedRows === 0) {
                    return res.status(404).json({ success: false, error: 'Élève non trouvé' });
                }
                res.status(204).send();
            } finally { if (conn) conn.release(); }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur suppression', message: error.message });
        }
    }
};
