import { Option } from '../models/Option.js';

export default {

    /**
     * GET /api/options
     * Récupérer toutes les options
     */
    readAll: async (req, res) => {
        console.log("GET /api/options");
        try {
            // Utiliser le modèle
            const data = await Option.findAll();

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('Erreur lecture options:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    },

    /**
     * GET /api/options/eleve/:id?annee_scolaire=2025-2026
     * Récupérer les options d'un élève
     */
    readByEleve: async (req, res) => {
        console.log("GET /api/options/eleve/:id");
        try {
            const id = parseInt(req.params.id);
            const annee = req.query.annee_scolaire || '2025-2026';

            // Utiliser le modèle
            const data = await Option.getByEleve(id, annee);

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('Erreur lecture options élève:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    }
};