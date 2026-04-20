/**
 * @module controllers/stage.controller
 * @description Contrôleur des vues stages
 */

const { apiClient } = require('../config/api');

async function suivi(req, res) {
    try {
        const api = apiClient(req.session.token);
        const annee = req.query.annee_scolaire || '';
        const { data } = await api.get(`/stages/recherches/suivi${annee ? '?annee_scolaire=' + annee : ''}`);

        res.render('stages/suivi', {
            title: 'Suivi des recherches de stage',
            recherches: data,
            anneeScolaire: annee
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/dashboard');
    }
}

async function recherchesEleve(req, res) {
    try {
        const api = apiClient(req.session.token);
        const [rechRes, eleveRes] = await Promise.all([
            api.get(`/stages/recherches/eleve/${req.params.id}`),
            api.get(`/eleves/${req.params.id}`)
        ]);

        res.render('stages/recherches', {
            title: `Recherches de ${rechRes.data[0]?.eleve_nom || 'l\'élève'}`,
            recherches: rechRes.data,
            eleve: eleveRes.data
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/stages/suivi');
    }
}

async function createRechercheForm(req, res) {
    try {
        const api = apiClient(req.session.token);
        const [entreprisesRes, elevesRes] = await Promise.all([
            api.get('/stages/entreprises'),
            api.get('/eleves?limit=100')
        ]);

        res.render('stages/nouvelle-recherche', {
            title: 'Nouvelle recherche de stage',
            entreprises: entreprisesRes.data,
            eleves: elevesRes.data.data || [],
            id_eleve: req.query.id_eleve || ''
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/stages/suivi');
    }
}

async function createRecherche(req, res) {
    try {
        const api = apiClient(req.session.token);
        await api.post('/stages/recherches', {
            id_eleve: parseInt(req.body.id_eleve),
            id_entreprise: parseInt(req.body.id_entreprise),
            id_contact: req.body.id_contact ? parseInt(req.body.id_contact) : null,
            annee_scolaire: req.body.annee_scolaire,
            nb_lettres_envoyees: parseInt(req.body.nb_lettres_envoyees) || 1,
            nb_lettres_recues: parseInt(req.body.nb_lettres_recues) || 0,
            resultat_entretien: req.body.resultat_entretien || 'en_attente'
        });
        req.flash('success', 'Recherche enregistrée');
        res.redirect(`/stages/eleve/${req.body.id_eleve}`);
    } catch (err) {
        req.flash('error', err.data?.error || err.message);
        res.redirect('/stages/nouvelle-recherche');
    }
}

async function conventions(req, res) {
    try {
        const api = apiClient(req.session.token);
        const { data } = await api.get('/stages/conventions');
        res.render('stages/conventions', { title: 'Conventions de stage', conventions: data });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/dashboard');
    }
}

async function conventionDetail(req, res) {
    try {
        const api = apiClient(req.session.token);
        const { data } = await api.get(`/stages/conventions/${req.params.id}`);
        res.render('stages/convention-detail', { title: 'Convention de stage', convention: data });
    } catch (err) {
        req.flash('error', 'Convention non trouvée');
        res.redirect('/stages/conventions');
    }
}

async function createConventionForm(req, res) {
    try {
        const api = apiClient(req.session.token);
        const [entreprisesRes, elevesRes] = await Promise.all([
            api.get('/stages/entreprises'),
            api.get('/eleves?limit=100')
        ]);
        res.render('stages/nouvelle-convention', {
            title: 'Nouvelle convention',
            entreprises: entreprisesRes.data,
            eleves: elevesRes.data.data || []
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/stages/conventions');
    }
}

async function createConvention(req, res) {
    try {
        const api = apiClient(req.session.token);
        await api.post('/stages/conventions', {
            id_eleve: parseInt(req.body.id_eleve),
            id_entreprise: parseInt(req.body.id_entreprise),
            date_debut: req.body.date_debut,
            date_fin: req.body.date_fin,
            sujet: req.body.sujet
        });
        req.flash('success', 'Convention créée');
        res.redirect('/stages/conventions');
    } catch (err) {
        req.flash('error', err.data?.error || err.message);
        res.redirect('/stages/conventions/nouvelle');
    }
}

async function validerConvention(req, res) {
    try {
        const api = apiClient(req.session.token);
        await api.put(`/stages/conventions/${req.params.id}/valider`, {
            id_enseignant: parseInt(req.body.id_enseignant)
        });
        req.flash('success', 'Convention validée');
    } catch (err) {
        req.flash('error', err.data?.error || err.message);
    }
    res.redirect('/stages/conventions');
}

async function entreprises(req, res) {
    try {
        const api = apiClient(req.session.token);
        const { data } = await api.get('/stages/entreprises');
        res.render('stages/entreprises', { title: 'Entreprises', entreprises: data });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/dashboard');
    }
}

async function createEntreprise(req, res) {
    try {
        const api = apiClient(req.session.token);
        await api.post('/stages/entreprises', req.body);
        req.flash('success', 'Entreprise ajoutée');
        res.redirect('/stages/entreprises');
    } catch (err) {
        req.flash('error', err.data?.error || err.message);
        res.redirect('/stages/entreprises');
    }
}

module.exports = {
    suivi, recherchesEleve, createRechercheForm, createRecherche,
    conventions, conventionDetail, createConventionForm, createConvention, validerConvention,
    entreprises, createEntreprise
};
