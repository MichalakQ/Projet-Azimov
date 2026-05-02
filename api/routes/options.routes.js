import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import optionController from '../controllers/option.controller.js';

const router = express.Router();

/**
 * GET /api/options
 * Récupérer toutes les options scolaires
 */
router.get('/', asyncHandler(optionController.readAll));

/**
 * GET /api/options/eleve/:id?annee_scolaire=2025-2026
 * Récupérer les options d'un élève
 */
router.get('/eleve/:id', asyncHandler(optionController.readByEleve));

export default router;
