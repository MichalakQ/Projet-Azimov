package com.asimut.model;

/**
 * ✅ CORRIGÉ: Ajout des SETTERS + Annotations
 */
public class Parent {
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String lien;

    // ============================================================
    // GETTERS
    // ============================================================

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

    public String getLien() {
        return lien;
    }

    // ============================================================
    // SETTERS (✅ AJOUTÉS - Requis par Gson)
    // ============================================================

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

    public void setLien(String lien) {
        this.lien = lien;
    }

    // ============================================================
    // UTILES
    // ============================================================

    @Override
    public String toString() {
        return (prenom != null ? prenom + " " : "") + (nom != null ? nom : "") + " (" + (lien != null ? lien : "Parent") + ")";
    }
}