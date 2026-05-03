import jwt from 'jsonwebtoken';
import { Utilisateur } from '../models/Utilisateur.js';

export default {

    /**
     * POST /api/auth/login
     * Connexion utilisateur
     */
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

            // Utiliser le modèle pour trouver l'utilisateur
            const user = await Utilisateur.findByIdentifiant(identifiant);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Identifiants incorrects'
                });
            }

            // Vérifier le mot de passe avec le modèle
            const valid = await Utilisateur.verifyPassword(mot_de_passe, user.mot_de_passe);
            if (!valid) {
                return res.status(401).json({
                    success: false,
                    error: 'Identifiants incorrects'
                });
            }

            // Générer le JWT
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

        } catch (error) {
            console.error('Erreur login:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur serveur',
                message: error.message
            });
        }
    },

    /**
     * GET /api/auth/profil
     * Récupérer le profil de l'utilisateur connecté
     */
    profil: async (req, res) => {
        console.log("GET /api/auth/profil");
        try {
            // req.user vient du middleware d'authentification
            const user = await Utilisateur.findById(req.user.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Utilisateur non trouvé'
                });
            }

            res.json({
                success: true,
                data: user
            });

        } catch (error) {
            console.error('Erreur profil:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur serveur',
                message: error.message
            });
        }
    }
};