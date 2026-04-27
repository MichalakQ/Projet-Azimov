package com.asimut.model;

public class Moyenne {
    private int id;
    private String annee_scolaire;
    private int semestre;
    private double valeur;
    private boolean validee;
    private String classe;
    private String nom;
    private String prenom;

    public int getId() { return id; }
    public String getAnneeScolaire() { return annee_scolaire; }
    public int getSemestre() { return semestre; }
    public double getValeur() { return valeur; }
    public boolean isValidee() { return validee; }
    public String getClasse() { return classe; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
}
