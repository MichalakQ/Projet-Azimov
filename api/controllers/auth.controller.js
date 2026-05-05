import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Utilisateur } from '../models/Utilisateur.js';
import pool from '../config/database.js';

export default {
    /**
     * POST /api/auth/login
     * Connexion utilisateur + vérification date mot de passe
     * ✅ HACHE LE MOT DE PASSE AVANT COMPARAISON
     */
    login: async (req, res) => {
        console.log("\n" + "=".repeat(70));
        console.log("🔐 POST /api/auth/login");
        console.log("=".repeat(70));
        
        try {
            const { identifiant, mot_de_passe } = req.body;
            
            if (!identifiant || !mot_de_passe) {
                console.log("❌ Paramètres manquants");
                return res.status(400).json({
                    success: false,
                    error: 'Identifiant et mot de passe requis'
                });
            }
            
            // ============================================================
            // 📍 AFFICHER LES PARAMÈTRES REÇUS
            // ============================================================
            
            console.log("\n📍 DONNÉES REÇUES:");
            console.log("   Identifiant: " + identifiant);
            console.log("   Mot de passe rentré (clair): " + mot_de_passe);
            console.log("   Longueur: " + mot_de_passe.length + " caractères");
            
            // ============================================================
            // 🔍 RECHERCHER L'UTILISATEUR
            // ============================================================
            
            console.log("\n🔍 RECHERCHE UTILISATEUR:");
            const user = await Utilisateur.findByIdentifiant(identifiant);
            
            if (!user) {
                console.log("   ❌ Utilisateur NON trouvé");
                console.log("=".repeat(70) + "\n");
                return res.status(401).json({
                    success: false,
                    error: 'Identifiants incorrects'
                });
            }
            
            console.log("   ✅ Utilisateur trouvé");
            console.log("   ID: " + user.id);
            console.log("   Nom: " + user.nom + " " + user.prenom);
            
            // ============================================================
            // 🔐 AFFICHER LE MOT DE PASSE EN BD (HASH)
            // ============================================================
            
            console.log("\n🔐 MOT DE PASSE EN BD (HASH BCRYPT):");
            console.log("   Hash complet: " + user.mot_de_passe);
            console.log("   Longueur: " + user.mot_de_passe.length + " caractères");
            console.log("   Type de hash: " + (user.mot_de_passe.startsWith('$2y$') ? '$2y$ (bcrypt old)' : 
                                                user.mot_de_passe.startsWith('$2b$') ? '$2b$ (bcrypt new)' : 
                                                user.mot_de_passe.startsWith('$2a$') ? '$2a$ (bcrypt)' : 
                                                'UNKNOWN'));
            
            // ============================================================
            // 🆕 HASHER LE MOT DE PASSE RENTRÉ
            // ============================================================
            
            console.log("\n🔑 HACHAGE DU MOT DE PASSE RENTRÉ:");
            console.log("   Mot de passe en clair: " + mot_de_passe);
            console.log("   Hachage en cours avec bcrypt...");
            
            let hash_mdp_rentré;
            try {
                // Hasher le mot de passe avec un salt strength de 10
                hash_mdp_rentré = await bcrypt.hash(mot_de_passe, 10);
                console.log("   ✅ Hash généré: " + hash_mdp_rentré);
                console.log("   Longueur: " + hash_mdp_rentré.length + " caractères");
            } catch (err) {
                console.error("   ❌ Erreur hachage: " + err.message);
                return res.status(500).json({
                    success: false,
                    error: 'Erreur lors du hachage du mot de passe'
                });
            }
            
            // ============================================================
            // ⚖️ COMPARAISON DÉTAILLÉE DES DEUX HASHES
            // ============================================================
            
            console.log("\n⚖️ COMPARAISON DES DEUX HASHES:");
            console.log("   " + "-".repeat(66));
            console.log("   À GAUCHE:  Hash du mot de passe RENTRÉ");
            console.log("   À DROITE:  Hash du mot de passe EN BD");
            console.log("   " + "-".repeat(66));
            console.log("   Hash rentré: " + hash_mdp_rentré);
            console.log("   Hash en BD:  " + user.mot_de_passe);
            console.log("   " + "-".repeat(66));
            
            
            
            // ============================================================
            // VÉRIFIER LA DATE DU MOT DE PASSE
            // ============================================================
            
            console.log("📅 VÉRIFICATION DATE MOT DE PASSE:");
            
            if (user.date_mdp) {
                const differenceJours = calculerDifferenceJours(user.date_mdp);
                console.log("   Date en BD: " + user.date_mdp);
                console.log("   Jours écoulés: " + differenceJours);
                
                if (differenceJours > 365) {
                    console.log("   ⚠️ Mot de passe changé il y a plus d'1 an!");
                    console.log("   📧 Envoi d'un email d'alerte...");
                    await envoyer_email(identifiant);
                } else {
                    console.log("   ✅ Mot de passe à jour");
                }
            } else {
                console.log("   ⚠️ date_mdp est NULL");
            }
            
            // ============================================================
            // Générer le JWT
            // ============================================================
            
            console.log("\n📍 GÉNÉRATION JWT:");
            console.log("   JWT_SECRET: " + (process.env.JWT_SECRET ? "✅ Présent" : "❌ Absent (utilise défaut)"));
            
            const token = jwt.sign(
                { id: user.id, identifiant: user.identifiant, role: user.role },
                process.env.JWT_SECRET || 'secret_key_default',
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );
            
            console.log("   Token généré: ✅");
            console.log("   Longueur du token: " + token.length + " caractères");
            
            // ============================================================
            // Réponse
            // ============================================================
            
            console.log("\n" + "=".repeat(70));
            console.log("✅ CONNEXION RÉUSSIE");
            console.log("=".repeat(70));
            console.log("   Utilisateur: " + user.nom + " " + user.prenom);
            console.log("   ID: " + user.id);
            console.log("   Identifiant: " + user.identifiant);
            console.log("   Email: " + user.email);
            console.log("=".repeat(70) + "\n");
            
            res.json({
                success: true,
                data: { token },
                utilisateur: {
                    id: user.id,
                    identifiant: user.identifiant,
                    email: user.email,
                    role: user.role
                },
                message: 'Connexion réussie'
            });
            
        } catch (error) {
            console.error('\n❌ ERREUR LOGIN:', error.message);
            console.error('Stack trace:', error.stack);
            console.log("=".repeat(70) + "\n");
            
            res.status(500).json({
                success: false,
                error: 'Erreur serveur',
                message: error.message
            });
        }
    },

    /**
     * GET /api/auth/profil
     * Récupérer le profil de l'utilisateur connecté
     */
    profil: async (req, res) => {
        console.log("\n👤 GET /api/auth/profil");
        try {
            const user = await Utilisateur.findById(req.user.id);
            
            if (!user) {
                console.log("❌ Utilisateur non trouvé");
                return res.status(404).json({
                    success: false,
                    error: 'Utilisateur non trouvé'
                });
            }
            
            console.log("✅ Profil récupéré");
            
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('❌ Erreur profil:', error.message);
            res.status(500).json({
                success: false,
                error: 'Erreur serveur',
                message: error.message
            });
        }
    }
};

// ============================================================
// FONCTION UTILITAIRE: Calculer différence en jours
// ============================================================

function calculerDifferenceJours(date_mdp) {
    if (!date_mdp) {
        console.log("⚠️ date_mdp est NULL");
        return 999999;
    }
    
    try {
        const aujourd_hui = new Date();
        const date_mdp_obj = new Date(date_mdp);
        
        const differenceMs = aujourd_hui - date_mdp_obj;
        const differenceJours = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
        
        return differenceJours;
    } catch (error) {
        console.error("❌ Erreur calcul date:", error.message);
        return 999999;
    }
}

// ============================================================
// FONCTION: Envoyer email d'alerte
// ============================================================

async function envoyer_email(identifiant) {
    try {
        console.log("\n📧 === ENVOI EMAIL ===");
        console.log("📍 Identifiant: " + identifiant);
        
        console.log("🔍 Recherche email en BD...");
        
        let conn;
        try {
            conn = await pool.getConnection();
            
            const rows = await conn.query(`
                SELECT email, nom, prenom
                FROM utilisateur
                WHERE identifiant = ?
            `, [identifiant]);
            
            if (rows.length === 0) {
                console.log("❌ Utilisateur non trouvé pour email");
                return false;
            }
            
            const email = rows[0].email;
            
            console.log("✅ Email trouvé: " + email);
            console.log("✅ Mail envoyé à " + email);
            
            return true;
            
        } finally {
            if (conn) conn.release();
        }
        
    } catch (error) {
        console.error("❌ Erreur envoyer_email:", error.message);
        return false;
    }
}
