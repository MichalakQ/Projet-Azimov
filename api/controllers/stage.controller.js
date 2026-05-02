import { Stage } from '../models/Stage.js';

export default {

    /**
     * GET /api/stages/recherches/eleve/:id
     * Récupérer les recherches de stage d'un élève
     */
    readRecherches: async (req, res) => {
        console.log("GET /api/stages/recherches/eleve/:id");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID invalide'
                });
            }

            // Utiliser le modèle
            const data = await Stage.getRecherches(id);

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('Erreur lecture recherches:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur lecture recherches',
                message: error.message
            });
        }
    },

    /**
     * GET /api/stages/recherches/suivi?annee_scolaire=2025-2026
     * Récupérer le suivi des recherches de stage
     */
    readSuivi: async (req, res) => {
        console.log("GET /api/stages/recherches/suivi");
        try {
            const annee = req.query.annee_scolaire || '2025-2026';

            // Utiliser le modèle
            const data = await Stage.getSuivi(annee);

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('Erreur suivi:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur suivi',
                message: error.message
            });
        }
    },

    /**
     * POST /api/stages/recherches
     * Créer une recherche de stage
     */
    createRecherche: async (req, res) => {
        console.log("POST /api/stages/recherches");
        try {
            const { id_eleve, id_entreprise, annee_scolaire } = req.body;

            if (!id_eleve || !id_entreprise || !annee_scolaire) {
                return res.status(400).json({
                    success: false,
                    error: 'id_eleve, id_entreprise et annee_scolaire requis'
                });
            }

            try {
                // Utiliser le modèle
                const id = await Stage.createRecherche({
                    idEleve: id_eleve,
                    idEntreprise: id_entreprise,
                    annee: annee_scolaire
                });

                res.status(201).json({
                    success: true,
                    data: { id },
                    message: 'Recherche créée'
                });

            } catch (error) {
                throw error;
            }

        } catch (error) {
            console.error('Erreur création recherche:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur création recherche',
                message: error.message
            });
        }
    },

    /**
     * GET /api/stages/conventions
     * Récupérer toutes les conventions de stage
     */
    readConventions: async (req, res) => {
        console.log("GET /api/stages/conventions");
        try {
            // Utiliser le modèle
            const data = await Stage.getConventions();

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('Erreur conventions:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur conventions',
                message: error.message
            });
        }
    },

    /**
     * GET /api/stages/entreprises
     * Récupérer toutes les entreprises
     */
    readEntreprises: async (req, res) => {
        console.log("GET /api/stages/entreprises");
        try {
            // Utiliser le modèle
            const data = await Stage.getEntreprises();

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('Erreur entreprises:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur entreprises',
                message: error.message
            });
        }
    }
};
