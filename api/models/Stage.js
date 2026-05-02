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
                SELECT rs.*, ent.nom AS entreprise_nom, ent.ville,
                       ce.nom AS contact_nom, ce.email AS contact_email
                FROM recherche_stage rs
                JOIN entreprise ent ON ent.id = rs.id_entreprise
                LEFT JOIN contact_entreprise ce ON ce.id = rs.id_contact
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
     */
    static async getSuivi(annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(
                'SELECT * FROM v_eleves_recherche_stage WHERE annee_scolaire = ? ORDER BY alerte DESC, nb_entreprises_contactees DESC',
                [annee]
            );
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer une recherche de stage
     */
    static async createRecherche(data) {
        const { idEleve, idEntreprise, annee } = data;
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            const result = await conn.query(`
                INSERT INTO recherche_stage (id_eleve, id_entreprise, annee_scolaire, date_creation)
                VALUES (?, ?, ?, NOW())
            `, [idEleve, idEntreprise, annee]);
            
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
     * Récupérer les conventions de stage
     */
    static async getConventions() {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(`
                SELECT cs.*, e.nom AS eleve_nom, e.prenom AS eleve_prenom, ent.nom AS entreprise_nom
                FROM convention_stage cs
                JOIN eleve e ON e.id = cs.id_eleve
                JOIN entreprise ent ON ent.id = cs.id_entreprise
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
            const rows = await conn.query('SELECT * FROM convention_stage WHERE id = ?', [id]);
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer une convention de stage
     */
    static async createConvention(data) {
        const { idEleve, idEntreprise, dateDebut, dateFin, evaluationMaitreStage } = data;
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            const result = await conn.query(`
                INSERT INTO convention_stage (id_eleve, id_entreprise, date_debut, date_fin, evaluation_maitre_stage, date_creation)
                VALUES (?, ?, ?, ?, ?, NOW())
            `, [idEleve, idEntreprise, dateDebut, dateFin, evaluationMaitreStage || null]);
            
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
            const data = await conn.query('SELECT * FROM entreprise ORDER BY nom');
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
            const rows = await conn.query('SELECT * FROM entreprise WHERE id = ?', [id]);
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
            const data = await conn.query(
                'SELECT * FROM contact_entreprise WHERE id_entreprise = ? ORDER BY nom',
                [idEntreprise]
            );
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
