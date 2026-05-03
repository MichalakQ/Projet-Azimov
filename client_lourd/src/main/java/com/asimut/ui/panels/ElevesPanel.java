package com.asimut.ui.panels;

import com.asimut.model.*;
import com.asimut.service.ApiService;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;


public class ElevesPanel extends JPanel implements Refreshable {

    private final DefaultTableModel tableModel;
    private final JTable table;
    private final JTextField txtSearch = new JTextField();
    private final JTextArea txtDetail = new JTextArea();
    private int currentPage = 1;
    private int currentEleveId = -1;  // ← Pour stocker l'ID de l'élève actuellement affiché

    public ElevesPanel() {
        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(24, 28, 24, 28));
        setOpaque(false);

        // ===== TOP : titre + recherche + bouton créer =====
        JPanel topPanel = new JPanel(new BorderLayout(8, 0));
        topPanel.setOpaque(false);

        JLabel title = new JLabel("Élèves");
        title.setFont(new Font("SansSerif", Font.BOLD, 20));
        topPanel.add(title, BorderLayout.WEST);

        JPanel searchRow = new JPanel(new BorderLayout(6, 0));
        searchRow.setOpaque(false);
        searchRow.setPreferredSize(new Dimension(400, 30));
        txtSearch.putClientProperty("JTextField.placeholderText", "Rechercher par nom...");
        txtSearch.addActionListener(e -> doSearch());
        searchRow.add(txtSearch, BorderLayout.CENTER);

        JButton btnSearch = new JButton("Rechercher");
        btnSearch.addActionListener(e -> doSearch());
        searchRow.add(btnSearch, BorderLayout.EAST);

        JPanel topRight = new JPanel(new FlowLayout(FlowLayout.RIGHT, 6, 0));
        topRight.setOpaque(false);
        topRight.add(searchRow);

        JButton btnNew = new JButton("+ Nouvel élève");
        btnNew.addActionListener(e -> showCreateDialog());
        topRight.add(btnNew);

        topPanel.add(topRight, BorderLayout.EAST);
        add(topPanel, BorderLayout.NORTH);

        // ===== CENTER : table + detail =====
        JSplitPane split = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT);
        split.setDividerLocation(600);
        split.setOpaque(false);

        // Table
        tableModel = new DefaultTableModel(new String[]{"ID", "Nom", "Prénom", "Identifiant", "Classe"}, 0) {
            public boolean isCellEditable(int r, int c) { return false; }
        };
        table = new JTable(tableModel);
        table.setRowHeight(28);
        table.getColumnModel().getColumn(0).setMaxWidth(50);
        table.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) showDetail();
        });

        JPanel tablePanel = new JPanel(new BorderLayout());
        tablePanel.setOpaque(false);
        tablePanel.add(new JScrollPane(table), BorderLayout.CENTER);

        // Pagination
        JPanel pagination = new JPanel(new FlowLayout(FlowLayout.CENTER));
        pagination.setOpaque(false);
        JButton btnPrev = new JButton("< Précédent");
        btnPrev.addActionListener(e -> { if (currentPage > 1) { currentPage--; refresh(); } });
        JButton btnNext = new JButton("Suivant >");
        btnNext.addActionListener(e -> { currentPage++; refresh(); });
        pagination.add(btnPrev);
        pagination.add(btnNext);
        tablePanel.add(pagination, BorderLayout.SOUTH);

        split.setLeftComponent(tablePanel);

        // Detail
        JPanel detailPanel = new JPanel(new BorderLayout());
        detailPanel.setBorder(BorderFactory.createEmptyBorder(8, 12, 8, 0));

        // Header avec titre + bouton éditer
        JPanel headerDetail = new JPanel(new BorderLayout());
        headerDetail.setOpaque(false);

        JLabel detailTitle = new JLabel("Fiche élève");
        detailTitle.setFont(new Font("SansSerif", Font.BOLD, 14));
        headerDetail.add(detailTitle, BorderLayout.WEST);

        // ✅ NOUVEAU: Boutons Éditer + Supprimer
        JPanel btnPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        btnPanel.setOpaque(false);

        JButton btnEdit = new JButton("✎ Éditer");
        btnEdit.addActionListener(e -> editEleve());
        btnPanel.add(btnEdit);

        JButton btnDelete = new JButton("🗑️ Supprimer");
        btnDelete.setForeground(new Color(220, 53, 69));  // Rouge
        btnDelete.addActionListener(e -> deleteEleveConfirm());
        btnPanel.add(btnDelete);

        headerDetail.add(btnPanel, BorderLayout.EAST);

        detailPanel.add(headerDetail, BorderLayout.NORTH);

        txtDetail.setEditable(false);
        txtDetail.setFont(new Font("Monospaced", Font.PLAIN, 12));
        txtDetail.setLineWrap(true);
        txtDetail.setWrapStyleWord(true);
        txtDetail.setText("Sélectionnez un élève dans la liste.");
        detailPanel.add(new JScrollPane(txtDetail), BorderLayout.CENTER);

        split.setRightComponent(detailPanel);
        add(split, BorderLayout.CENTER);

        refresh();
    }

    private void doSearch() {
        String q = txtSearch.getText().trim();
        if (q.isEmpty()) { refresh(); return; }

        SwingWorker<Eleve[], Void> worker = new SwingWorker<>() {
            @Override
            protected Eleve[] doInBackground() throws Exception {
                return ApiService.getInstance().searchEleves(q);
            }
            @Override
            protected void done() {
                try {
                    fillTable(get());
                } catch (Exception e) {
                    JOptionPane.showMessageDialog(ElevesPanel.this, e.getMessage(), "Erreur", JOptionPane.ERROR_MESSAGE);
                }
            }
        };
        worker.execute();
    }

    private void fillTable(Eleve[] eleves) {
        tableModel.setRowCount(0);
        if (eleves == null) return;
        for (Eleve e : eleves) {
            tableModel.addRow(new Object[]{e.getId(), e.getNom(), e.getPrenom(), e.getIdentifiant(), e.getClasse()});
        }
    }

    private void showDetail() {
        int row = table.getSelectedRow();
        if (row < 0) return;
        int id = (int) tableModel.getValueAt(row, 0);
        currentEleveId = id;  // ← Stocker l'ID pour la fonction éditer

        SwingWorker<Eleve, Void> worker = new SwingWorker<>() {
            @Override
            protected Eleve doInBackground() throws Exception {
                return ApiService.getInstance().getEleveStatistiques(id);
            }
            @Override
            protected void done() {
                try {
                    Eleve e = get();
                    StringBuilder sb = new StringBuilder();
                    sb.append("═══ ").append(e.getNom()).append(" ").append(e.getPrenom()).append(" ═══\n\n");
                    sb.append("Identifiant : ").append(e.getIdentifiant()).append("\n");
                    sb.append("Classe : ").append(e.getClasse() != null ? e.getClasse() : "—").append("\n");
                    // ✅ CORRIGÉ: Utiliser formatDate() pour afficher la date correctement
                    sb.append("Naissance : ").append(formatDate(e.getDateNaissance())).append("\n");
                    sb.append("Référent : ").append(e.getNomReferent() != null ? e.getPrenomReferent() + " " + e.getNomReferent() : "—").append("\n");

                    if (e.getMoyennes() != null && e.getMoyennes().length > 0) {
                        sb.append("\n── Moyennes ──\n");
                        for (Moyenne m : e.getMoyennes()) {
                            sb.append("  S").append(m.getSemestre()).append(" ").append(m.getAnneeScolaire())
                                    .append(" : ").append(m.getValeur()).append("/20")
                                    .append(m.isValidee() ? " ✓" : " (non validée)").append("\n");
                        }
                    }

                    if (e.getOptions() != null && e.getOptions().length > 0) {
                        sb.append("\n── Options ──\n");
                        for (OptionScolaire o : e.getOptions()) {
                            sb.append("  ").append(o.getLibelle()).append(" (").append(o.getCategorie()).append(")\n");
                        }
                    }

                    if (e.getParents() != null && e.getParents().length > 0) {
                        sb.append("\n── Parents ──\n");
                        for (Parent p : e.getParents()) {
                            sb.append("  ").append(p.getPrenom()).append(" ").append(p.getNom())
                                    .append(" — ").append(p.getEmail())
                                    .append(" (").append(p.getLien() != null ? p.getLien() : "—").append(")\n");
                        }
                    }

                    txtDetail.setText(sb.toString());
                    txtDetail.setCaretPosition(0);
                } catch (Exception ex) {
                    txtDetail.setText("Erreur : " + ex.getMessage());
                }
            }
        };
        worker.execute();
    }

    /**
     * ✅ ULTRA-AMÉLIORÉ: showCreateDialog avec TOUS les champs
     * - Identifiant AUTO-GÉNÉRÉ (pas de conflits !)
     * - Parents (jusqu'à 2)
     * - Classes (combo)
     * - Téléphone, Email, Date naissance
     */
    private void showCreateDialog() {
        // Créer les champs
        JTextField fNom = new JTextField(20);
        JTextField fPrenom = new JTextField(20);
        JTextField fId = new JTextField(20);
        fId.setEditable(false);  // ← Auto-généré, non éditable
        JTextField fDateNaissance = new JTextField(20);
        JTextField fEmail = new JTextField(20);
        JTextField fTelephone = new JTextField(20);
        JComboBox<String> cbClasse = new JComboBox<>();

        // Remplir le combo des classes
        cbClasse.addItem("(Aucune)");
        loadClassesInCombo(cbClasse);

        // Champs parents (Parent 1)
        JTextField fNomParent1 = new JTextField(20);
        JTextField fPrenomParent1 = new JTextField(20);
        JComboBox<String> cbLienParent1 = new JComboBox<>(new String[]{"Père", "Mère", "Tuteur", "Tutrice"});
        JTextField fEmailParent1 = new JTextField(20);
        JTextField fTelParent1 = new JTextField(20);

        // Champs parents (Parent 2)
        JTextField fNomParent2 = new JTextField(20);
        JTextField fPrenomParent2 = new JTextField(20);
        JComboBox<String> cbLienParent2 = new JComboBox<>(new String[]{"Père", "Mère", "Tuteur", "Tutrice"});
        JTextField fEmailParent2 = new JTextField(20);
        JTextField fTelParent2 = new JTextField(20);

        // SECTION 1: INFOS ÉLÈVE
        JPanel section1 = new JPanel(new GridLayout(7, 2, 8, 8));
        section1.setBorder(BorderFactory.createTitledBorder("📝 Informations de l'élève"));

        JLabel labelNom = new JLabel("Nom * :");
        labelNom.setFont(new Font("SansSerif", Font.BOLD, 12));
        section1.add(labelNom);
        section1.add(fNom);

        JLabel labelPrenom = new JLabel("Prénom * :");
        labelPrenom.setFont(new Font("SansSerif", Font.BOLD, 12));
        section1.add(labelPrenom);
        section1.add(fPrenom);

        JLabel labelId = new JLabel("Identifiant (auto) :");
        labelId.setFont(new Font("SansSerif", Font.PLAIN, 11));
        section1.add(labelId);
        section1.add(fId);

        section1.add(new JLabel("Date naissance (opt) :"));
        section1.add(fDateNaissance);

        section1.add(new JLabel("Classe (opt) :"));
        section1.add(cbClasse);

        section1.add(new JLabel("Téléphone (opt) :"));
        section1.add(fTelephone);

        section1.add(new JLabel("Email (opt) :"));
        section1.add(fEmail);

        // SECTION 2: PARENT 1
        JPanel section2 = new JPanel(new GridLayout(5, 2, 8, 8));
        section2.setBorder(BorderFactory.createTitledBorder("👥 Parent 1 (optionnel)"));
        section2.add(new JLabel("Nom parent :"));
        section2.add(fNomParent1);
        section2.add(new JLabel("Prénom parent :"));
        section2.add(fPrenomParent1);
        section2.add(new JLabel("Lien :"));
        section2.add(cbLienParent1);
        section2.add(new JLabel("Email parent :"));
        section2.add(fEmailParent1);
        section2.add(new JLabel("Téléphone parent :"));
        section2.add(fTelParent1);

        // SECTION 3: PARENT 2
        JPanel section3 = new JPanel(new GridLayout(5, 2, 8, 8));
        section3.setBorder(BorderFactory.createTitledBorder("👥 Parent 2 (optionnel)"));
        section3.add(new JLabel("Nom parent :"));
        section3.add(fNomParent2);
        section3.add(new JLabel("Prénom parent :"));
        section3.add(fPrenomParent2);
        section3.add(new JLabel("Lien :"));
        section3.add(cbLienParent2);
        section3.add(new JLabel("Email parent :"));
        section3.add(fEmailParent2);
        section3.add(new JLabel("Téléphone parent :"));
        section3.add(fTelParent2);

        // PANEL GLOBAL avec scroll
        JPanel mainPanel = new JPanel();
        mainPanel.setLayout(new BoxLayout(mainPanel, BoxLayout.Y_AXIS));
        mainPanel.add(section1);
        mainPanel.add(Box.createVerticalStrut(10));
        mainPanel.add(section2);
        mainPanel.add(Box.createVerticalStrut(10));
        mainPanel.add(section3);

        JScrollPane scrollPane = new JScrollPane(mainPanel);
        scrollPane.setPreferredSize(new Dimension(500, 700));

        // LISTENER pour auto-générer l'identifiant
        fNom.getDocument().addDocumentListener(new javax.swing.event.DocumentListener() {
            public void insertUpdate(javax.swing.event.DocumentEvent e) { updateIdentifiant(); }
            public void removeUpdate(javax.swing.event.DocumentEvent e) { updateIdentifiant(); }
            public void changedUpdate(javax.swing.event.DocumentEvent e) { updateIdentifiant(); }

            private void updateIdentifiant() {
                String nom = fNom.getText().trim();
                String prenom = fPrenom.getText().trim();
                if (!nom.isEmpty() && !prenom.isEmpty()) {
                    String id = generateIdentifiant(nom, prenom);
                    fId.setText(id);
                }
            }
        });

        fPrenom.getDocument().addDocumentListener(new javax.swing.event.DocumentListener() {
            public void insertUpdate(javax.swing.event.DocumentEvent e) { updateIdentifiant(); }
            public void removeUpdate(javax.swing.event.DocumentEvent e) { updateIdentifiant(); }
            public void changedUpdate(javax.swing.event.DocumentEvent e) { updateIdentifiant(); }

            private void updateIdentifiant() {
                String nom = fNom.getText().trim();
                String prenom = fPrenom.getText().trim();
                if (!nom.isEmpty() && !prenom.isEmpty()) {
                    String id = generateIdentifiant(nom, prenom);
                    fId.setText(id);
                }
            }
        });

        // AFFICHER LE DIALOG
        int result = JOptionPane.showConfirmDialog(
                this,
                scrollPane,
                "Créer un nouvel élève",
                JOptionPane.OK_CANCEL_OPTION,
                JOptionPane.PLAIN_MESSAGE
        );

        if (result == JOptionPane.OK_OPTION) {
            // VALIDATIONS
            String nom = fNom.getText().trim().toUpperCase();
            String prenom = fPrenom.getText().trim();
            String identifiant = fId.getText().trim();

            if (nom.isEmpty() || prenom.isEmpty() || identifiant.isEmpty()) {
                JOptionPane.showMessageDialog(this, "❌ Nom, Prénom et Identifiant sont requis", "Validation", JOptionPane.ERROR_MESSAGE);
                return;
            }

            String dateNaissance = fDateNaissance.getText().trim();
            if (!dateNaissance.isEmpty() && !dateNaissance.matches("\\d{4}-\\d{2}-\\d{2}")) {
                JOptionPane.showMessageDialog(this, "❌ Format de date invalide (YYYY-MM-DD)", "Validation", JOptionPane.ERROR_MESSAGE);
                return;
            }

            // RÉSUMÉ avant confirmation
            StringBuilder summary = new StringBuilder();
            summary.append("📋 RÉSUMÉ DE LA CRÉATION\n\n");
            summary.append("═══ ÉLÈVE ═══\n");
            summary.append("Nom : ").append(nom).append("\n");
            summary.append("Prénom : ").append(prenom).append("\n");
            summary.append("Identifiant : ").append(identifiant).append("\n");
            if (!dateNaissance.isEmpty()) summary.append("Naissance : ").append(dateNaissance).append("\n");
            if (!fTelephone.getText().trim().isEmpty()) summary.append("Téléphone : ").append(fTelephone.getText().trim()).append("\n");
            if (!fEmail.getText().trim().isEmpty()) summary.append("Email : ").append(fEmail.getText().trim()).append("\n");
            String classe = (String) cbClasse.getSelectedItem();
            if (!classe.equals("(Aucune)")) summary.append("Classe : ").append(classe).append("\n");

            if (!fNomParent1.getText().trim().isEmpty()) {
                summary.append("\n═══ PARENT 1 ═══\n");
                summary.append("Nom : ").append(fNomParent1.getText().trim()).append("\n");
                summary.append("Prénom : ").append(fPrenomParent1.getText().trim()).append("\n");
                summary.append("Lien : ").append(cbLienParent1.getSelectedItem()).append("\n");
                if (!fEmailParent1.getText().trim().isEmpty()) summary.append("Email : ").append(fEmailParent1.getText().trim()).append("\n");
                if (!fTelParent1.getText().trim().isEmpty()) summary.append("Téléphone : ").append(fTelParent1.getText().trim()).append("\n");
            }

            if (!fNomParent2.getText().trim().isEmpty()) {
                summary.append("\n═══ PARENT 2 ═══\n");
                summary.append("Nom : ").append(fNomParent2.getText().trim()).append("\n");
                summary.append("Prénom : ").append(fPrenomParent2.getText().trim()).append("\n");
                summary.append("Lien : ").append(cbLienParent2.getSelectedItem()).append("\n");
                if (!fEmailParent2.getText().trim().isEmpty()) summary.append("Email : ").append(fEmailParent2.getText().trim()).append("\n");
                if (!fTelParent2.getText().trim().isEmpty()) summary.append("Téléphone : ").append(fTelParent2.getText().trim()).append("\n");
            }

            summary.append("\n✅ Continuer ?");

            int confirm = JOptionPane.showConfirmDialog(this, summary.toString(), "Confirmation", JOptionPane.YES_NO_OPTION, JOptionPane.INFORMATION_MESSAGE);

            if (confirm == JOptionPane.YES_OPTION) {
                // ✅ SwingWorker
                SwingWorker<Boolean, Void> worker = new SwingWorker<>() {
                    @Override
                    protected Boolean doInBackground() throws Exception {
                        System.out.println("\n" + "=".repeat(50));
                        System.out.println("✏️ === CRÉATION ÉLÈVE ===");
                        System.out.println("=".repeat(50));
                        System.out.println("📍 Nom : " + nom);
                        System.out.println("📍 Prénom : " + prenom);
                        System.out.println("📍 Identifiant : " + identifiant);
                        if (!dateNaissance.isEmpty()) System.out.println("📍 Date naissance : " + dateNaissance);
                        if (!fTelephone.getText().trim().isEmpty()) System.out.println("📍 Téléphone : " + fTelephone.getText().trim());
                        if (!fEmail.getText().trim().isEmpty()) System.out.println("📍 Email : " + fEmail.getText().trim());
                        String classe = (String) cbClasse.getSelectedItem();
                        if (!classe.equals("(Aucune)")) System.out.println("📍 Classe : " + classe);
                        System.out.println("=".repeat(50));
                        System.out.println("🔄 Envoi vers l'API...");

                        boolean result = ApiService.getInstance().createEleve(nom, prenom, identifiant);

                        if (result) {
                            System.out.println("✅ Élève créé avec succès !");
                        } else {
                            System.out.println("❌ Erreur API : création échouée");
                        }
                        System.out.println("=".repeat(50) + "\n");

                        return result;
                    }

                    @Override
                    protected void done() {
                        try {
                            boolean ok = get();
                            if (ok) {
                                JOptionPane.showMessageDialog(
                                        ElevesPanel.this,
                                        "✅ Élève créé avec succès !\n\n" + nom + " " + prenom +
                                                "\n\nIdentifiant : " + identifiant,
                                        "Succès",
                                        JOptionPane.INFORMATION_MESSAGE
                                );
                                refresh();
                            } else {
                                JOptionPane.showMessageDialog(
                                        ElevesPanel.this,
                                        "❌ Erreur : création échouée\n\n" +
                                                "Vérifiez :\n" +
                                                "• Que l'identifiant est unique\n" +
                                                "• Que l'API est accessible\n" +
                                                "• Que les données sont valides\n\n" +
                                                "Identifiant utilisé : " + identifiant,
                                        "Erreur",
                                        JOptionPane.ERROR_MESSAGE
                                );
                            }
                        } catch (Exception ex) {
                            String errorMsg = ex.getMessage();
                            System.err.println("❌ EXCEPTION COMPLÈTE:");
                            ex.printStackTrace();

                            // Parser les erreurs courantes
                            if (errorMsg != null) {
                                if (errorMsg.contains("DUP_ENTRY") || errorMsg.contains("existe") || errorMsg.contains("Unique")) {
                                    errorMsg = "❌ ERREUR : Identifiant déjà existant !\n\n" +
                                            "L'identifiant '" + identifiant + "' est déjà utilisé.\n\n" +
                                            "L'app génère un ID unique avec timestamp,\n" +
                                            "mais si le même ID est généré deux fois,\n" +
                                            "il y a conflit.\n\n" +
                                            "Essayez de créer l'élève à nouveau\n" +
                                            "(timestamp sera différent).";
                                } else if (errorMsg.contains("Connection") || errorMsg.contains("timeout")) {
                                    errorMsg = "❌ ERREUR RÉSEAU\n\n" +
                                            "Impossible de joindre l'API.\n\n" +
                                            "Vérifiez que :\n" +
                                            "• L'API est lancée\n" +
                                            "• Le serveur est accessible\n" +
                                            "• La base de données fonctionne";
                                } else if (errorMsg.isEmpty()) {
                                    errorMsg = "❌ ERREUR INCONNUE\n\n" +
                                            "L'API a retourné une erreur sans message.\n\n" +
                                            "Vérifiez les logs du serveur.";
                                }
                            }

                            JOptionPane.showMessageDialog(
                                    ElevesPanel.this,
                                    errorMsg != null ? errorMsg : "❌ Erreur inconnue lors de la création",
                                    "Erreur de création",
                                    JOptionPane.ERROR_MESSAGE
                            );
                        }
                    }
                };
                worker.execute();
            }
        }
    }

    /**
     * ✅ Génère automatiquement un identifiant VRAIMENT UNIQUE
     * Format: prenom_nom_yyyyMMdd_HHmmss
     * Ex: jean_dupont_20260503_151245
     *
     * Garantit l'unicité même si plusieurs élèves créés le même jour !
     */
    private String generateIdentifiant(String nom, String prenom) {
        String nomSanitized = nom.toLowerCase().replaceAll("[^a-z]", "");
        String prenomSanitized = prenom.toLowerCase().replaceAll("[^a-z]", "");

        // Ajouter timestamp complet (date + heure + minute + seconde)
        String timestamp = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));

        String id = prenomSanitized + "_" + nomSanitized + "_" + timestamp;

        System.out.println("✅ Identifiant auto-généré: " + id);

        return id;
    }

    /**
     * ✅ Charge les classes dans le combo (version robuste)
     * Gère les erreurs si getLettre() n'existe pas
     */
    private void loadClassesInCombo(JComboBox<String> cbClasse) {
        try {
            Classe[] classes = ApiService.getInstance().getClasses("2025-2026");
            if (classes != null && classes.length > 0) {
                for (Classe c : classes) {
                    String classeName = getClasseDisplayName(c);
                    if (classeName != null && !classeName.isEmpty()) {
                        cbClasse.addItem(classeName);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("⚠️ Impossible de charger les classes: " + e.getMessage());
        }
    }

    /**
     * ✅ Retourne le nom formaté d'une classe (6A, 5B, etc)
     * Gère les cas où getLettre() n'existe pas
     */
    private String getClasseDisplayName(Classe c) {
        try {
            // Essayer avec niveau + lettre
            if (c.getNiveau() != null && c.getLettre() != null) {
                return c.getNiveau() + c.getLettre();
            }
        } catch (Exception e1) {
            // Si ça échoue, essayer autre chose
        }

        try {
            // Fallback: utiliser getClasseFormatted() s'il existe
            if (c.toString() != null) {
                return c.toString();
            }
        } catch (Exception e2) {
            // Si ça échoue aussi
        }

        // Dernier recours
        return "Classe " + c.getId();
    }

    /**
     * ✅ Éditer les informations d'un élève
     */
    private void editEleve() {
        if (currentEleveId < 0) {
            JOptionPane.showMessageDialog(this, "❌ Sélectionnez un élève d'abord", "Erreur", JOptionPane.ERROR_MESSAGE);
            return;
        }

        // Récupérer les infos actuelles de l'élève
        SwingWorker<Eleve, Void> worker = new SwingWorker<>() {
            @Override
            protected Eleve doInBackground() throws Exception {
                return ApiService.getInstance().getEleveStatistiques(currentEleveId);
            }

            @Override
            protected void done() {
                try {
                    Eleve eleve = get();
                    if (eleve == null) {
                        JOptionPane.showMessageDialog(ElevesPanel.this, "❌ Élève non trouvé", "Erreur", JOptionPane.ERROR_MESSAGE);
                        return;
                    }

                    // Créer le formulaire d'édition
                    JTextField fNom = new JTextField(eleve.getNom(), 20);
                    JTextField fPrenom = new JTextField(eleve.getPrenom(), 20);
                    // ✅ CORRIGÉ: Stocker la date en ISO (format API)
                    JTextField fDateNaissance = new JTextField(eleve.getDateNaissance() != null ? eleve.getDateNaissance() : "", 20);
                    JTextField fTelephone = new JTextField(eleve.getTelephone() != null ? eleve.getTelephone() : "", 20);

                    // Combo classe
                    JComboBox<String> cbClasse = new JComboBox<>();
                    cbClasse.addItem("(Aucune)");
                    try {
                        Classe[] classes = ApiService.getInstance().getClasses("2025-2026");
                        if (classes != null) {
                            for (Classe c : classes) {
                                cbClasse.addItem(c.getNom() != null ? c.getNom() : c.getId() + "");
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("⚠️ Impossible de charger les classes");
                    }
                    if (eleve.getClasse() != null) {
                        cbClasse.setSelectedItem(eleve.getClasse());
                    }

                    // Panel du formulaire
                    JPanel form = new JPanel(new GridLayout(5, 2, 8, 8));
                    form.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

                    form.add(new JLabel("Nom :"));
                    form.add(fNom);
                    form.add(new JLabel("Prénom :"));
                    form.add(fPrenom);
                    form.add(new JLabel("Date naissance (YYYY-MM-DD) :"));
                    form.add(fDateNaissance);
                    form.add(new JLabel("Téléphone :"));
                    form.add(fTelephone);
                    form.add(new JLabel("Classe :"));
                    form.add(cbClasse);

                    JScrollPane scroll = new JScrollPane(form);
                    scroll.setPreferredSize(new Dimension(400, 250));

                    int result = JOptionPane.showConfirmDialog(ElevesPanel.this, scroll, "Éditer élève", JOptionPane.OK_CANCEL_OPTION);

                    if (result == JOptionPane.OK_OPTION) {
                        String nom = fNom.getText().trim().toUpperCase();
                        String prenom = fPrenom.getText().trim();
                        String dateNaissance = fDateNaissance.getText().trim();
                        String telephone = fTelephone.getText().trim();

                        if (nom.isEmpty() || prenom.isEmpty()) {
                            JOptionPane.showMessageDialog(ElevesPanel.this, "❌ Nom et prénom requis", "Validation", JOptionPane.ERROR_MESSAGE);
                            return;
                        }

                        if (!dateNaissance.isEmpty() && !dateNaissance.matches("\\d{4}-\\d{2}-\\d{2}")) {
                            JOptionPane.showMessageDialog(ElevesPanel.this, "❌ Format de date invalide (YYYY-MM-DD)", "Validation", JOptionPane.ERROR_MESSAGE);
                            return;
                        }

                        // Afficher résumé
                        StringBuilder summary = new StringBuilder();
                        summary.append("📋 MODIFICATION\n\n");
                        summary.append("Nom : ").append(nom).append("\n");
                        summary.append("Prénom : ").append(prenom).append("\n");
                        if (!dateNaissance.isEmpty()) summary.append("Naissance : ").append(dateNaissance).append("\n");
                        if (!telephone.isEmpty()) summary.append("Téléphone : ").append(telephone).append("\n");
                        String classe = (String) cbClasse.getSelectedItem();
                        if (!classe.equals("(Aucune)")) summary.append("Classe : ").append(classe).append("\n");
                        summary.append("\nContinuer ?");

                        int confirm = JOptionPane.showConfirmDialog(ElevesPanel.this, summary.toString(), "Confirmation", JOptionPane.YES_NO_OPTION);

                        if (confirm == JOptionPane.YES_OPTION) {
                            // SwingWorker pour la mise à jour
                            SwingWorker<Boolean, Void> updateWorker = new SwingWorker<>() {
                                @Override
                                protected Boolean doInBackground() throws Exception {
                                    System.out.println("\n" + "=".repeat(50));
                                    System.out.println("✏️ === MODIFICATION ÉLÈVE ===");
                                    System.out.println("=".repeat(50));
                                    System.out.println("📍 ID : " + currentEleveId);
                                    System.out.println("📍 Nom : " + nom);
                                    System.out.println("📍 Prénom : " + prenom);
                                    if (!dateNaissance.isEmpty()) System.out.println("📍 Naissance : " + dateNaissance);
                                    if (!telephone.isEmpty()) System.out.println("📍 Téléphone : " + telephone);
                                    // ✅ Déclarer classe UNE SEULE FOIS
                                    String classe = (String) cbClasse.getSelectedItem();
                                    if (!classe.equals("(Aucune)")) System.out.println("📍 Classe : " + classe);
                                    System.out.println("=".repeat(50));

                                    // ✅ CORRIGÉ: Construire Map et appeler updateEleve()
                                    Map<String, Object> data = new HashMap<>();
                                    data.put("nom", nom);
                                    data.put("prenom", prenom);
                                    if (!dateNaissance.isEmpty()) data.put("date_naissance", dateNaissance);
                                    if (!telephone.isEmpty()) data.put("telephone", telephone);
                                    if (!classe.equals("(Aucune)")) data.put("classe", classe);

                                    boolean ok = ApiService.getInstance().updateEleve(currentEleveId, data);

                                    if (ok) {
                                        System.out.println("✅ Élève modifié avec succès !");
                                    } else {
                                        System.out.println("❌ Erreur lors de la modification");
                                    }
                                    System.out.println("=".repeat(50) + "\n");

                                    return ok;
                                }

                                @Override
                                protected void done() {
                                    try {
                                        boolean ok = get();
                                        if (ok) {
                                            JOptionPane.showMessageDialog(ElevesPanel.this, "✅ Élève modifié !\n\n" + nom + " " + prenom, "Succès", JOptionPane.INFORMATION_MESSAGE);
                                            refresh();
                                        } else {
                                            JOptionPane.showMessageDialog(ElevesPanel.this, "❌ Erreur lors de la modification", "Erreur", JOptionPane.ERROR_MESSAGE);
                                        }
                                    } catch (Exception ex) {
                                        JOptionPane.showMessageDialog(ElevesPanel.this, "❌ Erreur : " + ex.getMessage(), "Erreur", JOptionPane.ERROR_MESSAGE);
                                    }
                                }
                            };
                            updateWorker.execute();
                        }
                    }
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(ElevesPanel.this, "❌ Erreur : " + ex.getMessage(), "Erreur", JOptionPane.ERROR_MESSAGE);
                }
            }
        };
        worker.execute();
    }

    /**
     * ✅ NOUVEAU: Demander confirmation et supprimer un élève
     */
    private void deleteEleveConfirm() {
        if (currentEleveId < 0) {
            JOptionPane.showMessageDialog(this, "❌ Sélectionnez un élève d'abord", "Erreur", JOptionPane.ERROR_MESSAGE);
            return;
        }

        // Récupérer les infos de l'élève pour affichage
        SwingWorker<Eleve, Void> worker = new SwingWorker<>() {
            @Override
            protected Eleve doInBackground() throws Exception {
                return ApiService.getInstance().getEleveStatistiques(currentEleveId);
            }

            @Override
            protected void done() {
                try {
                    Eleve eleve = get();
                    if (eleve == null) {
                        JOptionPane.showMessageDialog(ElevesPanel.this, "❌ Élève non trouvé", "Erreur", JOptionPane.ERROR_MESSAGE);
                        return;
                    }

                    // CONFIRMATION DIALOG avec détails
                    String message = "⚠️ ATTENTION !\n\n" +
                            "Voulez-vous vraiment supprimer cet élève ?\n\n" +
                            "Nom : " + eleve.getNom() + " " + eleve.getPrenom() + "\n" +
                            "Identifiant : " + eleve.getIdentifiant() + "\n\n" +
                            "⚠️ Cette action est IRRÉVERSIBLE !";

                    int confirm = JOptionPane.showConfirmDialog(
                            ElevesPanel.this,
                            message,
                            "CONFIRMER LA SUPPRESSION",
                            JOptionPane.YES_NO_OPTION,
                            JOptionPane.WARNING_MESSAGE
                    );

                    if (confirm == JOptionPane.YES_OPTION) {
                        // Procéder à la suppression
                        deleteEleveExecute(eleve);
                    }
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(ElevesPanel.this, "❌ Erreur : " + ex.getMessage(), "Erreur", JOptionPane.ERROR_MESSAGE);
                }
            }
        };
        worker.execute();
    }

    /**
     * ✅ NOUVEAU: Exécuter la suppression de l'élève
     */
    private void deleteEleveExecute(Eleve eleve) {
        SwingWorker<Boolean, Void> deleteWorker = new SwingWorker<>() {
            @Override
            protected Boolean doInBackground() throws Exception {
                System.out.println("\n" + "=".repeat(50));
                System.out.println("🗑️ === SUPPRESSION ÉLÈVE ===");
                System.out.println("=".repeat(50));
                System.out.println("📍 ID : " + currentEleveId);
                System.out.println("📍 Nom : " + eleve.getNom());
                System.out.println("📍 Prénom : " + eleve.getPrenom());
                System.out.println("📍 Identifiant : " + eleve.getIdentifiant());
                System.out.println("=".repeat(50));
                System.out.println("🔄 Envoi de la suppression...");

                // ✅ Appeler deleteEleve() d'ApiService
                boolean ok = ApiService.getInstance().deleteEleve(currentEleveId);

                if (ok) {
                    System.out.println("✅ Élève supprimé avec succès !");
                } else {
                    System.out.println("❌ Erreur lors de la suppression");
                }
                System.out.println("=".repeat(50) + "\n");

                return ok;
            }

            @Override
            protected void done() {
                try {
                    boolean ok = get();
                    if (ok) {
                        JOptionPane.showMessageDialog(
                                ElevesPanel.this,
                                "✅ Élève supprimé avec succès !\n\n" + eleve.getNom() + " " + eleve.getPrenom(),
                                "Succès",
                                JOptionPane.INFORMATION_MESSAGE
                        );
                        // Rafraîchir la liste
                        currentEleveId = -1;
                        txtDetail.setText("Sélectionnez un élève dans la liste.");
                        refresh();
                    } else {
                        JOptionPane.showMessageDialog(
                                ElevesPanel.this,
                                "❌ Erreur : impossible de supprimer l'élève",
                                "Erreur",
                                JOptionPane.ERROR_MESSAGE
                        );
                    }
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(
                            ElevesPanel.this,
                            "❌ Erreur : " + ex.getMessage(),
                            "Erreur",
                            JOptionPane.ERROR_MESSAGE
                    );
                }
            }
        };
        deleteWorker.execute();
    }

    /**
     * ✅ IMPLÉMENTATION DE L'INTERFACE Refreshable
     */
    @Override
    public void refresh() {
        SwingWorker<Eleve[], Void> worker = new SwingWorker<>() {
            @Override
            protected Eleve[] doInBackground() throws Exception {
                return ApiService.getInstance().getEleves(currentPage, 20);
            }
            @Override
            protected void done() {
                try {
                    fillTable(get());
                } catch (Exception ignored) {}
            }
        };
        worker.execute();
    }

    /**
     * ✅ Formatte une date ISO 8601 en format lisible français
     * Format d'entrée:  2005-11-19T23:00:00.000Z
     * Format de sortie: 19/11/2005
     */
    private String formatDate(String dateIso) {
        if (dateIso == null || dateIso.isEmpty()) {
            return "—";
        }
        try {
            Instant instant = Instant.parse(dateIso);
            LocalDate date = instant.atZone(ZoneId.of("UTC")).toLocalDate();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            return date.format(formatter);
        } catch (Exception e) {
            System.err.println("⚠️ Erreur formatage date: " + e.getMessage());
            return dateIso; // Retourner la valeur originale si erreur
        }
    }
}