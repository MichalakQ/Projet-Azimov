package com.asimut.ui.panels;

import com.asimut.model.Enseignant;
import com.asimut.service.ApiService;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class EnseignantsPanel extends JPanel implements Refreshable {

    private final DefaultTableModel tableModel;

    public EnseignantsPanel() {
        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(24, 28, 24, 28));
        setOpaque(false);

        JLabel title = new JLabel("Enseignants");
        title.setFont(new Font("SansSerif", Font.BOLD, 20));
        add(title, BorderLayout.NORTH);

        tableModel = new DefaultTableModel(
                new String[]{"ID", "Nom", "Prénom", "Email", "Téléphone"}, 0
        ) {
            public boolean isCellEditable(int r, int c) { return false; }
        };

        JTable table = new JTable(tableModel);
        table.setRowHeight(28);
        table.getColumnModel().getColumn(0).setMaxWidth(50);

        JScrollPane scroll = new JScrollPane(table);
        scroll.setBorder(BorderFactory.createEmptyBorder(12, 0, 0, 0));
        add(scroll, BorderLayout.CENTER);

        refresh();
    }

    @Override
    public void refresh() {
        SwingWorker<Enseignant[], Void> worker = new SwingWorker<>() {
            @Override
            protected Enseignant[] doInBackground() throws Exception {
                return ApiService.getInstance().getEnseignants();
            }

            @Override
            protected void done() {
                try {
                    Enseignant[] data = get();
                    tableModel.setRowCount(0);
                    for (Enseignant e : data) {
                        tableModel.addRow(new Object[]{
                                e.getId(), e.getNom(), e.getPrenom(),
                                e.getEmail() != null ? e.getEmail() : "—",
                                e.getTelephone() != null ? e.getTelephone() : "—"
                        });
                    }
                } catch (Exception ignored) {}
            }
        };
        worker.execute();
    }
}