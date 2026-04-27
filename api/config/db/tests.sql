-- ============================================================
-- ASIM'UT - Données initiales et jeu de test
-- ============================================================

USE asimut;

-- ============================================================
-- DONNÉES DE RÉFÉRENCE
-- ============================================================

-- Rôles
INSERT INTO role (libelle, description) VALUES
('proviseur',    'Proviseur - validation des moyennes et gestion globale'),
('secretariat',  'Secrétariat - saisie des élèves, moyennes, affectations'),
('enseignant',   'Enseignant - référent d''élèves, validation conventions'),
('eleve',        'Élève - consultation de ses données et gestion stages');

-- Niveaux scolaires
INSERT INTO niveau (numero, libelle) VALUES
(6, '6ème'),
(5, '5ème'),
(4, '4ème'),
(3, '3ème');

-- Options scolaires
INSERT INTO option_scolaire (libelle, categorie) VALUES
('Anglais renforcé',    'langue'),
('Espagnol',            'langue'),
('Allemand',            'langue'),
('Italien',             'langue'),
('Chinois',             'langue'),
('Électricité',         'technique'),
('Informatique',        'technique'),
('Mécanique',           'technique'),
('Biologie',            'technique'),
('Physique',            'technique'),
('Sport',               'sport');

-- ============================================================
-- JEU DE TEST
-- ============================================================

-- Utilisateurs (mot de passe = hash bcrypt de "asimov2026")
-- $2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SET @pwd = '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';

-- Proviseur
INSERT INTO utilisateur (identifiant, mot_de_passe, email, id_role) VALUES
('proviseur', @pwd, 'proviseur@asimov.edu', 1);

-- Secrétariat
INSERT INTO utilisateur (identifiant, mot_de_passe, email, id_role) VALUES
('secretariat', @pwd, 'secretariat@asimov.edu', 2);

-- Enseignants (utilisateurs)
INSERT INTO utilisateur (identifiant, mot_de_passe, email, id_role) VALUES
('dupontm',  @pwd, 'marie.dupont@asimov.edu',    3),
('martinp',  @pwd, 'pierre.martin@asimov.edu',   3),
('bernardl', @pwd, 'lucie.bernard@asimov.edu',    3),
('moreauj',  @pwd, 'jean.moreau@asimov.edu',      3);

-- Enseignants (profils)
INSERT INTO enseignant (nom, prenom, email, telephone, id_utilisateur) VALUES
('DUPONT',  'Marie',  'marie.dupont@asimov.edu',  '0476000001', 3),
('MARTIN',  'Pierre', 'pierre.martin@asimov.edu', '0476000002', 4),
('BERNARD', 'Lucie',  'lucie.bernard@asimov.edu', '0476000003', 5),
('MOREAU',  'Jean',   'jean.moreau@asimov.edu',   '0476000004', 6);

-- Classes (année 2025-2026)
INSERT INTO classe (id_niveau, lettre, annee_scolaire) VALUES
-- 6ème
(1, 'A', '2025-2026'), (1, 'B', '2025-2026'), (1, 'C', '2025-2026'),
-- 5ème
(2, 'A', '2025-2026'), (2, 'B', '2025-2026'),
-- 4ème
(3, 'A', '2025-2026'), (3, 'B', '2025-2026'),
-- 3ème
(4, 'A', '2025-2026'), (4, 'B', '2025-2026');

-- Élèves (utilisateurs)
INSERT INTO utilisateur (identifiant, mot_de_passe, email, id_role) VALUES
('calvins',   @pwd, 'susanne.calvin@eleve.asimov.edu',  4),
('baleyr',    @pwd, 'robin.baley@eleve.asimov.edu',     4),
('seldonh',   @pwd, 'hugo.seldon@eleve.asimov.edu',     4),
('danneelr',  @pwd, 'rania.danneel@eleve.asimov.edu',   4),
('trantorl',  @pwd, 'lea.trantor@eleve.asimov.edu',     4),
('demerzelk', @pwd, 'karim.demerzel@eleve.asimov.edu',  4),
('peloratj',  @pwd, 'julie.pelorat@eleve.asimov.edu',   4),
('brannom',   @pwd, 'mehdi.branno@eleve.asimov.edu',    4),
('trivizea',  @pwd, 'amina.trivize@eleve.asimov.edu',   4),
('comporn',   @pwd, 'nathan.compor@eleve.asimov.edu',   4);

-- Élèves (profils)
INSERT INTO eleve (nom, prenom, identifiant, date_naissance, id_utilisateur) VALUES
('CALVIN',   'Susanne', 'calvins',   '2013-03-15', 7),
('BALEY',    'Robin',   'baleyr',    '2013-07-22', 8),
('SELDON',   'Hugo',    'seldonh',   '2012-01-10', 9),
('DANNEEL',  'Rania',   'danneelr',  '2012-11-05', 10),
('TRANTOR',  'Léa',     'trantorl',  '2011-06-18', 11),
('DEMERZEL', 'Karim',   'demerzelk', '2011-09-30', 12),
('PELORAT',  'Julie',   'peloratj',  '2010-04-12', 13),
('BRANNO',   'Mehdi',   'brannom',   '2010-08-25', 14),
('TRIVIZE',  'Amina',   'trivizea',  '2013-12-01', 15),
('COMPOR',   'Nathan',  'comporn',   '2012-05-20', 16);

-- Parents
INSERT INTO parent (nom, prenom, email, telephone) VALUES
('CALVIN',   'Robert',   'robert.calvin@mail.com',    '0612345001'),
('BALEY',    'Nathalie', 'nathalie.baley@mail.com',   '0612345002'),
('SELDON',   'Françoise','francoise.seldon@mail.com', '0612345003'),
('DANNEEL',  'Ahmed',    'ahmed.danneel@mail.com',    '0612345004'),
('TRANTOR',  'Sophie',   'sophie.trantor@mail.com',   '0612345005'),
('DEMERZEL', 'Fatima',   'fatima.demerzel@mail.com',  '0612345006'),
('PELORAT',  'Marc',     'marc.pelorat@mail.com',     '0612345007'),
('BRANNO',   'Samira',   'samira.branno@mail.com',    '0612345008'),
('TRIVIZE',  'Laurent',  'laurent.trivize@mail.com',  '0612345009'),
('COMPOR',   'Claire',   'claire.compor@mail.com',    '0612345010');

-- Association élèves <-> parents
INSERT INTO eleve_parent (id_eleve, id_parent, lien) VALUES
(1,  1,  'père'),
(2,  2,  'mère'),
(3,  3,  'mère'),
(4,  4,  'père'),
(5,  5,  'mère'),
(6,  6,  'mère'),
(7,  7,  'père'),
(8,  8,  'mère'),
(9,  9,  'père'),
(10, 10, 'mère');

-- Inscriptions (année 2025-2026)
INSERT INTO inscription (id_eleve, id_classe, annee_scolaire) VALUES
(1,  1, '2025-2026'),    -- Calvin     -> 6A
(2,  2, '2025-2026'),    -- Baley      -> 6B
(9,  3, '2025-2026'),    -- Trivize    -> 6C
(3,  4, '2025-2026'),    -- Seldon     -> 5A
(4,  5, '2025-2026'),    -- Danneel    -> 5B
(10, 4, '2025-2026'),    -- Compor     -> 5A
(5,  6, '2025-2026'),    -- Trantor    -> 4A
(6,  7, '2025-2026'),    -- Demerzel   -> 4B
(7,  8, '2025-2026'),    -- Pelorat    -> 3A
(8,  9, '2025-2026');    -- Branno     -> 3B

-- Affectation des référents (round-robin sur 4 enseignants)
INSERT INTO referent (id_enseignant, id_eleve, annee_scolaire) VALUES
(1, 1,  '2025-2026'),    -- Dupont  -> Calvin
(2, 2,  '2025-2026'),    -- Martin  -> Baley
(3, 3,  '2025-2026'),    -- Bernard -> Seldon
(4, 4,  '2025-2026'),    -- Moreau  -> Danneel
(1, 5,  '2025-2026'),    -- Dupont  -> Trantor
(2, 6,  '2025-2026'),    -- Martin  -> Demerzel
(3, 7,  '2025-2026'),    -- Bernard -> Pelorat
(4, 8,  '2025-2026'),    -- Moreau  -> Branno
(1, 9,  '2025-2026'),    -- Dupont  -> Trivize
(2, 10, '2025-2026');    -- Martin  -> Compor

-- Options des élèves
INSERT INTO eleve_option (id_eleve, id_option, annee_scolaire) VALUES
(1, 1,  '2025-2026'),   -- Calvin:   Anglais renforcé
(1, 7,  '2025-2026'),   -- Calvin:   Informatique
(3, 3,  '2025-2026'),   -- Seldon:   Allemand
(3, 10, '2025-2026'),   -- Seldon:   Physique
(5, 2,  '2025-2026'),   -- Trantor:  Espagnol
(5, 11, '2025-2026'),   -- Trantor:  Sport
(7, 7,  '2025-2026'),   -- Pelorat:  Informatique
(7, 9,  '2025-2026');   -- Pelorat:  Biologie

-- Moyennes (semestre 1 - 2025-2026)
INSERT INTO moyenne (id_eleve, annee_scolaire, semestre, valeur, saisie_par, validee, validee_par, date_validation) VALUES
(1,  '2025-2026', 1, 14.50, 2, TRUE,  1, NOW()),
(2,  '2025-2026', 1, 12.75, 2, TRUE,  1, NOW()),
(3,  '2025-2026', 1, 16.00, 2, TRUE,  1, NOW()),
(4,  '2025-2026', 1, 13.25, 2, TRUE,  1, NOW()),
(5,  '2025-2026', 1, 11.00, 2, TRUE,  1, NOW()),
(6,  '2025-2026', 1, 15.50, 2, TRUE,  1, NOW()),
(7,  '2025-2026', 1, 17.25, 2, FALSE, NULL, NULL),
(8,  '2025-2026', 1, 09.75, 2, FALSE, NULL, NULL),
(9,  '2025-2026', 1, 13.00, 2, TRUE,  1, NOW()),
(10, '2025-2026', 1, 14.00, 2, TRUE,  1, NOW());

-- Entreprises pour les stages
INSERT INTO entreprise (nom, adresse, ville, code_postal, telephone, email) VALUES
('CEA Grenoble',          '17 avenue des Martyrs',       'Grenoble',            '38000', '0476000100', 'contact@cea.fr'),
('STMicroelectronics',   '12 rue Jules Horowitz',       'Grenoble',            '38019', '0476000200', 'rh@st.com'),
('Schneider Electric',    '35 rue Joseph Monier',        'Rueil-Malmaison',     '92500', '0141290000', 'stages@se.com'),
('Laboratoire ILL',       '71 avenue des Martyrs',       'Grenoble',            '38042', '0476000300', 'hr@ill.eu'),
('Cabinet Vétérinaire',   '5 place Victor Hugo',         'Grenoble',            '38000', '0476000400', 'contact@vetgrenoble.fr'),
('Boulangerie Artisanale','22 rue de la Liberté',        'Saint-Martin-le-Vinoux','38950','0476000500', 'boulange@mail.fr');

-- Contacts dans les entreprises
INSERT INTO contact_entreprise (id_entreprise, nom, prenom, fonction, telephone, email) VALUES
(1, 'GARNIER',  'Philippe', 'Responsable RH',        '0476000101', 'p.garnier@cea.fr'),
(2, 'CHEN',     'Wei',      'Tuteur de stage',       '0476000201', 'w.chen@st.com'),
(3, 'LAMBERT',  'Claire',   'Chargée de recrutement','0141290001', 'c.lambert@se.com'),
(4, 'MÜLLER',   'Hans',     'Directeur adjoint',     '0476000301', 'h.muller@ill.eu'),
(5, 'ROUSSEAU', 'Anne',     'Vétérinaire',           '0476000401', 'a.rousseau@vetgrenoble.fr');

-- Recherches de stage (élèves de 3ème)
INSERT INTO recherche_stage (id_eleve, id_entreprise, id_contact, annee_scolaire, nb_lettres_envoyees, nb_lettres_recues, date_entretien, resultat_entretien) VALUES
(7, 1, 1, '2025-2026', 1, 1, '2026-01-15', 'accepte'),
(7, 2, 2, '2025-2026', 1, 0, NULL, 'sans_reponse'),
(8, 1, 1, '2025-2026', 1, 1, '2026-01-20', 'refuse'),
(8, 2, 2, '2025-2026', 1, 0, NULL, 'sans_reponse'),
(8, 3, 3, '2025-2026', 1, 1, '2026-02-01', 'en_attente'),
(8, 4, 4, '2025-2026', 1, 0, NULL, 'sans_reponse'),
(8, 5, 5, '2025-2026', 1, 1, NULL, 'en_attente'),
(8, 6, NULL, '2025-2026', 1, 0, NULL, 'sans_reponse');

-- Convention de stage (Pelorat au CEA)
INSERT INTO convention_stage (id_eleve, id_entreprise, id_contact, date_debut, date_fin, sujet, validee_referent, id_referent, date_validation, signature_parent) VALUES
(7, 1, 1, '2026-03-10', '2026-03-21', 'Découverte des métiers de la recherche scientifique', TRUE, 3, NOW(), TRUE);

-- Projets de l'établissement
INSERT INTO projet (titre, description, date_creation, statut, id_responsable, valide_par) VALUES
('Jardin botanique',     'Création et entretien d''un jardin botanique dans la cour du collège',   '2025-10-01', 'en_cours', 5, 1),
('Robot Asimov',         'Conception d''un robot éducatif pour les classes de 6ème',                '2025-11-15', 'valide',   7, 1),
('Journal du collège',   'Rédaction et publication d''un journal mensuel',                         '2025-09-15', 'en_cours', 3, 1);

-- Participation aux projets
INSERT INTO participation_projet (id_eleve, id_projet, date_debut, date_fin) VALUES
(5, 1, '2025-10-01', NULL),
(6, 1, '2025-10-15', NULL),
(7, 2, '2025-11-15', NULL),
(8, 2, '2025-12-01', NULL),
(1, 2, '2026-01-10', NULL),
(3, 3, '2025-09-15', NULL),
(4, 3, '2025-09-15', NULL),
(10,3, '2025-10-01', NULL);
