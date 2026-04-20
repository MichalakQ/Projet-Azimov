/**
 * @module controllers/moyenne.controller
 * @description Contrôleur des vues moyennes
 */

const { apiClient } = require('../config/api');

async function index(req, res) {
    try {
        const api = apiClient(req.session.token);
        const annee = req.query.annee_scolaire || '';

        const promises = [api.get(`/moyennes/niveaux${annee ? '?annee_scolaire=' + annee : ''}`)];
        if (['proviseur'].includes(req.session.user.role)) {
            promises.push(api.get('/moyennes/en-attente'));
        }

        const results = await Promise.allSettled(promises);

        res.render('moyennes/index', {
            title: 'Moyennes',
            moyennesParNiveau: results[0].status === 'fulfilled' ? results[0].value.data : [],
            enAttente: results[1]?.status === 'fulfilled' ? results[1].value.data : [],
            anneeScolaire: annee
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/dashboard');
    }
}

async function saisirForm(req, res) {
    try {
        const api = apiClient(req.session.token);
        const { data } = await api.get('/eleves?limit=100');
        res.render('moyennes/saisir', { title: 'Saisie de moyenne', eleves: data.data || [] });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/moyennes');
    }
}

async function saisir(req, res) {
    try {
        const api = apiClient(req.session.token);
        await api.post('/moyennes', {
            id_eleve: parseInt(req.body.id_eleve),
            annee_scolaire: req.body.annee_scolaire,
            semestre: parseInt(req.body.semestre),
            valeur: parseFloat(req.body.valeur)
        });
        req.flash('success', 'Moyenne saisie');
        res.redirect('/moyennes');
    } catch (err) {
        req.flash('error', err.data?.error || err.message);
        res.redirect('/moyennes/saisir');
    }
}

async function valider(req, res) {
    try {
        const api = apiClient(req.session.token);
        await api.put(`/moyennes/${req.params.id}/valider`);
        req.flash('success', 'Moyenne validée');
    } catch (err) {
        req.flash('error', err.data?.error || err.message);
    }
    res.redirect('/moyennes');
}

async function corriger(req, res) {
    try {
        const api = apiClient(req.session.token);
        await api.put(`/moyennes/${req.params.id}/corriger`, {
            valeur: parseFloat(req.body.valeur)
        });
        req.flash('success', 'Moyenne corrigée');
    } catch (err) {
        req.flash('error', err.data?.error || err.message);
    }
    res.redirect('/moyennes');
}

module.exports = { index, saisirForm, saisir, valider, corriger };
