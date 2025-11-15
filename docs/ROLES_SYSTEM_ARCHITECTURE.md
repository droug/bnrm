# Architecture du Système de Rôles BNRM

**Version**: 2.0  
**Date**: 2025-11-15

---

## 📐 Vue d'Ensemble

Le système BNRM utilise **DEUX systèmes de rôles complémentaires** :

### 1. Rôles Système (`user_roles` table + enum)
**Objectif**: Contrôle d'accès principal et Row Level Security (RLS)

- **Type**: Enum PostgreSQL `user_role` (16 valeurs fixes)
- **Table**: `user_roles`
- **Usage**: Authentification, autorisation globale, RLS policies
- **Configuration**: `src/config/validSystemRoles.ts`
- **Hooks**: `useUserRoles`, `useSecureRoles`, `useAccessControl`

### 2. Rôles Workflow (`workflow_roles` table)
**Objectif**: Gestion fine des processus métier

- **Type**: TEXT libre (54+ rôles définis)
- **Table**: `workflow_roles` + `workflow_user_roles` (liaison)
- **Usage**: Étapes de workflow, transitions, permissions granulaires
- **Configuration**: `src/config/workflowRoles.ts`
- **Composants**: `WorkflowRolesManager`, `RoleTransitionsMatrix`

---

## 🔐 Rôles Système (16 valeurs)

### Enum PostgreSQL

```sql
CREATE TYPE public.user_role AS ENUM (
  'admin',
  'librarian',
  'researcher',
  'visitor',
  'public_user',
  'subscriber',
  'partner',
  'producer',
  'editor',
  'printer',
  'distributor',
  'author',
  'dac',
  'comptable',
  'direction',
  'read_only'
);
```

### Catégories

#### 👔 Administration (5 rôles)
| Rôle | Description | Accès |
|------|-------------|-------|
| `admin` | Administrateur système | Complet |
| `librarian` | Bibliothécaire | Catalogues, manuscrits |
| `direction` | Direction BNRM | Approbations, décisions |
| `dac` | Direction Affaires Culturelles | Validation culturelle |
| `comptable` | Comptabilité | Gestion financière |

#### 👥 Utilisateurs (5 rôles)
| Rôle | Description | Limites |
|------|-------------|---------|
| `visitor` | Visiteur | Lecture publique uniquement |
| `public_user` | Grand public inscrit | 5 requêtes/jour |
| `subscriber` | Abonné premium | 100 requêtes, téléchargements |
| `researcher` | Chercheur | 50 requêtes, reproductions |
| `partner` | Partenaire institutionnel | 200 requêtes, prioritaire |

#### 📚 Professionnels Chaîne du Livre (5 rôles)
| Rôle | Description | Usage |
|------|-------------|-------|
| `author` | Auteur/Écrivain | Dépôt légal |
| `editor` | Éditeur | Dépôt légal, ISBN |
| `printer` | Imprimeur | Production |
| `producer` | Producteur de contenu | Dépôt légal |
| `distributor` | Distributeur | Distribution |

#### 🔧 Autres (1 rôle)
| Rôle | Description |
|------|-------------|
| `read_only` | Lecture seule système |

---

## 🔄 Rôles Workflow (54 rôles)

### Par Module

#### 1️⃣ Dépôt Légal
```typescript
- Auteur/Éditeur (user)
- Agent Dépôt Légal (module)
- Validateur BN (module)
- dl_validator (module - technique)
```

#### 2️⃣ Catalogage
```typescript
- Catalogueur (module)
- Responsable Validation (module)
```

#### 3️⃣ GED (Gestion Électronique Documents)
```typescript
- Agent Numérisation (module)
- Contrôleur Qualité (module)
- Responsable GED (module)
- Archiviste GED (system)
- ged_controller (module - technique)
```

#### 4️⃣ CBM (Catalogue Bibliographique Marocain)
```typescript
- Bibliothèque Partenaire (user)
- Coordinateur CBM (module)
- Coordinateur CBM Adhésions (module)
- Administrateur CBM (admin)
- cbm_coordinator (module - technique)
```

#### 5️⃣ Inscriptions
```typescript
- Agent Inscription (module)
- Responsable Service (module)
```

#### 6️⃣ Restauration
```typescript
- Gestionnaire Restauration (module)
- Expert Restauration (module)
- Restaurateur (module)
```

#### 7️⃣ Reproduction
```typescript
- Agent Reproduction (module)
- Technicien Reproduction (module)
```

#### 8️⃣ Activités Culturelles
```typescript
- Gestionnaire Activités Culturelles (module)
- Département Action Culturelle (module)
- Gestionnaire Visites (module)
- Guide (user)
- Gestionnaire Espaces (module)
```

#### 9️⃣ Administration
```typescript
- Administrateur BNRM (admin)
- Direction BNRM (admin)
- DAC (admin)
- Bureau d'ordre (module)
- Service Financier (module)
- Service Comptabilité (module)
- Gestionnaire Financier (module)
- Responsable e-Payment (module)
- payment_validator (module - technique)
```

#### 🔟 Système Workflow
```typescript
- workflow_admin (system)
- workflow_manager (system)
```

---

## 📊 Tables de Base de Données

### user_roles
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role user_role NOT NULL,  -- ENUM
  granted_by UUID,
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

### workflow_roles
```sql
CREATE TABLE workflow_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL,  -- Texte libre
  module TEXT NOT NULL,
  role_level TEXT,  -- 'system', 'admin', 'module', 'user'
  description TEXT,
  permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### workflow_user_roles (liaison)
```sql
CREATE TABLE workflow_user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  workflow_role_id UUID REFERENCES workflow_roles(id),
  context_type TEXT,  -- Ex: 'deposit_request', 'catalog_entry'
  context_id UUID,
  granted_by UUID,
  granted_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

---

## 🎯 Quand Utiliser Quel Système ?

### Utiliser `user_roles` (enum) quand :
✅ Contrôle d'accès global (peut voir/éditer/supprimer)  
✅ RLS policies Supabase  
✅ Vérification de rôle simple (`isAdmin`, `isLibrarian`)  
✅ Restrictions par type d'utilisateur (visiteur, abonné, etc.)  

**Exemple** :
```typescript
// Hook useSecureRoles
const { isAdmin, isLibrarian, hasRole } = useSecureRoles();

if (!isAdmin) {
  return <Navigate to="/unauthorized" />;
}
```

### Utiliser `workflow_roles` quand :
✅ Gestion d'étapes de workflow  
✅ Transitions entre états  
✅ Permissions contextuelles (valider CETTE demande)  
✅ Rôles temporaires liés à un processus  

**Exemple** :
```typescript
// Vérifier si l'utilisateur peut valider cette étape
const canValidateStep = await checkWorkflowPermission(
  userId,
  'Validateur BN',
  depositRequestId
);
```

---

## 🔧 Fichiers de Configuration

### Rôles Système
```
src/config/validSystemRoles.ts
  ├─ VALID_SYSTEM_ROLES (16 valeurs)
  ├─ SYSTEM_ROLES_OPTIONS (avec labels FR)
  ├─ getSystemRoleLabel()
  ├─ isValidSystemRole()
  └─ ADMIN_ROLES, USER_ROLES, PROFESSIONAL_ROLES
```

### Rôles Workflow
```
src/config/workflowRoles.ts
  ├─ LEGAL_DEPOSIT_WORKFLOW_ROLES
  ├─ CATALOGING_WORKFLOW_ROLES
  ├─ GED_WORKFLOW_ROLES
  ├─ CBM_WORKFLOW_ROLES
  ├─ ALL_WORKFLOW_ROLES (54 rôles)
  ├─ getWorkflowRolesByModule()
  ├─ findWorkflowRole()
  └─ getAvailableModules()
```

### Politiques d'Accès
```
src/config/accessPolicies.ts
  ├─ ACCESS_MATRIX (rôle → niveaux d'accès)
  ├─ ROLE_LIMITS (quotas par rôle)
  ├─ canAccessContent()
  ├─ canDownload()
  └─ canRequestReproduction()
```

---

## 🛡️ Sécurité

### RLS Policies avec user_roles

```sql
-- Fonction sécurisée pour vérifier les rôles
CREATE FUNCTION has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id 
    AND role = _role
    AND (expires_at IS NULL OR expires_at > NOW())
  )
$$;

-- Policy utilisant la fonction
CREATE POLICY "Admins can view all"
ON profiles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));
```

### ⚠️ Avertissements Sécurité

❌ **NE JAMAIS** :
- Stocker les rôles dans `profiles.role` (attaque escalade privilèges)
- Vérifier les rôles avec localStorage/sessionStorage
- Utiliser `as any` lors de l'insertion de rôles
- Mélanger user_roles et workflow_roles dans les RLS

✅ **TOUJOURS** :
- Utiliser la table `user_roles` séparée
- Valider les rôles côté serveur (SECURITY DEFINER)
- Vérifier les expirations (`expires_at`)
- Logger les changements de rôles

---

## 🚀 Utilisation dans le Code

### Hook: useUserRoles (Rôles Système)

```typescript
import { useUserRoles } from '@/hooks/useUserRoles';

function MyComponent() {
  const { 
    roles,           // Liste des rôles de l'utilisateur
    hasRole,         // Vérifier un rôle
    isAdmin,         // Shortcut
    getPrimaryRole,  // Rôle principal
    grantRole,       // Attribuer (admin only)
    revokeRole,      // Révoquer (admin only)
    loading 
  } = useUserRoles();

  if (loading) return <Spinner />;

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {hasRole('librarian') && <CatalogManager />}
    </div>
  );
}
```

### Hook: useSecureRoles (Raccourcis)

```typescript
import { useSecureRoles } from '@/hooks/useSecureRoles';

function ProtectedPage() {
  const { 
    isAdmin,
    isLibrarian,
    isProfessional,  // editor | printer | producer | distributor
    isPartner,
    isResearcher,
    isSubscriber,
    hasAnyRole,
    hasAllRoles,
    loading 
  } = useSecureRoles();

  if (!isAdmin && !isLibrarian) {
    return <Navigate to="/unauthorized" />;
  }

  return <AdminDashboard />;
}
```

### Hook: useAccessControl (Politiques)

```typescript
import { useAccessControl } from '@/hooks/useAccessControl';

function DocumentViewer({ document }) {
  const {
    userRole,              // Rôle principal
    checkAccess,           // Vérifier accès au contenu
    checkDownload,         // Peut télécharger ?
    checkReproduction,     // Peut reproduire ?
    checkAdvancedSearch,   // Recherche avancée ?
    isAuthenticated
  } = useAccessControl();

  const { allowed, message } = checkAccess(document.access_level);

  if (!allowed) {
    return <Alert>{message}</Alert>;
  }

  return (
    <div>
      <Document content={document} />
      {checkDownload() && <DownloadButton />}
    </div>
  );
}
```

### Composant: WorkflowRoleManager (À créer)

```typescript
// TODO: Créer ce composant
import { WorkflowRoleManager } from '@/components/roles/WorkflowRoleManager';

function UserManagement() {
  return (
    <WorkflowRoleManager 
      userId={selectedUserId}
      module="legal_deposit"
      onRoleAssign={handleAssign}
      onRoleRevoke={handleRevoke}
    />
  );
}
```

---

## 📝 Checklist Migration

### ✅ Fait
- [x] Créé `validSystemRoles.ts` avec 16 rôles valides
- [x] Créé `workflowRoles.ts` avec 54 rôles workflow
- [x] Créé audit complet `AUDIT_ROLES_PERMISSIONS.md`
- [x] Corrigé `UserManagement.tsx` validation
- [x] Documenté architecture complète

### ⚠️ En Cours
- [ ] Créer composant `WorkflowRoleManager`
- [ ] Créer page `/admin/workflow-roles`
- [ ] Ajouter validation `SimpleSelect` pour rôles invalides

### 🔜 À Faire
- [ ] Migration SQL pour nettoyer données invalides
- [ ] Tests unitaires validation rôles
- [ ] Documentation utilisateur final
- [ ] Formation équipe admin

---

## 🔗 Liens Utiles

- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Guide Sécurité BNRM](./SECURITY_ROLES_GUIDE.md)
- [Guide Authentification](./AUTHENTIFICATION_ET_PERMISSIONS.md)
- [Audit Système](./AUDIT_ROLES_PERMISSIONS.md)

---

**Dernière mise à jour**: 2025-11-15  
**Responsable**: Équipe Architecture BNRM
