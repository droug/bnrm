# Système d'Intégrations Externes BNRM

## Vue d'ensemble

Le système d'intégrations permet au portail BNRM de se connecter et de synchroniser des données avec des systèmes externes comme :
- **SIGB** (Système Intégré de Gestion de Bibliothèque)
- **Systèmes d'Information** internes
- **APIs externes**
- **Webhooks** pour les notifications en temps réel

## Architecture

### Tables de la base de données

1. **`external_integrations`** : Configuration des intégrations
   - Type (SIGB, SI, webhook, API)
   - URL de l'endpoint
   - Authentification (Basic, Bearer, API Key, OAuth2)
   - Direction de sync (entrant, sortant, bidirectionnel)
   - Fréquence et paramètres

2. **`integration_sync_logs`** : Historique des synchronisations
   - Statut, durée, nombre d'enregistrements
   - Détails des succès et échecs

3. **`integration_sync_errors`** : Erreurs détaillées
   - Type d'erreur, message, stack trace
   - Données ayant causé l'erreur
   - Système de retry

4. **`integration_webhooks`** : Configuration des webhooks
   - Secret de signature
   - IPs autorisées
   - Types d'événements

5. **`webhook_events`** : Événements reçus
   - Données de l'événement
   - Statut de traitement

### Edge Functions

#### `integration-sync`
Synchronise les données depuis un système externe vers la base BNRM.

**URL**: `/functions/v1/integration-sync`

**Payload**:
```json
{
  "integrationId": "uuid-de-l-integration",
  "syncType": "manual",
  "entityType": "legal_deposits",
  "filters": {}
}
```

**Fonctionnalités**:
- Authentification automatique selon le type configuré
- Mapping des données selon la configuration
- Traitement par batch pour les grandes volumétries
- Gestion des erreurs et retry automatique
- Logging détaillé de chaque synchronisation

#### `integration-webhook`
Reçoit les webhooks des systèmes externes.

**URL**: `/functions/v1/integration-webhook?webhook_id={uuid}`

**Fonctionnalités**:
- Vérification de la signature HMAC
- Filtrage par IP source
- Validation des types d'événements
- Traitement asynchrone
- Mapping automatique vers les tables BNRM

## Configuration

### 1. Créer une intégration

Accédez à `/admin/integrations` et cliquez sur "Nouvelle intégration".

**Paramètres requis**:
- **Nom** : Identifiant de l'intégration
- **Type** : SIGB, SI, Webhook ou API
- **URL** : Endpoint de l'API externe
- **Direction** : Entrant, Sortant ou Bidirectionnel

**Paramètres optionnels**:
- **Authentification** : None, Basic, Bearer, API Key, OAuth2
- **Fréquence** : Manuel, Temps réel, Horaire, Quotidien, Hebdomadaire
- **Timeout** : Délai d'attente en secondes (défaut: 30s)
- **Retry** : Nombre de tentatives (défaut: 3)
- **Batch Size** : Nombre d'enregistrements par batch (défaut: 100)

### 2. Configurer le mapping des données

Le mapping permet de transformer les données du système externe au format BNRM.

**Exemple de mapping simple**:
```json
{
  "title": "titre",
  "author": "auteur",
  "isbn": "numero_isbn"
}
```

**Exemple de mapping avancé**:
```json
{
  "title": {
    "source": "titre",
    "transform": "uppercase"
  },
  "publication_year": {
    "source": "annee",
    "transform": "parseInt",
    "default": 2024
  }
}
```

**Transformations disponibles**:
- `uppercase` : Convertir en majuscules
- `lowercase` : Convertir en minuscules
- `parseInt` : Convertir en entier
- `default` : Valeur par défaut si vide

### 3. Configurer un webhook

Pour recevoir des événements en temps réel :

1. Créez une intégration de type "webhook"
2. Configurez les types d'événements autorisés
3. Optionnel : Ajoutez un secret pour la signature HMAC
4. Optionnel : Limitez les IPs autorisées
5. Copiez l'URL du webhook et configurez-la dans le système externe

**Format de l'URL du webhook**:
```
https://votre-domaine.com/functions/v1/integration-webhook?webhook_id={uuid}
```

**Format attendu des événements**:
```json
{
  "event": "user.created",
  "type": "user",
  "data": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 4. Sécurité des webhooks

#### Signature HMAC

Pour vérifier l'authenticité des webhooks, configurez un secret.

**Génération de la signature côté externe**:
```javascript
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', webhook_secret)
  .update(JSON.stringify(payload))
  .digest('hex');

// Envoyer dans l'en-tête
headers['X-Webhook-Signature'] = `sha256=${signature}`;
```

#### Restriction par IP

Ajoutez les IPs autorisées dans la configuration du webhook pour limiter l'accès.

## Utilisation

### Synchronisation manuelle

1. Accédez à `/admin/integrations`
2. Cliquez sur l'icône "Play" à côté de l'intégration
3. La synchronisation démarre et les logs s'affichent

### Synchronisation automatique

Activez "Synchronisation automatique" et choisissez la fréquence.

**Note**: Pour les fréquences programmées (horaire, quotidienne, hebdomadaire), vous devez configurer un cron job ou utiliser un service externe pour appeler l'edge function `integration-sync` à intervalles réguliers.

### Consulter les logs

Accédez à l'onglet "Logs de synchronisation" pour voir :
- Statut de chaque synchronisation
- Nombre d'enregistrements traités
- Succès et échecs
- Durée d'exécution
- Messages d'erreur détaillés

### Résoudre les erreurs

Les erreurs de synchronisation sont enregistrées dans `integration_sync_errors`.

Pour consulter les erreurs :
```sql
SELECT * FROM integration_sync_errors
WHERE resolved = false
ORDER BY created_at DESC;
```

Pour marquer une erreur comme résolue :
```sql
UPDATE integration_sync_errors
SET resolved = true,
    resolved_at = NOW(),
    resolved_by = auth.uid()
WHERE id = 'error-id';
```

## Mapping des entités

### Entités supportées

| Entité | Table BNRM | Clé de conflit |
|--------|-----------|----------------|
| `legal_deposits` | `legal_deposit_requests` | `request_number` |
| `users` | `profiles` | `user_id` |
| `catalog_metadata` | `catalog_metadata` | `source_record_id` |
| `manuscripts` | `manuscripts` | `inventory_number` |

### Ajouter une nouvelle entité

1. Modifiez la fonction `getTargetTable()` dans `integration-sync/index.ts`
2. Ajoutez la correspondance table/clé dans `getConflictKey()`
3. Créez la logique de mapping dans le mapping de données

## Monitoring

### Métriques disponibles

- Nombre total de synchronisations
- Taux de succès/échec
- Temps moyen de synchronisation
- Volume de données synchronisées
- Nombre d'erreurs non résolues

### Alertes recommandées

- Synchronisation échouée 3 fois de suite
- Temps de synchronisation > 5 minutes
- Taux d'échec > 10%
- Erreurs non résolues > 50

## Bonnes pratiques

### Performance

1. **Utilisez le batch processing** : Configurez un batch_size adapté à votre volumétrie
2. **Optimisez le timeout** : Ajustez selon la latence de votre réseau
3. **Limitez les données** : Synchronisez uniquement les champs nécessaires
4. **Utilisez des index** : Assurez-vous que les clés de conflit sont indexées

### Sécurité

1. **Toujours utiliser HTTPS** pour les endpoints
2. **Configurer l'authentification** (ne pas utiliser "none" en production)
3. **Activer la signature HMAC** pour les webhooks
4. **Restreindre les IPs** sources si possible
5. **Stocker les credentials de manière sécurisée** (utiliser les secrets Supabase)

### Fiabilité

1. **Activer le retry** : Au moins 3 tentatives
2. **Monitorer les logs** régulièrement
3. **Tester en environnement de dev** avant production
4. **Avoir un plan de rollback** en cas de problème
5. **Documenter les mappings** de données

## Exemples d'intégrations

### SIGB Koha

```json
{
  "name": "SIGB Koha",
  "integration_type": "sigb",
  "endpoint_url": "https://koha.bnrm.ma/api/v1/biblios",
  "auth_type": "api_key",
  "sync_direction": "inbound",
  "data_mapping": {
    "title": "title",
    "author": "author",
    "isbn": "isbn",
    "publication_year": {
      "source": "copyrightdate",
      "transform": "parseInt"
    }
  },
  "sync_entities": ["catalog_metadata"]
}
```

### Système d'inscription

```json
{
  "name": "Système d'inscription",
  "integration_type": "si",
  "endpoint_url": "https://inscription.bnrm.ma/api/users",
  "auth_type": "bearer",
  "sync_direction": "bidirectional",
  "data_mapping": {
    "first_name": "prenom",
    "last_name": "nom",
    "email": "email",
    "phone": "telephone"
  },
  "sync_entities": ["users"]
}
```

### Webhook dépôt légal

```json
{
  "name": "Webhook Dépôt Légal",
  "integration_type": "webhook",
  "webhook_name": "legal_deposit_notifications",
  "event_types": ["deposit.created", "deposit.updated", "deposit.validated"],
  "signature_algorithm": "sha256",
  "is_active": true
}
```

## Dépannage

### La synchronisation échoue

1. Vérifiez l'URL de l'endpoint
2. Testez l'authentification
3. Vérifiez les logs d'erreur détaillés
4. Testez la connectivité réseau
5. Vérifiez que le mapping est correct

### Le webhook ne reçoit pas d'événements

1. Vérifiez que le webhook est actif
2. Vérifiez l'URL configurée dans le système externe
3. Testez avec un outil comme curl
4. Vérifiez les IPs autorisées
5. Consultez les logs du système externe

### Les données ne correspondent pas

1. Vérifiez le mapping de données
2. Testez avec un petit échantillon
3. Vérifiez les transformations appliquées
4. Consultez les logs de synchronisation
5. Vérifiez les clés de conflit

## Support

Pour toute question ou problème :
1. Consultez les logs dans `/admin/integrations`
2. Vérifiez la documentation des APIs externes
3. Contactez l'équipe technique BNRM

## Évolutions futures

- Support de GraphQL
- Synchronisation incrémentale
- File d'attente pour les webhooks
- Dashboard de monitoring avancé
- Export des logs
- Tests de connexion intégrés
