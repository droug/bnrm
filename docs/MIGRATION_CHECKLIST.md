# Checklist de Migration des Formulaires

## Vue d'ensemble
Ce document liste les formulaires à migrer vers react-hook-form + zod avec leur statut.

## Statut de Migration

### ✅ Terminé

1. **BoxReservationDialog** (`src/components/bnrm/BoxReservationDialog.tsx`)
   - ✅ Schéma Zod créé (`boxReservationSchema`)
   - ✅ Migration vers react-hook-form
   - ✅ Validation des dates (fin > début)
   - ✅ Messages d'erreur en français
   - ✅ Calcul automatique durée/montant

### 🚧 En Cours

2. **ServiceRegistrationDialog** (`src/components/bnrm/ServiceRegistrationDialog.tsx`)
   - ✅ Schéma Zod créé (`serviceRegistrationSchema`)
   - ⏳ Migration en cours
   - ⏳ Validation conditionnelle (page-based services)

3. **LegalDepositDeclaration** (`src/components/LegalDepositDeclaration.tsx`)
   - ✅ Schémas Zod créés:
     - `monographDepositSchema`
     - `periodicalDepositSchema`
     - `databaseDepositSchema`
     - `issnRequestSchema`
   - ✅ Composants de sections créés:
     - `AuthorIdentification`
     - `DocumentsUpload`
   - ✅ Hook de validation créé (`useLegalDepositValidation`)
   - ⏳ **Nécessite découpage complet** (3852 lignes → sous-composants)
   - ⏳ Règles dynamiques:
     - ✅ Type auteur (personne physique/morale)
     - ✅ Type publication (thèse/coran)
     - ✅ Éditeur Amazon
     - ⏳ Migration du code principal

### ⏸️ En Attente

4. **BNRMServices** (`src/components/bnrm/BNRMServices.tsx`)
   - ✅ Schémas créés (`bnrmServiceSchema`, `bnrmTariffSchema`)
   - ⏸️ Formulaire de création/édition de service à migrer
   - ⏸️ Formulaire de gestion des tarifs à migrer

5. **LegalDepositBackoffice** (`src/components/LegalDepositBackoffice.tsx`)
   - ⏸️ Schéma à créer pour formulaires d'édition
   - ⏸️ Formulaires inline à identifier et migrer

## Règles Métiers à Implémenter

### Dépôt Légal

#### Type de Publication
- [x] **Thèse** → Pièce "Recommandation" obligatoire
  - Affichage conditionnel ✓
  - Validation ✓
  - Message d'erreur ✓
  
- [x] **Coran** → "Autorisation Fondation Mohammed VI" obligatoire
  - Affichage conditionnel ✓
  - Validation ✓
  - Message d'erreur ✓

#### Type d'Auteur
- [x] **Personne morale** → Champ "Statut" obligatoire
  - Options: Étatique / Non étatique ✓
  - Affichage conditionnel ✓
  - Validation ✓
  
- [x] **Personne physique** → Champs "Genre" + "Date de naissance" obligatoires
  - Genre: Homme / Femme ✓
  - Date de naissance ✓
  - Affichage conditionnel ✓
  - Validation ✓

#### Éditeur
- [x] **Amazon** → Lien produit Amazon obligatoire
  - Affichage conditionnel ✓
  - Validation URL ✓
  - Validation domaine amazon.* ✓

### Services BNRM

#### Réservation Box
- [x] Dates début/fin obligatoires ✓
- [x] Date fin > Date début ✓
- [x] Calcul automatique durée ✓
- [x] Calcul automatique montant ✓

#### Inscription Service
- [ ] Validation manuscriptId pour services de reproduction
- [ ] Validation pageCount pour services facturés à la page
- [ ] Abonnement mensuel vs annuel

## Prochaines Étapes

### Court Terme (Priorité Haute)

1. **Terminer ServiceRegistrationDialog**
   - Ajouter validation conditionnelle pour manuscriptId
   - Ajouter validation pour pageCount
   - Tester tous les scénarios

2. **Découper LegalDepositDeclaration**
   - Créer `PublicationIdentification.tsx`
   - Créer `PublisherIdentification.tsx`
   - Créer `PrinterIdentification.tsx`
   - Créer composant principal orchestrateur
   - Migrer la logique de soumission

3. **Tester les règles dynamiques**
   - Scénario: Thèse sans recommandation
   - Scénario: Coran sans autorisation
   - Scénario: Personne morale sans statut
   - Scénario: Personne physique sans genre/date
   - Scénario: Amazon sans lien

### Moyen Terme (Priorité Moyenne)

4. **Migrer BNRMServices**
   - Formulaire service (création/édition)
   - Formulaire tarif (ajout/modification)
   - Validation ID uniques

5. **Migrer LegalDepositBackoffice**
   - Identifier tous les formulaires inline
   - Créer schémas pour chacun
   - Migrer progressivement

### Long Terme (Amélioration Continue)

6. **Tests automatisés**
   - Tests unitaires pour schémas Zod
   - Tests d'intégration pour formulaires
   - Tests E2E pour workflows complets

7. **Documentation utilisateur**
   - Guide d'utilisation des formulaires
   - FAQ sur les règles de validation
   - Vidéos tutoriels

## Critères de Validation (DoD)

Pour chaque formulaire migré:

- ✅ Schéma Zod créé et documenté
- ✅ Migration vers react-hook-form complète
- ✅ Tous les champs obligatoires validés
- ✅ Règles conditionnelles implémentées
- ✅ Messages d'erreur en français
- ✅ Focus automatique sur erreurs
- ✅ UX: champs invalides visuellement identifiés
- ✅ Pas de console.log en production (logger uniquement)
- ✅ Tests manuels effectués
- ✅ Pas de régression visuelle

## Notes Techniques

### Pattern pour Validation Conditionnelle

```tsx
// Dans le schéma
.refine(
  (data) => {
    if (condition && !data.requiredField) {
      return false;
    }
    return true;
  },
  {
    message: 'Message d\'erreur spécifique',
    path: ['requiredField']
  }
)
```

### Pattern pour Affichage Conditionnel

```tsx
const fieldValue = form.watch('fieldName');

{fieldValue === 'specificValue' && (
  <FormField ... />
)}
```

### Pattern pour Validation Dynamique dans Hook

```tsx
useEffect(() => {
  if (shouldValidate) {
    const value = form.getValues('field');
    if (!value) {
      form.setError('field', {
        type: 'required',
        message: 'Message d\'erreur'
      });
    } else {
      form.clearErrors('field');
    }
  }
}, [shouldValidate, form]);
```
