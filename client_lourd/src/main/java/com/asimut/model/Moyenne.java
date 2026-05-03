package com.asimut.model;

import com.google.gson.annotations.SerializedName;

/**
 * Modèle Moyenne - Mapping Gson avec @SerializedName
 * ✅ CORRIGÉ: Gestion des champs nullables et des booléens
 */
public class Moyenne {
    private int id;

    @SerializedName("annee_scolaire")
    private String anneeScolaire;

    private int semestre;
    private double valeur;

    // ✅ IMPORTANT: validee peut être 0/1 (MySQL) ou true/false (JS)
    // Le BooleanDeserializer d'ApiService gérera la conversion
    private boolean validee;

    private String classe;
    private String nom;
    private String prenom;

    // Champs supplémentaires si utiles
    @SerializedName("date_saisie")
    private String dateSaisie;

    // ============================================================
    // CONSTRUCTEURS
    // ============================================================

    /**
     * Constructeur par défaut (requis pour Gson)
     */
    public Moyenne() {
    }

    /**
     * Constructeur avec paramètres essentiels
     */
    public Moyenne(int id, String anneeScolaire, int semestre, double valeur, boolean validee) {
        this.id = id;
        this.anneeScolaire = anneeScolaire;
        this.semestre = semestre;
        this.valeur = valeur;
        this.validee = validee;
    }

    // ============================================================
    // GETTERS
    // ============================================================

    public int getId() {
        return id;
    }

    public String getAnneeScolaire() {
        return anneeScolaire;
    }

    public int getSemestre() {
        return semestre;
    }

    public double getValeur() {
        return valeur;
    }

    /**
     * Récupère l'état de validation (géré par le déserializer Gson)
     * @return true si validée, false sinon
     */
    public boolean isValidee() {
        return validee;
    }

    public String getClasse() {
        return classe;
    }

    public String getNom() {
        return nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public String getDateSaisie() {
        return dateSaisie;
    }

    // ============================================================
    // SETTERS
    // ============================================================

    public void setId(int id) {
        this.id = id;
    }

    public void setAnneeScolaire(String anneeScolaire) {
        this.anneeScolaire = anneeScolaire;
    }

    public void setSemestre(int semestre) {
        this.semestre = semestre;
    }

    public void setValeur(double valeur) {
        if (valeur >= 0 && valeur <= 20) {
            this.valeur = valeur;
        } else {
            throw new IllegalArgumentException("La valeur doit être entre 0 et 20");
        }
    }

    public void setValidee(boolean validee) {
        this.validee = validee;
    }

    public void setClasse(String classe) {
        this.classe = classe;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public void setDateSaisie(String dateSaisie) {
        this.dateSaisie = dateSaisie;
    }

    // ============================================================
    // MÉTHODES UTILES
    // ============================================================

    @Override
    public String toString() {
        return valeur + "/20 (S" + semestre + " " + anneeScolaire + ")";
    }

    /**
     * Retourne une représentation détaillée avec validation
     */
    public String toDetailedString() {
        return toString() + (validee ? " ✓ VALIDÉE" : " ⚠ EN ATTENTE");
    }

    /**
     * Valider ou invalider cette moyenne
     */
    public void valider(boolean etat) {
        this.validee = etat;
    }

    /**
     * Vérifie que l'objet est valide
     */
    public boolean isValid() {
        return this != null
                && id > 0
                && anneeScolaire != null
                && !anneeScolaire.isEmpty()
                && semestre >= 1 && semestre <= 2
                && valeur >= 0 && valeur <= 20;
    }

    /**
     * Formatte la valeur pour affichage
     */
    public String getFormattedValeur() {
        return String.format("%.2f/20", valeur);
    }
}