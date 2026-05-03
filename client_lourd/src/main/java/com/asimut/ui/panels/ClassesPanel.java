package com.asimut.ui.panels;

import com.asimut.model.Classe;
import com.asimut.service.ApiService;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class ClassesPanel extends JPanel implements Refreshable {

    private final DefaultTableModel tableModel;
    private final JTextField txtAnnee = new JTextField("2025-2026", 10);

    public ClassesPanel() {
        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(24, 28, 24, 28));
        setOpaque(false);

        // Top
        JPanel top = new JPanel(new BorderLayout());
        top.setOpaque(false);

        JLabel title = new JLabel("Classes");
        title.setFont(new Font("SansSerif", Font.BOLD, 20));
        top.add(title, BorderLayout.WEST);

        JPanel filter = new JPanel(new FlowLayout(FlowLayout.RIGHT, 6, 0));
        filter.setOpaque(false);
        filter.add(new JLabel("Année scolaire :"));
        filter.add(txtAnnee);
        JButton btnLoad = new JButton("Charger");
        btnLoad.addActionListener(e -> refresh());
        filter.add(btnLoad);
        top.add(filter, BorderLayout.EAST);

        add(top, BorderLayout.NORTH);

        // Table
        tableModel = new DefaultTableModel(
                new String[]{"Classe", "Niveau", "Nb élèves", "Année"}, 0
        ) {
            public boolean isCellEditable(int r, int c) { return false; }
        };

        JTable table = new JTable(tableModel);
        table.setRowHeight(28);

        JScrollPane scroll = new JScrollPane(table);
        scroll.setBorder(BorderFactory.createEmptyBorder(12, 0, 0, 0));
        add(scroll, BorderLayout.CENTER);

        refresh();
    }

    @Override
    public void refresh() {
        String annee = txtAnnee.getText().trim();
        SwingWorker<Classe[], Void> worker = new SwingWorker<>() {
            @Override
            protected Classe[] doInBackground() throws Exception {
                return ApiService.getInstance().getClasses(annee);
            }

            @Override
            protected void done() {
                try {
                    Classe[] data = get();
                    tableModel.setRowCount(0);
                    for (Classe c : data) {
                        tableModel.addRow(new Object[]{
                                c.getNom(), c.getNiveau(),
                                c.getNbEleves(), c.getAnneeScolaire()
                        });
                    }
                } catch (Exception ignored) {}
            }
        };
        worker.execute();
    }
}