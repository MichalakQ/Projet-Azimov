package com.asimut.model;

import com.google.gson.annotations.SerializedName;

/**
 * ✅ CORRIGÉ: Ajout des SETTERS + Annotations @SerializedName
 */
public class OptionScolaire {
    private int id;
    private String libelle;
    private String categorie;

    @SerializedName("annee_scolaire")
    private String anneeScolaire;

    // ============================================================
    // GETTERS
    // ============================================================

    public int getId() {
        return id;
    }

    public String getLibelle() {
        return libelle;
    }

    public String getCategorie() {
        return categorie;
    }

    public String getAnneeScolaire() {
        return anneeScolaire;
    }

    // ============================================================
    // SETTERS (✅ AJOUTÉS - Requis par Gson)
    // ============================================================

    public void setId(int id) {
        this.id = id;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }

    public void setAnneeScolaire(String anneeScolaire) {
        this.anneeScolaire = anneeScolaire;
    }

    // ============================================================
    // UTILES
    // ============================================================

    @Override
    public String toString() {
        return libelle + " (" + categorie + ")";
    }
}