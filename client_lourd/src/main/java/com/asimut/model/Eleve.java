package com.asimut.model;

public class Eleve {
    private int id;
    private String nom;
    private String prenom;
    private String identifiant;
    private String date_naissance;
    private String classe;
    private String niveau;
    private String classe_actuelle;
    private String nom_referent;
    private String prenom_referent;

    // Statistiques (remplies par /statistiques)
    private Moyenne[] moyennes;
    private OptionScolaire[] options;
    private Parent[] parents;

    public int getId() { return id; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
    public String getIdentifiant() { return identifiant; }
    public String getDateNaissance() { return date_naissance; }
    public String getClasse() { return classe != null ? classe : classe_actuelle; }
    public String getNiveau() { return niveau; }
    public String getNomReferent() { return nom_referent; }
    public String getPrenomReferent() { return prenom_referent; }
    public Moyenne[] getMoyennes() { return moyennes; }
    public OptionScolaire[] getOptions() { return options; }
    public Parent[] getParents() { return parents; }

    @Override
    public String toString() { return nom + " " + prenom; }
}
