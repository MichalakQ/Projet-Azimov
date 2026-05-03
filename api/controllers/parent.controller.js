import { Parent } from '../models/Parent.js';

export default {

    /**
     * GET /api/parents
     * Récupérer tous les parents
     */
    readAll: async (req, res) => {
        console.log("GET /api/parents");
        try {
            // Utiliser le modèle
            const data = await Parent.findAll();

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('Erreur lecture parents:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    },

    /**
     * GET /api/parents/eleve/:id
     * Récupérer les parents d'un élève
     */
    readByEleve: async (req, res) => {
        console.log("GET /api/parents/eleve/:id");
        try {
            const id = parseInt(req.params.id);

            // Utiliser le modèle
            const data = await Parent.getByEleve(id);

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('Erreur lecture parents élève:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    },

    /**
     * GET /api/parents/publipostage?annee_scolaire=2025-2026
     * Récupérer les données pour les courriers aux parents
     */
    readPublipostage: async (req, res) => {
        console.log("GET /api/parents/publipostage");
        try {
            const annee = req.query.annee_scolaire || '2025-2026';

            // Utiliser le modèle
            const data = await Parent.getPublipostage(annee);

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('Erreur publipostage:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur',
                message: error.message
            });
        }
    }
};