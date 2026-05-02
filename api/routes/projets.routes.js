import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import projetController from '../controllers/projet.controller.js';

const router = express.Router();

/**
 * GET /api/projets
 * Récupérer tous les projets
 */
router.get('/', asyncHandler(projetController.readAll));

/**
 * GET /api/projets/:id
 * Récupérer un projet par ID avec ses participants
 */
router.get('/:id', asyncHandler(projetController.readById));

/**
 * POST /api/projets
 * Créer un nouveau projet (protégé)
 */
router.post('/', authMiddleware, asyncHandler(projetController.createProjet));

/**
 * PUT /api/projets/:id/valider
 * Valider un projet (protégé)
 */
router.put('/:id/valider', authMiddleware, asyncHandler(projetController.validerProjet));

export default router;
