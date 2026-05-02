import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import referentController from '../controllers/referent.controller.js';

const router = express.Router();

/**
 * GET /api/referents?annee_scolaire=2025-2026
 * Récupérer tous les référents
 */
router.get('/', asyncHandler(referentController.readAll));

/**
 * GET /api/referents/eleve/:id?annee_scolaire=2025-2026
 * Récupérer le référent d'un élève
 * IMPORTANT: Cette route doit être avant /round-robin
 */
router.get('/eleve/:id', asyncHandler(referentController.readByEleve));

/**
 * POST /api/referents
 * Affecter un référent à un élève (protégé)
 */
router.post('/', authMiddleware, asyncHandler(referentController.affecter));

/**
 * POST /api/referents/round-robin
 * Affectation automatique des référents en round-robin (protégé)
 */
router.post('/round-robin', authMiddleware, asyncHandler(referentController.roundRobin));

export default router;
