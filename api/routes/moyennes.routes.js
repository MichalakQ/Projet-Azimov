import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import moyenneController from '../controllers/moyenne.controller.js';

const router = express.Router();

/**
 * GET /api/moyennes/eleve/:id
 * Récupérer les moyennes d'un élève
 * IMPORTANT: Cette route doit être avant /niveaux pour éviter la confusion
 */
router.get('/eleve/:id', asyncHandler(moyenneController.readByEleve));

/**
 * GET /api/moyennes/niveaux?annee_scolaire=2025-2026
 * Récupérer les moyennes par niveau
 */
router.get('/niveaux', asyncHandler(moyenneController.readByNiveau));

/**
 * GET /api/moyennes/en-attente
 * Récupérer les moyennes en attente de validation
 */
router.get('/en-attente', asyncHandler(moyenneController.readEnAttente));

/**
 * POST /api/moyennes
 * Créer une nouvelle moyenne (protégé)
 */
router.post('/', authMiddleware, asyncHandler(moyenneController.createMoyenne));

/**
 * PUT /api/moyennes/:id/valider
 * Valider une moyenne (protégé)
 */
router.put('/:id/valider', authMiddleware, asyncHandler(moyenneController.validerMoyenne));

/**
 * PUT /api/moyennes/:id/corriger
 * Corriger une moyenne (protégé)
 */
router.put('/:id/corriger', authMiddleware, asyncHandler(moyenneController.corrigerMoyenne));

export default router;
