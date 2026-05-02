import { Classe } from '../models/Classe.js';

export default {

    /**
     * GET /api/classes?annee_scolaire=2025-2026
     * Récupérer toutes les classes
     */
    readAll: async (req, res) => {
        console.log("GET /api/classes");
        try {
            const annee = req.query.annee_scolaire || '2025-2026';

            // Utiliser le modèle
            const data = await Classe.findAll(annee);

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('Erreur lecture classes:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    },

    /**
     * GET /api/classes/niveaux
     * Récupérer tous les niveaux
     */
    readNiveaux: async (req, res) => {
        console.log("GET /api/classes/niveaux");
        try {
            // Utiliser le modèle
            const data = await Classe.getNiveaux();

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('Erreur lecture niveaux:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    },

    /**
     * GET /api/classes/:id/eleves
     * Récupérer les élèves d'une classe
     */
    readEleves: async (req, res) => {
        console.log("GET /api/classes/:id/eleves");
        try {
            const id = parseInt(req.params.id);

            // Utiliser le modèle
            const data = await Classe.getEleves(id);

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('Erreur lecture élèves classe:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    }
};
