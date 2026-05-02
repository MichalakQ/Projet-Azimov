package com.asimut.model;

import com.google.gson.annotations.SerializedName;

/**
 * Modèle Classe - Mapping Gson avec @SerializedName
 */
public class Classe {
    private int id;
    private String nom;
    private String niveau;

    @SerializedName("annee_scolaire")
    private String anneeScolaire;

    @SerializedName("nb_eleves")
    private int nbEleves;

    // ============================================================
    // GETTERS
    // ============================================================

    public int getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public String getNiveau() {
        return niveau;
    }

    public String getAnneeScolaire() {
        return anneeScolaire;
    }

    public int getNbEleves() {
        return nbEleves;
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

    public void setNiveau(String niveau) {
        this.niveau = niveau;
    }

    public void setAnneeScolaire(String anneeScolaire) {
        this.anneeScolaire = anneeScolaire;
    }

    public void setNbEleves(int nbEleves) {
        this.nbEleves = nbEleves;
    }

    // ============================================================
    // AUTRES
    // ============================================================

    @Override
    public String toString() {
        return nom + " (" + anneeScolaire + ")";
    }
}