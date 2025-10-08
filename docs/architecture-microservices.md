# Architecture Microservices - BNRM Platform

## Vue d'ensemble

L'architecture de la plateforme BNRM est organisée en microservices via des **Supabase Edge Functions**, permettant une séparation claire des responsabilités et une scalabilité horizontale.

## Services principaux

### 1. Analytics Service (`analytics-service`)
**Responsabilité**: Suivi et métriques de la plateforme

**Endpoints**:
- `POST /analytics-service`
  - `action: 'log'` - Enregistre une activité
  - `action: 'get_stats'` - Récupère les statistiques globales
  - `action: 'get_user_activity'` - Activité d'un utilisateur spécifique
  - `action: 'get_content_stats'` - Statistiques de contenu

**Utilisation**:
```typescript
const { data } = await supabase.functions.invoke('analytics-service', {
  body: {
    action: 'log',
    event: 'page_view',
    resource_type: 'manuscript',
    resource_id: 'uuid',
    metadata: { page: '/manuscripts/view' }
  }
});
```

### 2. Workflow Service (`workflow-service`)
**Responsabilité**: Gestion des workflows métier (dépôt légal, reproduction, validation)

**Endpoints**:
- `POST /workflow-service`
  - `action: 'get_workflow'` - Récupère le workflow d'une demande
  - `action: 'update_step'` - Met à jour une étape
  - `action: 'create_workflow'` - Crée un nouveau workflow
  - `action: 'get_status'` - Statut global du workflow

**Types de workflows**:
- `legal_deposit` - Dépôt légal (5 étapes)
- `reproduction` - Demande de reproduction (5 étapes)
- `manuscript_review` - Validation de manuscrit (5 étapes)

**Utilisation**:
```typescript
const { data } = await supabase.functions.invoke('workflow-service', {
  body: {
    action: 'update_step',
    request_id: 'uuid',
    step_number: 2,
    status: 'termine',
    comments: 'Validation effectuée'
  }
});
```

### 3. Notification Service (`notification-service`)
**Responsabilité**: Notifications email et in-app

**Endpoints**:
- `POST /notification-service`
  - `action: 'send_email'` - Envoie un email
  - `action: 'create_notification'` - Crée une notification in-app
  - `action: 'get_notifications'` - Récupère les notifications d'un utilisateur
  - `action: 'mark_read'` - Marque une notification comme lue

**Utilisation**:
```typescript
const { data } = await supabase.functions.invoke('notification-service', {
  body: {
    action: 'create_notification',
    recipient_id: 'user-uuid',
    subject: 'Validation approuvée',
    message: 'Votre demande a été approuvée',
    notification_type: 'approval'
  }
});
```

### 4. Payment Service (`create-payment`, `verify-payment`)
**Responsabilité**: Gestion des paiements Stripe

**Fonctions existantes**:
- `create-payment` - Crée une session de paiement
- `verify-payment` - Vérifie le statut d'un paiement

**Utilisation**:
```typescript
// Création d'un paiement
const { data } = await supabase.functions.invoke('create-payment', {
  body: {
    amount: 100,
    transactionType: 'service_subscription',
    serviceId: 'S001'
  }
});

// Vérification
const { data: verification } = await supabase.functions.invoke('verify-payment', {
  body: {
    sessionId: 'cs_xxx',
    transactionId: 'uuid'
  }
});
```

### 5. Document Service (`document-service`)
**Responsabilité**: Gestion des documents (manuscrits, contenu, dépôts légaux)

**Endpoints**:
- `POST /document-service`
  - `action: 'get_document'` - Récupère un document
  - `action: 'list_documents'` - Liste les documents avec filtres
  - `action: 'get_metadata'` - Métadonnées enrichies
  - `action: 'update_document'` - Met à jour un document

**Types de documents**:
- `manuscript` - Manuscrits
- `content` - Contenu éditorial
- `legal_deposit` - Dépôts légaux

**Utilisation**:
```typescript
const { data } = await supabase.functions.invoke('document-service', {
  body: {
    action: 'list_documents',
    document_type: 'manuscript',
    filters: {
      language: 'ar',
      status: 'published'
    }
  }
});
```

### 6. Search Service (`search-engine`)
**Responsabilité**: Recherche avancée avec Typesense

**Fonction existante**: `search-engine`

**Actions**:
- `index` - Indexe le contenu
- `search` - Recherche avec filtres
- `suggest` - Suggestions de recherche

### 7. Content Service (`content-service`)
**Responsabilité**: Gestion du cycle de vie du contenu

**Endpoints**:
- `POST /content-service`
  - `action: 'create'` - Crée du contenu
  - `action: 'update'` - Met à jour le contenu
  - `action: 'publish'` - Publie le contenu
  - `action: 'archive'` - Archive le contenu
  - `action: 'list'` - Liste le contenu avec filtres
  - `action: 'translate'` - Récupère une traduction

**Utilisation**:
```typescript
const { data } = await supabase.functions.invoke('content-service', {
  body: {
    action: 'publish',
    content_id: 'uuid'
  }
});
```

### 8. User Service (`user-service`)
**Responsabilité**: Gestion des utilisateurs, profils, rôles et permissions

**Endpoints**:
- `POST /user-service`
  - `action: 'get_profile'` - Récupère un profil
  - `action: 'update_profile'` - Met à jour un profil
  - `action: 'get_roles'` - Récupère les rôles d'un utilisateur
  - `action: 'assign_role'` - Assigne un rôle (admin uniquement)
  - `action: 'get_permissions'` - Récupère les permissions
  - `action: 'list_users'` - Liste les utilisateurs (admin/librarian)

**Utilisation**:
```typescript
const { data } = await supabase.functions.invoke('user-service', {
  body: {
    action: 'update_profile',
    profile_data: {
      first_name: 'Mohammed',
      institution: 'Université Hassan II'
    }
  }
});
```

## Architecture de données

### Communication entre services
Les services communiquent via:
1. **Base de données PostgreSQL** - Source de vérité partagée
2. **Edge Functions** - Communication synchrone HTTP
3. **Tables de logs** - Traçabilité inter-services

### Sécurité
- **JWT Authentication** - Via Supabase Auth
- **RLS Policies** - Protection des données au niveau base
- **Service Role Key** - Pour les opérations privilégiées
- **CORS** - Configuration pour les appels frontend

### Logging et monitoring
Tous les services loggent dans `activity_logs` avec:
- `user_id` - Utilisateur à l'origine
- `action` - Action effectuée
- `resource_type` - Type de ressource
- `resource_id` - ID de la ressource
- `details` - Métadonnées JSON

## Déploiement

Les Edge Functions sont **automatiquement déployées** par Lovable lors de la mise à jour du code.

### Configuration
Le fichier `supabase/config.toml` définit:
- `verify_jwt` - Authentification requise ou non
- Chaque fonction doit être déclarée

## Migration progressive

Pour migrer du code existant vers cette architecture:

1. **Identifier** les fonctionnalités à migrer
2. **Appeler** le service approprié au lieu d'accéder directement à la DB
3. **Tester** avec les nouvelles fonctions
4. **Nettoyer** l'ancien code une fois validé

### Exemple de migration

**Avant** (accès direct DB):
```typescript
const { data } = await supabase
  .from('activity_logs')
  .insert({ user_id, action: 'view', resource_type: 'manuscript' });
```

**Après** (via service):
```typescript
const { data } = await supabase.functions.invoke('analytics-service', {
  body: {
    action: 'log',
    event: 'view',
    resource_type: 'manuscript',
    resource_id: manuscriptId
  }
});
```

## Avantages de cette architecture

✅ **Séparation des responsabilités** - Chaque service a un rôle clair  
✅ **Scalabilité** - Les Edge Functions scalent automatiquement  
✅ **Maintenabilité** - Code organisé et modulaire  
✅ **Testabilité** - Services indépendants testables séparément  
✅ **Sécurité** - Contrôle d'accès au niveau service  
✅ **Traçabilité** - Logging centralisé des opérations  

## Liens utiles

- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Logs des fonctions](https://supabase.com/dashboard/project/safeppmznupzqkqmzjzt/functions)
