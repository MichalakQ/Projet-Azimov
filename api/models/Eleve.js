import pool from '../config/database.js';

export class Eleve {
    /**
     * Récupérer tous les élèves avec pagination
     */
 /**
 * Récupérer tous les élèves avec pagination
 */
static async findAll(page = 1, limit = 20) {
    let conn;
    try {
        conn = await pool.getConnection();
        const offset = (page - 1) * limit;
        
        const data = await conn.query(`
            SELECT 
                e.id,
                e.nom,
                e.prenom,
                e.identifiant_csv AS identifiant,
                e.date_naissance,
                CONCAT(n.numero, c.lettre) AS classe,
                n.libelle AS niveau,
                e.date_creation
            FROM eleve e
            LEFT JOIN inscription i ON i.id_eleve = e.id
            LEFT JOIN classe c ON c.id = i.id_classe
            LEFT JOIN niveau n ON n.id = c.id_niveau
            GROUP BY e.id
            ORDER BY e.nom, e.prenom
            LIMIT ? OFFSET ?
        `, [limit, offset]);
        
        const countResult = await conn.query('SELECT COUNT(*) as total FROM eleve');
        const total = Number(countResult[0].total);  // ✅ CONVERTIR EN NUMBER
        
        return {
            data: data,
            count: total,
            page: page,
            totalPages: Math.ceil(total / limit)
        };
    } finally {
        if (conn) conn.release();
    }
}

    /**
     * Récupérer un élève par ID
     */
    static async findById(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query(`
                SELECT 
                    e.id,
                    e.nom,
                    e.prenom,
                    e.identifiant_csv AS identifiant,
                    e.date_naissance,
                    CONCAT(n.numero, c.lettre) AS classe,
                    n.libelle AS niveau,
                    e.date_creation
                FROM eleve e
                LEFT JOIN inscription i ON i.id_eleve = e.id
                LEFT JOIN classe c ON c.id = i.id_classe
                LEFT JOIN niveau n ON n.id = c.id_niveau
                WHERE e.id = ?
            `, [id]);
            
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Chercher des élèves par nom/prénom
     */
    static async search(query) {
        let conn;
        try {
            conn = await pool.getConnection();
            const searchTerm = `%${query}%`;
            
            const data = await conn.query(`
                SELECT 
                    e.id,
                    e.nom,
                    e.prenom,
                    e.identifiant_csv AS identifiant,
                    e.date_naissance,
                    CONCAT(n.numero, c.lettre) AS classe,
                    n.libelle AS niveau
                FROM eleve e
                LEFT JOIN inscription i ON i.id_eleve = e.id
                LEFT JOIN classe c ON c.id = i.id_classe
                LEFT JOIN niveau n ON n.id = c.id_niveau
                WHERE e.nom LIKE ? OR e.prenom LIKE ?
                ORDER BY e.nom, e.prenom
            `, [searchTerm, searchTerm]);
            
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les statistiques d'un élève
     */
    static async getStatistiques(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            // Élève de base
            const rows = await conn.query(`
                SELECT 
                    e.id,
                    e.nom,
                    e.prenom,
                    e.identifiant_csv AS identifiant,
                    e.date_naissance,
                    CONCAT(n.numero, c.lettre) AS classe,
                    n.libelle AS niveau,
                    u_ref.prenom AS prenom_referent,
                    u_ref.nom AS nom_referent
                FROM eleve e
                LEFT JOIN inscription i ON i.id_eleve = e.id
                LEFT JOIN classe c ON c.id = i.id_classe
                LEFT JOIN niveau n ON n.id = c.id_niveau
                LEFT JOIN referent r ON r.id_eleve = e.id
                LEFT JOIN enseignant ens ON ens.id = r.id_enseignant
                LEFT JOIN utilisateur u_ref ON u_ref.id = ens.id_utilisateur
                WHERE e.id = ?
            `, [id]);
            
            if (rows.length === 0) return null;
            
            const eleve = rows[0];
            
            // Moyennes
            const moyennes = await conn.query(`
                SELECT id, id_eleve, valeur, semestre, annee_scolaire, validee, date_saisie
                FROM moyenne
                WHERE id_eleve = ?
                ORDER BY annee_scolaire DESC, semestre DESC
            `, [id]);
            
            // Options
            const options = await conn.query(`
                SELECT DISTINCT o.id, o.libelle, o.categorie
                FROM eleve_option eo
                JOIN option_scolaire o ON o.id = eo.id_option
                WHERE eo.id_eleve = ?
            `, [id]);
            
            // Parents
            const parents = await conn.query(`
                SELECT DISTINCT u.nom, u.prenom, u.email, ep.lien
                FROM eleve_parent ep
                JOIN parent p ON p.id = ep.id_parent
                JOIN utilisateur u ON u.id = p.id_utilisateur
                WHERE ep.id_eleve = ?
            `, [id]);
            
            return {
                ...eleve,
                moyennes: moyennes,
                options: options,
                parents: parents
            };
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer un élève
     */
    static async create(data) {
        const { nom, prenom, identifiant } = data;
        
        if (!nom || !prenom || !identifiant) {
            throw new Error('Champs requis: nom, prenom, identifiant');
        }
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            // Créer utilisateur
            const userResult = await conn.query(`
                INSERT INTO utilisateur (identifiant, mot_de_passe, nom, prenom, email, id_role, actif)
                VALUES (?, ?, ?, ?, ?, 4, 1)
            `, [identifiant, 'hashed_password', nom, prenom, `${identifiant}@asimov.edu`]);
            
            const userId = userResult.insertId;
            
            // Créer élève
            const result = await conn.query(`
                INSERT INTO eleve (id_utilisateur, nom, prenom, identifiant_csv)
                VALUES (?, ?, ?, ?)
            `, [userId, nom, prenom, identifiant]);
            
            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Mettre à jour un élève
     */
    static async update(id, data) {
        const { nom, prenom } = data;
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            await conn.query(
                'UPDATE eleve SET nom = ?, prenom = ? WHERE id = ?',
                [nom || undefined, prenom || undefined, id]
            );
            
            return await this.findById(id);
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Supprimer un élève
     */
    static async delete(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            await conn.query('DELETE FROM eleve WHERE id = ?', [id]);
            return true;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Inscrire un élève à une classe
     */
    static async inscribeToClasse(idEleve, idClasse) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const result = await conn.query(`
                INSERT INTO inscription (id_eleve, id_classe)
                VALUES (?, ?)
            `, [idEleve, idClasse]);
            
            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }
}