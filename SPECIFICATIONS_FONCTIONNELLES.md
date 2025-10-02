# Spécifications Fonctionnelles - Portail Bibliothèque Nationale du Royaume du Maroc

## 📋 Vue d'ensemble du système

### Objectif
Plateforme numérique complète pour la gestion de la bibliothèque nationale, incluant la consultation de manuscrits, le dépôt légal, la reproduction de documents, et l'attribution de numéros normalisés (ISBN, ISSN, ISMN).

### Architecture technique
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Stockage**: Supabase Storage (prévu)
- **Edge Functions**: Supabase Edge Functions

---

## 👥 Gestion des rôles et permissions

### Rôles utilisateurs

#### 1. **Visiteur (visitor)**
- Accès: Consultation publique uniquement
- Limitations: Aucune demande d'accès
- Fonctionnalités: Navigation publique, visualisation limitée

#### 2. **Grand Public (public_user)**
- Accès: Consultation publique
- Demandes: 5 demandes/mois maximum
- Fonctionnalités: Recherche basique, favoris, historique de lecture

#### 3. **Abonné Premium (subscriber)**
- Accès: Premium avec recherche avancée
- Demandes: 100 demandes/mois
- Fonctionnalités: 
  - Téléchargements illimités
  - Recherche avancée
  - Support prioritaire
  - Historique complet

#### 4. **Chercheur (researcher)**
- Accès: Académique étendu
- Demandes: 50 demandes/mois
- Fonctionnalités:
  - Accès aux manuscrits restreints
  - Téléchargement pour recherche
  - Collections spécialisées

#### 5. **Partenaire Institutionnel (partner)**
- Accès: Institutionnel prioritaire
- Demandes: 200 demandes/mois
- Fonctionnalités:
  - Collaboration inter-institutionnelle
  - Projets spéciaux
  - Accès prioritaire

#### 6. **Bibliothécaire (librarian)**
- Accès: Gestion étendue
- Permissions:
  - Gestion des manuscrits
  - Approbation des demandes d'accès
  - Gestion des collections
  - Validation niveau 1-2 (dépôt légal)
  - Gestion des métadonnées

#### 7. **Administrateur (admin)**
- Accès: Complet
- Permissions:
  - Toutes les permissions bibliothécaire
  - Gestion des utilisateurs
  - Validation niveau 3-4 (dépôt légal)
  - Configuration système
  - Gestion des tarifs BNRM
  - Accès aux logs d'activité

---

## 🗂️ Modules et interfaces

### 1. **Module d'accueil (Index)**
**Route**: `/`

**Composants**:
- Hero avec image de fond
- Section services
- Collections en vedette
- Actualités récentes
- Centre d'aide
- Footer avec liens utiles

**Fonctionnalités**:
- Navigation multilingue (FR, AR, BER, EN)
- Popup de bienvenue
- Chatbot IA intégré
- Accessibilité (contraste, taille police)

---

### 2. **Module Bibliothèque Numérique**
**Route**: `/digital-library`

**Sections**:
- Collections de manuscrits
- Recherche avancée
- Filtres (période, langue, auteur, catégorie)
- Galerie avec vignettes
- Réservoirs internationaux (Gallica, Library of Congress, etc.)

**Fonctionnalités**:
- Recherche plein texte
- Filtrage multicritère
- Ajout aux favoris
- Visualisation des manuscrits
- Téléchargement (selon permissions)

---

### 3. **Module Manuscrits**
**Route**: `/manuscripts`

**Affichage**:
- Grille de cartes manuscrits
- Vue détaillée par manuscrit
- Métadonnées complètes
- Images numérisées

**Actions**:
- Demande d'accès
- Signaler un manuscrit
- Ajouter aux favoris
- Partager

---

### 4. **Module Lecteur de Livres**
**Route**: `/book-reader/:id`

**Fonctionnalités**:
- Visualisation page par page
- Zoom et navigation
- Signets (bookmarks)
- Notes personnelles
- Progression de lecture
- Mode plein écran
- Watermark de protection

---

### 5. **Module Dépôt Légal (CPS Conforme)**
**Route**: `/legal-deposit`

#### Workflow en 4 étapes de validation

**Professionnel A (Initiateur)**:
- Crée la demande
- Remplit métadonnées
- Upload documents
- Soumet à Professionnel B

**Professionnel B (Collaborateur)**:
- Révise la demande
- Complète informations manquantes
- Valide et soumet au gestionnaire niveau 1

**Gestionnaire Niveau 1 (Bibliothécaire)**:
- Vérifie conformité documentaire
- Valide métadonnées
- Approuve ou rejette
- Transmet au niveau 2

**Gestionnaire Niveau 2 (Bibliothécaire Senior)**:
- Validation technique approfondie
- Vérification qualité
- Transmet au niveau 3

**Gestionnaire Niveau 3 (Admin)**:
- Validation administrative
- Vérification finale
- Transmet au niveau 4

**Gestionnaire Niveau 4 (Admin Senior)**:
- Approbation finale
- Attribution automatique des numéros:
  - **DL** (Dépôt Légal): Format `DL-YYYY-XXXXXX`
  - **ISBN** (pour livres)
  - **ISSN** (pour périodiques)
  - **ISMN** (pour partitions musicales)
- Génération code de validation 6 chiffres
- Notification au professionnel

**États possibles**:
- `brouillon` - En cours de rédaction
- `soumis_collaborateur` - Envoyé à Prof. B
- `en_attente_validation` - En attente gestionnaire
- `en_cours_traitement` - Validation en cours
- `validé_niveau_1` à `validé_niveau_4`
- `approuvé` - Attribution numéros effectuée
- `rejeté` - Demande refusée

**Types de monographie**:
- Livre imprimé
- Périodique
- Partition musicale
- Document électronique
- Autre

**Types de support**:
- Papier
- Électronique
- Mixte

---

### 6. **Module Reproduction de Documents**
**Route**: `/reproduction`

#### Workflow de validation

**Utilisateur**:
- Crée demande de reproduction
- Sélectionne manuscrits/contenus
- Spécifie format (PDF, JPEG, TIFF)
- Choisit résolution (300/600 DPI)
- Sélectionne mode couleur
- Ajoute spécifications pages

**Service Validator**:
- Vérifie disponibilité documents
- Calcule coût selon tarifs
- Valide ou rejette
- Transmet au manager

**Manager Validator**:
- Approbation finale
- Confirmation paiement
- Lance traitement

**Gestionnaire de traitement**:
- Numérisation/reproduction
- Upload fichiers de sortie
- Notification disponibilité

**Modalités de reproduction**:
- Sur place (bibliothèque)
- À distance (téléchargement)
- Envoi postal

**États**:
- `brouillon` - En cours
- `soumise` - Envoyée
- `en_attente_validation_service`
- `validée_service`
- `en_attente_validation_manager`
- `validée_manager`
- `en_attente_paiement`
- `payée`
- `en_traitement`
- `terminée`
- `disponible`
- `rejetée`

---

### 7. **Module BNRM (Bibliothèque Nationale)**
**Route**: `/bnrm-portal`

**Sous-modules**:

#### a) Services BNRM
- Inscription (Étudiants, Grand public, Pass Jeunes)
- Reproduction (NB, Couleur, différents formats)
- Certifications et authentifications
- Services de recherche documentaire

#### b) Tarifs
- Configuration des tarifs par service
- Historisation automatique des modifications
- Gestion des périodes de validité
- Tarifs différenciés (étudiants, public, etc.)

**Exemples de tarifs**:
- Inscription annuelle étudiants: 150 DH
- Inscription grand public: 60 DH/an
- Pass Jeunes: 30 DH/an
- Impression NB A4: 0.50 DH/page
- Impression couleur A4: 2 DH/page

#### c) Attribution de numéros
- **ISBN** (International Standard Book Number)
- **ISSN** (International Standard Serial Number)
- **ISMN** (International Standard Music Number)
- Plages de numéros configurables
- Attribution automatique
- Historique complet

#### d) Dashboard BNRM
- Statistiques globales
- Demandes en cours
- Revenus
- Graphiques d'activité

---

### 8. **Module Gestion des Métadonnées**
**Route**: `/catalog-metadata`

**Champs de métadonnées**:
- **Bibliographiques**: Titre, auteur, éditeur, ISBN/ISSN
- **Physiques**: Format, dimensions, nombre de pages
- **Techniques**: Résolution DPI, format numérique, taille fichier
- **Classification**: Dewey, UDC, CDU
- **Contenu**: Mots-clés, sujets, période, couverture géographique
- **Conservation**: État, notes, restrictions d'usage
- **Import/Export**: Synchronisation SIGB externe

**Fonctionnalités**:
- Import depuis systèmes SIGB
- Export en différents formats
- Historique des modifications
- Validation des données

---

### 9. **Module Préservation Numérique**
**Route**: `/preservation`

**Fonctionnalités**:
- Sauvegardes automatiques
- Vérification d'intégrité (checksums SHA-256)
- Migration de formats
- Planning de préservation
- Actions de conservation
- Formats supportés avec niveaux de risque

---

### 10. **Module Archivage Automatique**
**Route**: `/archiving`

**Configuration**:
- Archivage automatique après X jours
- Exclusion des contenus vedettes
- Seuil minimum de vues
- Conditions d'archivage (date publication, création, modification)

**Types de contenu**:
- Articles
- Actualités
- Événements
- Pages

---

### 11. **Module Gestion des Contenus**
**Route**: `/content-management`

**Éditeur WYSIWYG**:
- Création d'articles
- Actualités
- Pages statiques
- Événements
- Workflow de validation (brouillon → en révision → publié → archivé)

**Gestion des catégories**:
- Organisation hiérarchique
- Tags et mots-clés SEO
- Images et médias
- Traductions multilingues

---

### 12. **Module Utilisateurs et Permissions**
**Route**: `/user-management`

**Gestion des utilisateurs**:
- Liste complète des profils
- Édition des informations
- Changement de rôle
- Approbation/révocation d'accès
- Suppression de comptes

**Demandes d'accès**:
- Approbation de demandes en attente
- Historique des décisions
- Notes administratives

**Plans d'abonnement**:
- Gestion des formules
- Tarification
- Fonctionnalités incluses

---

### 13. **Module Espace Personnel**
**Route**: `/my-library-space`

**Pour l'utilisateur connecté**:
- Favoris
- Historique de lecture
- Signets (bookmarks)
- Demandes d'accès en cours
- Demandes de reproduction
- Profil et préférences

---

### 14. **Module Centre d'Aide**
**Route**: `/help`

**Sections**:
- Guides pas-à-pas
- FAQ multilingues
- Catégories d'aide
- Vidéos tutorielles
- Recherche dans l'aide
- Progression des tutoriels

**Catégories**:
- Premiers pas
- Recherche et navigation
- Gestion du compte
- Manuscrits et collections
- Dépôt légal
- Support technique

---

### 15. **Module Backoffice Administrateur**
**Route**: `/admin-settings`

**Cartes de gestion**:
- Gestion des utilisateurs
- Gestion des permissions
- Configuration BNRM
- Gestion du contenu
- Centre d'aide
- Métadonnées catalogue
- Préservation numérique
- Archivage automatique
- Backoffice dépôt légal
- Backoffice reproduction

---

## 🔐 Sécurité et Protection des Données

### 1. Authentification
- Supabase Auth avec JWT
- Stockage sécurisé des sessions
- Refresh automatique des tokens
- Protection des routes sensibles

### 2. Row Level Security (RLS)
- Politiques RLS sur toutes les tables
- Accès basé sur les rôles
- Isolation des données utilisateurs

### 3. Protection PII (Nouvellement implémenté)
- Audit logging pour l'accès aux données sensibles
- Fonction sécurisée `get_profile_with_contact()`
- Vue publique `profiles_public` sans données sensibles
- Table `profile_pii_access_log` pour traçabilité

### 4. Watermarking
- Protection des manuscrits affichés
- Watermarks subtils et positionnés
- Protection contre la copie non autorisée

### 5. Journalisation
- Table `activity_logs` avec anonymisation IP
- Nettoyage automatique après 90 jours
- Fonction `insert_activity_log()` sécurisée
- Anonymisation automatique des user-agents

---

## 📊 Schémas de base de données

### Tables principales

#### Utilisateurs et profils
- `profiles` - Profils utilisateurs avec rôles
- `profile_pii_access_log` - Audit d'accès aux données sensibles
- `user_permissions` - Permissions individuelles
- `role_permissions` - Permissions par rôle
- `permissions` - Liste des permissions disponibles

#### Manuscrits et collections
- `manuscripts` - Métadonnées des manuscrits
- `collections` - Groupements de manuscrits
- `categories` - Catégories de classification
- `catalog_metadata` - Métadonnées enrichies
- `access_requests` - Demandes d'accès

#### Dépôt légal
- `legal_deposit_requests` - Demandes de dépôt
- `deposit_workflow_steps` - Étapes de validation
- `deposit_activity_log` - Journal d'activité
- `deposit_notifications` - Notifications
- `professional_registry` - Registre des professionnels
- `number_ranges` - Plages ISBN/ISSN/ISMN

#### Reproduction
- `reproduction_requests` - Demandes de reproduction
- `reproduction_items` - Items à reproduire
- `reproduction_payments` - Paiements
- `reproduction_workflow_steps` - Workflow validation
- `reproduction_notifications` - Notifications

#### BNRM
- `bnrm_services` - Services offerts
- `bnrm_tarifs` - Grille tarifaire
- `bnrm_tarifs_historique` - Historique modifications
- `bnrm_parametres` - Paramètres système

#### Contenu et CMS
- `content` - Articles, actualités, pages
- `content_categories` - Catégories de contenu
- `content_translations` - Traductions
- `content_validation` - Workflow validation

#### Aide et support
- `help_categories` - Catégories d'aide
- `help_guides` - Guides utilisateur
- `tutorial_steps` - Étapes tutoriels
- `faqs` - Questions fréquentes
- `user_tutorial_progress` - Progression utilisateur

#### Préservation
- `preservation_backups` - Sauvegardes
- `preservation_actions` - Actions conservation
- `preservation_formats` - Formats supportés
- `preservation_schedules` - Planning

#### Archivage
- `archiving_settings` - Configuration
- `archiving_logs` - Journal archivage

#### Chatbot
- `chat_conversations` - Conversations
- `chat_messages` - Messages
- `chatbot_knowledge_base` - Base de connaissance
- `chatbot_interactions` - Statistiques

#### Données utilisateur
- `favorites` - Favoris utilisateurs
- `reading_history` - Historique lecture
- `user_bookmarks` - Signets
- `user_reviews` - Avis et notes

#### Système
- `activity_logs` - Journal d'activité global
- `languages` - Langues supportées
- `translations` - Traductions interface
- `subscription_plans` - Plans d'abonnement

---

## 🔄 Workflows détaillés

### Workflow Dépôt Légal (Conforme CPS)

```
┌─────────────────────────────────────────────────────────────┐
│ PROFESSIONNEL A (Initiateur)                                │
│ - Crée demande                                              │
│ - Remplit métadonnées (titre, auteur, ISBN/ISSN, etc.)     │
│ - Upload documents justificatifs                            │
│ - État: brouillon → soumis_collaborateur                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ PROFESSIONNEL B (Collaborateur)                             │
│ - Révise la demande                                         │
│ - Complète informations manquantes                          │
│ - Peut rejeter vers Prof. A                                 │
│ - État: soumis_collaborateur → en_attente_validation        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ GESTIONNAIRE NIVEAU 1 (Bibliothécaire)                      │
│ - Vérification conformité documentaire                      │
│ - Validation métadonnées bibliographiques                   │
│ - Peut rejeter ou demander modifications                    │
│ - État: en_attente_validation → validé_niveau_1             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ GESTIONNAIRE NIVEAU 2 (Bibliothécaire Senior)               │
│ - Validation technique approfondie                          │
│ - Vérification qualité des documents                        │
│ - Contrôle respect normes                                   │
│ - État: validé_niveau_1 → validé_niveau_2                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ GESTIONNAIRE NIVEAU 3 (Administrateur)                      │
│ - Validation administrative                                 │
│ - Vérification légale et réglementaire                      │
│ - Contrôle final avant attribution                          │
│ - État: validé_niveau_2 → validé_niveau_3                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ GESTIONNAIRE NIVEAU 4 (Administrateur Senior)               │
│ - Approbation finale                                        │
│ - Attribution automatique numéros:                          │
│   • DL-YYYY-XXXXXX (Dépôt Légal)                           │
│   • ISBN (si livre)                                         │
│   • ISSN (si périodique)                                    │
│   • ISMN (si partition musicale)                            │
│ - Génération code validation (6 chiffres)                   │
│ - Notification professionnel A                              │
│ - État: validé_niveau_3 → approuvé                          │
└─────────────────────────────────────────────────────────────┘
```

### Workflow Reproduction de Documents

```
┌─────────────────────────────────────────────────────────────┐
│ UTILISATEUR                                                  │
│ - Crée demande de reproduction                              │
│ - Sélectionne documents/manuscrits                          │
│ - Choisit format (PDF, JPEG, TIFF)                         │
│ - Spécifie résolution (300/600 DPI)                        │
│ - Sélectionne mode couleur                                  │
│ - Indique modalité (sur place/à distance)                   │
│ - État: brouillon → soumise                                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ SERVICE VALIDATOR (Bibliothécaire)                          │
│ - Vérifie disponibilité documents                           │
│ - Contrôle droits de reproduction                           │
│ - Calcule coût selon tarifs BNRM                           │
│ - Peut rejeter si non conforme                              │
│ - État: soumise → validée_service / rejetée                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ MANAGER VALIDATOR (Responsable)                             │
│ - Approbation managériale finale                            │
│ - Vérification budget/priorités                             │
│ - Validation paiement                                        │
│ - État: validée_service → validée_manager                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ PAIEMENT                                                     │
│ - Utilisateur effectue paiement                             │
│ - Méthodes: CB, virement, espèces, chèque                  │
│ - Confirmation transaction                                   │
│ - État: validée_manager → payée                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ TRAITEMENT                                                   │
│ - Numérisation/reproduction documents                       │
│ - Application spécifications (résolution, couleur)          │
│ - Contrôle qualité                                          │
│ - Upload fichiers de sortie                                 │
│ - État: payée → en_traitement → terminée                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ MISE À DISPOSITION                                           │
│ - Notification utilisateur                                   │
│ - Accès téléchargement (si à distance)                      │
│ - Ou retrait sur place                                       │
│ - Suivi téléchargements                                      │
│ - État: terminée → disponible                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design et UX

### Palette de couleurs (HSL)
- Primary: hsl(222.2 47.4% 11.2%)
- Secondary: hsl(210 40% 96.1%)
- Accent: hsl(210 40% 96.1%)
- Muted: hsl(210 40% 96.1%)

### Multilingue
- Français (FR) - Par défaut
- Arabe (AR) - RTL
- Amazigh/Berbère (BER) - Beta
- Anglais (EN)

### Accessibilité
- Contraste élevé/faible
- Ajustement taille police
- Support RTL complet
- Navigation clavier
- ARIA labels

### Composants réutilisables
- shadcn/ui components
- Custom watermark component
- Protected routes
- Form validation (react-hook-form + zod)

---

## 🔧 Fonctions Edge (Supabase)

### 1. `chatbot-ai`
Intelligence conversationnelle basique

### 2. `smart-chatbot`
Chatbot IA avancé avec context et outils

### 3. `auto-archive-content`
Archivage automatique des contenus selon configuration

### 4. `cleanup-activity-logs`
Nettoyage logs > 90 jours

### 5. `preservation-backup`
Sauvegardes de préservation numérique

### 6. `format-migration`
Migration de formats obsolètes

### 7. `search-engine`
Moteur de recherche avancé

### 8. `text-to-speech`
Synthèse vocale

### 9. `voice-to-text`
Reconnaissance vocale

---

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Adaptation complète des interfaces
- Menus mobiles optimisés
- Touch-friendly interactions

---

## 🚀 Déploiement et Configuration

### Variables d'environnement
- `SUPABASE_URL`: URL projet Supabase
- `SUPABASE_ANON_KEY`: Clé publique
- Autres secrets gérés via Supabase Secrets

### Configuration Supabase
- RLS activé sur toutes les tables
- Fonctions SQL avec SECURITY DEFINER
- Triggers automatiques (timestamps, numérotation)
- Politiques de sécurité strictes

---

## 📈 Évolutions futures possibles

1. **Storage Supabase**
   - Upload manuscrits numérisés
   - Stockage sécurisé documents dépôt légal
   - Gestion versions fichiers

2. **Paiement en ligne**
   - Intégration Stripe/PayPal
   - Abonnements récurrents
   - Factures automatiques

3. **OCR et IA**
   - Reconnaissance texte manuscrits
   - Traduction automatique
   - Classification automatique

4. **API publique**
   - Endpoints REST
   - Documentation OpenAPI
   - Rate limiting

5. **Mobile Apps**
   - iOS/Android natives
   - React Native
   - Notifications push

---

## 📞 Support et documentation

### Pour les utilisateurs
- Centre d'aide intégré
- FAQ multilingues
- Guides vidéo
- Chatbot IA 24/7

### Pour les administrateurs
- Documentation technique
- Logs détaillés
- Dashboard analytics
- Outils de monitoring

---

**Document généré le**: 2 octobre 2025  
**Version du portail**: 1.0  
**Dernière mise à jour**: Implémentation sécurité PII
