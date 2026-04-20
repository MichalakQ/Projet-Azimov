/**
 * @module controllers/eleve.controller
 * @description Contrôleur des vues élèves
 */

const { apiClient } = require('../config/api');

async function index(req, res) {
    try {
        const api = apiClient(req.session.token);
        const page = parseInt(req.query.page) || 1;
        const { data } = await api.get(`/eleves?page=${page}&limit=15`);

        res.render('eleves/index', {
            title: 'Liste des élèves',
            eleves: data.data,
            pagination: { page: data.page, totalPages: data.totalPages, total: data.total }
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/dashboard');
    }
}

async function search(req, res) {
    try {
        const api = apiClient(req.session.token);
        const q = req.query.q || '';
        if (q.length < 2) {
            return res.render('eleves/index', {
                title: 'Recherche élèves',
                eleves: [],
                pagination: null,
                searchQuery: q
            });
        }
        const { data } = await api.get(`/eleves/search?q=${encodeURIComponent(q)}`);
        res.render('eleves/index', {
            title: `Recherche : "${q}"`,
            eleves: data,
            pagination: null,
            searchQuery: q
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/eleves');
    }
}

async function show(req, res) {
    try {
        const api = apiClient(req.session.token);
        const { data } = await api.get(`/eleves/${req.params.id}/statistiques`);

        res.render('eleves/show', { title: `${data.prenom} ${data.nom}`, eleve: data });
    } catch (err) {
        req.flash('error', 'Élève non trouvé');
        res.redirect('/eleves');
    }
}

function createForm(req, res) {
    res.render('eleves/create', { title: 'Nouvel élève' });
}

async function create(req, res) {
    try {
        const api = apiClient(req.session.token);
        await api.post('/eleves', req.body);
        req.flash('success', 'Élève créé avec succès');
        res.redirect('/eleves');
    } catch (err) {
        req.flash('error', err.data?.error || err.message);
        res.redirect('/eleves/nouveau');
    }
}

async function editForm(req, res) {
    try {
        const api = apiClient(req.session.token);
        const { data } = await api.get(`/eleves/${req.params.id}`);
        res.render('eleves/edit', { title: `Modifier ${data.prenom} ${data.nom}`, eleve: data });
    } catch (err) {
        req.flash('error', 'Élève non trouvé');
        res.redirect('/eleves');
    }
}

async function update(req, res) {
    try {
        const api = apiClient(req.session.token);
        await api.put(`/eleves/${req.params.id}`, req.body);
        req.flash('success', 'Élève modifié');
        res.redirect(`/eleves/${req.params.id}`);
    } catch (err) {
        req.flash('error', err.data?.error || err.message);
        res.redirect(`/eleves/${req.params.id}/modifier`);
    }
}

async function remove(req, res) {
    try {
        const api = apiClient(req.session.token);
        await api.delete(`/eleves/${req.params.id}`);
        req.flash('success', 'Élève supprimé');
        res.redirect('/eleves');
    } catch (err) {
        req.flash('error', err.data?.error || err.message);
        res.redirect('/eleves');
    }
}

module.exports = { index, search, show, createForm, create, editForm, update, remove };
