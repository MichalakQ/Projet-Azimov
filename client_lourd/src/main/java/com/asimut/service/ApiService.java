package com.asimut.service;

import com.asimut.model.*;
import com.google.gson.*;
import java.net.URI;
import java.net.http.*;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.HashMap;
import java.util.Map;

/**
 * Service centralisé pour les appels à l'API REST Asim'UT.
 * Utilise java.net.http.HttpClient (Java 11+) et Gson.
 */
public class ApiService {

    private static ApiService instance;
    private final HttpClient httpClient;
    private final Gson gson;
    private String baseUrl = "http://localhost:3000";
    private String token;
    private Utilisateur currentUser;

    private ApiService() {
        this.httpClient = HttpClient.newHttpClient();
        this.gson = new GsonBuilder().create();
    }

    public static ApiService getInstance() {
        if (instance == null) instance = new ApiService();
        return instance;
    }

    public void setBaseUrl(String url) { this.baseUrl = url; }
    public String getToken() { return token; }
    public Utilisateur getCurrentUser() { return currentUser; }
    public boolean isLoggedIn() { return token != null; }

    // ============================================================
    // HTTP helpers
    // ============================================================

    private HttpRequest.Builder requestBuilder(String endpoint) {
        var builder = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + endpoint))
                .header("Content-Type", "application/json");
        if (token != null) {
            builder.header("Authorization", "Bearer " + token);
        }
        return builder;
    }

    private JsonObject doGet(String endpoint) throws Exception {
        var req = requestBuilder(endpoint).GET().build();
        var res = httpClient.send(req, BodyHandlers.ofString());
        return JsonParser.parseString(res.body()).getAsJsonObject();
    }

    private JsonObject doPost(String endpoint, Object body) throws Exception {
        String json = gson.toJson(body);
        var req = requestBuilder(endpoint)
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
        var res = httpClient.send(req, BodyHandlers.ofString());
        return JsonParser.parseString(res.body()).getAsJsonObject();
    }

    private JsonObject doPut(String endpoint, Object body) throws Exception {
        String json = gson.toJson(body);
        var req = requestBuilder(endpoint)
                .PUT(HttpRequest.BodyPublishers.ofString(json))
                .build();
        var res = httpClient.send(req, BodyHandlers.ofString());
        return JsonParser.parseString(res.body()).getAsJsonObject();
    }

    private JsonObject doDelete(String endpoint) throws Exception {
        var req = requestBuilder(endpoint).DELETE().build();
        var res = httpClient.send(req, BodyHandlers.ofString());
        if (res.body().isEmpty()) return new JsonObject();
        return JsonParser.parseString(res.body()).getAsJsonObject();
    }

    // ============================================================
    // AUTH
    // ============================================================

    /**
     * Connexion à l'API. Stocke le token et l'utilisateur.
     * @return true si la connexion a réussi
     */
    public boolean login(String identifiant, String motDePasse) throws Exception {
        Map<String, String> body = Map.of("identifiant", identifiant, "mot_de_passe", motDePasse);
        JsonObject result = doPost("/api/auth/login", body);

        if (result.has("success") && result.get("success").getAsBoolean()) {
            this.token = result.getAsJsonObject("data").get("token").getAsString();
            this.currentUser = gson.fromJson(result.getAsJsonObject("utilisateur"), Utilisateur.class);
            return true;
        }
        return false;
    }

    public void logout() {
        this.token = null;
        this.currentUser = null;
    }

    // ============================================================
    // ÉLÈVES
    // ============================================================

    public Eleve[] getEleves(int page, int limit) throws Exception {
        JsonObject result = doGet("/api/eleves?page=" + page + "&limit=" + limit);
        return gson.fromJson(result.getAsJsonArray("data"), Eleve[].class);
    }

    public int getElevesCount() throws Exception {
        JsonObject result = doGet("/api/eleves?page=1&limit=1");
        return result.has("count") ? result.get("count").getAsInt() : 0;
    }

    public Eleve[] searchEleves(String query) throws Exception {
        JsonObject result = doGet("/api/eleves/search?q=" + query);
        return gson.fromJson(result.getAsJsonArray("data"), Eleve[].class);
    }

    public Eleve getEleveStatistiques(int id) throws Exception {
        JsonObject result = doGet("/api/eleves/" + id + "/statistiques");
        return gson.fromJson(result.getAsJsonObject("data"), Eleve.class);
    }

    public boolean createEleve(String nom, String prenom, String identifiant) throws Exception {
        Map<String, String> body = Map.of("nom", nom, "prenom", prenom, "identifiant", identifiant);
        JsonObject result = doPost("/api/eleves", body);
        return result.has("success") && result.get("success").getAsBoolean();
    }

    public boolean deleteEleve(int id) throws Exception {
        doDelete("/api/eleves/" + id);
        return true;
    }

    // ============================================================
    // ENSEIGNANTS
    // ============================================================

    public Enseignant[] getEnseignants() throws Exception {
        JsonObject result = doGet("/api/enseignants");
        return gson.fromJson(result.getAsJsonArray("data"), Enseignant[].class);
    }

    // ============================================================
    // CLASSES
    // ============================================================

    public Classe[] getClasses(String anneeScolaire) throws Exception {
        JsonObject result = doGet("/api/classes?annee_scolaire=" + anneeScolaire);
        return gson.fromJson(result.getAsJsonArray("data"), Classe[].class);
    }

    // ============================================================
    // MOYENNES
    // ============================================================

    public Moyenne[] getMoyennesEleve(int idEleve) throws Exception {
        JsonObject result = doGet("/api/moyennes/eleve/" + idEleve);
        return gson.fromJson(result.getAsJsonArray("data"), Moyenne[].class);
    }

    public JsonObject[] getMoyennesParNiveau() throws Exception {
        JsonObject result = doGet("/api/moyennes/niveaux");
        JsonArray arr = result.getAsJsonArray("data");
        JsonObject[] out = new JsonObject[arr.size()];
        for (int i = 0; i < arr.size(); i++) out[i] = arr.get(i).getAsJsonObject();
        return out;
    }

    public Moyenne[] getMoyennesEnAttente() throws Exception {
        JsonObject result = doGet("/api/moyennes/en-attente");
        return gson.fromJson(result.getAsJsonArray("data"), Moyenne[].class);
    }

    public boolean validerMoyenne(int id) throws Exception {
        JsonObject result = doPut("/api/moyennes/" + id + "/valider", Map.of());
        return result.has("success") && result.get("success").getAsBoolean();
    }

    // ============================================================
    // STAGES
    // ============================================================

    public RechercheStage[] getSuiviStages() throws Exception {
        JsonObject result = doGet("/api/stages/recherches/suivi");
        return gson.fromJson(result.getAsJsonArray("data"), RechercheStage[].class);
    }

    // ============================================================
    // PROJETS
    // ============================================================

    public Projet[] getProjets() throws Exception {
        JsonObject result = doGet("/api/projets");
        return gson.fromJson(result.getAsJsonArray("data"), Projet[].class);
    }

    public boolean createProjet(String titre, String description) throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("titre", titre);
        if (description != null) body.put("description", description);
        JsonObject result = doPost("/api/projets", body);
        return result.has("success") && result.get("success").getAsBoolean();
    }

    // ============================================================
    // OPTIONS
    // ============================================================

    public OptionScolaire[] getOptions() throws Exception {
        JsonObject result = doGet("/api/options");
        return gson.fromJson(result.getAsJsonArray("data"), OptionScolaire[].class);
    }

    // ============================================================
    // REFERENTS
    // ============================================================

    public JsonObject[] getReferents() throws Exception {
        JsonObject result = doGet("/api/referents");
        JsonArray arr = result.getAsJsonArray("data");
        JsonObject[] out = new JsonObject[arr.size()];
        for (int i = 0; i < arr.size(); i++) out[i] = arr.get(i).getAsJsonObject();
        return out;
    }
}
