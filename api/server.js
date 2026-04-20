import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './config/database.js';
import { verifyToken, requireRole } from './middlewares/auth.js';

import CtrlAuth       from './controllers/auth.controller.js';
import CtrlEleve      from './controllers/eleve.controller.js';
import CtrlEnseignant from './controllers/enseignant.controller.js';
import CtrlClasse     from './controllers/classe.controller.js';
import CtrlMoyenne    from './controllers/moyenne.controller.js';
import CtrlReferent   from './controllers/referent.controller.js';
import CtrlStage      from './controllers/stage.controller.js';
import CtrlProjet     from './controllers/projet.controller.js';
import CtrlOption     from './controllers/option.controller.js';
import CtrlParent     from './controllers/parent.controller.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ========================================
// ROUTES REST API
// ========================================

// Auth (publiques)
app.post('/api/auth/login',  CtrlAuth.login);
app.get('/api/auth/profil',  verifyToken, CtrlAuth.profil);

// Élèves
app.get('/api/eleves',                  verifyToken, CtrlEleve.readEleves);
app.get('/api/eleves/search',           verifyToken, CtrlEleve.searchEleves);
app.get('/api/eleves/:id',              verifyToken, CtrlEleve.readEleveId);
app.get('/api/eleves/:id/statistiques', verifyToken, CtrlEleve.readStatistiques);
app.post('/api/eleves',                 verifyToken, requireRole('secretariat', 'proviseur'), CtrlEleve.createEleve);
app.put('/api/eleves/:id',              verifyToken, requireRole('secretariat', 'proviseur'), CtrlEleve.updateEleve);
app.delete('/api/eleves/:id',           verifyToken, requireRole('proviseur'), CtrlEleve.deleteEleve);

// Enseignants
app.get('/api/enseignants',             verifyToken, CtrlEnseignant.readAll);
app.get('/api/enseignants/:id',         verifyToken, CtrlEnseignant.readById);
app.get('/api/enseignants/:id/eleves',  verifyToken, CtrlEnseignant.readEleves);

// Classes
app.get('/api/classes',                 verifyToken, CtrlClasse.readAll);
app.get('/api/classes/niveaux',         verifyToken, CtrlClasse.readNiveaux);
app.get('/api/classes/:id/eleves',      verifyToken, CtrlClasse.readEleves);

// Moyennes
app.get('/api/moyennes/eleve/:id',      verifyToken, CtrlMoyenne.readByEleve);
app.get('/api/moyennes/niveaux',        verifyToken, CtrlMoyenne.readByNiveau);
app.get('/api/moyennes/en-attente',     verifyToken, requireRole('proviseur'), CtrlMoyenne.readEnAttente);
app.post('/api/moyennes',               verifyToken, requireRole('secretariat'), CtrlMoyenne.createMoyenne);
app.put('/api/moyennes/:id/valider',    verifyToken, requireRole('proviseur'), CtrlMoyenne.validerMoyenne);
app.put('/api/moyennes/:id/corriger',   verifyToken, requireRole('proviseur'), CtrlMoyenne.corrigerMoyenne);

// Référents
app.get('/api/referents',               verifyToken, CtrlReferent.readAll);
app.get('/api/referents/eleve/:id',     verifyToken, CtrlReferent.readByEleve);
app.post('/api/referents',              verifyToken, requireRole('secretariat', 'proviseur'), CtrlReferent.affecter);
app.post('/api/referents/round-robin',  verifyToken, requireRole('secretariat', 'proviseur'), CtrlReferent.roundRobin);

// Stages
app.get('/api/stages/recherches/eleve/:id', verifyToken, CtrlStage.readRecherches);
app.get('/api/stages/recherches/suivi',     verifyToken, requireRole('enseignant', 'proviseur', 'secretariat'), CtrlStage.readSuivi);
app.post('/api/stages/recherches',          verifyToken, CtrlStage.createRecherche);
app.get('/api/stages/conventions',          verifyToken, CtrlStage.readConventions);
app.get('/api/stages/entreprises',          verifyToken, CtrlStage.readEntreprises);

// Projets
app.get('/api/projets',                 verifyToken, CtrlProjet.readAll);
app.get('/api/projets/:id',             verifyToken, CtrlProjet.readById);
app.post('/api/projets',                verifyToken, CtrlProjet.createProjet);
app.put('/api/projets/:id/valider',     verifyToken, requireRole('proviseur'), CtrlProjet.validerProjet);

// Options
app.get('/api/options',                 verifyToken, CtrlOption.readAll);
app.get('/api/options/eleve/:id',       verifyToken, CtrlOption.readByEleve);

// Parents
app.get('/api/parents',                 verifyToken, CtrlParent.readAll);
app.get('/api/parents/eleve/:id',       verifyToken, CtrlParent.readByEleve);
app.get('/api/parents/publipostage',    verifyToken, requireRole('secretariat', 'proviseur'), CtrlParent.readPublipostage);

// Documentation racine
app.get('/api', (req, res) => {
    res.json({
        message: "API REST Asim'UT - Collège Isaac Asimov",
        version: '1.0.0',
        endpoints: {
            'POST /api/auth/login':              'Connexion (identifiant + mot_de_passe)',
            'GET  /api/auth/profil':             'Profil utilisateur connecté',
            'GET  /api/eleves':                  'Liste paginée des élèves',
            'GET  /api/eleves/search?q=':        'Rechercher un élève par nom',
            'GET  /api/eleves/:id':              'Détail d\'un élève',
            'GET  /api/eleves/:id/statistiques': 'Statistiques complètes',
            'POST /api/eleves':                  'Créer un élève',
            'PUT  /api/eleves/:id':              'Modifier un élève',
            'DELETE /api/eleves/:id':            'Supprimer un élève',
            'GET  /api/enseignants':             'Liste des enseignants',
            'GET  /api/enseignants/:id/eleves':  'Élèves référés',
            'GET  /api/classes':                 'Classes par année',
            'GET  /api/classes/niveaux':          'Niveaux scolaires',
            'GET  /api/moyennes/eleve/:id':      'Moyennes d\'un élève',
            'GET  /api/moyennes/niveaux':         'Moyennes par niveau',
            'POST /api/moyennes':                'Saisir une moyenne',
            'PUT  /api/moyennes/:id/valider':    'Valider une moyenne',
            'PUT  /api/moyennes/:id/corriger':   'Corriger une moyenne',
            'GET  /api/referents':               'Affectations référents',
            'POST /api/referents/round-robin':   'Affectation automatique',
            'GET  /api/stages/recherches/suivi': 'Suivi des recherches (alerte >15)',
            'GET  /api/stages/conventions':       'Conventions de stage',
            'GET  /api/stages/entreprises':       'Annuaire entreprises',
            'GET  /api/projets':                 'Projets de l\'établissement',
            'GET  /api/options':                 'Options scolaires',
            'GET  /api/parents':                 'Liste des parents',
            'GET  /api/parents/publipostage':    'Données publipostage'
        },
        exampleLogin: {
            identifiant: "proviseur",
            mot_de_passe: "asimov2026"
        }
    });
});

// GESTION DES ERREURS 404 (Express v5)
app.use('/*splat', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint non trouvé',
        requestedPath: req.originalUrl,
        method: req.method,
        availableEndpoints: ['GET /api']
    });
});

// ========================================
// DÉMARRAGE
// ========================================
const docAPI = async () => {
    await testConnection();
    console.log(`🚀 Asim'UT API démarrée sur http://localhost:${PORT}`);
    console.log(`📚 Documentation sur http://localhost:${PORT}/api`);
    console.log(`📊 Dashboard sur http://localhost:${PORT}/dashboard.html`);
    console.log(`\n📋 Endpoints principaux :`);
    console.log(`   POST   /api/auth/login           - Connexion`);
    console.log(`   GET    /api/eleves                - Liste des élèves`);
    console.log(`   GET    /api/eleves/search?q=      - Rechercher`);
    console.log(`   GET    /api/eleves/:id/statistiques - Statistiques`);
    console.log(`   POST   /api/moyennes              - Saisir une moyenne`);
    console.log(`   GET    /api/stages/recherches/suivi - Suivi stages`);
    console.log(`   GET    /api/projets               - Projets`);
};

app.listen(PORT, docAPI);

export default app;
