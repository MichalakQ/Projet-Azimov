import pool from '../config/database.js';

export class Stage {
    /**
     * Récupérer les recherches de stage d'un élève
     * CORRECTIONS :
     *  - `annee_scolaire` est une colonne VARCHAR (pas une table)
     *  - le nom/prénom de l'élève vient de `eleve` directement
     */
    static async getRecherches(idEleve) {
        let conn;
        try {
            conn = await pool.getConnection();

            const data = await conn.query(`
                SELECT
                    rs.id,
                    rs.id_eleve,
                    ent.nom AS entreprise_nom,
                    ent.ville,
                    ce.nom AS contact_nom,
                    ce.email AS contact_email,
                    rs.nb_lettres_envoyees,
                    rs.nb_lettres_recues,
                    rs.resultat_entretien,
                    rs.annee_scolaire,
                    rs.date_creation
                FROM recherche_stage rs
                INNER JOIN entreprise ent ON ent.id = rs.id_entreprise
                LEFT JOIN contact_entreprise ce ON ce.id = rs.id_contact
                WHERE rs.id_eleve = ?
                ORDER BY rs.date_creation DESC
            `, [idEleve]);

            return data.map(row => ({
                ...row,
                nb_lettres_envoyees: Number(row.nb_lettres_envoyees),
                nb_lettres_recues: Number(row.nb_lettres_recues)
            }));
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer le suivi des recherches de stage pour une année.
     * Avec alerte si > 15 entreprises contactées.
     * CORRECTIONS :
     *  - nom/prenom depuis `eleve` (pas de jointure utilisateur)
     *  - `annee_scolaire` en colonne directe
     */
    static async getSuivi(annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();

            const data = await conn.query(`
                SELECT
                    e.id AS id_eleve,
                    e.nom,
                    e.prenom,
                    COUNT(DISTINCT rs.id_entreprise) AS nb_entreprises_contactees,
                    (COUNT(DISTINCT rs.id_entreprise) > 15) AS alerte,
                    rs.annee_scolaire
                FROM recherche_stage rs
                INNER JOIN eleve e ON e.id = rs.id_eleve
                WHERE rs.annee_scolaire = ?
                GROUP BY e.id, e.nom, e.prenom, rs.annee_scolaire
                ORDER BY alerte DESC, nb_entreprises_contactees DESC
            `, [annee]);

            return data.map(row => ({
                ...row,
                nb_entreprises_contactees: Number(row.nb_entreprises_contactees),
                alerte: Boolean(Number(row.alerte))
            }));
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer une recherche de stage
     * CORRECTION : la table attend `annee_scolaire` (VARCHAR), pas
     * `id_annee_scolaire`. `id_entreprise` est NOT NULL.
     */
    static async createRecherche(data) {
        const { idEleve, idEntreprise, idContact = null, annee } = data;

        if (!idEleve || !idEntreprise || !annee) {
            throw new Error('Champs requis : idEleve, idEntreprise, annee');
        }

        let conn;
        try {
            conn = await pool.getConnection();

            const result = await conn.query(`
                INSERT INTO recherche_stage
                    (id_eleve, id_entreprise, id_contact, annee_scolaire)
                VALUES (?, ?, ?, ?)
            `, [idEleve, idEntreprise, idContact, annee]);

            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Mettre à jour une recherche de stage
     */
    static async updateRecherche(id, data) {
        const {
            nbLettresEnvoyees,
            nbLettresRecues,
            dateEntretien,
            resultat,
            commentaire
        } = data;

        let conn;
        try {
            conn = await pool.getConnection();

            await conn.query(`
                UPDATE recherche_stage
                SET nb_lettres_envoyees = ?,
                    nb_lettres_recues   = ?,
                    date_entretien      = ?,
                    resultat_entretien  = ?,
                    commentaire         = ?
                WHERE id = ?
            `, [
                nbLettresEnvoyees,
                nbLettresRecues,
                dateEntretien || null,
                resultat || 'en_attente',
                commentaire || null,
                id
            ]);

            return true;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les conventions de stage
     * CORRECTIONS MAJEURES :
     *  - la table s'appelle `convention_stage` (pas `document_stage`)
     *  - pas de colonnes `type_document` ni `validee` (mais `validee_referent`)
     *  - pas d'`id_annee_scolaire` ; on déduit l'année depuis l'inscription
     *  - nom/prenom élève depuis `eleve`
     */
    static async getConventions() {
        let conn;
        try {
            conn = await pool.getConnection();

            const data = await conn.query(`
                SELECT
                    cs.id,
                    e.nom        AS eleve_nom,
                    e.prenom     AS eleve_prenom,
                    ent.nom      AS entreprise_nom,
                    ce.nom       AS contact_nom,
                    cs.sujet,
                    cs.date_debut,
                    cs.date_fin,
                    cs.validee_referent,
                    cs.signature_parent,
                    cs.fichier_pdf
                FROM convention_stage cs
                INNER JOIN eleve e          ON e.id = cs.id_eleve
                INNER JOIN entreprise ent   ON ent.id = cs.id_entreprise
                LEFT  JOIN contact_entreprise ce ON ce.id = cs.id_contact
                ORDER BY cs.date_debut DESC
            `);

            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer une convention par ID
     */
    static async getConventionById(id) {
        let conn;
        try {
            conn = await pool.getConnection();

            const rows = await conn.query(`
                SELECT
                    cs.id,
                    cs.id_eleve,
                    cs.id_entreprise,
                    cs.id_contact,
                    e.nom        AS eleve_nom,
                    e.prenom     AS eleve_prenom,
                    ent.nom      AS entreprise_nom,
                    cs.sujet,
                    cs.date_debut,
                    cs.date_fin,
                    cs.validee_referent,
                    cs.signature_parent,
                    cs.fichier_pdf
                FROM convention_stage cs
                INNER JOIN eleve e        ON e.id = cs.id_eleve
                INNER JOIN entreprise ent ON ent.id = cs.id_entreprise
                WHERE cs.id = ?
            `, [id]);

            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer une convention de stage
     * CORRECTION : table `convention_stage`, colonnes alignées au schéma.
     */
    static async createConvention(data) {
        const {
            idEleve,
            idEntreprise,
            idContact = null,
            dateDebut,
            dateFin,
            sujet = null
        } = data;

        if (!idEleve || !idEntreprise || !dateDebut || !dateFin) {
            throw new Error('Champs requis : idEleve, idEntreprise, dateDebut, dateFin');
        }

        let conn;
        try {
            conn = await pool.getConnection();

            const result = await conn.query(`
                INSERT INTO convention_stage
                    (id_eleve, id_entreprise, id_contact, date_debut, date_fin, sujet)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [idEleve, idEntreprise, idContact, dateDebut, dateFin, sujet]);

            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les entreprises
     */
    static async getEntreprises() {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(`
                SELECT id, nom, adresse, ville, code_postal, telephone, email, site_web
                FROM entreprise
                ORDER BY nom
            `);
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer une entreprise par ID
     */
    static async getEntrepriseById(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query(`
                SELECT id, nom, adresse, ville, code_postal, telephone, email, site_web
                FROM entreprise
                WHERE id = ?
            `, [id]);
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les contacts d'une entreprise
     */
    static async getContactsEntreprise(idEntreprise) {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(`
                SELECT id, nom, prenom, fonction, telephone, email
                FROM contact_entreprise
                WHERE id_entreprise = ?
                ORDER BY nom
            `, [idEntreprise]);
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Ajouter un contact à une entreprise
     */
    static async addContact(idEntreprise, data) {
        const { nom, prenom, fonction, telephone, email } = data;

        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query(`
                INSERT INTO contact_entreprise
                    (id_entreprise, nom, prenom, fonction, telephone, email)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [idEntreprise, nom, prenom || null, fonction || null, telephone || null, email || null]);
            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Supprimer une recherche de stage
     */
    static async deleteRecherche(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query('DELETE FROM recherche_stage WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } finally {
            if (conn) conn.release();
        }
    }
}