package com.asimut.model;

/**
 * Modèle Enseignant - Correspond au JSON retourné par l'API
 */
public class Enseignant {
    private int id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;

    // ============================================================
    // GETTERS
    // ============================================================

    public int getId() {
        return id;
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

    // ============================================================
    // SETTERS (optionnels mais utiles)
    // ============================================================

    public void setId(int id) {
        this.id = id;
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

    // ============================================================
    // AUTRES
    // ============================================================

    @Override
    public String toString() {
        return nom + " " + prenom;
    }
}