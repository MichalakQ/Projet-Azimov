import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import stageController from '../controllers/stage.controller.js';

const router = express.Router();

/**
 * GET /api/stages/recherches/eleve/:id
 * Récupérer les recherches de stage d'un élève
 * IMPORTANT: Cette route doit être avant /suivi
 */
router.get('/recherches/eleve/:id', asyncHandler(stageController.readRecherches));

/**
 * GET /api/stages/recherches/suivi?annee_scolaire=2025-2026
 * Récupérer le suivi des recherches de stage
 */
router.get('/recherches/suivi', asyncHandler(stageController.readSuivi));

/**
 * POST /api/stages/recherches
 * Créer une recherche de stage (protégé)
 */
router.post('/recherches', authMiddleware, asyncHandler(stageController.createRecherche));

/**
 * GET /api/stages/conventions
 * Récupérer toutes les conventions de stage
 */
router.get('/conventions', asyncHandler(stageController.readConventions));

/**
 * GET /api/stages/entreprises
 * Récupérer toutes les entreprises
 */
router.get('/entreprises', asyncHandler(stageController.readEntreprises));

export default router;
