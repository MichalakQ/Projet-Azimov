/**
 * @module app
 * @description Point d'entrée du client léger Asim'UT (Express.js + EJS)
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const methodOverride = require('method-override');

const { injectLocals } = require('./middlewares/auth');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8080;

// ============================================================
// Configuration du moteur de vues EJS
// ============================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================================
// Middlewares
// ============================================================
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'asimut_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24h
}));

app.use(flash());
app.use(injectLocals);

// ============================================================
// Routes
// ============================================================
app.use('/', routes);

// 404
app.use((req, res) => {
    res.status(404).render('error', { title: '404', message: 'Page non trouvée', status: 404 });
});

// Erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { title: 'Erreur', message: err.message, status: 500 });
});

// ============================================================
// Démarrage
// ============================================================
app.listen(PORT, () => {
    console.log(`🌐 Client léger Asim'UT : http://localhost:${PORT}`);
    console.log(`📡 API configurée sur : ${process.env.API_URL || 'http://localhost:3000/api'}`);
});

module.exports = app;
