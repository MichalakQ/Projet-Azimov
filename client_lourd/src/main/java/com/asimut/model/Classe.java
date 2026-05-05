package com.asimut.model;

import com.google.gson.annotations.SerializedName;

/**
 * Modèle Classe - UNIVERSEL
 * Compatible avec ClassesPanel ET ElevesPanel
 *
 * Champs utilisés par ClassesPanel:
 * - nom (ex: "6A", "5B")
 * - niveau (ex: "6ème", "5ème")
 * - nbEleves (ex: 28)
 * - anneeScolaire (ex: "2025-2026")
 *
 * Champs utilisés par ElevesPanel:
 * - lettre (ex: "A", "B")
 * - niveau (ex: "6ème")
 * - idNiveau (ex: 1)
 *
 * Exemple JSON de l'API:
 * {
 *   "id": 1,
 *   "id_niveau": 1,
 *   "lettre": "A",
 *   "id_annee_scolaire": 1,
 *   "niveau": "6ème",
 *   "nom": "6A",
 *   "nb_eleves": 28,
 *   "annee_scolaire": "2025-2026"
 * }
 */
public class Classe {
    private int id;

    // ========== Champs pour ClassesPanel ==========
    private String nom;  // Ex: "6A", "5B"

    @SerializedName("nb_eleves")
    private int nbEleves;  // Ex: 28

    @SerializedName("annee_scolaire")
    private String anneeScolaire;  // Ex: "2025-2026"

    // ========== Champs pour ElevesPanel ==========
    @SerializedName("id_niveau")
    private int idNiveau;

    private String lettre;  // Ex: "A", "B", "C"

    @SerializedName("niveau")
    private String niveau;  // Ex: "6ème", "5ème", "4ème", "3ème"

    @SerializedName("id_annee_scolaire")
    private int idAnneeScolaire;

    // ============================================================
    // CONSTRUCTEURS
    // ============================================================

    public Classe() {
    }

    public Classe(int id, String nom, int nbEleves, String anneeScolaire) {
        this.id = id;
        this.nom = nom;
        this.nbEleves = nbEleves;
        this.anneeScolaire = anneeScolaire;
    }

    public Classe(int id, int idNiveau, String lettre, int idAnneeScolaire, String niveau) {
        this.id = id;
        this.idNiveau = idNiveau;
        this.lettre = lettre;
        this.idAnneeScolaire = idAnneeScolaire;
        this.niveau = niveau;
    }

    // ============================================================
    // GETTERS (pour ClassesPanel)
    // ============================================================

    public int getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public int getNbEleves() {
        return nbEleves;
    }

    public String getAnneeScolaire() {
        return anneeScolaire;
    }

    // ============================================================
    // GETTERS (pour ElevesPanel)
    // ============================================================

    public int getIdNiveau() {
        return idNiveau;
    }

    public String getLettre() {
        return lettre;
    }

    public String getNiveau() {
        return niveau;
    }

    public int getIdAnneeScolaire() {
        return idAnneeScolaire;
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

    public void setNbEleves(int nbEleves) {
        this.nbEleves = nbEleves;
    }

    public void setAnneeScolaire(String anneeScolaire) {
        this.anneeScolaire = anneeScolaire;
    }

    public void setIdNiveau(int idNiveau) {
        this.idNiveau = idNiveau;
    }

    public void setLettre(String lettre) {
        this.lettre = lettre;
    }

    public void setNiveau(String niveau) {
        this.niveau = niveau;
    }

    public void setIdAnneeScolaire(int idAnneeScolaire) {
        this.idAnneeScolaire = idAnneeScolaire;
    }

    // ============================================================
    // MÉTHODES UTILES
    // ============================================================

    @Override
    public String toString() {
        if (nom != null && !nom.isEmpty()) {
            return nom;  // Ex: "6A"
        }
        if (niveau != null && lettre != null) {
            return niveau + lettre;  // Ex: "6èmeA"
        }
        return "Classe " + id;
    }

    /**
     * Retourne la classe au format "6A", "5B", etc.
     * Extrait le numéro du niveau et ajoute la lettre
     */
    public String getClasseFormatted() {
        try {
            if (niveau != null && lettre != null) {
                // Extraire le numéro du niveau (ex: "6ème" → "6")
                String num = niveau.replaceAll("[^0-9]", "");
                if (!num.isEmpty()) {
                    return num + lettre;
                }
            }
        } catch (Exception e) {
            // Fallback silencieux
        }

        // Si ça échoue, retourner un format simple
        if (lettre != null) {
            return idNiveau + lettre;
        }

        // Dernier recours: utiliser nom si disponible
        if (nom != null) {
            return nom;
        }

        return "Classe " + id;
    }

    /**
     * Retourne le nom complet de la classe
     * Ex: "6ème A", "5ème B"
     */
    public String getFullName() {
        if (niveau != null && lettre != null) {
            return niveau + " " + lettre;
        }
        if (nom != null) {
            return nom;
        }
        return toString();
    }

    /**
     * Retourne vrai si la classe a des données complètes
     */
    public boolean isComplete() {
        return (nom != null && !nom.isEmpty()) &&
                (niveau != null && !niveau.isEmpty()) &&
                nbEleves > 0;
    }
}