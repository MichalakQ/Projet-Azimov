import pool from '../config/database.js';

export class Classe {
    /**
     * Récupérer toutes les classes d'une année
     */
    static async findAll(annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const data = await conn.query(`
                SELECT 
                    c.id,
                    CONCAT(n.numero, c.lettre) AS nom,
                    n.libelle AS niveau,
                    a.libelle AS annee_scolaire,
                    COUNT(DISTINCT i.id_eleve) AS nb_eleves
                FROM classe c 
                INNER JOIN niveau n ON n.id = c.id_niveau
                INNER JOIN annee_scolaire a ON a.id = c.id_annee_scolaire
                LEFT JOIN inscription i ON i.id_classe = c.id
                WHERE a.libelle = ?
                GROUP BY c.id, n.numero, c.lettre, n.libelle, a.libelle
                ORDER BY n.numero DESC, c.lettre
            `, [annee]);
            
            // ✅ CONVERTIR BigInt en Number
            return data.map(row => ({
                ...row,
                nb_eleves: Number(row.nb_eleves)
            }));
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer une classe par ID
     */
    static async findById(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const rows = await conn.query(`
                SELECT 
                    c.id,
                    CONCAT(n.numero, c.lettre) AS nom,
                    n.libelle AS niveau,
                    a.libelle AS annee_scolaire,
                    COUNT(DISTINCT i.id_eleve) AS nb_eleves
                FROM classe c 
                INNER JOIN niveau n ON n.id = c.id_niveau
                INNER JOIN annee_scolaire a ON a.id = c.id_annee_scolaire
                LEFT JOIN inscription i ON i.id_classe = c.id
                WHERE c.id = ?
                GROUP BY c.id, n.numero, c.lettre, n.libelle, a.libelle
            `, [id]);
            
            if (rows.length === 0) return null;
            
            // ✅ CONVERTIR BigInt en Number
            return {
                ...rows[0],
                nb_eleves: Number(rows[0].nb_eleves)
            };
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer tous les niveaux
     */
    static async getNiveaux() {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const data = await conn.query(`
                SELECT id, numero, libelle 
                FROM niveau 
                ORDER BY numero DESC
            `);
            
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les élèves d'une classe
     */
    static async getEleves(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const data = await conn.query(`
                SELECT DISTINCT
                    e.id,
                    u.nom,
                    u.prenom,
                    e.identifiant_csv AS identifiant,
                    CONCAT(n.numero, c.lettre) AS classe
                FROM inscription i 
                INNER JOIN eleve e ON e.id = i.id_eleve
                INNER JOIN utilisateur u ON u.id = e.id_utilisateur
                INNER JOIN classe c ON c.id = i.id_classe
                INNER JOIN niveau n ON n.id = c.id_niveau
                WHERE i.id_classe = ? 
                ORDER BY u.nom, u.prenom
            `, [id]);
            
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer une classe
     */
    static async create(data) {
        const { idNiveau, lettre, idAnneeScolaire } = data;
        
        if (!idNiveau || !lettre || !idAnneeScolaire) {
            throw new Error('Champs requis: idNiveau, lettre, idAnneeScolaire');
        }
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            const result = await conn.query(`
                INSERT INTO classe (id_niveau, lettre, id_annee_scolaire)
                VALUES (?, ?, ?)
            `, [idNiveau, lettre, idAnneeScolaire]);
            
            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Supprimer une classe
     */
    static async delete(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            await conn.query('DELETE FROM classe WHERE id = ?', [id]);
            
            return true;
        } finally {
            if (conn) conn.release();
        }
    }
}