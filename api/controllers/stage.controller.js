import { Stage } from '../models/Stage.js';

export default {

    /**
     * GET /api/stages/recherches/eleve/:id
     * Récupérer les recherches de stage d'un élève
     */
    readRecherches: async (req, res) => {
        console.log("\n🔍 === GET /api/stages/recherches/eleve/:id ===");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID invalide'
                });
            }

            console.log("📍 Élève ID: " + id);

            // Utiliser le modèle
            const data = await Stage.getRecherches(id);
            
            console.log("✅ Récupéré: " + data.length + " recherches");

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('❌ Erreur lecture recherches:', error.message);
            console.error(error);
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
        console.log("\n🔍 === GET /api/stages/recherches/suivi ===");
        try {
            const annee = req.query.annee_scolaire || '2025-2026';
            
            console.log("📍 Année: " + annee);

            // Utiliser le modèle
            const data = await Stage.getSuivi(annee);
            
            console.log("✅ Récupéré: " + data.length + " élèves en suivi");

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('❌ Erreur suivi:', error.message);
            console.error(error);
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
        console.log("\n🔍 === POST /api/stages/recherches ===");
        try {
            const { id_eleve, id_entreprise, id_annee_scolaire } = req.body;

            if (!id_eleve || !id_entreprise || !id_annee_scolaire) {
                return res.status(400).json({
                    success: false,
                    error: 'Champs requis: id_eleve, id_entreprise, id_annee_scolaire'
                });
            }

            console.log("📍 Élève: " + id_eleve + ", Entreprise: " + id_entreprise);

            try {
                // Utiliser le modèle
                const id = await Stage.createRecherche({
                    idEleve: id_eleve,
                    idEntreprise: id_entreprise,
                    idAnneeScolaire: id_annee_scolaire
                });

                console.log("✅ Recherche créée: ID=" + id);

                res.status(201).json({
                    success: true,
                    data: { id },
                    message: 'Recherche créée'
                });

            } catch (error) {
                throw error;
            }

        } catch (error) {
            console.error('❌ Erreur création recherche:', error.message);
            console.error(error);
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
        console.log("\n🔍 === GET /api/stages/conventions ===");
        try {
            // Utiliser le modèle
            const data = await Stage.getConventions();
            
            console.log("✅ Récupéré: " + data.length + " documents");

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('❌ Erreur conventions:', error.message);
            console.error(error);
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
        console.log("\n🔍 === GET /api/stages/entreprises ===");
        try {
            // Utiliser le modèle
            const data = await Stage.getEntreprises();
            
            console.log("✅ Récupéré: " + data.length + " entreprises");

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('❌ Erreur entreprises:', error.message);
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Erreur entreprises',
                message: error.message
            });
        }
    }
};