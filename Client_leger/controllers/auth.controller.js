/**
 * @module controllers/auth.controller
 * @description Contrôleur d'authentification (login, logout)
 */

const { apiClient } = require('../config/api');

function loginForm(req, res) {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('login', { title: 'Connexion' });
}

async function login(req, res) {
    try {
        const { identifiant, mot_de_passe } = req.body;
        const api = apiClient();
        const { data } = await api.post('/auth/login', { identifiant, mot_de_passe });

        req.session.token = data.token;
        req.session.user = data.utilisateur;

        req.flash('success', `Bienvenue ${data.utilisateur.identifiant}`);
        res.redirect('/dashboard');
    } catch (err) {
        req.flash('error', err.data?.error || 'Identifiants incorrects');
        res.redirect('/login');
    }
}

function logout(req, res) {
    req.session.destroy(() => {
        res.redirect('/login');
    });
}

async function dashboard(req, res) {
    try {
        const api = apiClient(req.session.token);
        const role = req.session.user.role;

        const promises = [api.get('/eleves?limit=5')];

        if (['proviseur', 'secretariat'].includes(role)) {
            promises.push(api.get('/moyennes/en-attente'));
        }

        const results = await Promise.allSettled(promises);
        const eleves = results[0].status === 'fulfilled' ? results[0].value.data : { data: [] };
        const moyennesEnAttente = results[1]?.status === 'fulfilled' ? results[1].value.data : [];

        res.render('dashboard', {
            title: 'Tableau de bord',
            eleves: eleves.data || [],
            totalEleves: eleves.total || 0,
            moyennesEnAttente: moyennesEnAttente || []
        });
    } catch (err) {
        req.flash('error', 'Erreur de chargement du tableau de bord');
        res.render('dashboard', {
            title: 'Tableau de bord',
            eleves: [],
            totalEleves: 0,
            moyennesEnAttente: []
        });
    }
}

module.exports = { loginForm, login, logout, dashboard };
