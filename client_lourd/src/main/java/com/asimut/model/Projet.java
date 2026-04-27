package com.asimut.model;

public class Projet {
    private int id;
    private String titre;
    private String description;
    private String date_creation;
    private String statut;
    private String responsable_nom;
    private String responsable_prenom;

    public int getId() { return id; }
    public String getTitre() { return titre; }
    public String getDescription() { return description; }
    public String getDateCreation() { return date_creation; }
    public String getStatut() { return statut; }
    public String getResponsableNom() { return responsable_nom; }
    public String getResponsablePrenom() { return responsable_prenom; }
}
