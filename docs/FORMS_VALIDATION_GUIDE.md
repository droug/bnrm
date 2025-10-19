# Guide de Validation des Formulaires

## Vue d'ensemble

Tous les formulaires critiques du projet utilisent maintenant `react-hook-form` avec `zod` pour une validation robuste côté client et des règles métiers dynamiques.

## Architecture

### Schémas de Validation (`src/schemas/`)

Les schémas Zod définissent:
- Types TypeScript auto-générés
- Validation des champs (required, min, max, email, etc.)
- Règles conditionnelles (validation discriminée)
- Messages d'erreur personnalisés

**Fichiers de schémas:**
- `legalDepositSchema.ts` - Dépôt légal (monographies, périodiques, BD/logiciels)
- `bnrmServiceSchema.ts` - Services BNRM (inscriptions, réservations)

### Composants de Formulaire

#### Utilisation de `react-hook-form`

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mySchema, MyFormData } from '@/schemas/mySchema';

const form = useForm<MyFormData>({
  resolver: zodResolver(mySchema),
  defaultValues: {
    // valeurs par défaut
  },
});

const onSubmit = async (data: MyFormData) => {
  // Les données sont validées ici
  // Traitement...
};
```

#### Composants UI de Formulaire

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label *</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

## Règles Métiers Implémentées

### Dépôt Légal - Règles Dynamiques

#### 1. Type de Publication

**Thèse:**
- Document "Recommandation" **OBLIGATOIRE**
- Affichage conditionnel du champ de téléversement
- Validation bloque la soumission si absent

```tsx
const isThesisRecommendationRequired = publicationType === 'these';

// Dans le schéma:
.refine(
  (data) => {
    if (data.publication.publicationType === 'these' && !data.documents.thesisRecommendation) {
      return false;
    }
    return true;
  },
  { message: 'Recommandation obligatoire pour une thèse' }
)
```

**Coran:**
- "Autorisation Fondation Mohammed VI" **OBLIGATOIRE**
- Même logique conditionnelle

#### 2. Type d'Auteur

**Personne Morale:**
- Champ "Statut" **OBLIGATOIRE** (Étatique / Non étatique)
- Pas de genre ni date de naissance

```tsx
z.object({
  authorType: z.literal('morale'),
  status: z.enum(['etatique', 'non-etatique'], {
    required_error: 'Le statut est obligatoire pour une personne morale'
  }),
})
```

**Personne Physique:**
- Champ "Genre" **OBLIGATOIRE** (Homme / Femme)
- Champ "Date de naissance" **OBLIGATOIRE**
- Pas de statut

```tsx
z.object({
  authorType: z.literal('physique'),
  gender: z.enum(['homme', 'femme'], {
    required_error: 'Le genre est obligatoire pour une personne physique'
  }),
  birthDate: z.string().min(1, 'La date de naissance est obligatoire'),
})
```

#### 3. Éditeur Amazon

Lorsque l'éditeur sélectionné contient "Amazon":
- Champ "Lien du produit Amazon" apparaît
- **OBLIGATOIRE** et validé comme URL
- Validation du domaine amazon.*

### Services BNRM

#### Réservation de Box

- Dates de début/fin **OBLIGATOIRES**
- Date de fin > Date de début (validation automatique)
- Calcul automatique de la durée
- Calcul automatique du montant total

```tsx
.refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['endDate']
  }
)
```

## Composants Réutilisables

### Sections de Formulaire (`src/components/legal-deposit/form-sections/`)

**AuthorIdentification.tsx:**
- Identification de l'auteur avec champs conditionnels
- Intégration complète avec react-hook-form
- Gestion automatique de la validation

**DocumentsUpload.tsx:**
- Téléversement de documents avec validation
- Affichage conditionnel selon type de publication
- Gestion des types de fichiers et tailles

**Exemple d'utilisation:**
```tsx
import { AuthorIdentification } from '@/components/legal-deposit/form-sections/AuthorIdentification';

<AuthorIdentification 
  form={form}
  selectedRegion={selectedRegion}
  setSelectedRegion={setSelectedRegion}
/>
```

## UX - Messages d'Erreur

### Affichage des Erreurs

- Erreurs sous chaque champ avec `<FormMessage />`
- Focus automatique sur le premier champ invalide
- Messages personnalisés en français
- Indication visuelle (bordure rouge, icône)

### Exemples de Messages

```tsx
// Champ obligatoire
z.string().min(1, 'Le nom est obligatoire')

// Email invalide
z.string().email('Email invalide')

// Nombre minimum
z.number().min(1, 'Le nombre de pages est obligatoire')

// Énumération
z.enum(['homme', 'femme'], {
  required_error: 'Le genre est obligatoire'
})
```

## Migration des Formulaires Existants

### Étapes de Migration

1. **Créer le schéma Zod**
   ```tsx
   // src/schemas/myFormSchema.ts
   export const myFormSchema = z.object({
     field1: z.string().min(1, 'Champ obligatoire'),
     // ...
   });
   export type MyFormData = z.infer<typeof myFormSchema>;
   ```

2. **Migrer le composant**
   ```tsx
   // Remplacer useState par useForm
   const form = useForm<MyFormData>({
     resolver: zodResolver(myFormSchema),
     defaultValues: { /* ... */ },
   });
   
   // Remplacer la soumission manuelle
   const onSubmit = async (data: MyFormData) => {
     // data est déjà validé
   };
   ```

3. **Mettre à jour le JSX**
   ```tsx
   <Form {...form}>
     <form onSubmit={form.handleSubmit(onSubmit)}>
       <FormField ... />
     </form>
   </Form>
   ```

### Composants Prioritaires à Migrer

- [x] `BoxReservationDialog.tsx` - TERMINÉ
- [ ] `ServiceRegistrationDialog.tsx` - EN COURS
- [ ] `LegalDepositDeclaration.tsx` - À DÉCOUPER et MIGRER
- [ ] `BNRMServices.tsx` - Service/Tarif forms
- [ ] `LegalDepositBackoffice.tsx` - Formulaires d'édition

## Tests de Validation

### Scénarios à Tester

1. **Soumission vide** - Tous les champs obligatoires doivent afficher des erreurs
2. **Format invalide** - Email, URL, dates
3. **Règles conditionnelles:**
   - Thèse sans recommandation → bloqué
   - Coran sans autorisation → bloqué
   - Personne morale sans statut → bloqué
   - Personne physique sans genre/date → bloqué
   - Amazon sans lien → bloqué
4. **Dates invalides** - Date fin < Date début

### Validation Visuelle

- Focus sur premier champ invalide ✓
- Messages d'erreur clairs en français ✓
- Bordures rouges sur champs invalides ✓
- Désactivation du bouton pendant soumission ✓

## Bonnes Pratiques

1. **Toujours utiliser Zod pour la validation**
2. **Créer des schémas réutilisables** dans `src/schemas/`
3. **Décomposer les gros formulaires** en sous-composants
4. **Utiliser `watch()`** pour les champs conditionnels
5. **Messages d'erreur en français** et spécifiques
6. **Gérer le loading state** pendant la soumission
7. **Reset du formulaire** après succès
8. **Focus automatique** sur erreurs

## Ressources

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Shadcn Form Components](https://ui.shadcn.com/docs/components/form)
