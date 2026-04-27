/**
 * @module server
 * @description Point d'entrée de l'API REST Asim'UT
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// Middlewares globaux
// ============================================================
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', express.static(path.join(__dirname, 'public')));

// ============================================================
// Routes
// ============================================================
const authRoutes       = require('./routes/auth.routes');
const eleveRoutes      = require('./routes/eleve.routes');
const enseignantRoutes = require('./routes/enseignant.routes');
const classeRoutes     = require('./routes/classe.routes');
const moyenneRoutes    = require('./routes/moyenne.routes');
const referentRoutes   = require('./routes/referent.routes');
const stageRoutes      = require('./routes/stage.routes');
const projetRoutes     = require('./routes/projet.routes');
const optionRoutes     = require('./routes/option.routes');
const parentRoutes     = require('./routes/parent.routes');
const importRoutes     = require('./routes/import.routes');

app.use('/api/auth',        authRoutes);
app.use('/api/eleves',      eleveRoutes);
app.use('/api/enseignants',  enseignantRoutes);
app.use('/api/classes',     classeRoutes);
app.use('/api/moyennes',    moyenneRoutes);
app.use('/api/referents',   referentRoutes);
app.use('/api/stages',      stageRoutes);
app.use('/api/projets',     projetRoutes);
app.use('/api/options',     optionRoutes);
app.use('/api/parents',     parentRoutes);
app.use('/api/import',      importRoutes);

// Route racine
app.get('/api', (req, res) => {
    res.json({
        application: "Asim'UT API",
        version: '1.0.0',
        description: 'API REST - Collège-Lycée Isaac Asimov',
        endpoints: {
            auth:        '/api/auth',
            eleves:      '/api/eleves',
            enseignants: '/api/enseignants',
            classes:     '/api/classes',
            moyennes:    '/api/moyennes',
            referents:   '/api/referents',
            stages:      '/api/stages',
            projets:     '/api/projets',
            options:     '/api/options',
            parents:     '/api/parents',
            import:      '/api/import'
        }
    });
});

// ============================================================
// Gestion des erreurs
// ============================================================
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
    console.error('Erreur serveur :', err.stack);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Erreur interne du serveur'
            : err.message
    });
});

// ============================================================
// Démarrage
// ============================================================
async function start() {
    const dbOk = await testConnection();
    if (!dbOk) {
        console.error('⚠️  Démarrage sans base de données');
    }
    app.listen(PORT, () => {
        console.log(`🚀 Asim'UT API démarrée sur http://localhost:${PORT}`);
        console.log(`📖 Documentation : http://localhost:${PORT}/api`);
    });
}

start();

module.exports = app;