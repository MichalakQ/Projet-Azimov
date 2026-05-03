package com.asimut.service;

import com.asimut.model.*;
import com.google.gson.*;
import java.lang.reflect.Type;
import java.net.URI;
import java.net.http.*;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.HashMap;
import java.util.Map;

/**
 * Service centralisé pour les appels à l'API REST Asim'UT.
 * Utilise java.net.http.HttpClient (Java 11+) et Gson.
 * ✅ COMPLÉTÉ + CORRIGÉ: Toutes les méthodes + gestion des booléens (0/1 → true/false)
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
        // ✅ CORRIGÉ: Configuration Gson avec TypeAdapter pour les booléens
        this.gson = new GsonBuilder()
                .registerTypeAdapter(boolean.class, new BooleanDeserializer())
                .registerTypeAdapter(Boolean.class, new BooleanDeserializer())
                .create();
    }

    // ============================================================
    // ✅ Custom TypeAdapter pour convertir 0/1 en true/false
    // ============================================================
    private static class BooleanDeserializer implements JsonDeserializer<Boolean> {
        @Override
        public Boolean deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context)
                throws JsonParseException {

            if (json.isJsonPrimitive()) {
                JsonPrimitive prim = json.getAsJsonPrimitive();

                if (prim.isBoolean()) {
                    return prim.getAsBoolean();
                }
                if (prim.isNumber()) {
                    return prim.getAsNumber().intValue() != 0;
                }
                if (prim.isString()) {
                    String str = prim.getAsString().toLowerCase().trim();
                    return str.equals("true") || str.equals("1");
                }
            }
            return false;
        }
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
        try {
            System.out.println("\n🔐 === Tentative de connexion ===");
            System.out.println("📍 Identifiant: " + identifiant);

            Map<String, String> body = Map.of("identifiant", identifiant, "mot_de_passe", motDePasse);
            JsonObject result = doPost("/api/auth/login", body);

            if (result.has("success") && result.get("success").getAsBoolean()) {
                this.token = result.getAsJsonObject("data").get("token").getAsString();
                this.currentUser = gson.fromJson(result.getAsJsonObject("utilisateur"), Utilisateur.class);
                System.out.println("✅ Connexion réussie!");
                System.out.println("👤 Utilisateur: " + currentUser.getNom() + " " + currentUser.getPrenom());
                return true;
            }
            System.out.println("❌ Erreur connexion: " + result.get("error"));
            return false;
        } catch (Exception e) {
            System.err.println("❌ Exception login: " + e.getMessage());
            throw e;
        }
    }

    public void logout() {
        this.token = null;
        this.currentUser = null;
        System.out.println("✅ Déconnexion réussie");
    }

    // ============================================================
    // ÉLÈVES
    // ============================================================

    /**
     * Récupérer tous les élèves avec pagination
     */
    public Eleve[] getEleves(int page, int limit) throws Exception {
        try {
            System.out.println("\n📋 === Chargement élèves page " + page + " ===");

            JsonObject result = doGet("/api/eleves?page=" + page + "&limit=" + limit);

            if (!result.has("success") || !result.get("success").getAsBoolean()) {
                System.err.println("❌ Erreur API: " + result.get("error"));
                return new Eleve[0];
            }

            Eleve[] eleves = gson.fromJson(result.getAsJsonArray("data"), Eleve[].class);
            System.out.println("✅ Chargé: " + eleves.length + " élèves");

            return eleves;
        } catch (Exception e) {
            System.err.println("❌ Erreur getEleves: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Récupérer le nombre total d'élèves
     */
    public int getElevesCount() throws Exception {
        try {
            JsonObject result = doGet("/api/eleves?page=1&limit=1");
            return result.has("count") ? result.get("count").getAsInt() : 0;
        } catch (Exception e) {
            System.err.println("❌ Erreur getElevesCount: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Rechercher des élèves par nom/prénom
     */
    public Eleve[] searchEleves(String query) throws Exception {
        try {
            System.out.println("\n🔍 === Recherche élèves: " + query + " ===");

            JsonObject result = doGet("/api/eleves/search?q=" + query);

            if (!result.has("success") || !result.get("success").getAsBoolean()) {
                return new Eleve[0];
            }

            JsonElement dataElement = result.get("data");
            if (dataElement == null || dataElement.isJsonNull()) {
                return new Eleve[0];
            }

            Eleve[] eleves = gson.fromJson(dataElement, Eleve[].class);
            System.out.println("✅ Trouvé: " + eleves.length + " résultats");

            return eleves;
        } catch (Exception e) {
            System.err.println("❌ Erreur searchEleves: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Récupérer un élève par ID (données basiques)
     */
    public Eleve getEleveDetail(int id) throws Exception {
        try {
            System.out.println("\n📊 === Chargement élève ID: " + id + " ===");

            JsonObject result = doGet("/api/eleves/" + id);

            if (!result.has("success") || !result.get("success").getAsBoolean()) {
                System.err.println("❌ Erreur API: " + result.get("error"));
                return null;
            }

            if (!result.has("data")) {
                System.err.println("❌ Pas de données");
                return null;
            }

            Eleve eleve = gson.fromJson(result.getAsJsonObject("data"), Eleve.class);

            if (eleve == null) {
                System.err.println("❌ Parsing JSON échoué");
                return null;
            }

            System.out.println("✅ Élève chargé: " + eleve.getNom() + " " + eleve.getPrenom());
            return eleve;

        } catch (Exception e) {
            System.err.println("❌ Erreur getEleveDetail: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Récupérer les STATISTIQUES COMPLÈTES d'un élève
     * Inclut: moyennes, options, parents, référent
     * ✅ Le BooleanDeserializer gère les booléens de MySQL
     */
    public Eleve getEleveStatistiques(int id) throws Exception {
        try {
            System.out.println("\n📊 === Chargement statistiques élève ID: " + id + " ===");

            JsonObject result = doGet("/api/eleves/" + id + "/statistiques");

            if (!result.has("success") || !result.get("success").getAsBoolean()) {
                System.err.println("❌ Erreur API: " + result.get("error"));
                return null;
            }

            if (!result.has("data")) {
                System.err.println("❌ Pas de données");
                return null;
            }

            Eleve eleve = gson.fromJson(result.getAsJsonObject("data"), Eleve.class);

            if (eleve == null) {
                System.err.println("❌ Parsing JSON échoué");
                return null;
            }

            System.out.println("✅ Élève chargé: " + eleve.getNom() + " " + eleve.getPrenom());
            if (eleve.getMoyennes() != null) {
                System.out.println("   📈 Moyennes: " + eleve.getMoyennes().length);
            }
            if (eleve.getOptions() != null) {
                System.out.println("   📚 Options: " + eleve.getOptions().length);
            }
            if (eleve.getParents() != null) {
                System.out.println("   👥 Parents: " + eleve.getParents().length);
            }

            return eleve;

        } catch (Exception e) {
            System.err.println("❌ Erreur getEleveStatistiques: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Créer un nouvel élève
     */
    public boolean createEleve(String nom, String prenom, String identifiant) throws Exception {
        try {
            System.out.println("\n✏️ === Création élève ===");
            System.out.println("📍 Nom: " + nom + ", Prénom: " + prenom);

            Map<String, String> body = Map.of("nom", nom, "prenom", prenom, "identifiant", identifiant);
            JsonObject result = doPost("/api/eleves", body);

            boolean success = result.has("success") && result.get("success").getAsBoolean();
            if (success) {
                System.out.println("✅ Élève créé avec succès");
            } else {
                System.err.println("❌ Erreur création: " + result.get("error"));
            }
            return success;
        } catch (Exception e) {
            System.err.println("❌ Exception createEleve: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Supprimer un élève
     */
    public boolean deleteEleve(int id) throws Exception {
        try {
            System.out.println("\n🗑️ === Suppression élève ID: " + id + " ===");

            doDelete("/api/eleves/" + id);
            System.out.println("✅ Élève supprimé");
            return true;
        } catch (Exception e) {
            System.err.println("❌ Erreur deleteEleve: " + e.getMessage());
            throw e;
        }
    }

    // ============================================================
    // ENSEIGNANTS
    // ============================================================

    /**
     * Récupérer tous les enseignants
     */
    public Enseignant[] getEnseignants() throws Exception {
        try {
            System.out.println("\n👨‍🏫 === Chargement enseignants ===");

            JsonObject result = doGet("/api/enseignants");

            if (!result.has("success") || !result.get("success").getAsBoolean()) {
                return new Enseignant[0];
            }

            Enseignant[] enseignants = gson.fromJson(result.getAsJsonArray("data"), Enseignant[].class);
            System.out.println("✅ Chargé: " + enseignants.length + " enseignants");

            return enseignants;
        } catch (Exception e) {
            System.err.println("❌ Erreur getEnseignants: " + e.getMessage());
            throw e;
        }
    }

    // ============================================================
    // CLASSES
    // ============================================================

    /**
     * Récupérer les classes pour une année scolaire
     */
    public Classe[] getClasses(String anneeScolaire) throws Exception {
        try {
            System.out.println("\n📚 === Chargement classes ===");
            System.out.println("📍 Année: " + anneeScolaire);

            JsonObject result = doGet("/api/classes?annee_scolaire=" + anneeScolaire);

            if (!result.has("success") || !result.get("success").getAsBoolean()) {
                return new Classe[0];
            }

            Classe[] classes = gson.fromJson(result.getAsJsonArray("data"), Classe[].class);
            System.out.println("✅ Chargé: " + classes.length + " classes");

            return classes;
        } catch (Exception e) {
            System.err.println("❌ Erreur getClasses: " + e.getMessage());
            throw e;
        }
    }

    // ============================================================
    // MOYENNES
    // ============================================================

    /**
     * Récupérer les moyennes d'un élève
     */
    public Moyenne[] getMoyennesEleve(int idEleve) throws Exception {
        try {
            System.out.println("\n📈 === Chargement moyennes élève ID: " + idEleve + " ===");

            JsonObject result = doGet("/api/moyennes/eleve/" + idEleve);

            if (!result.has("success") || !result.get("success").getAsBoolean()) {
                return new Moyenne[0];
            }

            Moyenne[] moyennes = gson.fromJson(result.getAsJsonArray("data"), Moyenne[].class);
            System.out.println("✅ Chargé: " + moyennes.length + " moyennes");

            return moyennes;
        } catch (Exception e) {
            System.err.println("❌ Erreur getMoyennesEleve: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Récupérer les moyennes par niveau
     */
    public JsonObject[] getMoyennesParNiveau() throws Exception {
        try {
            System.out.println("\n📊 === Chargement moyennes par niveau ===");

            JsonObject result = doGet("/api/moyennes/niveaux");
            JsonArray arr = result.getAsJsonArray("data");
            JsonObject[] out = new JsonObject[arr.size()];
            for (int i = 0; i < arr.size(); i++) out[i] = arr.get(i).getAsJsonObject();

            System.out.println("✅ Chargé: " + out.length + " niveaux");
            return out;
        } catch (Exception e) {
            System.err.println("❌ Erreur getMoyennesParNiveau: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Récupérer les moyennes en attente de validation
     */
    public Moyenne[] getMoyennesEnAttente() throws Exception {
        try {
            System.out.println("\n⏳ === Chargement moyennes en attente ===");

            JsonObject result = doGet("/api/moyennes/en-attente");

            if (!result.has("success") || !result.get("success").getAsBoolean()) {
                return new Moyenne[0];
            }

            Moyenne[] moyennes = gson.fromJson(result.getAsJsonArray("data"), Moyenne[].class);
            System.out.println("✅ Chargé: " + moyennes.length + " moyennes en attente");

            return moyennes;
        } catch (Exception e) {
            System.err.println("❌ Erreur getMoyennesEnAttente: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Valider une moyenne
     */
    public boolean validerMoyenne(int id) throws Exception {
        try {
            System.out.println("\n✅ === Validation moyenne ID: " + id + " ===");

            JsonObject result = doPut("/api/moyennes/" + id + "/valider", Map.of());

            boolean success = result.has("success") && result.get("success").getAsBoolean();
            if (success) {
                System.out.println("✅ Moyenne validée");
            } else {
                System.err.println("❌ Erreur: " + result.get("error"));
            }
            return success;
        } catch (Exception e) {
            System.err.println("❌ Exception validerMoyenne: " + e.getMessage());
            throw e;
        }
    }

    // ============================================================
    // STAGES
    // ============================================================

    /**
     * Récupérer le suivi des recherches de stage
     */
    public RechercheStage[] getSuiviStages() throws Exception {
        try {
            System.out.println("\n🎓 === Chargement suivi stages ===");

            JsonObject result = doGet("/api/stages/recherches/suivi");

            if (!result.has("success") || !result.get("success").getAsBoolean()) {
                return new RechercheStage[0];
            }

            RechercheStage[] stages = gson.fromJson(result.getAsJsonArray("data"), RechercheStage[].class);
            System.out.println("✅ Chargé: " + stages.length + " élèves en recherche");

            return stages;
        } catch (Exception e) {
            System.err.println("❌ Erreur getSuiviStages: " + e.getMessage());
            throw e;
        }
    }

    // ============================================================
    // PROJETS
    // ============================================================

    /**
     * Récupérer tous les projets
     */
    public Projet[] getProjets() throws Exception {
        try {
            System.out.println("\n📋 === Chargement projets ===");

            JsonObject result = doGet("/api/projets");

            if (!result.has("success") || !result.get("success").getAsBoolean()) {
                return new Projet[0];
            }

            Projet[] projets = gson.fromJson(result.getAsJsonArray("data"), Projet[].class);
            System.out.println("✅ Chargé: " + projets.length + " projets");

            return projets;
        } catch (Exception e) {
            System.err.println("❌ Erreur getProjets: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Créer un nouveau projet
     */
    public boolean createProjet(String titre, String description) throws Exception {
        try {
            System.out.println("\n✏️ === Création projet ===");
            System.out.println("📍 Titre: " + titre);

            Map<String, String> body = new HashMap<>();
            body.put("titre", titre);
            if (description != null) body.put("description", description);

            JsonObject result = doPost("/api/projets", body);

            boolean success = result.has("success") && result.get("success").getAsBoolean();
            if (success) {
                System.out.println("✅ Projet créé");
            } else {
                System.err.println("❌ Erreur: " + result.get("error"));
            }
            return success;
        } catch (Exception e) {
            System.err.println("❌ Exception createProjet: " + e.getMessage());
            throw e;
        }
    }

    // ============================================================
    // OPTIONS
    // ============================================================

    /**
     * Récupérer toutes les options scolaires
     */
    public OptionScolaire[] getOptions() throws Exception {
        try {
            System.out.println("\n📚 === Chargement options scolaires ===");

            JsonObject result = doGet("/api/options");

            if (!result.has("success") || !result.get("success").getAsBoolean()) {
                return new OptionScolaire[0];
            }

            OptionScolaire[] options = gson.fromJson(result.getAsJsonArray("data"), OptionScolaire[].class);
            System.out.println("✅ Chargé: " + options.length + " options");

            return options;
        } catch (Exception e) {
            System.err.println("❌ Erreur getOptions: " + e.getMessage());
            throw e;
        }
    }

    // ============================================================
    // REFERENTS
    // ============================================================

    /**
     * Récupérer tous les référents
     */
    public JsonObject[] getReferents() throws Exception {
        try {
            System.out.println("\n👥 === Chargement référents ===");

            JsonObject result = doGet("/api/referents");

            if (!result.has("success") || !result.get("success").getAsBoolean()) {
                return new JsonObject[0];
            }

            JsonArray arr = result.getAsJsonArray("data");
            JsonObject[] out = new JsonObject[arr.size()];
            for (int i = 0; i < arr.size(); i++) out[i] = arr.get(i).getAsJsonObject();

            System.out.println("✅ Chargé: " + out.length + " référents");
            return out;
        } catch (Exception e) {
            System.err.println("❌ Erreur getReferents: " + e.getMessage());
            throw e;
        }
    }
}