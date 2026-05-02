import pool from '../config/database.js';

export class Moyenne {
    /**
     * Récupérer les moyennes d'un élève
     */
    static async findByEleve(idEleve) {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(`
                SELECT m.*, CONCAT(n.numero, c.lettre) AS classe
                FROM moyenne m
                JOIN inscription i ON i.id_eleve = m.id_eleve AND i.annee_scolaire = m.annee_scolaire
                JOIN classe c ON c.id = i.id_classe
                JOIN niveau n ON n.id = c.id_niveau
                WHERE m.id_eleve = ? 
                ORDER BY m.annee_scolaire DESC, m.semestre DESC
            `, [idEleve]);
            
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les moyennes par niveau
     */
    static async findByNiveau(annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(
                'SELECT * FROM v_moyennes_par_niveau WHERE annee_scolaire = ? ORDER BY niveau DESC, semestre',
                [annee]
            );
            
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les moyennes en attente de validation
     */
    static async findEnAttente() {
        let conn;
        try {
            conn = await pool.getConnection();
            const data = await conn.query(`
                SELECT m.*, e.nom, e.prenom, CONCAT(n.numero, c.lettre) AS classe
                FROM moyenne m
                JOIN eleve e ON e.id = m.id_eleve
                JOIN inscription i ON i.id_eleve = m.id_eleve AND i.annee_scolaire = m.annee_scolaire
                JOIN classe c ON c.id = i.id_classe
                JOIN niveau n ON n.id = c.id_niveau
                WHERE m.validee = FALSE 
                ORDER BY m.date_saisie
            `);
            
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer une nouvelle moyenne
     */
    static async create(data) {
        const { id_eleve, annee_scolaire, semestre, valeur, id_saisie_par } = data;
        
        if (valeur < 0 || valeur > 20) {
            throw new Error('Valeur entre 0 et 20');
        }
        
        if (![1, 2].includes(semestre)) {
            throw new Error('Semestre : 1 ou 2');
        }
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            const result = await conn.query(`
                INSERT INTO moyenne (id_eleve, annee_scolaire, semestre, valeur, id_saisie_par, date_saisie)
                VALUES (?, ?, ?, ?, ?, NOW())
            `, [id_eleve, annee_scolaire, semestre, valeur, id_saisie_par]);
            
            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Valider une moyenne
     */
    static async valider(id, idValideur) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const result = await conn.query(
                'UPDATE moyenne SET validee = TRUE, id_valide_par = ?, date_validation = NOW() WHERE id = ? AND validee = FALSE',
                [idValideur, id]
            );
            
            if (result.affectedRows === 0) {
                throw new Error('Moyenne introuvable ou déjà validée');
            }
            
            return await this.findById(id);
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Corriger une moyenne
     */
    static async corriger(id, valeur) {
        if (valeur < 0 || valeur > 20) {
            throw new Error('Valeur entre 0 et 20');
        }
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            await conn.query(
                'UPDATE moyenne SET valeur = ?, validee = FALSE, id_valide_par = NULL, date_validation = NULL WHERE id = ?',
                [valeur, id]
            );
            
            return await this.findById(id);
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer une moyenne par ID
     */
    static async findById(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query('SELECT * FROM moyenne WHERE id = ?', [id]);
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }
}
