package com.asimut.ui;

import com.asimut.service.ApiService;
import javax.swing.*;
import java.awt.*;

/**
 * Fenêtre de connexion à l'API Asim'UT.
 */
public class LoginFrame extends JFrame {

    private final JTextField txtUrl = new JTextField("http://localhost:3000");
    private final JTextField txtIdentifiant = new JTextField("proviseur");
    private final JPasswordField txtPassword = new JPasswordField("1234");
    private final JLabel lblStatus = new JLabel(" ");
    private final JButton btnLogin = new JButton("Se connecter");

    public LoginFrame() {
        setTitle("Asim'UT — Connexion");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setSize(420, 340);
        setLocationRelativeTo(null);
        setResizable(false);
        initUI();
    }

    private void initUI() {
        JPanel main = new JPanel(new GridBagLayout());
        main.setBorder(BorderFactory.createEmptyBorder(30, 40, 30, 40));
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(4, 0, 4, 0);
        gbc.gridwidth = GridBagConstraints.REMAINDER;
        gbc.weightx = 1;

        JLabel title = new JLabel("Asim'UT — Collège Asimov");
        title.setFont(new Font("SansSerif", Font.BOLD, 18));
        title.setHorizontalAlignment(SwingConstants.CENTER);
        main.add(title, gbc);

        JLabel subtitle = new JLabel("Suivi des élèves — Client lourd");
        subtitle.setFont(new Font("SansSerif", Font.PLAIN, 12));
        subtitle.setForeground(Color.GRAY);
        subtitle.setHorizontalAlignment(SwingConstants.CENTER);
        main.add(subtitle, gbc);

        main.add(Box.createVerticalStrut(12), gbc);

        main.add(new JLabel("URL de l'API"), gbc);
        main.add(txtUrl, gbc);

        main.add(new JLabel("Identifiant"), gbc);
        main.add(txtIdentifiant, gbc);

        main.add(new JLabel("Mot de passe"), gbc);
        main.add(txtPassword, gbc);

        main.add(Box.createVerticalStrut(8), gbc);

        btnLogin.setFont(new Font("SansSerif", Font.BOLD, 13));
        btnLogin.addActionListener(e -> doLogin());
        main.add(btnLogin, gbc);

        lblStatus.setFont(new Font("SansSerif", Font.PLAIN, 11));
        lblStatus.setHorizontalAlignment(SwingConstants.CENTER);
        main.add(lblStatus, gbc);

        setContentPane(main);

        // Enter pour se connecter
        getRootPane().setDefaultButton(btnLogin);
    }

    private void doLogin() {
        btnLogin.setEnabled(false);
        lblStatus.setForeground(Color.GRAY);
        lblStatus.setText("Connexion en cours...");

        SwingWorker<Boolean, Void> worker = new SwingWorker<>() {
            String errorMsg = "";

            @Override
            protected Boolean doInBackground() {
                try {
                    ApiService api = ApiService.getInstance();
                    api.setBaseUrl(txtUrl.getText().trim());
                    return api.login(
                            txtIdentifiant.getText().trim(),
                            new String(txtPassword.getPassword())
                    );
                } catch (Exception e) {
                    errorMsg = e.getMessage();
                    return false;
                }
            }

            @Override
            protected void done() {
                try {
                    if (get()) {
                        dispose();
                        MainFrame mainFrame = new MainFrame();
                        mainFrame.setVisible(true);
                    } else {
                        lblStatus.setForeground(new Color(239, 68, 68));
                        lblStatus.setText(errorMsg.isEmpty() ? "Identifiants incorrects" : "Erreur : " + errorMsg);
                    }
                } catch (Exception e) {
                    lblStatus.setForeground(new Color(239, 68, 68));
                    lblStatus.setText("Erreur : " + e.getMessage());
                }
                btnLogin.setEnabled(true);
            }
        };
        worker.execute();
    }
}
