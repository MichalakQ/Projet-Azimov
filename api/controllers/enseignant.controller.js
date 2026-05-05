import { Enseignant } from '../models/Enseignant.js';

export default {

    /**
     * GET /api/enseignants
     * Récupérer tous les enseignants
     */
    readAll: async (req, res) => {
        console.log("\n🔍 === GET /api/enseignants ===");
        try {
            // Utiliser le modèle
            const data = await Enseignant.findAll();
            
            console.log("✅ Récupéré: " + data.length + " enseignants");
            if (data.length > 0) {
                console.log("  [0] " + data[0].prenom + " " + data[0].nom);
            }

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('❌ Erreur lecture enseignants:', error.message);
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Erreur lecture enseignants',
                message: error.message
            });
        }
    },

    /**
     * GET /api/enseignants/:id
     * Récupérer un enseignant par ID
     */
    readById: async (req, res) => {
        console.log("\n🔍 === GET /api/enseignants/:id ===");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID invalide'
                });
            }

            // Utiliser le modèle
            const enseignant = await Enseignant.findById(id);
            
            if (!enseignant) {
                console.log("⚠️ Enseignant " + id + " non trouvé");
                return res.status(404).json({
                    success: false,
                    error: 'Enseignant non trouvé'
                });
            }
            
            console.log("✅ Enseignant trouvé: " + enseignant.prenom + " " + enseignant.nom);

            res.json({
                success: true,
                data: enseignant
            });

        } catch (error) {
            console.error('❌ Erreur lecture enseignant:', error.message);
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Erreur lecture enseignant',
                message: error.message
            });
        }
    },

    /**
     * GET /api/enseignants/:id/eleves?annee_scolaire=2025-2026
     * Récupérer les élèves d'un enseignant (ses références)
     */
    readEleves: async (req, res) => {
        console.log("\n🔍 === GET /api/enseignants/:id/eleves ===");
        try {
            const id = parseInt(req.params.id);
            const annee = req.query.annee_scolaire || '2025-2026';
            
            console.log("📍 Enseignant ID: " + id + ", Année: " + annee);

            // Utiliser le modèle
            const data = await Enseignant.getEleves(id, annee);
            
            console.log("✅ Récupéré: " + data.length + " élèves");

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('❌ Erreur lecture élèves enseignant:', error.message);
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Erreur lecture élèves enseignant',
                message: error.message
            });
        }
    }
};