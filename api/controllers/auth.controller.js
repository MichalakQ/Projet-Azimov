import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';

export default {

    login: async (req, res) => {
        console.log("POST /api/auth/login");
        try {
            const { identifiant, mot_de_passe } = req.body;

            if (!identifiant || !mot_de_passe) {
                return res.status(400).json({
                    success: false,
                    error: 'Identifiant et mot de passe requis'
                });
            }

            let conn;
            try {
                conn = await pool.getConnection();
                const rows = await conn.query(
                    `SELECT u.*, r.libelle AS role
                     FROM utilisateur u
                     JOIN role r ON r.id = u.id_role
                     WHERE u.identifiant = ? AND u.actif = TRUE`,
                    [identifiant]
                );

                if (rows.length === 0) {
                    return res.status(401).json({ success: false, error: 'Identifiants incorrects' });
                }

                const user = rows[0];
                const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
                if (!valid) {
                    return res.status(401).json({ success: false, error: 'Identifiants incorrects' });
                }

                const token = jwt.sign(
                    { id: user.id, identifiant: user.identifiant, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
                );

                res.json({
                    success: true,
                    data: { token },
                    utilisateur: {
                        id: user.id,
                        identifiant: user.identifiant,
                        email: user.email,
                        role: user.role
                    },
                    message: 'Connexion réussie'
                });
            } finally {
                if (conn) conn.release();
            }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur serveur', message: error.message });
        }
    },

    profil: async (req, res) => {
        console.log("GET /api/auth/profil");
        try {
            let conn;
            try {
                conn = await pool.getConnection();
                const rows = await conn.query(
                    `SELECT u.id, u.identifiant, u.email, r.libelle AS role
                     FROM utilisateur u
                     JOIN role r ON r.id = u.id_role
                     WHERE u.identifiant = ?`,
                    [req.user.identifiant]
                );
                if (rows.length === 0) {
                    return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
                }
                res.json({ success: true, data: rows[0] });
            } finally {
                if (conn) conn.release();
            }
        } catch (error) {
            res.status(500).json({ success: false, error: 'Erreur serveur', message: error.message });
        }
    }
};
