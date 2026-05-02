import pool from '../config/database.js';

export class Eleve {
    /**
     * Récupérer tous les élèves avec pagination
     */
    static async findAll(page = 1, limit = 20) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const offset = (page - 1) * limit;

            const [countResult] = await conn.query('SELECT COUNT(*) AS total FROM eleve');
            const total = Number(countResult.total);

            const data = await conn.query(`
                SELECT e.id, e.nom, e.prenom, e.identifiant, e.date_naissance,
                       CONCAT(n.numero, c.lettre) AS classe, n.libelle AS niveau,
                       e.date_creation
                FROM eleve e
                LEFT JOIN inscription i ON i.id_eleve = e.id
                LEFT JOIN classe c ON c.id = i.id_classe
                LEFT JOIN niveau n ON n.id = c.id_niveau
                ORDER BY e.nom, e.prenom
                LIMIT ? OFFSET ?
            `, [limit, offset]);

            return {
                data,
                count: total,
                page,
                limit,
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
            const rows = await conn.query('SELECT * FROM eleve WHERE id = ?', [id]);
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Rechercher des élèves
     */
    static async search(query) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const data = await conn.query(`
                SELECT e.id, e.nom, e.prenom, e.identifiant,
                       CONCAT(n.numero, c.lettre) AS classe
                FROM eleve e
                LEFT JOIN inscription i ON i.id_eleve = e.id
                LEFT JOIN classe c ON c.id = i.id_classe
                LEFT JOIN niveau n ON n.id = c.id_niveau
                WHERE e.nom LIKE ? OR e.prenom LIKE ? OR e.identifiant LIKE ?
                ORDER BY e.nom
            `, [`%${query}%`, `%${query}%`, `%${query}%`]);
            
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les statistiques complètes d'un élève
     */
    static async getStatistiques(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            // Infos de base
            const [eleve] = await conn.query(`
                SELECT e.id, e.nom, e.prenom, e.identifiant, e.date_naissance,
                       CONCAT(n.numero, c.lettre) AS classe_actuelle,
                       ens.nom AS nom_referent, ens.prenom AS prenom_referent
                FROM eleve e
                LEFT JOIN inscription i ON i.id_eleve = e.id
                LEFT JOIN classe c ON c.id = i.id_classe
                LEFT JOIN niveau n ON n.id = c.id_niveau
                LEFT JOIN referent r ON r.id_eleve = e.id AND r.annee_scolaire = i.annee_scolaire
                LEFT JOIN enseignant ens ON ens.id = r.id_enseignant
                ORDER BY i.annee_scolaire DESC LIMIT 1
            `, [id]);

            if (!eleve) return null;

            // Moyennes
            const moyennes = await conn.query(`
                SELECT m.annee_scolaire, m.semestre, m.valeur, m.validee
                FROM moyenne m WHERE m.id_eleve = ?
                ORDER BY m.annee_scolaire DESC, m.semestre DESC
            `, [id]);

            // Options
            const options = await conn.query(`
                SELECT o.libelle, o.categorie, eo.annee_scolaire
                FROM eleve_option eo JOIN option_scolaire o ON o.id = eo.id_option
                WHERE eo.id_eleve = ?
            `, [id]);

            // Parents
            const parents = await conn.query(`
                SELECT p.nom, p.prenom, p.email, ep.lien
                FROM parent p JOIN eleve_parent ep ON ep.id_parent = p.id
                WHERE ep.id_eleve = ?
            `, [id]);

            return { ...eleve, moyennes, options, parents };
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Créer un nouvel élève
     */
    static async create(data) {
        const { nom, prenom, identifiant, date_naissance, id_utilisateur } = data;
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            const result = await conn.query(`
                INSERT INTO eleve (id_utilisateur, nom, prenom, identifiant, date_naissance, date_creation)
                VALUES (?, ?, ?, ?, ?, NOW())
            `, [id_utilisateur, nom.toUpperCase(), prenom, identifiant, date_naissance || null]);
            
            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Mettre à jour un élève
     */
    static async update(id, data) {
        const { nom, prenom, date_naissance } = data;
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            await conn.query(`
                UPDATE eleve
                SET nom = ?, prenom = ?, date_naissance = ?
                WHERE id = ?
            `, [
                nom ? nom.toUpperCase() : undefined,
                prenom,
                date_naissance,
                id
            ]);
            
            return await this.findById(id);
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Inscrire un élève à une classe
     */
    static async inscribeToClasse(idEleve, idClasse, annee) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            await conn.query(`
                INSERT INTO inscription (id_eleve, id_classe, annee_scolaire, date_inscription)
                VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE id_classe = ?
            `, [idEleve, idClasse, annee, idClasse]);
            
            return true;
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
            
            const result = await conn.query('DELETE FROM eleve WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } finally {
            if (conn) conn.release();
        }
    }
}
