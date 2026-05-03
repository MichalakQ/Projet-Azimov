import { Referent } from '../models/Referent.js';

export default {

    /**
     * GET /api/referents?annee_scolaire=2025-2026
     * Récupérer tous les référents
     */
    readAll: async (req, res) => {
        console.log("GET /api/referents");
        try {
            const annee = req.query.annee_scolaire || '2025-2026';

            // Utiliser le modèle
            const data = await Referent.findAll(annee);

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('Erreur lecture referents:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    },

    /**
     * GET /api/referents/eleve/:id?annee_scolaire=2025-2026
     * Récupérer le référent d'un élève
     */
    readByEleve: async (req, res) => {
        console.log("GET /api/referents/eleve/:id");
        try {
            const id = parseInt(req.params.id);
            const annee = req.query.annee_scolaire || '2025-2026';

            // Utiliser le modèle
            const referent = await Referent.getByEleve(id, annee);
            if (!referent) {
                return res.status(404).json({
                    success: false,
                    error: 'Aucun référent trouvé'
                });
            }

            res.json({
                success: true,
                data: referent
            });

        } catch (error) {
            console.error('Erreur lecture referent:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    },

    /**
     * POST /api/referents
     * Affecter un référent à un élève
     */
    affecter: async (req, res) => {
        console.log("POST /api/referents");
        try {
            const { id_enseignant, id_eleve, annee_scolaire } = req.body;

            if (!id_enseignant || !id_eleve || !annee_scolaire) {
                return res.status(400).json({
                    success: false,
                    error: 'id_enseignant, id_eleve et annee_scolaire requis'
                });
            }

            try {
                // Utiliser le modèle
                await Referent.assign(id_enseignant, id_eleve, annee_scolaire);

                res.status(201).json({
                    success: true,
                    message: 'Référent affecté'
                });

            } catch (error) {
                throw error;
            }

        } catch (error) {
            console.error('Erreur affectation:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    },

    /**
     * POST /api/referents/round-robin
     * Affectation automatique en round-robin
     */
    roundRobin: async (req, res) => {
        console.log("POST /api/referents/round-robin");
        try {
            const { annee_scolaire } = req.body;

            if (!annee_scolaire) {
                return res.status(400).json({
                    success: false,
                    error: 'annee_scolaire requise'
                });
            }

            try {
                // Utiliser le modèle
                const result = await Referent.roundRobin(annee_scolaire);

                res.json({
                    success: true,
                    data: result,
                    message: 'Affectation round-robin terminée'
                });

            } catch (error) {
                throw error;
            }

        } catch (error) {
            console.error('Erreur round-robin:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    }
};