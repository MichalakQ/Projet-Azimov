import { Eleve } from '../models/Eleve.js';
import { Utilisateur } from '../models/Utilisateur.js';

export default {

    /**
     * GET /api/eleves?page=1&limit=20
     * Récupérer tous les élèves avec pagination
     */
    readEleves: async (req, res) => {
        console.log("GET /api/eleves : readEleves");
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            // Utiliser le modèle
            const result = await Eleve.findAll(page, limit);

            res.json({
                success: true,
                ...result
            });

        } catch (error) {
            console.error('Erreur lecture élèves:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur lecture élèves',
                message: error.message
            });
        }
    },

    /**
     * GET /api/eleves/:id
     * Récupérer un élève par ID
     */
    readEleveId: async (req, res) => {
        console.log("GET /api/eleves/:id : readEleveId");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID invalide'
                });
            }

            // Utiliser le modèle
            const eleve = await Eleve.findById(id);
            if (!eleve) {
                return res.status(404).json({
                    success: false,
                    error: 'Élève non trouvé'
                });
            }

            res.json({
                success: true,
                data: eleve
            });

        } catch (error) {
            console.error('Erreur lecture élève:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur lecture élève',
                message: error.message
            });
        }
    },

    /**
     * GET /api/eleves/search?q=nom
     * Chercher des élèves
     */
    searchEleves: async (req, res) => {
        console.log("GET /api/eleves/search : searchEleves");
        try {
            const q = req.query.q;
            if (!q || q.length < 2) {
                return res.status(400).json({
                    success: false,
                    error: 'Minimum 2 caractères'
                });
            }

            // Utiliser le modèle
            const data = await Eleve.search(q);

            res.json({
                success: true,
                data,
                count: data.length
            });

        } catch (error) {
            console.error('Erreur recherche:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur recherche',
                message: error.message
            });
        }
    },

    /**
     * GET /api/eleves/:id/statistiques
     * Récupérer les statistiques complètes d'un élève
     */
    readStatistiques: async (req, res) => {
        console.log("GET /api/eleves/:id/statistiques : readStatistiques");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID invalide'
                });
            }

            // Utiliser le modèle
            const stats = await Eleve.getStatistiques(id);
            if (!stats) {
                return res.status(404).json({
                    success: false,
                    error: 'Élève non trouvé'
                });
            }

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Erreur statistiques:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur statistiques',
                message: error.message
            });
        }
    },

    /**
     * POST /api/eleves
     * Créer un nouvel élève
     * 
     * ✅ CORRIGÉ: Envoie nom et prenom à Utilisateur.create()
     */
    createEleve: async (req, res) => {
        console.log("POST /api/eleves : createEleve");
        try {
            const { nom, prenom, identifiant, date_naissance } = req.body;

            if (!nom || !prenom || !identifiant) {
                return res.status(400).json({
                    success: false,
                    error: 'nom, prenom et identifiant requis'
                });
            }

            try {
                // Créer l'utilisateur d'abord
                const userId = await Utilisateur.create({
                    identifiant,
                    nom: nom.toUpperCase(),           // ✅ AJOUTÉ - nom en majuscules
                    prenom,                           // ✅ AJOUTÉ - prénom
                    mot_de_passe: 'changermotdepasse',
                    email: `${identifiant}@eleve.asimov.edu`,
                    id_role: 4  // Rôle élève
                });

                // Créer l'élève avec le modèle
                const eleveId = await Eleve.create({
                    nom: nom.toUpperCase(),
                    prenom,
                    identifiant,
                    date_naissance,
                    id_utilisateur: userId
                });

                // Récupérer l'élève créé
                const created = await Eleve.findById(eleveId);

                res.status(201).json({
                    success: true,
                    data: created,
                    message: 'Élève créé avec succès'
                });

            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({
                        success: false,
                        error: 'Cet identifiant existe déjà'
                    });
                }
                throw error;
            }

        } catch (error) {
            console.error('Erreur création:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur création',
                message: error.message
            });
        }
    },

    /**
     * PUT /api/eleves/:id
     * Mettre à jour un élève
     */
    updateEleve: async (req, res) => {
        console.log("PUT /api/eleves/:id : updateEleve");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID invalide'
                });
            }

            // Utiliser le modèle
            const updated = await Eleve.update(id, req.body);
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    error: 'Élève non trouvé'
                });
            }

            res.json({
                success: true,
                data: updated,
                message: 'Élève modifié avec succès'
            });

        } catch (error) {
            console.error('Erreur modification:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur modification',
                message: error.message
            });
        }
    },

    /**
     * DELETE /api/eleves/:id
     * Supprimer un élève
     */
    deleteEleve: async (req, res) => {
        console.log("DELETE /api/eleves/:id : deleteEleve");
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID invalide'
                });
            }

            // Utiliser le modèle
            const success = await Eleve.delete(id);
            if (!success) {
                return res.status(404).json({
                    success: false,
                    error: 'Élève non trouvé'
                });
            }

            res.status(204).send();

        } catch (error) {
            console.error('Erreur suppression:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur suppression',
                message: error.message
            });
        }
    }
};