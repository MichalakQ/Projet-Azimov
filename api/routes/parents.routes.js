import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import parentController from '../controllers/parent.controller.js';

const router = express.Router();

/**
 * GET /api/parents
 * Récupérer tous les parents
 */
router.get('/', asyncHandler(parentController.readAll));

/**
 * GET /api/parents/eleve/:id
 * Récupérer les parents d'un élève
 * IMPORTANT: Cette route doit être avant /publipostage
 */
router.get('/eleve/:id', asyncHandler(parentController.readByEleve));

/**
 * GET /api/parents/publipostage?annee_scolaire=2025-2026
 * Récupérer les données pour les courriers aux parents
 */
router.get('/publipostage', asyncHandler(parentController.readPublipostage));

export default router;
