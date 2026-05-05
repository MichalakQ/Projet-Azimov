import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import classeController from '../controllers/classe.controller.js';

const router = express.Router();

/**
 * GET /api/classes/niveaux
 * Récupérer tous les niveaux (6ème, 5ème, etc)
 * IMPORTANT: Cette route doit être AVANT /:id sinon sera interceptée
 */
router.get('/niveaux', asyncHandler(classeController.readNiveaux));

/**
 * GET /api/classes?annee_scolaire=2025-2026
 * Récupérer toutes les classes
 */
router.get('/', asyncHandler(classeController.readAll));

/**
 * GET /api/classes/:id
 * Récupérer une classe par ID
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'ID invalide' });
    }
    // Récupérer les élèves de la classe
    await classeController.readEleves(req, res);
}));

/**
 * GET /api/classes/:id/eleves
 * Récupérer les élèves d'une classe
 */
router.get('/:id/eleves', asyncHandler(classeController.readEleves));

export default router;