package com.asimut.model;

import com.google.gson.annotations.SerializedName;

/**
 * Modèle RechercheStage - Mapping Gson avec @SerializedName
 */
public class RechercheStage {

    @SerializedName("id_eleve")
    private int idEleve;

    private String nom;
    private String prenom;

    @SerializedName("nb_entreprises_contactees")
    private int nbEntreprisesContactees;

    private boolean alerte;

    @SerializedName("annee_scolaire")
    private String anneeScolaire;

    // ============================================================
    // GETTERS
    // ============================================================

    public int getIdEleve() {
        return idEleve;
    }

    public String getNom() {
        return nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public int getNbEntreprisesContactees() {
        return nbEntreprisesContactees;
    }

    public boolean isAlerte() {
        return alerte;
    }

    public String getAnneeScolaire() {
        return anneeScolaire;
    }

    // ============================================================
    // SETTERS
    // ============================================================

    public void setIdEleve(int idEleve) {
        this.idEleve = idEleve;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public void setNbEntreprisesContactees(int nbEntreprisesContactees) {
        this.nbEntreprisesContactees = nbEntreprisesContactees;
    }

    public void setAlerte(boolean alerte) {
        this.alerte = alerte;
    }

    public void setAnneeScolaire(String anneeScolaire) {
        this.anneeScolaire = anneeScolaire;
    }

    @Override
    public String toString() {
        return nom + " " + prenom + " (" + nbEntreprisesContactees + " entreprises)";
    }
}