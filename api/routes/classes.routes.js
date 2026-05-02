import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import classeController from '../controllers/classe.controller.js';

const router = express.Router();

/**
 * GET /api/classes?annee_scolaire=2025-2026
 * Récupérer toutes les classes
 */
router.get('/', asyncHandler(classeController.readAll));

/**
 * GET /api/classes/niveaux
 * Récupérer tous les niveaux (6ème, 5ème, etc)
 * IMPORTANT: Cette route doit être avant /:id sinon sera interceptée
 */
router.get('/niveaux', asyncHandler(classeController.readNiveaux));

/**
 * GET /api/classes/:id
 * Récupérer une classe par ID
 */
router.get('/:id', asyncHandler(classeController.readAll));

/**
 * GET /api/classes/:id/eleves
 * Récupérer les élèves d'une classe
 */
router.get('/:id/eleves', asyncHandler(classeController.readEleves));

export default router;
