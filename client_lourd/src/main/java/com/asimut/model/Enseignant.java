package com.asimut.model;

public class Enseignant {
    private int id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;

    public int getId() { return id; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
    public String getEmail() { return email; }
    public String getTelephone() { return telephone; }

    @Override
    public String toString() { return nom + " " + prenom; }
}
