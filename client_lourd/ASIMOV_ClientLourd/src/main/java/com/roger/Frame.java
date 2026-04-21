package com.roger;

import javax.swing.*;
import java.awt.*;
import java.util.ArrayList;

public class Frame extends JFrame {

    private JPanel listPanel;
    private JTextField search;
    private JButton searchButton;

    private JScrollPane content;
    private ArrayList<JLabel> elements;

    public Frame () {
        super();
        build();
    }

    private void build() {

        setTitle("Asim'UT");
        setSize(800 , 450);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        setContentPane(Panel());
        loadData();
    }

    private JPanel Panel() {

        JPanel panel = new JPanel(new BorderLayout(10, 10));

        panel.add(SubPanel(), BorderLayout.NORTH);

        elements = new ArrayList<>();

        listPanel = new JPanel();
        listPanel.setLayout(new BoxLayout(listPanel, BoxLayout.Y_AXIS));

        updateList(); // gère même si vide

        content = new JScrollPane(listPanel);
        panel.add(content, BorderLayout.CENTER);

        return panel;
    }

    private JPanel SubPanel() {

        JPanel panel = new JPanel(new BorderLayout(5, 5));

        search = new JTextField();
        panel.add(search, BorderLayout.CENTER);

        searchButton = new JButton("Rechercher");
        panel.add(searchButton, BorderLayout.EAST);

        return panel;
    }

    private void updateList() {
        listPanel.removeAll();

        if (elements.isEmpty()) {
            JLabel emptyLabel = new JLabel("Aucun élément", SwingConstants.CENTER);
            emptyLabel.setPreferredSize(new Dimension(0, 50));
            listPanel.add(emptyLabel);
        } else {
            for (JLabel label : elements) {
                label.setMaximumSize(new Dimension(Integer.MAX_VALUE, 40));
                label.setBorder(BorderFactory.createEmptyBorder(5,10,5,10));
                listPanel.add(label);
            }
        }

        listPanel.revalidate();
        listPanel.repaint();
    }

    // Dangereux

    private void loadData() {
        new Thread(() -> {
            String json = fetchData(); // appel API
            ArrayList<String> results = parseJson(json);

            SwingUtilities.invokeLater(() -> {
                elements.clear();

                for (String item : results) {
                    elements.add(new JLabel(item));
                }

                updateList();
            });
        }).start();
    }

    private String fetchData() {
        try {
            var client = java.net.http.HttpClient.newHttpClient();

            var request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://localhost:3000/eleves"))
                    .GET()
                    .build();

            var response = client.send(request,
                    java.net.http.HttpResponse.BodyHandlers.ofString());

            return response.body();

        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    private ArrayList<String> parseJson(String json) {
        ArrayList<String> list = new ArrayList<>();

        json = json.replace("[", "").replace("]", "").replace("\"", "");
        String[] items = json.split(",");

        for (String item : items) {
            list.add(item.trim());
        }

        return list;
    }

}
