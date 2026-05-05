package com.asimut;

import com.asimut.model.Utilisateur;
import com.asimut.service.ApiService;
import com.asimut.ui.MainFrame;
import com.formdev.flatlaf.FlatDarkLaf;
import javax.swing.*;
import java.lang.reflect.Field;

public class App {
    public static void main(String[] args) {
        try {
            FlatDarkLaf.setup();

            SwingUtilities.invokeLater(() -> {
                try {
                    // Initialiser ApiService
                    ApiService api = ApiService.getInstance();
                    api.setBaseUrl("http://localhost:3000");

                    // Créer un utilisateur mock pour les tests (sans authentification)
                    Utilisateur mockUser = new Utilisateur();
                    // Utiliser la réflexion pour affecter les champs privés
                    setFieldValue(mockUser, "id", 1);
                    setFieldValue(mockUser, "identifiant", "proviseur");
                    setFieldValue(mockUser, "email", "proviseur@asimut.fr");
                    setFieldValue(mockUser, "role", "Proviseur");

                    // Affecter l'utilisateur et un token fictif
                    setFieldValue(api, "currentUser", mockUser);
                    setFieldValue(api, "token", "mock-token-test");

                    System.out.println("✓ Utilisateur mock créé: " + mockUser);
                    System.out.println("✓ API initialisée sans authentification");

                    // Lancer MainFrame directement
                    MainFrame mainFrame = new MainFrame();
                    mainFrame.setVisible(true);

                } catch (Exception e) {
                    System.err.println("✗ Erreur initialisation: " + e.getMessage());
                    e.printStackTrace();
                    JOptionPane.showMessageDialog(null,
                            "Erreur: " + e.getMessage(),
                            "Erreur",
                            JOptionPane.ERROR_MESSAGE);
                }
            });

        } catch (Exception e) {
            System.err.println("✗ Erreur FlatLaf: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Affecter une valeur à un champ privé via réflexion
     */
    private static void setFieldValue(Object obj, String fieldName, Object value) throws Exception {
        Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(obj, value);
    }
}