package com.asimut.model;

import com.google.gson.annotations.SerializedName;

public class Eleve {
    private int id;
    private String nom;
    private String prenom;
    private String identifiant;

    @SerializedName("date_naissance")
    private String dateNaissance;

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

    @Override
    public String toString() {
        return nom + " " + prenom;
    }
}