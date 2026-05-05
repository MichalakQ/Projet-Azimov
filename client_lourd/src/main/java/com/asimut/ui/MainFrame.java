package com.asimut.ui;

import com.asimut.service.ApiService;
import com.asimut.ui.panels.*;
import javax.swing.*;
import java.awt.*;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Fenêtre principale avec navigation latérale (style IntelliJ).
 * Utilise un CardLayout pour basculer entre les panneaux.
 */
public class MainFrame extends JFrame {

    private final CardLayout cardLayout = new CardLayout();
    private final JPanel contentPanel = new JPanel(cardLayout);
    private final Map<String, JButton> navButtons = new LinkedHashMap<>();
    private String activePanel = "dashboard";

    public MainFrame() {
        var user = ApiService.getInstance().getCurrentUser();
        String userStr = user != null ? user.getIdentifiant() : "Utilisateur";
        setTitle("Asim'UT — " + userStr);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setSize(1200, 750);
        setMinimumSize(new Dimension(900, 600));
        setLocationRelativeTo(null);
        initUI();
    }

    private void initUI() {
        JPanel root = new JPanel(new BorderLayout());

        // ===== SIDEBAR =====
        JPanel sidebar = new JPanel();
        sidebar.setLayout(new BoxLayout(sidebar, BoxLayout.Y_AXIS));
        sidebar.setPreferredSize(new Dimension(200, 0));
        sidebar.setBackground(new Color(30, 33, 48));
        sidebar.setBorder(BorderFactory.createMatteBorder(0, 0, 0, 1, new Color(255, 255, 255, 15)));

        // Header sidebar
        JPanel sideHeader = new JPanel();
        sideHeader.setLayout(new BoxLayout(sideHeader, BoxLayout.Y_AXIS));
        sideHeader.setOpaque(false);
        sideHeader.setBorder(BorderFactory.createEmptyBorder(16, 16, 12, 16));
        sideHeader.setMaximumSize(new Dimension(200, 70));

        JLabel appName = new JLabel("Asim'UT");
        appName.setFont(new Font("SansSerif", Font.BOLD, 17));
        appName.setForeground(new Color(96, 165, 250));
        sideHeader.add(appName);

        var user = ApiService.getInstance().getCurrentUser();
        String userDisplay = user != null ? (user.getIdentifiant() + " · " + user.getRole()) : "Utilisateur";
        JLabel userName = new JLabel(userDisplay);
        userName.setFont(new Font("SansSerif", Font.PLAIN, 11));
        userName.setForeground(new Color(125, 129, 154));
        sideHeader.add(userName);

        sidebar.add(sideHeader);
        sidebar.add(createSeparator());

        // Navigation items
        addNavItem(sidebar, "dashboard", "Tableau de bord");
        addNavItem(sidebar, "eleves", "Élèves");
        addNavItem(sidebar, "enseignants", "Enseignants");
        addNavItem(sidebar, "classes", "Classes");
        sidebar.add(createSeparator());
        addNavItem(sidebar, "moyennes", "Moyennes");
        addNavItem(sidebar, "stages", "Stages");
        addNavItem(sidebar, "projets", "Projets");

        sidebar.add(Box.createVerticalGlue());
        sidebar.add(createSeparator());

        // Bouton déconnexion
        JButton btnLogout = createNavButton("Déconnexion");
        btnLogout.setForeground(new Color(239, 68, 68));
        btnLogout.addActionListener(e -> {
            ApiService.getInstance().logout();
            dispose();
            new LoginFrame().setVisible(true);
        });
        sidebar.add(btnLogout);
        sidebar.add(Box.createVerticalStrut(8));

        // ===== CONTENT PANELS =====
        contentPanel.setBackground(new Color(12, 14, 20));

        try {
            contentPanel.add(new DashboardPanel(), "dashboard");
            System.out.println("✓ DashboardPanel chargé");
        } catch (Exception e) {
            System.err.println("✗ Erreur DashboardPanel: " + e.getMessage());
            contentPanel.add(createErrorPanel("Erreur DashboardPanel"), "dashboard");
        }

        try {
            contentPanel.add(new ElevesPanel(), "eleves");
            System.out.println("✓ ElevesPanel chargé");
        } catch (Exception e) {
            System.err.println("✗ Erreur ElevesPanel: " + e.getMessage());
            contentPanel.add(createErrorPanel("Erreur ElevesPanel"), "eleves");
        }

        try {
            contentPanel.add(new EnseignantsPanel(), "enseignants");
            System.out.println("✓ EnseignantsPanel chargé");
        } catch (Exception e) {
            System.err.println("✗ Erreur EnseignantsPanel: " + e.getMessage());
            contentPanel.add(createErrorPanel("Erreur EnseignantsPanel"), "enseignants");
        }

        try {
            contentPanel.add(new ClassesPanel(), "classes");
            System.out.println("✓ ClassesPanel chargé");
        } catch (Exception e) {
            System.err.println("✗ Erreur ClassesPanel: " + e.getMessage());
            contentPanel.add(createErrorPanel("Erreur ClassesPanel"), "classes");
        }

        try {
            contentPanel.add(new MoyennesPanel(), "moyennes");
            System.out.println("✓ MoyennesPanel chargé");
        } catch (Exception e) {
            System.err.println("✗ Erreur MoyennesPanel: " + e.getMessage());
            contentPanel.add(createErrorPanel("Erreur MoyennesPanel"), "moyennes");
        }

        try {
            contentPanel.add(new StagesPanel(), "stages");
            System.out.println("✓ StagesPanel chargé");
        } catch (Exception e) {
            System.err.println("✗ Erreur StagesPanel: " + e.getMessage());
            contentPanel.add(createErrorPanel("Erreur StagesPanel"), "stages");
        }

        try {
            contentPanel.add(new ProjetsPanel(), "projets");
            System.out.println("✓ ProjetsPanel chargé");
        } catch (Exception e) {
            System.err.println("✗ Erreur ProjetsPanel: " + e.getMessage());
            contentPanel.add(createErrorPanel("Erreur ProjetsPanel"), "projets");
        }

        root.add(sidebar, BorderLayout.WEST);
        root.add(contentPanel, BorderLayout.CENTER);
        setContentPane(root);

        // Sélectionner le dashboard par défaut
        selectPanel("dashboard");

        System.out.println("✓ MainFrame initialisée avec succès");
    }

    private JPanel createErrorPanel(String message) {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setOpaque(false);
        JLabel lbl = new JLabel(message);
        lbl.setForeground(new Color(239, 68, 68));
        lbl.setFont(new Font("SansSerif", Font.BOLD, 14));
        panel.add(lbl, BorderLayout.CENTER);
        return panel;
    }

    private void addNavItem(JPanel sidebar, String key, String label) {
        JButton btn = createNavButton(label);
        btn.addActionListener(e -> selectPanel(key));
        navButtons.put(key, btn);
        sidebar.add(btn);
    }

    private JButton createNavButton(String label) {
        JButton btn = new JButton(label);
        btn.setFont(new Font("SansSerif", Font.PLAIN, 13));
        btn.setForeground(new Color(125, 129, 154));
        btn.setBackground(new Color(30, 33, 48));
        btn.setBorderPainted(false);
        btn.setFocusPainted(false);
        btn.setHorizontalAlignment(SwingConstants.LEFT);
        btn.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        btn.setMaximumSize(new Dimension(200, 38));
        btn.setPreferredSize(new Dimension(200, 38));
        btn.setBorder(BorderFactory.createEmptyBorder(0, 16, 0, 16));

        btn.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseEntered(java.awt.event.MouseEvent e) {
                if (!btn.getName().equals("active")) {
                    btn.setBackground(new Color(36, 39, 56));
                }
            }
            public void mouseExited(java.awt.event.MouseEvent e) {
                if (!btn.getName().equals("active")) {
                    btn.setBackground(new Color(30, 33, 48));
                }
            }
        });
        btn.setName("");
        return btn;
    }

    private void selectPanel(String key) {
        // Reset all buttons
        navButtons.forEach((k, btn) -> {
            btn.setBackground(new Color(30, 33, 48));
            btn.setForeground(new Color(125, 129, 154));
            btn.setFont(new Font("SansSerif", Font.PLAIN, 13));
            btn.setName("");
        });

        // Highlight selected
        JButton selected = navButtons.get(key);
        if (selected != null) {
            selected.setBackground(new Color(59, 130, 246, 15));
            selected.setForeground(new Color(96, 165, 250));
            selected.setFont(new Font("SansSerif", Font.BOLD, 13));
            selected.setName("active");
        }

        activePanel = key;
        cardLayout.show(contentPanel, key);

        // Rafraîchir le panneau affiché
        for (Component c : contentPanel.getComponents()) {
            if (c instanceof Refreshable r && c.isVisible()) {
                try {
                    r.refresh();
                } catch (Exception e) {
                    System.err.println("Erreur refresh " + key + ": " + e.getMessage());
                }
            }
        }

        System.out.println("✓ Panel sélectionné: " + key);
    }

    private JSeparator createSeparator() {
        JSeparator sep = new JSeparator();
        sep.setMaximumSize(new Dimension(200, 1));
        sep.setForeground(new Color(255, 255, 255, 15));
        return sep;
    }
}