/**
 * @module controllers/classe.controller
 */
const { apiClient } = require('../config/api');

async function index(req, res) {
    try {
        const api = apiClient(req.session.token);
        const annee = req.query.annee_scolaire || '';
        const { data } = await api.get(`/classes${annee ? '?annee_scolaire=' + annee : ''}`);
        res.render('classes/index', { title: 'Classes', classes: data, anneeScolaire: annee });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/dashboard');
    }
}

async function show(req, res) {
    try {
        const api = apiClient(req.session.token);
        const [classeRes, elevesRes] = await Promise.all([
            api.get(`/classes/${req.params.id}`),
            api.get(`/classes/${req.params.id}/eleves`)
        ]);
        res.render('classes/show', {
            title: `Classe`,
            classe: classeRes.data,
            eleves: elevesRes.data
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/classes');
    }
}

module.exports = { index, show };
