import { Projet } from '../models/Projet.js';

export default {

    /**
     * GET /api/projets
     * Récupérer tous les projets
     */
    readAll: async (req, res) => {
        console.log("GET /api/projets");
        try {
            // Utiliser le modèle
            const data = await Projet.findAll();

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('Erreur lecture projets:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    },

    /**
     * GET /api/projets/:id
     * Récupérer un projet avec ses participants
     */
    readById: async (req, res) => {
        console.log("GET /api/projets/:id");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID invalide'
                });
            }

            // Utiliser le modèle
            const projet = await Projet.findById(id);
            if (!projet) {
                return res.status(404).json({
                    success: false,
                    error: 'Projet non trouvé'
                });
            }

            res.json({
                success: true,
                data: projet
            });

        } catch (error) {
            console.error('Erreur lecture projet:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    },

    /**
     * POST /api/projets
     * Créer un nouveau projet
     */
    createProjet: async (req, res) => {
        console.log("POST /api/projets");
        try {
            const { titre, description } = req.body;

            if (!titre) {
                return res.status(400).json({
                    success: false,
                    error: 'Titre requis'
                });
            }

            try {
                // Utiliser le modèle
                const id = await Projet.create({
                    titre,
                    description
                });

                const created = await Projet.findById(id);

                res.status(201).json({
                    success: true,
                    data: created,
                    message: 'Projet créé'
                });

            } catch (error) {
                throw error;
            }

        } catch (error) {
            console.error('Erreur création:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    },

    /**
     * PUT /api/projets/:id/valider
     * Valider un projet
     */
    validerProjet: async (req, res) => {
        console.log("PUT /api/projets/:id/valider");
        try {
            const id = parseInt(req.params.id);

            try {
                // Utiliser le modèle
                const updated = await Projet.valider(id, req.user.id);

                res.json({
                    success: true,
                    data: updated,
                    message: 'Projet validé'
                });

            } catch (error) {
                throw error;
            }

        } catch (error) {
            console.error('Erreur validation:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    }
};
