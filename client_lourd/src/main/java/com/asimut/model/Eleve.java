package com.asimut.model;

import com.google.gson.annotations.SerializedName;

/**
 * ✅ CORRIGÉ: Ajout des annotations @SerializedName + getters/setters email/telephone
 */
public class Eleve {
    private int id;
    private String nom;
    private String prenom;
    private String identifiant;

    @SerializedName("date_naissance")
    private String dateNaissance;

    // ✅ AJOUTÉS: Annotations manquantes
    private String email;
    private String telephone;

    private String classe;
    private String niveau;
    private String classe_actuelle;

    @SerializedName("nom_referent")
    private String nomReferent;

    @SerializedName("prenom_referent")
    private String prenomReferent;

    // Statistiques (remplies par /statistiques)
    private Moyenne[] moyennes;
    private OptionScolaire[] options;
    private Parent[] parents;

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

    public String getIdentifiant() {
        return identifiant;
    }

    public String getDateNaissance() {
        return dateNaissance;
    }

    public String getEmail() {
        return email;
    }

    public String getTelephone() {
        return telephone;
    }

    public String getClasse() {
        return classe != null ? classe : classe_actuelle;
    }

    public String getNiveau() {
        return niveau;
    }

    public String getNomReferent() {
        return nomReferent;
    }

    public String getPrenomReferent() {
        return prenomReferent;
    }

    public Moyenne[] getMoyennes() {
        return moyennes;
    }

    public OptionScolaire[] getOptions() {
        return options;
    }

    public Parent[] getParents() {
        return parents;
    }

    // ============================================================
    // SETTERS
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

    public void setIdentifiant(String identifiant) {
        this.identifiant = identifiant;
    }

    public void setDateNaissance(String dateNaissance) {
        this.dateNaissance = dateNaissance;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public void setClasse(String classe) {
        this.classe = classe;
    }

    public void setNiveau(String niveau) {
        this.niveau = niveau;
    }

    public void setNomReferent(String nomReferent) {
        this.nomReferent = nomReferent;
    }

    public void setPrenomReferent(String prenomReferent) {
        this.prenomReferent = prenomReferent;
    }

    public void setMoyennes(Moyenne[] moyennes) {
        this.moyennes = moyennes;
    }

    public void setOptions(OptionScolaire[] options) {
        this.options = options;
    }

    public void setParents(Parent[] parents) {
        this.parents = parents;
    }

    // ============================================================
    // MÉTHODES UTILES
    // ============================================================

    @Override
    public String toString() {
        return nom + " " + prenom;
    }

    /**
     * Vérifier que l'objet n'est pas null et a au moins un id
     */
    public boolean isValid() {
        return this != null && id > 0 && nom != null && prenom != null;
    }

    public String getFullName() {
        return (prenom != null ? prenom + " " : "") + (nom != null ? nom : "");
    }
}