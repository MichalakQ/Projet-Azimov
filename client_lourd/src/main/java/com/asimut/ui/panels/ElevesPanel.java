package com.asimut.ui.panels;

import com.asimut.model.*;
import com.asimut.service.ApiService;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class ElevesPanel extends JPanel implements Refreshable {

    private final DefaultTableModel tableModel;
    private final JTable table;
    private final JTextField txtSearch = new JTextField();
    private final JTextArea txtDetail = new JTextArea();
    private int currentPage = 1;

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

        JLabel detailTitle = new JLabel("Fiche élève");
        detailTitle.setFont(new Font("SansSerif", Font.BOLD, 14));
        detailPanel.add(detailTitle, BorderLayout.NORTH);

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
                    sb.append("Naissance : ").append(e.getDateNaissance() != null ? e.getDateNaissance() : "—").append("\n");
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

    private void showCreateDialog() {
        JTextField fNom = new JTextField();
        JTextField fPrenom = new JTextField();
        JTextField fId = new JTextField();

        JPanel form = new JPanel(new GridLayout(3, 2, 6, 6));
        form.add(new JLabel("Nom :")); form.add(fNom);
        form.add(new JLabel("Prénom :")); form.add(fPrenom);
        form.add(new JLabel("Identifiant :")); form.add(fId);

        int result = JOptionPane.showConfirmDialog(this, form, "Nouvel élève", JOptionPane.OK_CANCEL_OPTION);
        if (result == JOptionPane.OK_OPTION) {
            try {
                boolean ok = ApiService.getInstance().createEleve(fNom.getText(), fPrenom.getText(), fId.getText());
                if (ok) {
                    JOptionPane.showMessageDialog(this, "Élève créé avec succès");
                    refresh();
                }
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Erreur : " + ex.getMessage(), "Erreur", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    @Override
    public void refresh() {
        SwingWorker<Eleve[], Void> worker = new SwingWorker<>() {
            @Override
            protected Eleve[] doInBackground() throws Exception {
                return ApiService.getInstance().getEleves(currentPage, 20);
            }
            @Override
            protected void done() {
                try { fillTable(get()); } catch (Exception ignored) {}
            }
        };
        worker.execute();
    }
}
