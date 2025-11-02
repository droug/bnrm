# Système de Synchronisation Automatique des Workflows

## Vue d'ensemble

Le système de synchronisation automatique bidirectionnelle des workflows permet de maintenir la cohérence entre :
1. Les définitions de workflows dans la base de données (Supabase)
2. Le fichier `src/data/predefinedWorkflowModels.json`
3. Les composants de gestion métier (pages de restauration, reproduction, etc.)

## Architecture

### Composants principaux

#### 1. `WorkflowAutoSync` (src/lib/workflowAutoSync.ts)
Classe utilitaire qui gère la synchronisation :
- **syncWorkflowToJSON()** : Synchronise un workflow de la BD vers JSON
- **syncAllWorkflowsToJSON()** : Synchronise tous les workflows actifs
- **detectWorkflowChanges()** : Détecte les différences entre BD et JSON
- **setupRealtimeSync()** : Configure l'écoute en temps réel des modifications

#### 2. `useWorkflowAutoSync` Hook (src/hooks/useWorkflowAutoSync.ts)
Hook React pour intégrer la synchronisation dans les composants :
- Détection automatique des modifications
- Synchronisation manuelle ou automatique
- État de synchronisation (hasChanges, lastSync, etc.)
- Écoute en temps réel des changements

#### 3. `WorkflowSyncManager` (src/components/workflow/WorkflowSyncManager.tsx)
Interface utilisateur pour gérer la synchronisation :
- Synchronisation JSON → BD (import des modèles prédéfinis)
- Synchronisation BD → JSON (export des modifications)
- Statistiques de synchronisation
- Détection des workflows manquants

## Utilisation

### 1. Synchronisation automatique lors des modifications

Les modifications effectuées dans l'éditeur de workflows sont automatiquement synchronisées :

```typescript
// Dans WorkflowStepsEditor.tsx
const { syncWorkflow, syncStatus } = useWorkflowAutoSync({
  workflowId,
  enabled: true
});

// Après sauvegarde d'une étape
await syncWorkflow(workflowId);
```

### 2. Synchronisation manuelle via l'interface

Rendez-vous sur `/admin/workflow-bpm` dans l'onglet "Modèles Prédéfinis" :

- **Sync JSON → BD** : Importe les workflows du fichier JSON vers la base de données
- **Sync BD → JSON** : Exporte les workflows modifiés de la BD vers le JSON

### 3. Écoute en temps réel

Le système écoute automatiquement les modifications sur les tables :
- `workflow_steps_new`
- `workflow_transitions`

Dès qu'une modification est détectée, le workflow concerné est automatiquement synchronisé.

## Workflows concernés

Tous les workflows du système sont synchronisés :

1. **WF_REST_01** - Demandes de Restauration (11 étapes)
2. **WF_REPRO_01** - Demandes de Reproduction
3. **WF_VISIT_01** - Réservation de Visites
4. **WF_CULT_01** - Réservation Espaces Culturels
5. **WF_DL_01** - Dépôt Légal
6. **WF_CAT_01** - Catalogage
7. **WF_GED_01** - Archivage GED
8. **WF_CBM_01** - CBM (Catalogue Bibliographique Marocain)
9. **WF_PAY_01** - e-Payment
10. **WF_PUB_01** - Publication de contenu
11. **WF_STAT_01** - Reporting et Statistiques

## Workflow de Restauration - Détails

Le workflow de restauration a été synchronisé avec 11 étapes complètes :

1. Demande soumise
2. En attente autorisation
3. Autorisée
4. Œuvre reçue
5. Diagnostic
6. Devis en attente
7. Devis accepté
8. Paiement validé
9. Restauration en cours
10. Terminée
11. Clôturée

Ces étapes correspondent exactement à celles utilisées dans :
- `RestorationWorkflowStepper.tsx` (affichage visuel)
- `RestorationWorkflowDialog.tsx` (actions de workflow)
- Page `/admin/restoration-requests` (gestion des demandes)

## Ajout d'un nouveau workflow

### Via l'interface (recommandé)

1. Allez sur `/admin/workflow-bpm` → onglet "Modèles"
2. Créez votre workflow via l'interface graphique
3. Le workflow sera automatiquement synchronisé vers le JSON

### Via le fichier JSON

1. Ajoutez votre workflow dans `src/data/predefinedWorkflowModels.json`
2. Allez sur `/admin/workflow-bpm` → onglet "Modèles Prédéfinis"
3. Cliquez sur "Sync JSON → BD"

## Modification d'un workflow existant

### Via l'éditeur BPM

1. Allez sur `/admin/workflow-bpm` → onglet "Modèles"
2. Cliquez sur le workflow à modifier
3. Modifiez les étapes, transitions, etc.
4. Les modifications sont automatiquement synchronisées vers le JSON

### Via le fichier JSON

1. Modifiez `src/data/predefinedWorkflowModels.json`
2. Synchronisez via l'interface "Modèles Prédéfinis"

## Format du fichier JSON

```json
{
  "code": "WF_REST_01",
  "name": "Workflow Demandes de Restauration",
  "module": "restoration",
  "workflow_type": "restoration",
  "version": "1.0",
  "description": "Description complète...",
  "color": "indigo",
  "steps": [
    {
      "order": 1,
      "name": "Demande soumise",
      "type": "creation",
      "required_role": "Utilisateur",
      "description": "Description de l'étape"
    }
  ],
  "transitions": [
    {
      "name": "Soumettre la demande",
      "from_step": 0,
      "to_step": 1,
      "trigger_type": "manual",
      "action": "Soumettre"
    }
  ],
  "roles": [
    {
      "name": "Utilisateur",
      "level": "module"
    }
  ]
}
```

## Indicateurs de synchronisation

### Interface utilisateur

- **Badge orange** : Modifications détectées non synchronisées
- **Badge vert** : Tout est synchronisé
- **Timestamp** : Dernière synchronisation effectuée

### Console

```
Workflow step changed: { new: {...}, old: {...} }
Workflow model built: { code: "WF_REST_01", ... }
```

## Dépannage

### Les modifications ne se synchronisent pas

1. Vérifiez que le workflow existe dans la base de données
2. Vérifiez les logs de la console pour les erreurs
3. Essayez une synchronisation manuelle via l'interface

### Erreur "No confident match found"

1. Le workflow n'existe pas dans le JSON
2. Utilisez "Sync BD → JSON" pour créer l'entrée

### Conflit de version

1. Comparez les versions dans la BD et le JSON
2. Résolvez manuellement les conflits
3. Relancez la synchronisation

## Bonnes pratiques

1. **Toujours tester** les modifications en dev avant production
2. **Utiliser l'interface BPM** plutôt que modifier le JSON manuellement
3. **Documenter** les changements majeurs de workflow
4. **Versionner** les workflows (incrémenter la version)
5. **Synchroniser régulièrement** pour éviter les divergences

## Limitations actuelles

1. La synchronisation BD → JSON affiche un toast mais ne modifie pas encore physiquement le fichier JSON (nécessite une API backend)
2. Les workflows supprimés de la BD ne sont pas automatiquement retirés du JSON
3. Les conflits de version nécessitent une résolution manuelle

## Évolutions futures

1. Synchronisation physique du fichier JSON via API
2. Gestion des conflits de version automatique
3. Historique des synchronisations
4. Rollback automatique en cas d'erreur
5. Export/Import de workflows entre environnements
