import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import referentController from '../controllers/referent.controller.js';

const router = express.Router();

/**
 * ✅ CORRIGÉ: Routes spécifiques AVANT les routes génériques
 * 
 * GET /api/referents/eleve/:id?annee_scolaire=2025-2026
 * Récupérer le référent d'un élève
 * IMPORTANT: Cette route doit être AVANT / pour ne pas être interceptée
 */
router.get('/eleve/:id', asyncHandler(referentController.readByEleve));

/**
 * GET /api/referents?annee_scolaire=2025-2026
 * Récupérer tous les référents
 */
router.get('/', asyncHandler(referentController.readAll));

/**
 * POST /api/referents/round-robin
 * Affectation automatique des référents en round-robin (protégé)
 * IMPORTANT: Cette route doit être AVANT POST / pour ne pas être interceptée
 */
router.post('/round-robin', authMiddleware, asyncHandler(referentController.roundRobin));

/**
 * POST /api/referents
 * Affecter un référent à un élève (protégé)
 */
router.post('/', authMiddleware, asyncHandler(referentController.affecter));

export default router;