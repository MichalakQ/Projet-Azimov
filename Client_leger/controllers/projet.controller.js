/**
 * @module controllers/projet.controller
 * @description Contrôleur des vues projets
 */

const { apiClient } = require('../config/api');

async function index(req, res) {
    try {
        const api = apiClient(req.session.token);
        const { data } = await api.get('/projets');
        res.render('projets/index', { title: 'Projets', projets: data });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/dashboard');
    }
}

async function show(req, res) {
    try {
        const api = apiClient(req.session.token);
        const { data } = await api.get(`/projets/${req.params.id}`);
        const participantsRes = await api.get('/projets');
        const projet = participantsRes.data.find(p => p.id === parseInt(req.params.id)) || data;
        res.render('projets/show', { title: projet.titre, projet });
    } catch (err) {
        req.flash('error', 'Projet non trouvé');
        res.redirect('/projets');
    }
}

async function create(req, res) {
    try {
        const api = apiClient(req.session.token);
        await api.post('/projets', req.body);
        req.flash('success', 'Projet créé');
    } catch (err) {
        req.flash('error', err.data?.error || err.message);
    }
    res.redirect('/projets');
}

async function valider(req, res) {
    try {
        const api = apiClient(req.session.token);
        await api.put(`/projets/${req.params.id}/valider`);
        req.flash('success', 'Projet validé');
    } catch (err) {
        req.flash('error', err.data?.error || err.message);
    }
    res.redirect('/projets');
}

async function addParticipant(req, res) {
    try {
        const api = apiClient(req.session.token);
        await api.post(`/projets/${req.params.id}/participants`, {
            id_eleve: parseInt(req.body.id_eleve),
            date_debut: req.body.date_debut || new Date().toISOString().slice(0, 10)
        });
        req.flash('success', 'Participant ajouté');
    } catch (err) {
        req.flash('error', err.data?.error || err.message);
    }
    res.redirect(`/projets/${req.params.id}`);
}

module.exports = { index, show, create, valider, addParticipant };
