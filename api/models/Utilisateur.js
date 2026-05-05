import pool from '../config/database.js';
import bcrypt from 'bcrypt';

export class Utilisateur {
    /**
     * Créer un nouvel utilisateur
     */
    static async create(data) {
        const { identifiant, mot_de_passe, nom, prenom, email, telephone, id_role } = data;
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            // Hasher le mot de passe
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(mot_de_passe, salt);
            
            const result = await conn.query(`
                INSERT INTO utilisateur (identifiant, mot_de_passe, nom, prenom, email, telephone, actif, id_role)
                VALUES (?, ?, ?, ?, ?, ?, TRUE, ?)
            `, [identifiant, hashedPassword, nom, prenom, email, telephone, id_role]);
            
            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Trouver un utilisateur par identifiant
     */
    static async findByIdentifiant(identifiant) {
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query(`
                SELECT u.*, r.libelle AS role
                FROM utilisateur u
                JOIN role r ON r.id = u.id_role
                WHERE u.identifiant = ? AND u.actif = TRUE
            `, [identifiant]);
            
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Trouver un utilisateur par ID
     */
    static async findById(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            const rows = await conn.query(`
                SELECT u.id, u.identifiant, u.email, r.libelle AS role
                FROM utilisateur u
                JOIN role r ON r.id = u.id_role
                WHERE u.id = ? AND u.actif = TRUE
            `, [id]);
            
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Vérifier le mot de passe
     */
    static async verifyPassword(motDePasse, hash) {
        return await bcrypt.compare(motDePasse, hash);
    }

    /**
     * Récupérer tous les utilisateurs
     */
    static async findAll(filters = {}) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            let query = `
                SELECT u.id, u.identifiant, u.email, u.nom, u.prenom, u.telephone, r.libelle AS role, u.actif
                FROM utilisateur u
                JOIN role r ON r.id = u.id_role
                WHERE 1=1
            `;
            const params = [];
            
            if (filters.actif !== undefined) {
                query += ` AND u.actif = ?`;
                params.push(filters.actif);
            }
            
            if (filters.role) {
                query += ` AND r.libelle = ?`;
                params.push(filters.role);
            }
            
            query += ` ORDER BY u.nom, u.prenom`;
            
            const rows = await conn.query(query, params);
            return rows;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Mettre à jour un utilisateur
     */
    static async update(id, data) {
        const { nom, prenom, email, telephone } = data;
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            await conn.query(`
                UPDATE utilisateur
                SET nom = ?, prenom = ?, email = ?, telephone = ?
                WHERE id = ?
            `, [nom, prenom, email, telephone, id]);
            
            return await this.findById(id);
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Désactiver un utilisateur
     */
    static async deactivate(id) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            await conn.query(`
                UPDATE utilisateur SET actif = FALSE WHERE id = ?
            `, [id]);
            
            return true;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Changer le mot de passe
     */
    static async changePassword(id, newPassword) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            
            await conn.query(`
                UPDATE utilisateur SET mot_de_passe = ? WHERE id = ?
            `, [hashedPassword, id]);
            
            return true;
        } finally {
            if (conn) conn.release();
        }
    }
}
