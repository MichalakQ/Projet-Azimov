import pool from '../config/database.js';

export class Stage {
    /**
     * Récupérer les recherches de stage d'un élève
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
                    a.libelle AS annee_scolaire,
                    rs.date_creation
                FROM recherche_stage rs
                INNER JOIN entreprise ent ON ent.id = rs.id_entreprise
                LEFT JOIN contact_entreprise ce ON ce.id = rs.id_contact
                LEFT JOIN annee_scolaire a ON a.id = rs.id_annee_scolaire
                WHERE rs.id_eleve = ? 
                ORDER BY rs.date_creation DESC
            `, [idEleve]);
            
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer le suivi des recherches de stage pour une année
     * Avec alerte si > 15 entreprises contactées
     */
    static async getSuivi(annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const data = await conn.query(`
                SELECT 
                    u.nom,
                    u.prenom,
                    COUNT(DISTINCT rs.id_entreprise) AS nb_entreprises_contactees,
                    (COUNT(DISTINCT rs.id_entreprise) > 15) AS alerte,
                    a.libelle AS annee_scolaire
                FROM recherche_stage rs
                INNER JOIN eleve e ON e.id = rs.id_eleve
                INNER JOIN utilisateur u ON u.id = e.id_utilisateur
                INNER JOIN annee_scolaire a ON a.id = rs.id_annee_scolaire
                WHERE a.libelle = ?
                GROUP BY e.id, u.nom, u.prenom, a.libelle
                ORDER BY alerte DESC, nb_entreprises_contactees DESC
            `, [annee]);
            
            // ✅ Convertir BigInt en Number et booléen
            return data.map(row => ({
                ...row,
                nb_entreprises_contactees: Number(row.nb_entreprises_contactees),
                alerte: Boolean(row.alerte)
            }));
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer une recherche de stage
     */
    static async createRecherche(data) {
        const { idEleve, idEntreprise, idAnneeScolaire } = data;
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            const result = await conn.query(`
                INSERT INTO recherche_stage (id_eleve, id_entreprise, id_annee_scolaire, date_creation)
                VALUES (?, ?, ?, NOW())
            `, [idEleve, idEntreprise, idAnneeScolaire]);
            
            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Mettre à jour une recherche de stage
     */
    static async updateRecherche(id, data) {
        const { nbLettresEnvoyees, nbLettresRecues, dateEntretien, resultat, commentaire } = data;
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            await conn.query(`
                UPDATE recherche_stage 
                SET nb_lettres_envoyees = ?, nb_lettres_recues = ?, 
                    date_entretien = ?, resultat_entretien = ?, commentaire = ?
                WHERE id = ?
            `, [nbLettresEnvoyees, nbLettresRecues, dateEntretien, resultat, commentaire, id]);
            
            return true;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les documents/conventions de stage
     */
    static async getConventions() {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const data = await conn.query(`
                SELECT 
                    ds.id,
                    u.nom AS eleve_nom,
                    u.prenom AS eleve_prenom,
                    ent.nom AS entreprise_nom,
                    ds.type_document,
                    ds.date_debut,
                    ds.date_fin,
                    ds.validee,
                    a.libelle AS annee_scolaire
                FROM document_stage ds
                INNER JOIN eleve e ON e.id = ds.id_eleve
                INNER JOIN utilisateur u ON u.id = e.id_utilisateur
                INNER JOIN entreprise ent ON ent.id = ds.id_entreprise
                LEFT JOIN annee_scolaire a ON a.id = ds.id_annee_scolaire
                ORDER BY ds.date_debut DESC
            `);
            
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer un document/convention par ID
     */
    static async getConventionById(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const rows = await conn.query(`
                SELECT 
                    ds.id,
                    ds.id_eleve,
                    ds.id_entreprise,
                    u.nom AS eleve_nom,
                    u.prenom AS eleve_prenom,
                    ent.nom AS entreprise_nom,
                    ds.type_document,
                    ds.date_debut,
                    ds.date_fin,
                    ds.validee
                FROM document_stage ds
                INNER JOIN eleve e ON e.id = ds.id_eleve
                INNER JOIN utilisateur u ON u.id = e.id_utilisateur
                INNER JOIN entreprise ent ON ent.id = ds.id_entreprise
                WHERE ds.id = ?
            `, [id]);
            
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer un document/convention de stage
     */
    static async createConvention(data) {
        const { idEleve, idEntreprise, typeDocument, dateDebut, dateFin } = data;
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            const result = await conn.query(`
                INSERT INTO document_stage (id_eleve, id_entreprise, type_document, date_debut, date_fin, date_creation)
                VALUES (?, ?, ?, ?, ?, NOW())
            `, [idEleve, idEntreprise, typeDocument || 'convention', dateDebut || null, dateFin || null]);
            
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
                SELECT 
                    id,
                    nom,
                    adresse,
                    ville,
                    code_postal,
                    telephone,
                    email,
                    site_web
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
                SELECT 
                    id,
                    nom,
                    adresse,
                    ville,
                    code_postal,
                    telephone,
                    email,
                    site_web
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
                SELECT 
                    id,
                    nom,
                    prenom,
                    fonction,
                    telephone,
                    email
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
                INSERT INTO contact_entreprise (id_entreprise, nom, prenom, fonction, telephone, email)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [idEntreprise, nom, prenom, fonction, telephone, email]);
            
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