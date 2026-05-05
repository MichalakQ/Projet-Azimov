import { Moyenne } from '../models/Moyenne.js';

export default {

    /**
     * GET /api/moyennes/eleve/:id
     * Récupérer les moyennes d'un élève
     */
    readByEleve: async (req, res) => {
        console.log("\n🔍 === GET /api/moyennes/eleve/:id ===");
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
            const data = await Moyenne.findByEleve(id);
            
            console.log("✅ Récupéré: " + data.length + " moyennes");

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('❌ Erreur lecture moyennes:', error.message);
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Erreur lecture moyennes',
                message: error.message
            });
        }
    },

    /**
     * GET /api/moyennes/niveaux?annee_scolaire=2025-2026
     * Récupérer les moyennes par niveau
     */
    readByNiveau: async (req, res) => {
        console.log("\n🔍 === GET /api/moyennes/niveaux ===");
        try {
            const annee = req.query.annee_scolaire || '2025-2026';
            
            console.log("📍 Année: " + annee);

            // Utiliser le modèle
            const data = await Moyenne.findByNiveau(annee);
            
            console.log("✅ Récupéré: " + data.length + " lignes");

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('❌ Erreur moyennes par niveau:', error.message);
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Erreur moyennes par niveau',
                message: error.message
            });
        }
    },

    /**
     * GET /api/moyennes/en-attente
     * Récupérer les moyennes en attente de validation
     */
    readEnAttente: async (req, res) => {
        console.log("\n🔍 === GET /api/moyennes/en-attente ===");
        try {
            // Utiliser le modèle
            const data = await Moyenne.findEnAttente();
            
            console.log("✅ Récupéré: " + data.length + " moyennes en attente");

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('❌ Erreur moyennes en attente:', error.message);
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Erreur moyennes en attente',
                message: error.message
            });
        }
    },

    /**
     * POST /api/moyennes
     * Créer une nouvelle moyenne
     */
    createMoyenne: async (req, res) => {
        console.log("\n🔍 === POST /api/moyennes ===");
        try {
            const { id_eleve, id_annee_scolaire, semestre, valeur } = req.body;

            if (!id_eleve || !id_annee_scolaire || !semestre || valeur === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Champs requis: id_eleve, id_annee_scolaire, semestre, valeur'
                });
            }

            console.log("📍 Élève: " + id_eleve + ", Valeur: " + valeur);

            try {
                // Utiliser le modèle
                const id = await Moyenne.create({
                    id_eleve,
                    id_annee_scolaire,
                    semestre,
                    valeur,
                    id_saisie_par: req.user ? req.user.id : 1
                });

                const created = await Moyenne.findById(id);
                
                console.log("✅ Moyenne créée: ID=" + id);

                res.status(201).json({
                    success: true,
                    data: created,
                    message: 'Moyenne saisie avec succès'
                });

            } catch (error) {
                if (error.message.includes('Valeur entre 0 et 20')) {
                    return res.status(400).json({
                        success: false,
                        error: 'Valeur entre 0 et 20'
                    });
                }
                throw error;
            }

        } catch (error) {
            console.error('❌ Erreur saisie:', error.message);
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Erreur saisie',
                message: error.message
            });
        }
    },

    /**
     * PUT /api/moyennes/:id/valider
     * Valider une moyenne
     */
    validerMoyenne: async (req, res) => {
        console.log("\n🔍 === PUT /api/moyennes/:id/valider ===");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID invalide'
                });
            }

            console.log("📍 Moyenne ID: " + id);

            try {
                // Utiliser le modèle
                const updated = await Moyenne.valider(id, req.user ? req.user.id : 1);
                
                console.log("✅ Moyenne validée");

                res.json({
                    success: true,
                    data: updated,
                    message: 'Moyenne validée'
                });

            } catch (error) {
                if (error.message.includes('introuvable')) {
                    return res.status(400).json({
                        success: false,
                        error: 'Moyenne introuvable ou déjà validée'
                    });
                }
                throw error;
            }

        } catch (error) {
            console.error('❌ Erreur validation:', error.message);
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Erreur validation',
                message: error.message
            });
        }
    },

    /**
     * PUT /api/moyennes/:id/corriger
     * Corriger une moyenne
     */
    corrigerMoyenne: async (req, res) => {
        console.log("\n🔍 === PUT /api/moyennes/:id/corriger ===");
        try {
            const id = parseInt(req.params.id);
            const { valeur } = req.body;

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID invalide'
                });
            }

            if (valeur === undefined || valeur < 0 || valeur > 20) {
                return res.status(400).json({
                    success: false,
                    error: 'Valeur entre 0 et 20'
                });
            }

            console.log("📍 Moyenne ID: " + id + ", Nouvelle valeur: " + valeur);

            try {
                // Utiliser le modèle
                const updated = await Moyenne.corriger(id, valeur);
                
                console.log("✅ Moyenne corrigée");

                res.json({
                    success: true,
                    data: updated,
                    message: 'Moyenne corrigée'
                });

            } catch (error) {
                throw error;
            }

        } catch (error) {
            console.error('❌ Erreur correction:', error.message);
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Erreur correction',
                message: error.message
            });
        }
    }
};