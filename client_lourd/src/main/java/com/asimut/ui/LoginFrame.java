package com.asimut.ui;

import com.asimut.service.ApiService;
import javax.swing.*;
import java.awt.*;

/**
 * Fenêtre de connexion à l'API Asim'UT - VERSION CORRIGÉE.
 *
 * Améliorations:
 * - Validation des champs
 * - Messages d'erreur plus clairs
 * - Gestion d'URL robuste
 * - Feedback utilisateur amélioré
 * - Code plus propre et maintenable
 */
public class LoginFrame extends JFrame {

    private final JTextField txtUrl = new JTextField("http://localhost:3000");
    private final JTextField txtIdentifiant = new JTextField("proviseur");
    private final JPasswordField txtPassword = new JPasswordField("1234");
    private final JLabel lblStatus = new JLabel(" ");
    private final JButton btnLogin = new JButton("Se connecter");
    private final JButton btnClear = new JButton("Effacer");

    public LoginFrame() {
        setTitle("Asim'UT — Connexion");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setSize(450, 380);
        setLocationRelativeTo(null);
        setResizable(false);
        initUI();
    }

    private void initUI() {
        JPanel main = new JPanel(new GridBagLayout());
        main.setBorder(BorderFactory.createEmptyBorder(30, 40, 30, 40));
        main.setBackground(new Color(245, 245, 245));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(6, 0, 6, 0);
        gbc.gridwidth = GridBagConstraints.REMAINDER;
        gbc.weightx = 1;

        // Titre principal
        JLabel title = new JLabel("Asim'UT — Collège Asimov");
        title.setFont(new Font("SansSerif", Font.BOLD, 18));
        title.setHorizontalAlignment(SwingConstants.CENTER);
        main.add(title, gbc);

        // Sous-titre
        JLabel subtitle = new JLabel("Suivi des élèves — Client lourd");
        subtitle.setFont(new Font("SansSerif", Font.PLAIN, 12));
        subtitle.setForeground(Color.GRAY);
        subtitle.setHorizontalAlignment(SwingConstants.CENTER);
        main.add(subtitle, gbc);

        main.add(Box.createVerticalStrut(16), gbc);

        // URL de l'API
        main.add(new JLabel("URL de l'API"), gbc);
        txtUrl.setFont(new Font("Monospaced", Font.PLAIN, 11));
        main.add(txtUrl, gbc);

        // Identifiant
        main.add(new JLabel("Identifiant"), gbc);
        txtIdentifiant.setFont(new Font("SansSerif", Font.PLAIN, 12));
        main.add(txtIdentifiant, gbc);

        // Mot de passe
        main.add(new JLabel("Mot de passe"), gbc);
        txtPassword.setFont(new Font("SansSerif", Font.PLAIN, 12));
        main.add(txtPassword, gbc);

        main.add(Box.createVerticalStrut(12), gbc);

        // Boutons
        JPanel buttonPanel = new JPanel(new GridLayout(1, 2, 10, 0));
        buttonPanel.setOpaque(false);

        btnLogin.setFont(new Font("SansSerif", Font.BOLD, 13));
        btnLogin.setBackground(new Color(59, 130, 246));
        btnLogin.setForeground(Color.WHITE);
        btnLogin.setFocusPainted(false);
        btnLogin.addActionListener(e -> doLogin());
        buttonPanel.add(btnLogin);

        btnClear.setFont(new Font("SansSerif", Font.PLAIN, 12));
        btnClear.setBackground(new Color(107, 114, 128));
        btnClear.setForeground(Color.WHITE);
        btnClear.setFocusPainted(false);
        btnClear.addActionListener(e -> clearFields());
        buttonPanel.add(btnClear);

        main.add(buttonPanel, gbc);

        // Label de statut
        lblStatus.setFont(new Font("SansSerif", Font.PLAIN, 11));
        lblStatus.setHorizontalAlignment(SwingConstants.CENTER);
        main.add(Box.createVerticalStrut(8), gbc);
        main.add(lblStatus, gbc);

        setContentPane(main);

        // Enter pour se connecter
        getRootPane().setDefaultButton(btnLogin);
    }

    /**
     * ✅ VALIDATION: Vérifie que les champs ne sont pas vides
     */
    private boolean validateInputs() {
        String url = txtUrl.getText().trim();
        String identifiant = txtIdentifiant.getText().trim();
        String password = new String(txtPassword.getPassword()).trim();

        if (url.isEmpty()) {
            showError("❌ L'URL de l'API est requise");
            return false;
        }

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            showError("❌ L'URL doit commencer par http:// ou https://");
            return false;
        }

        if (identifiant.isEmpty()) {
            showError("❌ L'identifiant est requis");
            return false;
        }

        if (password.isEmpty()) {
            showError("❌ Le mot de passe est requis");
            return false;
        }

        return true;
    }

    /**
     * ✅ CONNEXION: Lance la tentative de connexion
     */
    private void doLogin() {
        // 1. Valider les champs
        if (!validateInputs()) {
            return;
        }

        // 2. Désactiver le bouton et afficher le message
        btnLogin.setEnabled(false);
        btnClear.setEnabled(false);
        showInfo("⏳ Connexion en cours...");

        // 3. Lancer la connexion en arrière-plan (SwingWorker)
        SwingWorker<LoginResult, Void> worker = new SwingWorker<>() {
            @Override
            protected LoginResult doInBackground() {
                try {
                    ApiService api = ApiService.getInstance();
                    api.setBaseUrl(txtUrl.getText().trim());

                    boolean success = api.login(
                            txtIdentifiant.getText().trim(),
                            new String(txtPassword.getPassword())
                    );

                    if (success) {
                        return new LoginResult(true, "Connexion réussie");
                    } else {
                        return new LoginResult(false, "Identifiants incorrects");
                    }

                } catch (Exception e) {
                    System.err.println("❌ Erreur login: " + e.getMessage());
                    e.printStackTrace();

                    // Déterminer le type d'erreur
                    String errorMsg;
                    if (e.getMessage() != null && e.getMessage().contains("Connection refused")) {
                        errorMsg = "Impossible de se connecter au serveur (http://" +
                                txtUrl.getText().trim() + ")";
                    } else if (e.getMessage() != null && e.getMessage().contains("Unknown host")) {
                        errorMsg = "Serveur introuvable: " + txtUrl.getText().trim();
                    } else if (e.getMessage() != null && e.getMessage().contains("Endpoint not found")) {
                        errorMsg = "Endpoint /api/auth/login non trouvé sur le serveur";
                    } else {
                        errorMsg = "Erreur: " + (e.getMessage() != null ? e.getMessage() : "Erreur inconnue");
                    }

                    return new LoginResult(false, errorMsg);
                }
            }

            @Override
            protected void done() {
                try {
                    LoginResult result = get();

                    if (result.success) {
                        // ✅ SUCCÈS: Afficher la confirmation et ouvrir MainFrame
                        System.out.println("✅ " + result.message);
                        showSuccess("✅ " + result.message);

                        // Attendre 500ms avant de fermer la fenêtre
                        SwingUtilities.invokeLater(() -> {
                            dispose();
                            MainFrame mainFrame = new MainFrame();
                            mainFrame.setVisible(true);
                        });

                    } else {
                        // ❌ ERREUR: Afficher le message d'erreur
                        System.out.println("❌ " + result.message);
                        showError(result.message);
                    }

                } catch (Exception e) {
                    System.err.println("❌ Erreur done(): " + e.getMessage());
                    e.printStackTrace();
                    showError("Erreur: " + e.getMessage());
                }

                // Réactiver les boutons
                btnLogin.setEnabled(true);
                btnClear.setEnabled(true);
            }
        };

        worker.execute();
    }

    /**
     * ✅ AFFICHAGE: Messages d'erreur (rouge)
     */
    private void showError(String message) {
        lblStatus.setForeground(new Color(239, 68, 68));
        lblStatus.setText(message);
    }

    /**
     * ✅ AFFICHAGE: Messages d'info (gris)
     */
    private void showInfo(String message) {
        lblStatus.setForeground(Color.GRAY);
        lblStatus.setText(message);
    }

    /**
     * ✅ AFFICHAGE: Messages de succès (vert)
     */
    private void showSuccess(String message) {
        lblStatus.setForeground(new Color(34, 197, 94));
        lblStatus.setText(message);
    }

    /**
     * ✅ UTILITAIRE: Effacer les champs
     */
    private void clearFields() {
        txtUrl.setText("http://localhost:3000");
        txtIdentifiant.setText("");
        txtPassword.setText("");
        lblStatus.setText(" ");
        txtIdentifiant.requestFocus();
    }

    /**
     * ✅ INNER CLASS: Résultat de connexion
     */
    private static class LoginResult {
        final boolean success;
        final String message;

        LoginResult(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
    }
}