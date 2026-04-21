package com.roger;

import javax.swing.*;

public class Frame extends JFrame {


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

    }

    private JPanel Panel() {

        JPanel panel = new JPanel();

        return panel;

    }

}
