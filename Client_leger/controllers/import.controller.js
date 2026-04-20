/**
 * @module controllers/import.controller
 */
const { apiClient, API_URL } = require('../config/api');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

function importForm(req, res) {
    res.render('eleves/import', { title: 'Import CSV', resultats: null });
}

async function importCsv(req, res) {
    try {
        if (!req.file) {
            req.flash('error', 'Fichier CSV requis');
            return res.redirect('/eleves/import');
        }

        const form = new FormData();
        form.append('fichier', fs.createReadStream(req.file.path), req.file.originalname);
        form.append('annee_scolaire', req.body.annee_scolaire);
        form.append('classe_lettre', req.body.classe_lettre || 'A');

        const { data } = await axios.post(`${API_URL}/import/eleves`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${req.session.token}`
            }
        });

        // Nettoyage du fichier temporaire
        fs.unlinkSync(req.file.path);

        res.render('eleves/import', {
            title: 'Import CSV',
            resultats: data
        });
    } catch (err) {
        req.flash('error', err.response?.data?.error || err.message);
        res.redirect('/eleves/import');
    }
}

module.exports = { importForm, importCsv };
