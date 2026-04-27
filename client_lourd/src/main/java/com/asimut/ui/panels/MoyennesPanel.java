package com.asimut.ui.panels;

import com.asimut.model.Moyenne;
import com.asimut.service.ApiService;
import com.google.gson.JsonObject;
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class MoyennesPanel extends JPanel implements Refreshable {

    private final DefaultTableModel niveauModel;
    private final DefaultTableModel attenteModel;
    private final JTable attenteTable;

    public MoyennesPanel() {
        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(24, 28, 24, 28));
        setOpaque(false);

        JPanel content = new JPanel();
        content.setLayout(new BoxLayout(content, BoxLayout.Y_AXIS));
        content.setOpaque(false);

        JLabel title = new JLabel("Moyennes");
        title.setFont(new Font("SansSerif", Font.BOLD, 20));
        title.setAlignmentX(LEFT_ALIGNMENT);
        content.add(title);
        content.add(Box.createVerticalStrut(14));

        // Moyennes par niveau
        JLabel lblNiveau = new JLabel("Moyennes par niveau");
        lblNiveau.setFont(new Font("SansSerif", Font.BOLD, 14));
        lblNiveau.setAlignmentX(LEFT_ALIGNMENT);
        content.add(lblNiveau);
        content.add(Box.createVerticalStrut(6));

        niveauModel = new DefaultTableModel(
                new String[]{"Niveau", "Semestre", "Moyenne /20", "Nb élèves"}, 0
        ) {
            public boolean isCellEditable(int r, int c) { return false; }
        };
        JTable niveauTable = new JTable(niveauModel);
        niveauTable.setRowHeight(26);
        JScrollPane scrollNiveau = new JScrollPane(niveauTable);
        scrollNiveau.setPreferredSize(new Dimension(0, 160));
        scrollNiveau.setAlignmentX(LEFT_ALIGNMENT);
        content.add(scrollNiveau);
        content.add(Box.createVerticalStrut(20));

        // En attente de validation
        JPanel attenteHeader = new JPanel(new BorderLayout());
        attenteHeader.setOpaque(false);
        attenteHeader.setAlignmentX(LEFT_ALIGNMENT);
        attenteHeader.setMaximumSize(new Dimension(Integer.MAX_VALUE, 30));

        JLabel lblAttente = new JLabel("En attente de validation");
        lblAttente.setFont(new Font("SansSerif", Font.BOLD, 14));
        attenteHeader.add(lblAttente, BorderLayout.WEST);

        JButton btnValider = new JButton("Valider la sélection");
        btnValider.addActionListener(e -> validerSelection());
        attenteHeader.add(btnValider, BorderLayout.EAST);

        content.add(attenteHeader);
        content.add(Box.createVerticalStrut(6));

        attenteModel = new DefaultTableModel(
                new String[]{"ID", "Élève", "Classe", "Semestre", "Valeur"}, 0
        ) {
            public boolean isCellEditable(int r, int c) { return false; }
        };
        attenteTable = new JTable(attenteModel);
        attenteTable.setRowHeight(26);
        attenteTable.getColumnModel().getColumn(0).setMaxWidth(50);
        JScrollPane scrollAttente = new JScrollPane(attenteTable);
        scrollAttente.setAlignmentX(LEFT_ALIGNMENT);
        content.add(scrollAttente);

        add(content, BorderLayout.CENTER);
        refresh();
    }

    private void validerSelection() {
        int row = attenteTable.getSelectedRow();
        if (row < 0) {
            JOptionPane.showMessageDialog(this, "Sélectionnez une moyenne à valider");
            return;
        }
        int id = (int) attenteModel.getValueAt(row, 0);

        SwingWorker<Boolean, Void> worker = new SwingWorker<>() {
            @Override
            protected Boolean doInBackground() throws Exception {
                return ApiService.getInstance().validerMoyenne(id);
            }

            @Override
            protected void done() {
                try {
                    if (get()) {
                        JOptionPane.showMessageDialog(MoyennesPanel.this, "Moyenne validée");
                        refresh();
                    }
                } catch (Exception e) {
                    JOptionPane.showMessageDialog(MoyennesPanel.this,
                            "Erreur : " + e.getMessage(), "Erreur", JOptionPane.ERROR_MESSAGE);
                }
            }
        };
        worker.execute();
    }

    @Override
    public void refresh() {
        SwingWorker<Void, Void> worker = new SwingWorker<>() {
            JsonObject[] niveaux;
            Moyenne[] attente;

            @Override
            protected Void doInBackground() {
                try {
                    ApiService api = ApiService.getInstance();
                    niveaux = api.getMoyennesParNiveau();
                    attente = api.getMoyennesEnAttente();
                } catch (Exception e) {
                    System.err.println("Moyennes refresh error: " + e.getMessage());
                }
                return null;
            }

            @Override
            protected void done() {
                niveauModel.setRowCount(0);
                if (niveaux != null) {
                    for (JsonObject obj : niveaux) {
                        niveauModel.addRow(new Object[]{
                                obj.has("libelle_niveau") ? obj.get("libelle_niveau").getAsString() : "—",
                                "S" + (obj.has("semestre") ? obj.get("semestre").getAsInt() : "?"),
                                obj.has("moyenne_niveau") ? obj.get("moyenne_niveau").getAsDouble() : 0,
                                obj.has("nb_eleves") ? obj.get("nb_eleves").getAsInt() : 0
                        });
                    }
                }

                attenteModel.setRowCount(0);
                if (attente != null) {
                    for (Moyenne m : attente) {
                        attenteModel.addRow(new Object[]{
                                m.getId(),
                                (m.getNom() != null ? m.getNom() : "") + " " + (m.getPrenom() != null ? m.getPrenom() : ""),
                                m.getClasse() != null ? m.getClasse() : "—",
                                "S" + m.getSemestre(),
                                m.getValeur() + "/20"
                        });
                    }
                }
            }
        };
        worker.execute();
    }
}
