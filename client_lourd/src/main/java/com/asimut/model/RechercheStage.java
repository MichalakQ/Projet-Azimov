package com.asimut.model;

public class RechercheStage {
    private int id_eleve;
    private String nom;
    private String prenom;
    private int nb_entreprises_contactees;
    private boolean alerte;
    private String annee_scolaire;

    public int getIdEleve() { return id_eleve; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
    public int getNbEntreprisesContactees() { return nb_entreprises_contactees; }
    public boolean isAlerte() { return alerte; }
    public String getAnneeScolaire() { return annee_scolaire; }
}
