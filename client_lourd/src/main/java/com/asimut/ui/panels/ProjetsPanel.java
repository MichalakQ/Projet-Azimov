package com.asimut.ui.panels;

import com.asimut.model.Projet;
import com.asimut.service.ApiService;
import javax.swing.*;
import javax.swing.table.*;
import java.awt.*;

public class ProjetsPanel extends JPanel implements Refreshable {

    private final DefaultTableModel tableModel;

    public ProjetsPanel() {
        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(24, 28, 24, 28));
        setOpaque(false);

        // Top
        JPanel top = new JPanel(new BorderLayout());
        top.setOpaque(false);

        JLabel title = new JLabel("Projets de l'établissement");
        title.setFont(new Font("SansSerif", Font.BOLD, 20));
        top.add(title, BorderLayout.WEST);

        JButton btnNew = new JButton("+ Nouveau projet");
        btnNew.addActionListener(e -> showCreateDialog());
        top.add(btnNew, BorderLayout.EAST);

        add(top, BorderLayout.NORTH);

        // Table
        tableModel = new DefaultTableModel(
                new String[]{"ID", "Titre", "Responsable", "Statut", "Date création"}, 0
        ) {
            public boolean isCellEditable(int r, int c) { return false; }
        };

        JTable table = new JTable(tableModel);
        table.setRowHeight(28);
        table.getColumnModel().getColumn(0).setMaxWidth(50);

        // Rendu coloré pour le statut
        table.getColumnModel().getColumn(3).setCellRenderer(new DefaultTableCellRenderer() {
            @Override
            public Component getTableCellRendererComponent(JTable t, Object val,
                                                           boolean sel, boolean focus, int row, int col) {
                JLabel lbl = (JLabel) super.getTableCellRendererComponent(t, val, sel, focus, row, col);
                lbl.setHorizontalAlignment(CENTER);
                lbl.setFont(new Font("SansSerif", Font.BOLD, 11));
                String statut = val != null ? val.toString() : "";
                switch (statut) {
                    case "en_cours" -> lbl.setForeground(new Color(16, 185, 129));
                    case "valide" -> lbl.setForeground(new Color(96, 165, 250));
                    case "termine" -> lbl.setForeground(new Color(245, 158, 11));
                    case "annule" -> lbl.setForeground(new Color(239, 68, 68));
                    default -> lbl.setForeground(new Color(245, 158, 11));
                }
                return lbl;
            }
        });

        JScrollPane scroll = new JScrollPane(table);
        scroll.setBorder(BorderFactory.createEmptyBorder(12, 0, 0, 0));
        add(scroll, BorderLayout.CENTER);

        refresh();
    }

    private void showCreateDialog() {
        JTextField fTitre = new JTextField();
        JTextField fDesc = new JTextField();

        JPanel form = new JPanel(new GridLayout(2, 2, 6, 6));
        form.add(new JLabel("Titre :")); form.add(fTitre);
        form.add(new JLabel("Description :")); form.add(fDesc);

        int result = JOptionPane.showConfirmDialog(this, form, "Nouveau projet", JOptionPane.OK_CANCEL_OPTION);
        if (result == JOptionPane.OK_OPTION && !fTitre.getText().trim().isEmpty()) {
            SwingWorker<Boolean, Void> worker = new SwingWorker<>() {
                @Override
                protected Boolean doInBackground() throws Exception {
                    return ApiService.getInstance().createProjet(
                            fTitre.getText().trim(),
                            fDesc.getText().trim().isEmpty() ? null : fDesc.getText().trim()
                    );
                }

                @Override
                protected void done() {
                    try {
                        if (get()) {
                            JOptionPane.showMessageDialog(ProjetsPanel.this, "Projet créé avec succès");
                            refresh();
                        }
                    } catch (Exception e) {
                        JOptionPane.showMessageDialog(ProjetsPanel.this,
                                "Erreur : " + e.getMessage(), "Erreur", JOptionPane.ERROR_MESSAGE);
                    }
                }
            };
            worker.execute();
        }
    }

    @Override
    public void refresh() {
        SwingWorker<Projet[], Void> worker = new SwingWorker<>() {
            @Override
            protected Projet[] doInBackground() throws Exception {
                return ApiService.getInstance().getProjets();
            }

            @Override
            protected void done() {
                try {
                    Projet[] data = get();
                    tableModel.setRowCount(0);
                    for (Projet p : data) {
                        String responsable = "—";
                        if (p.getResponsableNom() != null) {
                            responsable = p.getResponsablePrenom() + " " + p.getResponsableNom();
                        }
                        tableModel.addRow(new Object[]{
                                p.getId(), p.getTitre(), responsable,
                                p.getStatut(), p.getDateCreation()
                        });
                    }
                } catch (Exception ignored) {}
            }
        };
        worker.execute();
    }
}