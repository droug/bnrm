# Spécifications Fonctionnelles Générales - Projet BNRM

## Document de Référence - Portail et Plateformes Numériques

**Version**: 1.0  
**Date de création**: 6 octobre 2025  
**Dernière mise à jour**: 6 octobre 2025  
**Statut**: Document de travail

---

## Table des Matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture générale](#2-architecture-générale)
3. [Modules et plateformes](#3-modules-et-plateformes)
4. [Gestion des utilisateurs et permissions](#4-gestion-des-utilisateurs-et-permissions)
5. [Sécurité et conformité](#5-sécurité-et-conformité)
6. [Technologies et infrastructure](#6-technologies-et-infrastructure)
7. [Intégrations et API](#7-intégrations-et-api)
8. [Déploiement et maintenance](#8-déploiement-et-maintenance)

---

## 1. Vue d'ensemble du projet

### 1.1 Contexte

Le projet BNRM est une plateforme numérique complète pour la Bibliothèque Nationale du Royaume du Maroc, intégrant plusieurs portails et services pour:
- La gestion et consultation du patrimoine documentaire
- Les services administratifs et e-services
- La bibliothèque numérique et les manuscrits
- Le dépôt légal et l'attribution BNRM
- Les services aux professionnels du livre

### 1.2 Objectifs principaux

1. **Accessibilité**: Rendre le patrimoine documentaire accessible au public marocain et international
2. **Numérisation**: Préserver et valoriser les collections par la numérisation
3. **Services administratifs**: Moderniser les processus de dépôt légal et d'attribution BNRM
4. **Multilingue**: Support de l'arabe, français et berbère (tamazight)
5. **Accessibilité**: Conformité WCAG 2.1 niveau AA pour les personnes en situation de handicap

### 1.3 Portée du projet

Le système comprend:
- **Portail principal BNRM**: Point d'entrée unique
- **Plateforme Manuscrits**: Gestion et consultation des manuscrits
- **Bibliothèque numérique**: Accès aux ressources numérisées
- **Portail Kitab**: Services aux professionnels du livre
- **Portail CBM**: Comité Bibliothèque du Maroc
- **E-services**: Dépôt légal, BNRM, reproduction, etc.

---

## 2. Architecture générale

### 2.1 Architecture technique

```
┌─────────────────────────────────────────────────────────┐
│                    PORTAIL PRINCIPAL                     │
│                      (Point d'entrée)                    │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│  Bibliothèque  │  │  Plateforme │  │    E-Services   │
│   Numérique    │  │  Manuscrits │  │   (Dépôt légal, │
│                │  │             │  │   BNRM, etc.)   │
└────────────────┘  └─────────────┘  └─────────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────▼──────┐
                    │   SUPABASE   │
                    │   - Database │
                    │   - Auth     │
                    │   - Storage  │
                    │   - Edge Fns │
                    └──────────────┘
```

### 2.2 Principes architecturaux

1. **Séparation des préoccupations**: Modules indépendants avec interfaces définies
2. **Sécurité par conception**: RLS, authentification forte, audit trail
3. **Scalabilité**: Architecture cloud-native avec Supabase
4. **Accessibilité**: Design responsive et WCAG 2.1 AA
5. **Performance**: Optimisation des requêtes, mise en cache, lazy loading

### 2.3 Flux de données

```
Utilisateur → Frontend (React) → Supabase Client → 
→ Edge Functions → Database (PostgreSQL) → 
→ Réponse → Frontend → Affichage
```

---

## 3. Modules et plateformes

### 3.1 Portail principal BNRM

**Route**: `/`

**Fonctionnalités**:
- Page d'accueil avec actualités et expositions virtuelles
- Navigation vers les différentes plateformes
- Recherche globale multi-critères
- Espace personnel utilisateur
- Centre d'aide multilingue avec chatbot IA

**Composants clés**:
- `Header.tsx`: Navigation principale
- `Hero.tsx`: Bannière d'accueil
- `Services.tsx`: Présentation des services
- `Collections.tsx`: Collections vedettes
- `Footer.tsx`: Pied de page

### 3.2 Bibliothèque numérique

**Route**: `/digital-library`

**Fonctionnalités**:
- Consultation des ressources numérisées
- Recherche avancée dans le catalogue
- Favoris et annotations personnelles
- Demandes de reproduction
- Expositions virtuelles
- Téléchargement selon permissions

**Gestion (Admin/Bibliothécaire)**:
- Route: `/admin/digital-library`
- Gestion des documents
- Gestion des utilisateurs
- Statistiques et analytics
- Gestion des demandes de reproduction

**Tables Supabase**:
- `content`: Documents et métadonnées
- `catalog_metadata`: Métadonnées enrichies
- `virtual_exhibitions`: Expositions virtuelles
- `exhibition_resources`: Ressources des expositions
- `reproduction_requests`: Demandes de reproduction
- `reproduction_items`: Articles de reproduction

### 3.3 Plateforme Manuscrits

**Route**: `/manuscripts-platform`

**Fonctionnalités**:
- Catalogue des manuscrits avec recherche avancée
- Visualiseur de manuscrits (images haute résolution)
- Recherche dans le texte (OCR)
- Navigation par page avec zoom
- Métadonnées détaillées (codicologie)
- Versions multiples (restauration, conservation)
- Contrôle d'accès granulaire
- Watermarking pour protection

**Espace personnel**:
- Route: `/my-manuscripts-space`
- Favoris
- Historique de consultation
- Demandes d'accès

**Gestion (Admin/Bibliothécaire)**:
- Route: `/admin/manuscripts-backoffice`
- Dashboard: Statistiques et KPIs
- Documents: Upload et gestion des manuscrits
- Utilisateurs: Gestion des accès
- Contrôle d'accès: Permissions granulaires
- Analytics: Statistiques d'utilisation
- Rapports: Génération de rapports
- Paramètres: Configuration

**Partenaires**:
- Route: `/partner-dashboard`
- Soumission de collections
- Suivi des soumissions
- Gestion des collections approuvées

**Tables Supabase**:
- `manuscripts`: Catalogue des manuscrits
- `manuscript_pages`: Pages numérisées avec OCR
- `manuscript_versions`: Versions multiples
- `manuscript_platform_users`: Utilisateurs de la plateforme
- `manuscript_reviews`: Processus d'approbation
- `partner_collections`: Collections partenaires
- `partner_manuscript_submissions`: Soumissions
- `access_requests`: Demandes d'accès

### 3.4 Portail Kitab (Professionnels du livre)

**Route**: `/kitab`

**Fonctionnalités**:
- Bibliographie nationale marocaine
- Répertoires:
  - Auteurs (`/kitab/repertoire-auteurs`)
  - Éditeurs (`/kitab/repertoire-editeurs`)
  - Distributeurs (`/kitab/repertoire-distributeurs`)
  - Imprimeurs (`/kitab/repertoire-imprimeurs`)
- Nouvelles publications (`/kitab/new-publications`)
- Publications à venir (`/kitab/upcoming`)
- Recherche bibliographique
- FAQ spécifique au secteur du livre

**Inscription professionnelle**:
- Route: `/signup`
- Formulaires spécialisés par type (auteur, éditeur, distributeur, imprimeur)
- Processus de vérification et approbation

**Tables Supabase**:
- `profiles`: Profils professionnels
- `content`: Publications et bibliographie
- `content_categories`: Catégories de publications

### 3.5 Portail CBM (Comité Bibliothèque du Maroc)

**Route**: `/cbm`

**Fonctionnalités**:
- Présentation du comité
- Objectifs et missions
- Organes de gestion
- Plan d'actions
- Accès rapide aux ressources
- Recherche dans les documents CBM

**Tables Supabase**:
- `content`: Documents et actualités CBM

### 3.6 E-Services

#### 3.6.1 Dépôt légal

**Route**: `/legal-deposit`

**Fonctionnalités**:
- Déclaration de dépôt légal en ligne
- Suivi des demandes
- Upload de documents
- Workflow de validation multi-étapes
- Notifications automatiques
- Génération de numéros de dépôt

**Backoffice** (Route: `/admin/legal-deposit`):
- Gestion des demandes
- Attribution des numéros
- Workflow de traitement
- Validation multi-niveaux
- Historique et audit

**Tables Supabase**:
- `legal_deposit_requests`: Demandes de dépôt
- `deposit_workflow_steps`: Étapes du workflow
- `deposit_activity_log`: Journal d'activité
- `deposit_notifications`: Notifications

**Workflow**:
```
Brouillon → Soumise → En cours de traitement → 
→ Validation B → Attribution BNRM → 
→ Réception physique → Validée/Rejetée
```

#### 3.6.2 Attribution BNRM (ISBN/ISSN/ISMN)

**Route**: `/bnrm-portal`

**Fonctionnalités**:
- Demande de numéros ISBN/ISSN/ISMN
- Consultation des tarifs
- Historique des attributions
- Services associés
- Dashboard personnel

**Backoffice** (Route: `/admin/bnrm-backoffice`):
- Gestion des demandes
- Attribution des numéros
- Gestion des tarifs
- Paramètres système
- Workflow personnalisé

**Tables Supabase**:
- `legal_deposit_requests`: Demandes BNRM
- `bnrm_services`: Catalogue des services
- `bnrm_tarifs`: Grille tarifaire
- `bnrm_tarifs_historique`: Historique des tarifs
- `bnrm_parametres`: Paramètres système
- `bnrm_wallets`: Portefeuilles utilisateurs
- `wallet_transactions`: Transactions

#### 3.6.3 Demandes de reproduction

**Route**: `/reproduction`

**Fonctionnalités**:
- Formulaire de demande
- Sélection de documents
- Calcul des coûts
- Suivi des demandes
- Paiement en ligne

**Backoffice** (Route: `/admin/reproduction-backoffice`):
- Gestion des demandes
- Workflow de traitement
- Routage automatique
- Statistiques

**Tables Supabase**:
- `reproduction_requests`: Demandes
- `reproduction_items`: Articles demandés
- `payment_transactions`: Paiements

---

## 4. Gestion des utilisateurs et permissions

### 4.1 Système de rôles

**Rôles disponibles**:
```typescript
type UserRole = 
  | 'visitor'        // Visiteur non authentifié
  | 'subscriber'     // Abonné (accès premium)
  | 'researcher'     // Chercheur (accès académique)
  | 'partner'        // Partenaire institutionnel
  | 'librarian'      // Bibliothécaire
  | 'admin';         // Administrateur
```

**Stockage sécurisé**:
- Table `user_roles`: Rôles avec expiration possible
- Table `profiles`: Informations utilisateur (sans rôle)
- Fonction `get_user_primary_role()`: Récupération du rôle principal
- Fonction `has_role()`: Vérification des rôles

### 4.2 Niveaux d'accès

**Niveaux de contenu**:
```typescript
type AccessLevel = 
  | 'public'         // Accessible à tous
  | 'restricted'     // Abonnés et chercheurs
  | 'confidential';  // Admins et bibliothécaires uniquement
```

**Matrice d'accès**:
| Rôle | Public | Restricted | Confidential |
|------|--------|------------|--------------|
| visitor | ✓ | ✗ | ✗ |
| subscriber | ✓ | ✓ | ✗ |
| researcher | ✓ | ✓ | ✗ |
| partner | ✓ | ✓ | ✗ |
| librarian | ✓ | ✓ | ✓ |
| admin | ✓ | ✓ | ✓ |

### 4.3 Permissions granulaires

**Système de permissions** (Tables):
- `permissions`: Catalogue des permissions
- `role_permissions`: Permissions par rôle
- `user_permissions`: Permissions individuelles (overrides)

**Catégories de permissions**:
- `content_management`: Gestion de contenu
- `user_management`: Gestion utilisateurs
- `system_admin`: Administration système
- `manuscripts`: Gestion manuscrits
- `legal_deposit`: Dépôt légal
- `bnrm`: Services BNRM

**Fonction de vérification**:
```sql
user_has_permission(user_uuid, permission_name) → boolean
```

### 4.4 Authentification et sécurité

**Méthodes d'authentification**:
- Email/mot de passe
- Google OAuth (optionnel)
- Réinitialisation de mot de passe
- Confirmation d'email

**Sécurité**:
- Row Level Security (RLS) sur toutes les tables
- SECURITY DEFINER functions pour éviter la récursion RLS
- Audit trail complet (table `activity_logs`)
- Anonymisation des données sensibles (IP, user agent)

---

## 5. Sécurité et conformité

### 5.1 Row Level Security (RLS)

**Principes**:
- RLS activé sur **toutes les tables**
- Politiques par opération (SELECT, INSERT, UPDATE, DELETE)
- Utilisation de fonctions SECURITY DEFINER
- Pas de contournement côté client

**Exemples de politiques**:
```sql
-- Utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all"
ON profiles FOR ALL
TO authenticated
USING (is_admin_or_librarian(auth.uid()));
```

### 5.2 Protection des données personnelles (PII)

**Données sensibles**:
- Informations de contact (téléphone, adresse)
- Données professionnelles
- Historique de navigation

**Mesures de protection**:
- Table `profile_pii_access_log`: Traçabilité des accès
- Fonction `get_profile_with_contact()`: Accès contrôlé
- Anonymisation automatique (IP, user agent)
- Rétention limitée (90 jours pour les logs)

### 5.3 Audit et traçabilité

**Table `activity_logs`**:
- Enregistrement de toutes les actions sensibles
- Anonymisation automatique des données réseau
- Fonction `insert_activity_log()` pour logging sécurisé
- Nettoyage automatique (90 jours)

**Logs conservés**:
- Connexions/déconnexions
- Modifications de profils
- Accès aux contenus sensibles
- Actions administratives
- Demandes de service

### 5.4 Prévention de la fraude

**Table `fraud_detection_logs`**:
- Détection d'activités suspectes
- Score de risque
- Actions automatiques
- Alertes administrateurs

**Indicateurs surveillés**:
- Tentatives de connexion multiples
- Téléchargements massifs
- Modifications suspectes de profils
- Transactions inhabituelles

---

## 6. Technologies et infrastructure

### 6.1 Stack technique

**Frontend**:
- React 18.3.1
- TypeScript
- Vite (build tool)
- TailwindCSS + shadcn/ui
- React Router DOM 6.30.1
- React Query (TanStack Query)
- Lucide React (icons)

**Backend**:
- Supabase (BaaS)
- PostgreSQL (base de données)
- Edge Functions (Deno)
- Supabase Auth
- Supabase Storage (à configurer)

**Bibliothèques spécialisées**:
- jsPDF + jsPDF-AutoTable: Génération PDF
- react-contenteditable: Édition WYSIWYG
- @react-three/fiber: Visualisations 3D
- recharts: Graphiques et analytics
- date-fns: Manipulation de dates

### 6.2 Base de données

**PostgreSQL avec**:
- Extensions activées:
  - `pg_trgm`: Recherche floue (trigram)
  - `uuid-ossp`: Génération UUID
- **110+ tables** organisées par domaine
- **50+ fonctions** métier
- Index optimisés pour la recherche
- Full-text search (tsvector)

**Stratégie de sauvegarde**:
- Sauvegardes automatiques Supabase
- Table `preservation_backups`: Sauvegardes métier
- Fonction `verify_backup_integrity()`

### 6.3 Edge Functions (Serverless)

**Functions déployées**:
1. `chatbot-ai`: Chatbot avec IA (Lovable AI / Gemini)
2. `smart-chatbot`: Chatbot avancé avec contexte
3. `text-to-speech`: Conversion texte → audio
4. `voice-to-text`: Transcription audio → texte
5. `search-engine`: Moteur de recherche avancé
6. `create-payment`: Création de paiements
7. `verify-payment`: Vérification de paiements
8. `route-reproduction-request`: Routage des demandes
9. `preservation-backup`: Sauvegarde automatique
10. `auto-archive-content`: Archivage automatique
11. `cleanup-activity-logs`: Nettoyage des logs
12. `format-migration`: Migration de formats
13. `sigb-metadata-sync`: Synchronisation métadonnées
14. `subscribe-newsletter`: Inscription newsletter

**Configuration** (`supabase/config.toml`):
```toml
[functions.chatbot-ai]
verify_jwt = true

[functions.smart-chatbot]
verify_jwt = false  # Public access
```

### 6.4 Secrets et configuration

**Secrets Supabase**:
- `LOVABLE_API_KEY`: API Lovable AI
- `OPENAI_API_KEY`: API OpenAI (backup)
- `TYPESENSE_API_KEY`: Recherche (si utilisé)
- `TYPESENSE_HOST`: Host Typesense
- `STRIPE_SECRET_KEY`: Paiements Stripe
- `SUPABASE_URL`: URL projet
- `SUPABASE_ANON_KEY`: Clé anonyme
- `SUPABASE_SERVICE_ROLE_KEY`: Clé service
- `SUPABASE_DB_URL`: URL base de données
- `SUPABASE_PUBLISHABLE_KEY`: Clé publique

---

## 7. Intégrations et API

### 7.1 Lovable AI (Chatbot)

**Modèles disponibles**:
- `google/gemini-2.5-pro`: Raisonnement complexe
- `google/gemini-2.5-flash`: Équilibré (défaut)
- `google/gemini-2.5-flash-lite`: Rapide et économique
- `openai/gpt-5`: Alternative premium
- `openai/gpt-5-mini`: Alternative équilibrée
- `openai/gpt-5-nano`: Alternative économique

**Usage**:
- Chatbot multilingue (ar, fr, ber)
- Base de connaissances (`chatbot_knowledge_base`)
- Recherche sémantique avec scoring
- Streaming de réponses
- Historique de conversations

**Endpoint**: `https://ai.gateway.lovable.dev/v1/chat/completions`

### 7.2 Paiements (Stripe - à configurer)

**Fonctionnalités prévues**:
- Paiement des services BNRM
- Paiement des reproductions
- Abonnements premium
- Gestion des portefeuilles

**Tables**:
- `payment_transactions`: Transactions
- `bnrm_wallets`: Portefeuilles utilisateurs
- `wallet_transactions`: Mouvements de portefeuille

### 7.3 Recherche avancée

**Capacités**:
- Full-text search PostgreSQL (tsvector)
- Recherche floue (pg_trgm)
- Recherche multi-critères
- Recherche dans les manuscrits (OCR)
- Recherche dans les pages (fonction `search_manuscript_pages`)
- Filtres avancés

**Logging**:
- Table `search_logs`: Traçabilité des recherches
- Fonction `log_search()`: Enregistrement automatique
- Analytics sur les recherches populaires

### 7.4 SIGB (Système Intégré de Gestion de Bibliothèque)

**Synchronisation prévue**:
- Edge function: `sigb-metadata-sync`
- Table: `catalog_metadata`
- Champs de synchronisation:
  - `source_sigb`: Système source
  - `source_record_id`: ID dans le SIGB
  - `last_sync_date`: Dernière synchro
  - `import_date`: Date d'import

**Métadonnées enrichies**:
- Classifications (Dewey, UDC, CDU)
- ISBN/ISSN
- Auteurs, éditeurs, illustrateurs
- Descriptions physiques
- Sujets et mots-clés
- Couverture géographique et temporelle

---

## 8. Déploiement et maintenance

### 8.1 Environnements

**Production**:
- URL: À définir
- Supabase Project ID: `safeppmznupzqkqmzjzt`
- Base de données: PostgreSQL 15+
- Edge Functions: Déploiement automatique

**Développement**:
- Local avec Vite dev server
- Supabase local (optionnel)
- Hot reload activé

### 8.2 CI/CD

**Déploiement automatique**:
- Git push → Lovable → Déploiement production
- Edge Functions: Déploiement automatique Supabase
- Migrations: Exécution manuelle avec validation

### 8.3 Monitoring et analytics

**Métriques surveillées**:
- Trafic utilisateurs (table `exhibition_visits`)
- Téléchargements (table `download_logs`)
- Recherches (table `search_logs`)
- Interactions chatbot (table `chatbot_interactions`)
- Activité système (table `activity_logs`)

**Dashboards admin**:
- Analytics bibliothèque numérique
- Analytics manuscrits
- Statistiques dépôt légal
- Statistiques BNRM
- Rapports personnalisés

### 8.4 Maintenance

**Tâches automatisées**:
- Nettoyage des logs (90 jours)
- Archivage automatique du contenu
- Sauvegardes de préservation
- Vérification d'intégrité des backups

**Edge Functions de maintenance**:
- `cleanup-activity-logs`: Tous les jours
- `auto-archive-content`: Hebdomadaire
- `preservation-backup`: Quotidien

### 8.5 Évolutions futures

**Court terme**:
- Activation Supabase Storage pour fichiers
- Intégration Stripe pour paiements
- OCR amélioré pour manuscrits
- Recherche sémantique avancée

**Moyen terme**:
- Application mobile (React Native)
- API publique documentée
- Intégration SIGB complète
- Reconnaissance d'écriture manuscrite (HTR)

**Long terme**:
- IA pour catalogage automatique
- Réalité augmentée pour manuscrits
- Blockchain pour certification
- Portail API partenaires

---

## 9. Annexes

### 9.1 Glossaire

**Termes techniques**:
- **RLS**: Row Level Security - Sécurité au niveau des lignes
- **PII**: Personal Identifiable Information - Données personnelles
- **OCR**: Optical Character Recognition - Reconnaissance optique de caractères
- **HTR**: Handwritten Text Recognition - Reconnaissance d'écriture manuscrite
- **SIGB**: Système Intégré de Gestion de Bibliothèque
- **BNRM**: Bibliothèque Nationale du Royaume du Maroc
- **CBM**: Comité Bibliothèque du Maroc

**Termes métier**:
- **Dépôt légal**: Obligation de déposer des exemplaires d'œuvres
- **ISBN**: International Standard Book Number
- **ISSN**: International Standard Serial Number
- **ISMN**: International Standard Music Number
- **Codicologie**: Science de la description des manuscrits

### 9.2 Références

**Documentation technique**:
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

**Standards et normes**:
- WCAG 2.1 Level AA
- ISO 2709 (Format MARC)
- Dublin Core Metadata
- RGPD / GDPR

### 9.3 Contacts et support

**Équipe projet**:
- Chef de projet: [À définir]
- Architecte technique: [À définir]
- Responsable sécurité: [À définir]

**Support technique**:
- Email: support@bnrm.ma
- Téléphone: [À définir]
- Heures: 9h-17h (GMT+1)

---

## 10. Historique des versions

| Version | Date | Auteur | Modifications |
|---------|------|--------|---------------|
| 1.0 | 06/10/2025 | Système | Création initiale du document |

---

**Document généré le**: 6 octobre 2025  
**Projet**: Portail BNRM - Spécifications générales  
**Statut**: Document de travail  
**Confidentialité**: Usage interne

---

*Ce document est évolutif et sera mis à jour régulièrement pour refléter les changements du projet.*