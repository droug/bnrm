# Système de Consentement aux Cookies - BNRM

## Vue d'ensemble

Implémentation complète d'un système de gestion du consentement aux cookies conforme au RGPD pour les plateformes BNRM.

## Fonctionnalités

### ✅ Bandeau de Cookies
- Affichage automatique lors de la première visite
- Position personnalisable (haut/bas)
- Thème personnalisable (clair/sombre)
- 3 options :
  - Accepter tous les cookies
  - Refuser
  - Paramètres personnalisés

### ✅ Gestion Granulaire
- **Cookies fonctionnels** : Toujours actifs (nécessaires au site)
- **Cookies analytiques** : Google Analytics (opt-in)
- **Cookies marketing** : Publicités (opt-in)

### ✅ Backoffice Admin
- Interface de personnalisation complète
- Modification des textes et messages
- Configuration des URLs de politiques
- Activation/désactivation du bandeau
- Position et thème

### ✅ Stockage & Audit
- Consentement stocké dans localStorage
- Historique des consentements en base de données
- Tracking par session et utilisateur
- Conformité RGPD

## Utilisation

### Pour les Visiteurs

1. **Premier accès** : Le bandeau apparaît automatiquement
2. **Choix** :
   - Cliquer sur "Accepter tous les cookies" pour tout accepter
   - Cliquer sur "Refuser" pour tout refuser
   - Cliquer sur "Paramètres" pour personnaliser

3. **Paramètres détaillés** :
   - Cocher/décocher selon préférences
   - Sauvegarder

### Pour les Administrateurs

#### Accéder à la configuration

```
/admin/cookie-settings
```

**Accès réservé aux administrateurs uniquement**

#### Personnalisation

1. **Contenu du bandeau** :
   - Titre (max 100 caractères)
   - Message principal (max 500 caractères)
   - Textes des boutons

2. **Liens et politiques** :
   - URL Politique de confidentialité
   - URL Politique des cookies

3. **Apparence** :
   - Activer/désactiver le bandeau
   - Afficher/masquer bouton paramètres
   - Position (haut/bas)
   - Thème (clair/sombre)

## Architecture Technique

### Base de Données

#### Table `cookie_settings`
```sql
- id: UUID
- title: TEXT
- message: TEXT
- accept_button_text: TEXT
- reject_button_text: TEXT
- settings_button_text: TEXT
- privacy_policy_url: TEXT
- cookie_policy_url: TEXT
- enabled: BOOLEAN
- show_settings_button: BOOLEAN
- position: ENUM('top', 'bottom')
- theme: ENUM('light', 'dark')
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### Table `cookie_consents`
```sql
- id: UUID
- user_id: UUID (nullable)
- session_id: TEXT
- analytics_consent: BOOLEAN
- marketing_consent: BOOLEAN
- functional_consent: BOOLEAN
- consent_date: TIMESTAMPTZ
- ip_address: TEXT
- user_agent: TEXT
- created_at: TIMESTAMPTZ
```

### Composants

#### `CookieBanner.tsx`
Bandeau affiché aux visiteurs
- Chargement config depuis Supabase
- Affichage conditionnel
- Gestion des interactions

#### `CookieSettingsDialog.tsx`
Modal de configuration détaillée
- Switches pour chaque catégorie
- Descriptions claires
- Sauvegarde des préférences

#### `useCookieConsent.ts`
Hook React pour gérer le consentement
- État du consentement
- Actions (accepter/refuser/personnaliser)
- Intégration Google Analytics
- Sauvegarde localStorage + DB

#### `CookieSettingsPage.tsx`
Interface backoffice admin
- Formulaire de configuration
- Validation Zod
- RLS Supabase (admin uniquement)

## Intégration Google Analytics

Le consentement Google Analytics est géré automatiquement :

```typescript
// Consentement accordé
window.gtag('consent', 'update', {
  analytics_storage: 'granted',
  ad_storage: 'denied'
});

// Consentement refusé
window.gtag('consent', 'update', {
  analytics_storage: 'denied',
  ad_storage: 'denied'
});
```

## Conformité RGPD

### ✅ Exigences respectées

1. **Consentement préalable** : Aucun cookie non-essentiel avant acceptation
2. **Information claire** : Description de chaque catégorie
3. **Choix granulaire** : Cookies au choix
4. **Révocable** : Possibilité de modifier à tout moment
5. **Preuve** : Historique des consentements en DB
6. **Durée** : Consentement stocké avec timestamp

### 🔒 Sécurité

- RLS Supabase sur toutes les tables
- Validation des entrées (Zod)
- Pas de données sensibles dans localStorage
- Audit trail complet

## Migration Supabase

Les tables ont été créées avec cette migration :

```sql
-- Tables cookie_settings et cookie_consents
-- RLS policies
-- Triggers
-- Indexes
```

**État** : ✅ Migration appliquée avec succès

## Développements Futurs

### Améliorations possibles

1. **Multi-langues** : Traduction des messages
2. **A/B Testing** : Tester différents messages
3. **Analytics** : Statistiques d'acceptation
4. **Export** : Export des consentements (RGPD)
5. **Renouvellement** : Demander nouveau consentement après X mois
6. **Géolocalisation** : Afficher uniquement pour UE/EEE

### Cookies supplémentaires

Pour ajouter une nouvelle catégorie de cookies :

1. Ajouter dans `useCookieConsent.ts`
2. Ajouter switch dans `CookieSettingsDialog.tsx`
3. Ajouter colonne dans `cookie_consents` table

## Support

Pour toute question sur le système de cookies :
- Vérifier la configuration dans `/admin/cookie-settings`
- Consulter les logs dans la console navigateur
- Vérifier la table `cookie_consents` pour l'audit

## Ressources

- [RGPD - Guide cookies](https://www.cnil.fr/fr/cookies-et-autres-traceurs)
- [Google Analytics - Consent Mode](https://developers.google.com/tag-platform/security/guides/consent)
- [Pattern Cookie Banner](https://www.cookiebot.com/en/cookie-consent/)
