package com.asimut.ui.panels;

import com.asimut.model.RechercheStage;
import com.asimut.service.ApiService;
import javax.swing.*;
import javax.swing.table.*;
import java.awt.*;

public class StagesPanel extends JPanel implements Refreshable {

    private final DefaultTableModel tableModel;

    public StagesPanel() {
        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(24, 28, 24, 28));
        setOpaque(false);

        JLabel title = new JLabel("Suivi des recherches de stage");
        title.setFont(new Font("SansSerif", Font.BOLD, 20));
        add(title, BorderLayout.NORTH);

        tableModel = new DefaultTableModel(
                new String[]{"Nom", "Prénom", "Entreprises contactées", "Statut"}, 0
        ) {
            public boolean isCellEditable(int r, int c) { return false; }
        };

        JTable table = new JTable(tableModel);
        table.setRowHeight(28);

        // Rendu coloré pour la colonne "Statut"
        table.getColumnModel().getColumn(3).setCellRenderer(new DefaultTableCellRenderer() {
            @Override
            public Component getTableCellRendererComponent(JTable t, Object val,
                                                           boolean sel, boolean focus, int row, int col) {
                JLabel lbl = (JLabel) super.getTableCellRendererComponent(t, val, sel, focus, row, col);
                lbl.setHorizontalAlignment(CENTER);
                lbl.setFont(new Font("SansSerif", Font.BOLD, 11));
                if ("ALERTE".equals(val)) {
                    lbl.setForeground(new Color(239, 68, 68));
                } else {
                    lbl.setForeground(new Color(16, 185, 129));
                }
                return lbl;
            }
        });

        // Rendu gras pour la colonne "Entreprises contactées" si > 15
        table.getColumnModel().getColumn(2).setCellRenderer(new DefaultTableCellRenderer() {
            @Override
            public Component getTableCellRendererComponent(JTable t, Object val,
                                                           boolean sel, boolean focus, int row, int col) {
                JLabel lbl = (JLabel) super.getTableCellRendererComponent(t, val, sel, focus, row, col);
                lbl.setHorizontalAlignment(CENTER);
                lbl.setFont(new Font("Monospaced", Font.BOLD, 13));
                int nb = val instanceof Integer ? (int) val : 0;
                if (nb > 15) {
                    lbl.setForeground(new Color(239, 68, 68));
                } else {
                    lbl.setForeground(lbl.getForeground());
                }
                return lbl;
            }
        });

        JScrollPane scroll = new JScrollPane(table);
        scroll.setBorder(BorderFactory.createEmptyBorder(12, 0, 0, 0));
        add(scroll, BorderLayout.CENTER);

        refresh();
    }

    @Override
    public void refresh() {
        SwingWorker<RechercheStage[], Void> worker = new SwingWorker<>() {
            @Override
            protected RechercheStage[] doInBackground() throws Exception {
                return ApiService.getInstance().getSuiviStages();
            }

            @Override
            protected void done() {
                try {
                    RechercheStage[] data = get();
                    tableModel.setRowCount(0);
                    for (RechercheStage s : data) {
                        tableModel.addRow(new Object[]{
                                s.getNom(),
                                s.getPrenom(),
                                s.getNbEntreprisesContactees(),
                                s.isAlerte() ? "ALERTE" : "OK"
                        });
                    }
                } catch (Exception ignored) {}
            }
        };
        worker.execute();
    }
}
