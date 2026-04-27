package com.asimut;

import com.asimut.ui.LoginFrame;
import com.formdev.flatlaf.FlatDarkLaf;
import javax.swing.*;

/**
 * Point d'entrée de l'application client lourd Asim'UT.
 * Utilise FlatLaf pour un rendu visuel moderne (style IntelliJ).
 */
public class App {
    public static void main(String[] args) {
        try {
            FlatDarkLaf.setup();
            UIManager.put("Button.arc", 8);
            UIManager.put("Component.arc", 8);
            UIManager.put("TextComponent.arc", 6);
        } catch (Exception e) {
            System.err.println("Erreur FlatLaf : " + e.getMessage());
        }

        SwingUtilities.invokeLater(() -> {
            LoginFrame login = new LoginFrame();
            login.setVisible(true);
        });
    }
}
