import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Connexion utilisateur
 */
router.post('/login', asyncHandler(authController.login));

/**
 * GET /api/auth/profil
 * Récupérer le profil de l'utilisateur connecté
 */
router.get('/profil', authMiddleware, asyncHandler(authController.profil));

export default router;
