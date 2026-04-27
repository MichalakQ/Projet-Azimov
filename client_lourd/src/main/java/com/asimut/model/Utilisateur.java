package com.asimut.model;

/**
 * Représente un utilisateur connecté avec son token JWT.
 */
public class Utilisateur {
    private int id;
    private String identifiant;
    private String email;
    private String role;

    public int getId() { return id; }
    public String getIdentifiant() { return identifiant; }
    public String getEmail() { return email; }
    public String getRole() { return role; }

    @Override
    public String toString() { return identifiant + " (" + role + ")"; }
}
