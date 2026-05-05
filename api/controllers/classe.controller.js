import { Classe } from '../models/Classe.js';

export default {

    /**
     * GET /api/classes?annee_scolaire=2025-2026
     * Récupérer toutes les classes
     */
    readAll: async (req, res) => {
        console.log("\n🔍 === GET /api/classes ===");
        try {
            const annee = req.query.annee_scolaire || '2025-2026';
            console.log("📍 Année: " + annee);

            // Utiliser le modèle
            const data = await Classe.findAll(annee);
            
            console.log("✅ Récupéré: " + data.length + " classes");

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('❌ Erreur lecture classes:', error.message);
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Erreur lecture classes',
                message: error.message
            });
        }
    },

    /**
     * GET /api/classes/niveaux
     * Récupérer tous les niveaux
     */
    readNiveaux: async (req, res) => {
        console.log("\n🔍 === GET /api/classes/niveaux ===");
        try {
            // Utiliser le modèle
            const data = await Classe.getNiveaux();
            
            console.log("✅ Récupéré: " + data.length + " niveaux");

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('❌ Erreur lecture niveaux:', error.message);
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Erreur lecture niveaux',
                message: error.message
            });
        }
    },

    /**
     * GET /api/classes/:id/eleves
     * Récupérer les élèves d'une classe
     */
    readEleves: async (req, res) => {
        console.log("\n🔍 === GET /api/classes/:id/eleves ===");
        try {
            const id = parseInt(req.params.id);
            console.log("📍 Classe ID: " + id);

            // Utiliser le modèle
            const data = await Classe.getEleves(id);
            
            console.log("✅ Récupéré: " + data.length + " élèves");

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('❌ Erreur lecture élèves classe:', error.message);
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Erreur lecture élèves classe',
                message: error.message
            });
        }
    }
};