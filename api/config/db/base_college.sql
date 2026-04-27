-- ============================================================
-- ASIM'UT - Base de données MariaDB
-- Collège-Lycée Isaac Asimov - Suivi des élèves
-- ============================================================
-- Auteur : Projet BTS SIO SLAM
-- Version : 1.0
-- Moteur : MariaDB / InnoDB (intégrité référentielle)
-- ============================================================

DROP DATABASE IF EXISTS asimut;
CREATE DATABASE asimut
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE asimut;

-- ============================================================
-- TABLE : role
-- Rôles applicatifs (proviseur, secrétariat, enseignant, élève)
-- ============================================================
CREATE TABLE role (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    libelle     VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : utilisateur
-- Comptes utilisateurs de l'application (authentification API)
-- ============================================================
CREATE TABLE utilisateur (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    identifiant     VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe    VARCHAR(255) NOT NULL,       -- hash bcrypt
    email           VARCHAR(255),
    actif           BOOLEAN NOT NULL DEFAULT TRUE,
    id_role         INT NOT NULL,
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_utilisateur_role
        FOREIGN KEY (id_role) REFERENCES role(id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : niveau
-- Niveaux scolaires (6, 5, 4, 3)
-- ============================================================
CREATE TABLE niveau (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    numero  TINYINT NOT NULL UNIQUE CHECK (numero BETWEEN 3 AND 6),
    libelle VARCHAR(20) NOT NULL           -- ex: "6ème", "5ème"
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : classe
-- Classes par année scolaire (ex: 6A, 5B, 4C...)
-- ============================================================
CREATE TABLE classe (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    id_niveau       INT NOT NULL,
    lettre          CHAR(1) NOT NULL,              -- A, B, C...
    annee_scolaire  VARCHAR(9) NOT NULL,            -- ex: "2025-2026"

    CONSTRAINT fk_classe_niveau
        FOREIGN KEY (id_niveau) REFERENCES niveau(id),
    CONSTRAINT uk_classe_unique
        UNIQUE (id_niveau, lettre, annee_scolaire)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : enseignant
-- Enseignants du collège (peuvent être référents)
-- ============================================================
CREATE TABLE enseignant (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(100) NOT NULL,
    prenom          VARCHAR(100) NOT NULL,
    email           VARCHAR(255),
    telephone       VARCHAR(20),
    id_utilisateur  INT UNIQUE,

    CONSTRAINT fk_enseignant_utilisateur
        FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : parent
-- Parents / représentants légaux (gérés séparément, RGPD)
-- ============================================================
CREATE TABLE parent (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nom         VARCHAR(100) NOT NULL,
    prenom      VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    telephone   VARCHAR(20),
    adresse     TEXT
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : eleve
-- Élèves du collège
-- ============================================================
CREATE TABLE eleve (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(100) NOT NULL,
    prenom          VARCHAR(100) NOT NULL,
    identifiant     VARCHAR(100) NOT NULL UNIQUE,   -- identifiant CSV
    date_naissance  DATE,
    id_utilisateur  INT UNIQUE,
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_eleve_utilisateur
        FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : eleve_parent
-- Association élève <-> parent (N:N)
-- ============================================================
CREATE TABLE eleve_parent (
    id_eleve    INT NOT NULL,
    id_parent   INT NOT NULL,
    lien        VARCHAR(50),                       -- père, mère, tuteur...

    PRIMARY KEY (id_eleve, id_parent),
    CONSTRAINT fk_ep_eleve
        FOREIGN KEY (id_eleve) REFERENCES eleve(id) ON DELETE CASCADE,
    CONSTRAINT fk_ep_parent
        FOREIGN KEY (id_parent) REFERENCES parent(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : inscription
-- Inscription d'un élève dans une classe pour une année
-- Conserve l'historique des classes
-- ============================================================
CREATE TABLE inscription (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    id_eleve        INT NOT NULL,
    id_classe       INT NOT NULL,
    annee_scolaire  VARCHAR(9) NOT NULL,            -- ex: "2025-2026"
    date_inscription DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inscription_eleve
        FOREIGN KEY (id_eleve) REFERENCES eleve(id) ON DELETE CASCADE,
    CONSTRAINT fk_inscription_classe
        FOREIGN KEY (id_classe) REFERENCES classe(id),
    CONSTRAINT uk_inscription_unique
        UNIQUE (id_eleve, annee_scolaire)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : option_scolaire
-- Options disponibles (langues, techniques, sport)
-- ============================================================
CREATE TABLE option_scolaire (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    libelle     VARCHAR(100) NOT NULL UNIQUE,
    categorie   ENUM('langue', 'technique', 'sport') NOT NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : eleve_option
-- Options choisies par un élève (max 2 par année scolaire)
-- ============================================================
CREATE TABLE eleve_option (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    id_eleve        INT NOT NULL,
    id_option       INT NOT NULL,
    annee_scolaire  VARCHAR(9) NOT NULL,

    CONSTRAINT fk_eo_eleve
        FOREIGN KEY (id_eleve) REFERENCES eleve(id) ON DELETE CASCADE,
    CONSTRAINT fk_eo_option
        FOREIGN KEY (id_option) REFERENCES option_scolaire(id),
    CONSTRAINT uk_eleve_option
        UNIQUE (id_eleve, id_option, annee_scolaire)
) ENGINE=InnoDB;

-- Trigger pour limiter à 2 options par élève et par année
DELIMITER //
CREATE TRIGGER trg_check_max_options
BEFORE INSERT ON eleve_option
FOR EACH ROW
BEGIN
    DECLARE nb_options INT;
    SELECT COUNT(*) INTO nb_options
    FROM eleve_option
    WHERE id_eleve = NEW.id_eleve
      AND annee_scolaire = NEW.annee_scolaire;
    IF nb_options >= 2 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Un élève ne peut choisir que 2 options par année scolaire.';
    END IF;
END //
DELIMITER ;

-- ============================================================
-- TABLE : referent
-- Affectation enseignant référent <-> élève (par année)
-- ============================================================
CREATE TABLE referent (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    id_enseignant   INT NOT NULL,
    id_eleve        INT NOT NULL,
    annee_scolaire  VARCHAR(9) NOT NULL,

    CONSTRAINT fk_referent_enseignant
        FOREIGN KEY (id_enseignant) REFERENCES enseignant(id),
    CONSTRAINT fk_referent_eleve
        FOREIGN KEY (id_eleve) REFERENCES eleve(id) ON DELETE CASCADE,
    CONSTRAINT uk_referent_eleve_annee
        UNIQUE (id_eleve, annee_scolaire)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : moyenne
-- Moyennes générales par semestre (saisie secrétariat, 
-- validation proviseur)
-- ============================================================
CREATE TABLE moyenne (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    id_eleve        INT NOT NULL,
    annee_scolaire  VARCHAR(9) NOT NULL,
    semestre        TINYINT NOT NULL CHECK (semestre IN (1, 2)),
    valeur          DECIMAL(4,2) NOT NULL CHECK (valeur BETWEEN 0 AND 20),
    saisie_par      INT NOT NULL,                   -- id_utilisateur (secrétariat)
    date_saisie     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    validee         BOOLEAN NOT NULL DEFAULT FALSE,
    validee_par     INT,                            -- id_utilisateur (proviseur)
    date_validation DATETIME,

    CONSTRAINT fk_moyenne_eleve
        FOREIGN KEY (id_eleve) REFERENCES eleve(id) ON DELETE CASCADE,
    CONSTRAINT fk_moyenne_saisie
        FOREIGN KEY (saisie_par) REFERENCES utilisateur(id),
    CONSTRAINT fk_moyenne_validation
        FOREIGN KEY (validee_par) REFERENCES utilisateur(id),
    CONSTRAINT uk_moyenne_unique
        UNIQUE (id_eleve, annee_scolaire, semestre)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : entreprise
-- Entreprises contactées pour les stages
-- ============================================================
CREATE TABLE entreprise (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nom         VARCHAR(255) NOT NULL,
    adresse     TEXT,
    ville       VARCHAR(100),
    code_postal VARCHAR(10),
    telephone   VARCHAR(20),
    email       VARCHAR(255),
    site_web    VARCHAR(255)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : contact_entreprise
-- Contacts au sein des entreprises
-- ============================================================
CREATE TABLE contact_entreprise (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    id_entreprise   INT NOT NULL,
    nom             VARCHAR(100) NOT NULL,
    prenom          VARCHAR(100),
    fonction        VARCHAR(100),
    telephone       VARCHAR(20),
    email           VARCHAR(255),

    CONSTRAINT fk_contact_entreprise
        FOREIGN KEY (id_entreprise) REFERENCES entreprise(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : recherche_stage
-- Suivi des recherches de stage par élève
-- ============================================================
CREATE TABLE recherche_stage (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    id_eleve            INT NOT NULL,
    id_entreprise       INT NOT NULL,
    id_contact          INT,
    annee_scolaire      VARCHAR(9) NOT NULL,
    nb_lettres_envoyees INT NOT NULL DEFAULT 0,
    nb_lettres_recues   INT NOT NULL DEFAULT 0,
    date_entretien      DATE,
    resultat_entretien  ENUM('en_attente', 'accepte', 'refuse', 'sans_reponse')
                        DEFAULT 'en_attente',
    commentaire         TEXT,
    date_creation       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rs_eleve
        FOREIGN KEY (id_eleve) REFERENCES eleve(id) ON DELETE CASCADE,
    CONSTRAINT fk_rs_entreprise
        FOREIGN KEY (id_entreprise) REFERENCES entreprise(id),
    CONSTRAINT fk_rs_contact
        FOREIGN KEY (id_contact) REFERENCES contact_entreprise(id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : convention_stage
-- Conventions de stage signées
-- ============================================================
CREATE TABLE convention_stage (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    id_eleve            INT NOT NULL,
    id_entreprise       INT NOT NULL,
    id_contact          INT,
    date_debut          DATE NOT NULL,
    date_fin            DATE NOT NULL,
    sujet               VARCHAR(255),
    fichier_pdf         VARCHAR(500),               -- chemin vers le PDF
    validee_referent    BOOLEAN NOT NULL DEFAULT FALSE,
    id_referent         INT,
    date_validation     DATETIME,
    signature_parent    BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cs_eleve
        FOREIGN KEY (id_eleve) REFERENCES eleve(id) ON DELETE CASCADE,
    CONSTRAINT fk_cs_entreprise
        FOREIGN KEY (id_entreprise) REFERENCES entreprise(id),
    CONSTRAINT fk_cs_contact
        FOREIGN KEY (id_contact) REFERENCES contact_entreprise(id),
    CONSTRAINT fk_cs_referent
        FOREIGN KEY (id_referent) REFERENCES enseignant(id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : attestation_stage
-- Attestations de stage (PDF signé)
-- ============================================================
CREATE TABLE attestation_stage (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    id_convention       INT NOT NULL UNIQUE,
    fichier_pdf         VARCHAR(500),               -- chemin vers le PDF signé
    date_depot          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_as_convention
        FOREIGN KEY (id_convention) REFERENCES convention_stage(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : projet
-- Projets de l'établissement
-- ============================================================
CREATE TABLE projet (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    titre           VARCHAR(255) NOT NULL,
    description     TEXT,
    date_creation   DATE NOT NULL,
    statut          ENUM('en_attente', 'valide', 'en_cours', 'termine', 'annule')
                    NOT NULL DEFAULT 'en_attente',
    id_responsable  INT,                            -- élève responsable du projet
    valide_par      INT,                            -- commission / proviseur

    CONSTRAINT fk_projet_responsable
        FOREIGN KEY (id_responsable) REFERENCES eleve(id),
    CONSTRAINT fk_projet_validation
        FOREIGN KEY (valide_par) REFERENCES utilisateur(id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : participation_projet
-- Participation des élèves aux projets
-- ============================================================
CREATE TABLE participation_projet (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    id_eleve        INT NOT NULL,
    id_projet       INT NOT NULL,
    date_debut      DATE NOT NULL,
    date_fin        DATE,
    commentaire     TEXT,

    CONSTRAINT fk_pp_eleve
        FOREIGN KEY (id_eleve) REFERENCES eleve(id) ON DELETE CASCADE,
    CONSTRAINT fk_pp_projet
        FOREIGN KEY (id_projet) REFERENCES projet(id) ON DELETE CASCADE,
    CONSTRAINT uk_participation
        UNIQUE (id_eleve, id_projet)
) ENGINE=InnoDB;

-- ============================================================
-- VUE : v_eleves_recherche_stage
-- Vue pour le suivi des recherches de stage avec alerte (>15)
-- ============================================================
CREATE OR REPLACE VIEW v_eleves_recherche_stage AS
SELECT
    e.id AS id_eleve,
    e.nom,
    e.prenom,
    rs.annee_scolaire,
    COUNT(rs.id) AS nb_entreprises_contactees,
    CASE
        WHEN COUNT(rs.id) > 15 THEN TRUE
        ELSE FALSE
    END AS alerte,
    ref.id_enseignant AS id_referent
FROM eleve e
JOIN recherche_stage rs ON rs.id_eleve = e.id
LEFT JOIN referent ref ON ref.id_eleve = e.id
    AND ref.annee_scolaire = rs.annee_scolaire
GROUP BY e.id, e.nom, e.prenom, rs.annee_scolaire, ref.id_enseignant;

-- ============================================================
-- VUE : v_moyennes_par_niveau
-- Moyenne générale par niveau de classe (pour graphiques)
-- ============================================================
CREATE OR REPLACE VIEW v_moyennes_par_niveau AS
SELECT
    n.numero AS niveau,
    n.libelle AS libelle_niveau,
    m.annee_scolaire,
    m.semestre,
    ROUND(AVG(m.valeur), 2) AS moyenne_niveau,
    COUNT(m.id) AS nb_eleves
FROM moyenne m
JOIN inscription i ON i.id_eleve = m.id_eleve
    AND i.annee_scolaire = m.annee_scolaire
JOIN classe c ON c.id = i.id_classe
JOIN niveau n ON n.id = c.id_niveau
WHERE m.validee = TRUE
GROUP BY n.numero, n.libelle, m.annee_scolaire, m.semestre;

-- ============================================================
-- VUE : v_eleves_referent
-- Liste des élèves par enseignant référent
-- ============================================================
CREATE OR REPLACE VIEW v_eleves_referent AS
SELECT
    ens.id AS id_enseignant,
    ens.nom AS nom_enseignant,
    ens.prenom AS prenom_enseignant,
    e.id AS id_eleve,
    e.nom AS nom_eleve,
    e.prenom AS prenom_eleve,
    r.annee_scolaire,
    CONCAT(n.numero, c.lettre) AS classe
FROM referent r
JOIN enseignant ens ON ens.id = r.id_enseignant
JOIN eleve e ON e.id = r.id_eleve
JOIN inscription i ON i.id_eleve = e.id
    AND i.annee_scolaire = r.annee_scolaire
JOIN classe c ON c.id = i.id_classe
JOIN niveau n ON n.id = c.id_niveau;
