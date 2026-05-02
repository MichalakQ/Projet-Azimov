import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import elevesController from '../controllers/eleve.controller.js';

const router = express.Router();

// Routes publiques (sans auth pour l'instant)
router.get('/', asyncHandler(elevesController.readEleves));
router.get('/search', asyncHandler(elevesController.searchEleves));
router.get('/:id', asyncHandler(elevesController.readEleveId));
router.get('/:id/statistiques', asyncHandler(elevesController.readStatistiques));

// Routes protégées
router.post('/', authMiddleware, asyncHandler(elevesController.createEleve));
router.put('/:id', authMiddleware, asyncHandler(elevesController.updateEleve));
router.delete('/:id', authMiddleware, asyncHandler(elevesController.deleteEleve));

export default router;
