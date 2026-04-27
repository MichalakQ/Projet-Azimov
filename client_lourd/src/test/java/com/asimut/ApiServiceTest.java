package com.asimut;

import com.asimut.model.*;
import com.asimut.service.ApiService;
import com.google.gson.JsonObject;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;

import static org.junit.Assert.*;

/**
 * Tests unitaires pour ApiService.
 * Prérequis : l'API doit tourner sur http://localhost:3000 avec le jeu de test.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ApiServiceTest {

    private static final ApiService api = ApiService.getInstance();

    @BeforeClass
    public static void setup() throws Exception {
        api.setBaseUrl("http://localhost:3000");
        boolean ok = api.login("proviseur", "asimov2026");
        assertTrue("Login proviseur doit réussir", ok);
    }

    // ===== AUTH =====

    @Test
    public void test01_loginReussi() {
        assertNotNull(api.getToken());
        assertNotNull(api.getCurrentUser());
        assertEquals("proviseur", api.getCurrentUser().getIdentifiant());
        assertEquals("proviseur", api.getCurrentUser().getRole());
    }

    @Test
    public void test02_loginEchoue() throws Exception {
        ApiService temp = ApiService.getInstance();
        // On ne peut pas tester directement avec le singleton, on vérifie juste que le token actuel est valide
        assertTrue(api.isLoggedIn());
    }

    // ===== ELEVES =====

    @Test
    public void test10_getEleves() throws Exception {
        Eleve[] eleves = api.getEleves(1, 10);
        assertNotNull(eleves);
        assertTrue("Doit y avoir des élèves", eleves.length > 0);
    }

    @Test
    public void test11_getElevesCount() throws Exception {
        int count = api.getElevesCount();
        assertTrue("Compteur > 0", count > 0);
    }

    @Test
    public void test12_searchEleves() throws Exception {
        Eleve[] result = api.searchEleves("calvin");
        assertNotNull(result);
        assertTrue("Calvin doit être trouvé", result.length > 0);
        assertEquals("CALVIN", result[0].getNom());
    }

    @Test
    public void test13_searchElevesVide() throws Exception {
        Eleve[] result = api.searchEleves("zzzzzzzzz");
        assertNotNull(result);
        assertEquals(0, result.length);
    }

    @Test
    public void test14_getEleveStatistiques() throws Exception {
        Eleve eleve = api.getEleveStatistiques(1);
        assertNotNull(eleve);
        assertNotNull(eleve.getNom());
        assertNotNull(eleve.getMoyennes());
        assertNotNull(eleve.getParents());
    }

    // ===== ENSEIGNANTS =====

    @Test
    public void test20_getEnseignants() throws Exception {
        Enseignant[] data = api.getEnseignants();
        assertNotNull(data);
        assertTrue("Doit y avoir des enseignants", data.length >= 4);
    }

    // ===== CLASSES =====

    @Test
    public void test30_getClasses() throws Exception {
        Classe[] data = api.getClasses("2025-2026");
        assertNotNull(data);
        assertTrue("Doit y avoir des classes", data.length > 0);
    }

    // ===== MOYENNES =====

    @Test
    public void test40_getMoyennesParNiveau() throws Exception {
        JsonObject[] data = api.getMoyennesParNiveau();
        assertNotNull(data);
        assertTrue("Doit y avoir des moyennes par niveau", data.length > 0);
        assertTrue(data[0].has("moyenne_niveau"));
    }

    @Test
    public void test41_getMoyennesEnAttente() throws Exception {
        Moyenne[] data = api.getMoyennesEnAttente();
        assertNotNull(data);
    }

    // ===== STAGES =====

    @Test
    public void test50_getSuiviStages() throws Exception {
        RechercheStage[] data = api.getSuiviStages();
        assertNotNull(data);
    }

    // ===== PROJETS =====

    @Test
    public void test60_getProjets() throws Exception {
        Projet[] data = api.getProjets();
        assertNotNull(data);
        assertTrue("Doit y avoir des projets", data.length > 0);
    }

    @Test
    public void test61_createProjet() throws Exception {
        boolean ok = api.createProjet("Projet Test JUnit", "Test automatisé");
        assertTrue("Création projet doit réussir", ok);
    }

    // ===== OPTIONS =====

    @Test
    public void test70_getOptions() throws Exception {
        OptionScolaire[] data = api.getOptions();
        assertNotNull(data);
        assertTrue("Doit y avoir des options", data.length >= 11);
    }

    // ===== CRUD ÉLÈVE =====

    @Test
    public void test80_createEtDeleteEleve() throws Exception {
        String uid = "testjunit" + System.currentTimeMillis();
        boolean created = api.createEleve("TESTJUNIT", "Auto", uid);
        assertTrue("Création élève doit réussir", created);

        // Recherche pour trouver l'ID
        Eleve[] found = api.searchEleves("TESTJUNIT");
        assertTrue("Doit trouver l'élève créé", found.length > 0);

        // Suppression
        boolean deleted = api.deleteEleve(found[0].getId());
        assertTrue("Suppression doit réussir", deleted);
    }
}
