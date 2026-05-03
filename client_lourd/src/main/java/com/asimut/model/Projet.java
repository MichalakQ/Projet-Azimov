package com.asimut.model;

import com.google.gson.annotations.SerializedName;

/**
 * ✅ CORRIGÉ: Ajout des SETTERS + Annotations @SerializedName
 */
public class Projet {
    private int id;
    private String titre;
    private String description;

    @SerializedName("date_creation")
    private String dateCreation;

    private String statut;

    @SerializedName("responsable_nom")
    private String responsableNom;

    @SerializedName("responsable_prenom")
    private String responsablePrenom;

    // ============================================================
    // GETTERS
    // ============================================================

    public int getId() {
        return id;
    }

    public String getTitre() {
        return titre;
    }

    public String getDescription() {
        return description;
    }

    public String getDateCreation() {
        return dateCreation;
    }

    public String getStatut() {
        return statut;
    }

    public String getResponsableNom() {
        return responsableNom;
    }

    public String getResponsablePrenom() {
        return responsablePrenom;
    }

    // ============================================================
    // SETTERS (✅ AJOUTÉS - Requis par Gson)
    // ============================================================

    public void setId(int id) {
        this.id = id;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setDateCreation(String dateCreation) {
        this.dateCreation = dateCreation;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public void setResponsableNom(String responsableNom) {
        this.responsableNom = responsableNom;
    }

    public void setResponsablePrenom(String responsablePrenom) {
        this.responsablePrenom = responsablePrenom;
    }

    // ============================================================
    // UTILES
    // ============================================================

    @Override
    public String toString() {
        return titre + " (" + statut + ")";
    }

    public String getResponsableName() {
        return (responsablePrenom != null ? responsablePrenom + " " : "") +
                (responsableNom != null ? responsableNom : "—");
    }
}