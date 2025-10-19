# Logging Cleanup - Production Security

## Objectif
Supprimer les logs de debug en production pour :
- Éviter les fuites d'informations sensibles
- Améliorer les performances
- Réduire le bruit dans les logs

## Système de logging

Utiliser `src/lib/logger.ts` :

```typescript
import { log } from '@/lib/logger';

// Logs uniquement en développement
log.log('User action:', action);
log.error('Error occurred:', error);
log.warn('Deprecated feature used');
```

## Logs supprimés (sensibles/bruyants)

Les logs suivants ont été **supprimés** car ils contiennent des informations sensibles :
- Credentials de connexion (LegalDepositDeclaration.tsx ligne 3186)
- Données de formulaire contenant potentiellement des informations personnelles
- Messages de chat avec l'utilisateur
- Détails de paiement

## Logs conservés avec log.error()

Les erreurs techniques importantes sont conservées en développement uniquement :
- Erreurs de chargement de données
- Erreurs de mise à jour de base de données
- Erreurs d'API Supabase
- Erreurs de validation

## Convention

- **NE PAS** logger : credentials, données personnelles, messages utilisateur
- **LOGGER en DEV** : erreurs techniques, états de workflow, debug général
- **Toujours** utiliser `log.*()` au lieu de `console.*()` pour tout nouveau code
