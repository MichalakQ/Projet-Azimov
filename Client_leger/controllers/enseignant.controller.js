/**
 * @module controllers/enseignant.controller
 */
const { apiClient } = require('../config/api');

async function index(req, res) {
    try {
        const api = apiClient(req.session.token);
        const { data } = await api.get('/enseignants');
        res.render('enseignants/index', { title: 'Enseignants', enseignants: data.data || [] });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/dashboard');
    }
}

async function show(req, res) {
    try {
        const api = apiClient(req.session.token);
        const [ensRes, elevesRes] = await Promise.all([
            api.get(`/enseignants/${req.params.id}`),
            api.get(`/enseignants/${req.params.id}/eleves`)
        ]);
        res.render('enseignants/show', {
            title: `${ensRes.data.prenom} ${ensRes.data.nom}`,
            enseignant: ensRes.data,
            elevesReferes: elevesRes.data
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/enseignants');
    }
}

module.exports = { index, show };
