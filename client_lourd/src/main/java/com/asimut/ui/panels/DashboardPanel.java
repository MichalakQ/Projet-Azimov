package com.asimut.ui.panels;

import com.asimut.model.*;
import com.asimut.service.ApiService;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class DashboardPanel extends JPanel implements Refreshable {

    private final JLabel lblEleves = new JLabel("—");
    private final JLabel lblClasses = new JLabel("—");
    private final JLabel lblProjets = new JLabel("—");
    private final DefaultTableModel tableModel;

    public DashboardPanel() {
        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(24, 28, 24, 28));
        setOpaque(false);

        JPanel content = new JPanel();
        content.setLayout(new BoxLayout(content, BoxLayout.Y_AXIS));
        content.setOpaque(false);

        JLabel title = new JLabel("Tableau de bord");
        title.setFont(new Font("SansSerif", Font.BOLD, 20));
        title.setAlignmentX(LEFT_ALIGNMENT);
        content.add(title);
        content.add(Box.createVerticalStrut(16));

        // Stats cards
        JPanel statsRow = new JPanel(new GridLayout(1, 3, 12, 0));
        statsRow.setOpaque(false);
        statsRow.setMaximumSize(new Dimension(Integer.MAX_VALUE, 80));
        statsRow.setAlignmentX(LEFT_ALIGNMENT);

        statsRow.add(createStatCard("Élèves", lblEleves));
        statsRow.add(createStatCard("Classes", lblClasses));
        statsRow.add(createStatCard("Projets", lblProjets));
        content.add(statsRow);
        content.add(Box.createVerticalStrut(16));

        // Table derniers élèves
        JLabel tableTitle = new JLabel("Derniers élèves inscrits");
        tableTitle.setFont(new Font("SansSerif", Font.BOLD, 14));
        tableTitle.setAlignmentX(LEFT_ALIGNMENT);
        content.add(tableTitle);
        content.add(Box.createVerticalStrut(8));

        tableModel = new DefaultTableModel(new String[]{"ID", "Nom", "Prénom", "Classe"}, 0) {
            public boolean isCellEditable(int r, int c) { return false; }
        };
        JTable table = new JTable(tableModel);
        table.setRowHeight(28);
        table.getColumnModel().getColumn(0).setMaxWidth(50);
        JScrollPane scroll = new JScrollPane(table);
        scroll.setAlignmentX(LEFT_ALIGNMENT);
        scroll.setPreferredSize(new Dimension(0, 200));
        content.add(scroll);

        add(content, BorderLayout.NORTH);
        refresh();
    }

    private JPanel createStatCard(String label, JLabel valueLabel) {
        JPanel card = new JPanel(new BorderLayout());
        card.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(255, 255, 255, 15)),
                BorderFactory.createEmptyBorder(14, 16, 14, 16)
        ));

        valueLabel.setFont(new Font("Monospaced", Font.BOLD, 28));
        valueLabel.setForeground(new Color(96, 165, 250));
        card.add(valueLabel, BorderLayout.CENTER);

        JLabel lbl = new JLabel(label.toUpperCase());
        lbl.setFont(new Font("SansSerif", Font.PLAIN, 10));
        lbl.setForeground(new Color(125, 129, 154));
        card.add(lbl, BorderLayout.SOUTH);

        return card;
    }

    @Override
    public void refresh() {
        SwingWorker<Void, Void> worker = new SwingWorker<>() {
            Eleve[] eleves;
            Classe[] classes;
            Projet[] projets;

            @Override
            protected Void doInBackground() {
                try {
                    ApiService api = ApiService.getInstance();
                    eleves = api.getEleves(1, 8);
                    classes = api.getClasses("2025-2026");
                    projets = api.getProjets();
                } catch (Exception e) {
                    System.err.println("Dashboard refresh error: " + e.getMessage());
                }
                return null;
            }

            @Override
            protected void done() {
                if (eleves != null) {
                    try { lblEleves.setText(String.valueOf(ApiService.getInstance().getElevesCount())); } catch (Exception ignored) {}
                    tableModel.setRowCount(0);
                    for (Eleve e : eleves) {
                        tableModel.addRow(new Object[]{e.getId(), e.getNom(), e.getPrenom(), e.getClasse()});
                    }
                }
                if (classes != null) lblClasses.setText(String.valueOf(classes.length));
                if (projets != null) lblProjets.setText(String.valueOf(projets.length));
            }
        };
        worker.execute();
    }
}
