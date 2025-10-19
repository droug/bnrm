# Guide de Sécurité - Gestion des Rôles

## ⚠️ CRITIQUE : Utiliser UNIQUEMENT la table user_roles

### ❌ NE JAMAIS FAIRE

```tsx
// DANGEREUX : profile.role peut être manipulé côté client
const { profile } = useAuth();
if (profile?.role === 'admin') {
  // Code sensible
}
```

### ✅ TOUJOURS FAIRE

```tsx
// SÉCURISÉ : Utilise la table user_roles avec RLS
import { useSecureRoles } from "@/hooks/useSecureRoles";

const { isAdmin, isLibrarian } = useSecureRoles();
if (isAdmin) {
  // Code sensible
}
```

## Hooks Disponibles

### 1. `useSecureRoles` - Vérifications de rôles simples

```tsx
const {
  isAdmin,
  isLibrarian,
  isProfessional,
  isPartner,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  loading
} = useSecureRoles();

// Exemples
if (isAdmin) { /* ... */ }
if (hasRole('editor')) { /* ... */ }
if (hasAnyRole(['admin', 'librarian'])) { /* ... */ }
```

### 2. `useAccessControl` - Contrôle d'accès granulaire

```tsx
const {
  userRole,
  checkAccess,
  checkDownload,
  isAdmin,
  isLibrarian,
  loading
} = useAccessControl();

// Vérifier l'accès à un contenu
const { allowed, message } = checkAccess('restricted');
```

### 3. `useUserRoles` - Gestion complète des rôles

```tsx
const {
  roles,
  hasRole,
  getPrimaryRole,
  grantRole,
  revokeRole,
  loading
} = useUserRoles();
```

## Protection des Routes

### Routes Admin/Librarian

```tsx
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";

export default function AdminPage() {
  const { user } = useAuth();
  const { isLibrarian, loading } = useSecureRoles();

  if (loading) return <Loader />;
  if (!user || !isLibrarian) {
    return <Navigate to="/" replace />;
  }

  return <AdminContent />;
}
```

### Routes Professionnelles

```tsx
export default function ProfessionalPage() {
  const { user } = useAuth();
  const { isProfessional, loading } = useSecureRoles();

  if (loading) return <Loader />;
  if (!user || !isProfessional) {
    return <Navigate to="/" replace />;
  }

  return <ProfessionalContent />;
}
```

## Architecture de Sécurité

### Table user_roles

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role user_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, role)
);
```

### Fonction de Sécurité (Security Definer)

```sql
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (expires_at IS NULL OR expires_at > NOW())
  );
$$;
```

### RLS Policies

```sql
-- Exemple de policy sécurisée
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));
```

## Migration du Code Existant

### Avant (Insécurisé)
```tsx
const { profile } = useAuth();
const canEdit = profile?.role === 'admin' || profile?.role === 'librarian';
```

### Après (Sécurisé)
```tsx
const { isLibrarian } = useSecureRoles();
const canEdit = isLibrarian;
```

## Checklist de Sécurité

- [ ] Aucune vérification de `profile.role` ou `profile?.role`
- [ ] Toutes les routes protégées utilisent `useSecureRoles` ou `useAccessControl`
- [ ] Pas de localStorage/sessionStorage pour les rôles
- [ ] Pas de rôles hardcodés dans le code
- [ ] Toutes les RLS policies utilisent `has_role()` ou `is_admin_or_librarian()`
- [ ] Les fonctions Edge Functions vérifient les rôles via Supabase
- [ ] Loading state géré pendant la récupération des rôles

## Bonnes Pratiques

1. **Toujours gérer le loading state**
   ```tsx
   const { isAdmin, loading } = useSecureRoles();
   if (loading) return <Loader />;
   ```

2. **Rediriger rapidement les non-autorisés**
   ```tsx
   if (!user || !isAdmin) return <Navigate to="/" replace />;
   ```

3. **Ne jamais exposer de données sensibles dans le client**
   - Les vérifications client sont pour l'UX
   - La sécurité réelle est dans les RLS policies

4. **Utiliser les fonctions security definer**
   - Évite les récursions RLS
   - Centralise la logique de vérification

## Erreurs Courantes à Éviter

❌ Vérifier les rôles avant le chargement
```tsx
const { isAdmin, loading } = useSecureRoles();
if (isAdmin) { /* BUG: isAdmin = false pendant loading */ }
```

✅ Gérer le loading correctement
```tsx
const { isAdmin, loading } = useSecureRoles();
if (loading) return <Loader />;
if (isAdmin) { /* Correct */ }
```

❌ Faire confiance au stockage local
```tsx
const role = localStorage.getItem('userRole'); // DANGEREUX
```

✅ Toujours interroger la base de données
```tsx
const { getPrimaryRole } = useSecureRoles(); // SÉCURISÉ
const role = getPrimaryRole();
```
