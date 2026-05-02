import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import enseignantController from '../controllers/enseignant.controller.js';

const router = express.Router();

/**
 * GET /api/enseignants
 * Récupérer tous les enseignants
 */
router.get('/', asyncHandler(enseignantController.readAll));

/**
 * GET /api/enseignants/:id
 * Récupérer un enseignant par ID
 */
router.get('/:id', asyncHandler(enseignantController.readById));

/**
 * GET /api/enseignants/:id/eleves?annee_scolaire=2025-2026
 * Récupérer les élèves d'un enseignant (ses références)
 */
router.get('/:id/eleves', asyncHandler(enseignantController.readEleves));

export default router;
