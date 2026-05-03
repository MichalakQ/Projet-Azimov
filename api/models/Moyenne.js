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
                SELECT 
                    m.id,
                    m.valeur,
                    m.semestre,
                    a.libelle AS annee_scolaire,
                    m.validee,
                    CONCAT(n.numero, c.lettre) AS classe
                FROM moyenne m
                INNER JOIN annee_scolaire a ON a.id = m.id_annee_scolaire
                INNER JOIN inscription i ON i.id_eleve = m.id_eleve
                INNER JOIN classe c ON c.id = i.id_classe
                INNER JOIN niveau n ON n.id = c.id_niveau
                WHERE m.id_eleve = ? 
                GROUP BY m.id
                ORDER BY m.id_annee_scolaire DESC, m.semestre DESC
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
            
            const data = await conn.query(`
                SELECT 
                    n.numero AS niveau,
                    n.libelle AS libelle_niveau,
                    m.semestre,
                    ROUND(AVG(m.valeur), 2) AS moyenne_niveau,
                    COUNT(DISTINCT m.id_eleve) AS nb_eleves,
                    a.libelle AS annee_scolaire
                FROM moyenne m
                INNER JOIN eleve e ON e.id = m.id_eleve
                INNER JOIN inscription i ON i.id_eleve = e.id
                INNER JOIN classe c ON c.id = i.id_classe
                INNER JOIN niveau n ON n.id = c.id_niveau
                INNER JOIN annee_scolaire a ON a.id = m.id_annee_scolaire
                WHERE a.libelle = ? AND m.validee = TRUE
                GROUP BY n.id, m.semestre, a.id
                ORDER BY n.numero DESC, m.semestre
            `, [annee]);
            
            // ✅ Convertir BigInt/Decimal en Number
            return data.map(row => ({
                ...row,
                nb_eleves: Number(row.nb_eleves),
                moyenne_niveau: Number(row.moyenne_niveau)
            }));
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
                SELECT 
                    m.id,
                    u.nom,
                    u.prenom,
                    CONCAT(n.numero, c.lettre) AS classe,
                    m.semestre,
                    m.valeur,
                    a.libelle AS annee_scolaire,
                    m.validee
                FROM moyenne m
                INNER JOIN eleve e ON e.id = m.id_eleve
                INNER JOIN utilisateur u ON u.id = e.id_utilisateur
                INNER JOIN inscription i ON i.id_eleve = m.id_eleve
                INNER JOIN classe c ON c.id = i.id_classe
                INNER JOIN niveau n ON n.id = c.id_niveau
                INNER JOIN annee_scolaire a ON a.id = m.id_annee_scolaire
                WHERE m.validee = FALSE 
                ORDER BY m.date_saisie
            `);
            
            return data;
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
            
            const rows = await conn.query(`
                SELECT 
                    m.id,
                    m.id_eleve,
                    m.valeur,
                    m.semestre,
                    a.libelle AS annee_scolaire,
                    m.validee,
                    m.date_saisie,
                    m.date_validation
                FROM moyenne m
                LEFT JOIN annee_scolaire a ON a.id = m.id_annee_scolaire
                WHERE m.id = ?
            `, [id]);
            
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer une nouvelle moyenne
     */
    static async create(data) {
        const { id_eleve, id_annee_scolaire, semestre, valeur, id_saisie_par } = data;
        
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
                INSERT INTO moyenne (id_eleve, id_annee_scolaire, semestre, valeur, id_saisie_par, date_saisie)
                VALUES (?, ?, ?, ?, ?, NOW())
            `, [id_eleve, id_annee_scolaire, semestre, valeur, id_saisie_par]);
            
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
}