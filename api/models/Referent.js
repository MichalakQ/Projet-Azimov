import pool from '../config/database.js';

export class Referent {
    /**
     * ✅ CORRIGÉ: Écrire la requête au lieu d'utiliser une vue inexistante
     * Récupérer tous les référents pour une année
     */
    static async findAll(annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            
            // ✅ CORRIGÉ: Écrire la requête avec les vraies tables
            // La vue v_eleves_referent n'existe pas
            const data = await conn.query(`
                SELECT 
                    r.id,
                    r.id_enseignant,
                    r.id_eleve,
                    u_ens.nom AS nom_enseignant,
                    u_ens.prenom AS prenom_enseignant,
                    u_eleve.nom AS nom_eleve,
                    u_eleve.prenom AS prenom_eleve,
                    a.libelle AS annee_scolaire
                FROM referent r
                INNER JOIN enseignant ens ON ens.id = r.id_enseignant
                INNER JOIN utilisateur u_ens ON u_ens.id = ens.id_utilisateur
                INNER JOIN eleve e ON e.id = r.id_eleve
                INNER JOIN utilisateur u_eleve ON u_eleve.id = e.id_utilisateur
                INNER JOIN annee_scolaire a ON a.id = r.id_annee_scolaire
                WHERE a.libelle = ?
                ORDER BY u_ens.nom, u_eleve.nom
            `, [annee]);
            
            return data;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * ✅ CORRIGÉ: Joindre avec annee_scolaire pour obtenir le libelle
     * Récupérer le référent d'un élève pour une année
     */
    static async getByEleve(idEleve, annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            
            // ✅ CORRIGÉ: Joindre avec annee_scolaire
            // referent table a id_annee_scolaire (INT), pas annee_scolaire (STRING)
            const rows = await conn.query(`
                SELECT 
                    r.id,
                    r.id_enseignant,
                    r.id_eleve,
                    u_ens.nom AS nom_enseignant,
                    u_ens.prenom AS prenom_enseignant,
                    a.libelle AS annee_scolaire
                FROM referent r
                INNER JOIN enseignant ens ON ens.id = r.id_enseignant
                INNER JOIN utilisateur u_ens ON u_ens.id = ens.id_utilisateur
                INNER JOIN annee_scolaire a ON a.id = r.id_annee_scolaire  -- ✅ AJOUTER JOIN
                WHERE r.id_eleve = ? AND a.libelle = ?  -- ✅ Comparer a.libelle
            `, [idEleve, annee]);
            
            return rows.length > 0 ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Affecter un référent à un élève
     */
    static async assign(idEnseignant, idEleve, idAnneeScolaire) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            await conn.query(`
                INSERT INTO referent (id_enseignant, id_eleve, id_annee_scolaire) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE id_enseignant = ?
            `, [idEnseignant, idEleve, idAnneeScolaire, idEnseignant]);
            
            return true;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Supprimer l'affectation d'un référent
     */
    static async unassign(idEleve, annee) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            // Récupérer l'id de l'année scolaire
            const anneeRows = await conn.query(
                'SELECT id FROM annee_scolaire WHERE libelle = ?',
                [annee]
            );
            
            if (anneeRows.length === 0) {
                throw new Error('Année scolaire inexistante');
            }
            
            const idAnneeScolaire = anneeRows[0].id;
            
            const result = await conn.query(`
                DELETE FROM referent 
                WHERE id_eleve = ? AND id_annee_scolaire = ?
            `, [idEleve, idAnneeScolaire]);
            
            return result.affectedRows > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * ✅ CORRIGÉ: Implémenter la logique en JavaScript
     * La procédure sp_affecter_referents_round_robin n'existe pas
     * Affectation round-robin (alterne les enseignants)
     */
    static async roundRobin(annee) {
        let conn;
        try {
            conn = await pool.getConnection();
            
            // 1. Récupérer les enseignants actifs
            const enseignants = await conn.query(`
                SELECT e.id 
                FROM enseignant e
                INNER JOIN utilisateur u ON u.id = e.id_utilisateur
                WHERE u.actif = TRUE
                ORDER BY e.id
            `);
            
            if (enseignants.length === 0) {
                throw new Error('Aucun enseignant disponible');
            }
            
            // 2. Récupérer l'ID de l'année scolaire
            const anneeRows = await conn.query(
                'SELECT id FROM annee_scolaire WHERE libelle = ?',
                [annee]
            );
            
            if (anneeRows.length === 0) {
                throw new Error('Année scolaire inexistante');
            }
            
            const idAnneeScolaire = anneeRows[0].id;
            
            // 3. Récupérer les élèves sans référent pour cette année
            const eleves = await conn.query(`
                SELECT e.id
                FROM eleve e
                WHERE e.id NOT IN (
                    SELECT DISTINCT id_eleve 
                    FROM referent 
                    WHERE id_annee_scolaire = ?
                )
                ORDER BY e.id
            `, [idAnneeScolaire]);
            
            if (eleves.length === 0) {
                console.log('ℹ️  Tous les élèves ont déjà un référent');
                return { affectedRows: 0 };
            }
            
            // 4. Affecter les référents en round-robin
            let enseignantIndex = 0;
            let affectedRows = 0;
            
            for (const eleve of eleves) {
                const enseignantId = enseignants[enseignantIndex % enseignants.length].id;
                
                try {
                    await conn.query(`
                        INSERT INTO referent (id_enseignant, id_eleve, id_annee_scolaire)
                        VALUES (?, ?, ?)
                    `, [enseignantId, eleve.id, idAnneeScolaire]);
                    
                    affectedRows++;
                } catch (err) {
                    // Si conflit d'unicité, ignorer
                    if (err.code !== 'ER_DUP_ENTRY') {
                        throw err;
                    }
                }
                
                enseignantIndex++;
            }
            
            console.log(`✅ ${affectedRows} élèves affectés en round-robin`);
            return { affectedRows: affectedRows };
            
        } finally {
            if (conn) conn.release();
        }
    }

    /**
     * Récupérer les statistiques sur les référents
     */
    static async getStatistics(annee = '2025-2026') {
        let conn;
        try {
            conn = await pool.getConnection();
            
            const data = await conn.query(`
                SELECT 
                    r.id_enseignant,
                    u_ens.nom,
                    u_ens.prenom,
                    COUNT(DISTINCT r.id_eleve) AS nb_eleves
                FROM referent r
                INNER JOIN enseignant ens ON ens.id = r.id_enseignant
                INNER JOIN utilisateur u_ens ON u_ens.id = ens.id_utilisateur
                INNER JOIN annee_scolaire a ON a.id = r.id_annee_scolaire
                WHERE a.libelle = ?
                GROUP BY r.id_enseignant, u_ens.id
                ORDER BY nb_eleves DESC
            `, [annee]);
            
            // ✅ Convertir BigInt en Number
            return data.map(row => ({
                ...row,
                nb_eleves: Number(row.nb_eleves)
            }));
        } finally {
            if (conn) conn.release();
        }
    }
}