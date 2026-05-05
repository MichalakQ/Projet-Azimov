package com.asimut.model;

import com.google.gson.annotations.SerializedName;

/**
 * Représente un utilisateur connecté avec son token JWT.
 * ✅ COMPLÉTÉ: Ajout de nom et prenom
 */
public class Utilisateur {
    private int id;
    private String identifiant;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String role;

    @SerializedName("id_role")
    private int idRole;

    private boolean actif;

    // ============================================================
    // GETTERS
    // ============================================================

    public int getId() {
        return id;
    }

    public String getIdentifiant() {
        return identifiant;
    }

    public String getNom() {
        return nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public String getEmail() {
        return email;
    }

    public String getTelephone() {
        return telephone;
    }

    public String getRole() {
        return role;
    }

    public int getIdRole() {
        return idRole;
    }

    public boolean isActif() {
        return actif;
    }

    // ============================================================
    // SETTERS (pour Gson)
    // ============================================================

    public void setId(int id) {
        this.id = id;
    }

    public void setIdentifiant(String identifiant) {
        this.identifiant = identifiant;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setIdRole(int idRole) {
        this.idRole = idRole;
    }

    public void setActif(boolean actif) {
        this.actif = actif;
    }

    // ============================================================
    // MÉTHODES UTILES
    // ============================================================

    @Override
    public String toString() {
        return (prenom != null ? prenom + " " : "") + (nom != null ? nom : identifiant) + " (" + role + ")";
    }

    public String getFullName() {
        return (prenom != null ? prenom + " " : "") + (nom != null ? nom : "");
    }
}