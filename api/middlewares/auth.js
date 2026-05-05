// ============================================================
// auth.controller.js - AVEC VÉRIFICATION DATE + EMAIL
// ============================================================
// Modifications:
// 1. Récupère la date_mdp lors du login
// 2. Vérifie si CURRENT_DATE - date_mdp > 1 an
// 3. Si oui: Appelle envoyer_email() pour envoyer un email
// 4. Console.log: "mail envoyé à [email]"

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Utilisateur } from '../models/Utilisateur.js';
import pool from '../config/database.js';  // Pour les requêtes SQL

// ============================================================
// FONCTION PRINCIPALE: LOGIN (MODIFIÉE)
// ============================================================

export const login = async (req, res) => {
    try {
        console.log("\n🔐 === POST /api/auth/login ===");
        
        const { identifiant, mot_de_passe } = req.body;
        
        if (!identifiant || !mot_de_passe) {
            console.log("❌ Paramètres manquants");
            return res.status(400).json({
                success: false,
                error: 'Identifiant et mot de passe requis'
            });
        }
        
        console.log("📍 Recherche utilisateur: " + identifiant);
        
        // Chercher l'utilisateur
        const user = await Utilisateur.findByIdentifiant(identifiant);
        if (!user) {
            console.log("❌ Utilisateur non trouvé");
            return res.status(401).json({
                success: false,
                error: 'Identifiants incorrects'
            });
        }
        
        console.log("📍 Vérification mot de passe...");
        
        // Vérifier le mot de passe
        const valid = await Utilisateur.verifyPassword(mot_de_passe, user.mot_de_passe);
        if (!valid) {
            console.log("❌ Mot de passe incorrect");
            return res.status(401).json({
                success: false,
                error: 'Identifiants incorrects'
            });
        }
        
        console.log("✅ Authentification réussie");
        
        // ============================================================
        // 🆕 NOUVELLE LOGIQUE: VÉRIFIER LA DATE DU MOT DE PASSE
        // ============================================================
        
        console.log("📅 Vérification date_mdp...");
        
        // 1️⃣ Récupérer la date_mdp depuis la BD
        const date_mdp = user.date_mdp;
        console.log("📍 date_mdp en BD: " + date_mdp);
        
        // 2️⃣ Vérifier si CURRENT_DATE - date_mdp > 1 an
        const differenceJours = calculerDifferenceJours(date_mdp);
        console.log("📊 Différence: " + differenceJours + " jours");
        
        if (differenceJours > 365) {  // > 1 an
            console.log("⚠️ Mot de passe changé il y a plus d'1 an!");
            console.log("📧 Envoi d'un email d'alerte...");
            
            // 3️⃣ Appeler la fonction envoyer_email()
            await envoyer_email(identifiant);
        } else {
            console.log("✅ Mot de passe à jour");
        }
        
        // ============================================================
        // Continuer avec le login normal
        // ============================================================
        
        console.log("📍 Génération JWT...");
        
        const token = jwt.sign(
            { 
                id: user.id, 
                identifiant: user.identifiant, 
                role: user.role,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
        
        console.log("✅ Token généré");
        console.log("👤 Utilisateur: " + user.nom + " " + user.prenom);
        console.log("👨‍💼 Rôle: " + user.role);
        
        return res.json({
            success: true,
            data: { token },
            utilisateur: {
                id: user.id,
                identifiant: user.identifiant,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                id_role: user.id_role
            },
            message: 'Connexion réussie'
        });
        
    } catch (error) {
        console.error('❌ Erreur login:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Erreur serveur',
            message: error.message
        });
    }
};

// ============================================================
// 🆕 FONCTION UTILITAIRE: CALCULER DIFFÉRENCE EN JOURS
// ============================================================
// Compare CURRENT_DATE avec la date_mdp
// Retourne le nombre de jours d'écart

function calculerDifferenceJours(date_mdp) {
    if (!date_mdp) {
        console.log("⚠️ date_mdp est NULL");
        return 999999;  // Considérer comme très vieux
    }
    
    const aujourd_hui = new Date();
    const date_mdp_obj = new Date(date_mdp);
    
    const differenceMs = aujourd_hui - date_mdp_obj;
    const differenceJours = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
    
    return differenceJours;
}


export async function envoyer_email(identifiant) {
    try {
        console.log("\n📧 === ENVOI EMAIL ===");
        console.log("📍 Identifiant: " + identifiant);
        
        // 1️⃣ REQUÊTE SQL: Obtenir l'email de l'utilisateur
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
            const nom = rows[0].nom;
            const prenom = rows[0].prenom;
            
            console.log("✅ Email trouvé: " + email);
            
            // 2️⃣ ENVOYER L'EMAIL
            console.log("📤 Envoi de l'email...");
            
            // Import du service email
            const { MailService } = await import('../services/MailService.js');
            
            const sujet = "🔔 Alerte - Renouvellement du mot de passe";
            const corps = `
                <html>
                    <body style="font-family: Arial, sans-serif;">
                        <h2>Alerte de sécurité</h2>
                        <p>Bonjour ${prenom} ${nom},</p>
                        <p>Votre mot de passe n'a pas été changé depuis plus d'un an.</p>
                        <p>Pour des raisons de sécurité, nous vous recommandons de le renouveler dès que possible.</p>
                        <p><a href="http://localhost:3000/change-password">Changer mon mot de passe</a></p>
                        <p>Cordialement,<br/>L'équipe Asim'UT</p>
                    </body>
                </html>
            `;
            
            // Envoyer l'email
            await MailService.getInstance().sendMail(email, sujet, corps);
            
            // 3️⃣ CONSOLE.LOG: Confirmation
            console.log("✅ Mail envoyé à " + email);
            
            return true;
            
        } finally {
            if (conn) conn.release();
        }
        
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi du mail:", error.message);
        return false;
    }
}

// ============================================================
// AUTRES FONCTIONS (INCHANGÉES)
// ============================================================

export const logout = async (req, res) => {
    console.log("\n🚪 === POST /api/auth/logout ===");
    try {
        console.log("✅ Déconnexion réussie");
        
        return res.json({
            success: true,
            message: 'Déconnexion réussie'
        });
        
    } catch (error) {
        console.error('❌ Erreur logout:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};

export const profil = async (req, res) => {
    console.log("\n👤 === GET /api/auth/profil ===");
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Non authentifié'
            });
        }
        
        console.log("📍 Récupération profil utilisateur " + req.user.id);
        
        const user = await Utilisateur.findById(req.user.id);
        
        if (!user) {
            console.log("❌ Utilisateur non trouvé");
            return res.status(404).json({
                success: false,
                error: 'Utilisateur non trouvé'
            });
        }
        
        console.log("✅ Profil récupéré");
        
        return res.json({
            success: true,
            utilisateur: {
                id: user.id,
                identifiant: user.identifiant,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                id_role: user.id_role
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur profil:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};

