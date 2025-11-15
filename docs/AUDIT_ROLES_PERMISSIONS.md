# Audit du Système de Rôles et Permissions BNRM

**Date**: 2025-11-15  
**Statut**: ⚠️ Incohérences détectées

## 📊 Vue d'ensemble

Le système BNRM utilise **deux systèmes de rôles parallèles** :

### 1. Système de Rôles Principaux (`user_roles`)
- **Table**: `user_roles`
- **Type**: Enum PostgreSQL `user_role`
- **Usage**: Contrôle d'accès principal, RLS policies
- **Gestion**: Via hooks `useUserRoles`, `useSecureRoles`, `useAccessControl`

### 2. Système de Rôles Workflows (`workflow_roles`)
- **Table**: `workflow_roles`
- **Type**: Texte libre
- **Usage**: Gestion des étapes et transitions de workflows
- **Liaison**: Via `workflow_user_roles`

---

## 🚨 Incohérences Critiques Identifiées

### Problème 1: Enum `user_role` incomplet

**Enum actuel** (16 valeurs):
```sql
'admin', 'librarian', 'researcher', 'visitor', 'public_user', 
'subscriber', 'partner', 'producer', 'editor', 'printer', 
'distributor', 'author', 'dac', 'comptable', 'direction', 'read_only'
```

**Rôles définis dans `completeSystemRoles.ts`** (50+ rôles):
- Administrateur Système
- Agent Inscription
- Responsable Inscriptions
- Inscrit - Étudiant
- Adhérent - Chercheur
- Adhérent - Premium
- Catalogueur
- ... et 40+ autres

❌ **Impact**: Le code tente d'insérer des rôles inexistants dans l'enum, causant des erreurs SQL.

---

### Problème 2: Tables de permissions mal utilisées

#### Tables existantes:
1. **`permissions`** (permissions système) → 5 entrées
2. **`workflow_permissions`** (permissions workflow) → 20 entrées
3. **`role_permissions`** (lie user_role ↔ permissions)
4. **`workflow_role_permissions`** (lie workflow_roles ↔ workflow_permissions)
5. **`user_permissions`** (permissions individuelles par utilisateur)

#### Problème:
- ❌ Le code `UserManagement.tsx` modifie `user_roles` directement sans vérifier `role_permissions`
- ❌ Aucun hook ne valide les permissions avant assignation
- ❌ Le hook `usePermissions` utilise une RPC `get_user_permissions` non documentée

---

### Problème 3: Confusion rôles internes vs externes

Le fichier `RolesList.tsx` définit:
```typescript
role_type: 'internal' | 'external'
```

Mais cette distinction n'existe pas dans les tables de base de données.

---

### Problème 4: Rôles workflow non liés aux utilisateurs

**Workflow Roles détectés** (20+):
- workflow_admin
- dl_validator (Dépôt Légal)
- cbm_coordinator (CBM)
- ged_controller (GED)
- payment_validator
- Auteur/Éditeur
- Agent Dépôt Légal
- Catalogueur
- Bibliothèque Partenaire
- ...

❌ **Problème**: Ces rôles existent dans `workflow_roles` mais ne sont pas assignés via l'interface `/admin/users`

---

## 📋 Architecture des Tables

### user_roles
```
id          | uuid
user_id     | uuid (FK → auth.users)
role        | user_role (enum)
granted_by  | uuid
granted_at  | timestamp
expires_at  | timestamp
```

### workflow_roles
```
id          | uuid
role_name   | text (libre)
module      | text
role_level  | text
description | text
permissions | jsonb
created_at  | timestamp
updated_at  | timestamp
```

### workflow_user_roles
```
id                | uuid
user_id           | uuid
workflow_role_id  | uuid (FK → workflow_roles)
context_type      | text
context_id        | uuid
granted_by        | uuid
granted_at        | timestamp
expires_at        | timestamp
is_active         | boolean
created_at        | timestamp
```

---

## ✅ Recommandations

### Solution 1: Unifier les systèmes de rôles

**Option A** (recommandée): Utiliser uniquement `workflow_roles` pour tout
- ✅ Plus flexible
- ✅ Supporte tous les rôles définis
- ✅ Permet la hiérarchie (role_level: system/admin/module/user)
- ❌ Nécessite migration des RLS policies

**Option B**: Étendre l'enum `user_role`
- ✅ Garde la compatibilité RLS
- ❌ Nécessite migration SQL pour chaque nouveau rôle
- ❌ Limite à ~60 valeurs d'enum

### Solution 2: Corriger `UserManagement.tsx`

**Problème actuel**:
```typescript
await supabase
  .from('user_roles')
  .insert({
    user_id: userProfile.user_id,
    role: newRole as any, // ❌ Pas de validation
    granted_by: currentUser.id,
  });
```

**Solution**:
```typescript
// 1. Valider que le rôle existe dans l'enum
const validRoles: UserRole[] = [
  'admin', 'librarian', 'researcher', 'visitor', 
  'public_user', 'subscriber', 'partner'
];

if (!validRoles.includes(newRole as UserRole)) {
  throw new Error(`Rôle invalide: ${newRole}`);
}

// 2. Vérifier les permissions de l'utilisateur actuel
const canAssignRole = await checkCanAssignRole(currentUser.id, newRole);

// 3. Insérer avec validation
await supabase.from('user_roles').insert({...});
```

### Solution 3: Créer des composants de sélection adaptés

**Pour rôles système** (`user_roles`):
```typescript
<SimpleSelect
  options={VALID_USER_ROLES} // Uniquement les 16 valeurs de l'enum
  value={userRole}
  onChange={handleSystemRoleChange}
/>
```

**Pour rôles workflow** (`workflow_roles`):
```typescript
<WorkflowRoleSelector
  userId={userId}
  module={selectedModule}
  availableRoles={workflowRoles}
  assignedRoles={userWorkflowRoles}
  onAssign={handleWorkflowRoleAssign}
/>
```

### Solution 4: Créer une RPC pour validation

```sql
CREATE OR REPLACE FUNCTION assign_user_role(
  target_user_id UUID,
  new_role user_role,
  assigner_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que l'assigner a la permission
  IF NOT has_role(assigner_id, 'admin') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Supprimer l'ancien rôle
  DELETE FROM user_roles WHERE user_id = target_user_id;

  -- Insérer le nouveau
  INSERT INTO user_roles (user_id, role, granted_by)
  VALUES (target_user_id, new_role, assigner_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔧 Actions Immédiates Requises

### Haute Priorité
1. ✅ **Documenter l'enum `user_role`** exact dans `src/integrations/supabase/types.ts`
2. ✅ **Créer `src/config/validSystemRoles.ts`** avec uniquement les 16 rôles valides
3. ✅ **Mettre à jour `UserManagement.tsx`** pour utiliser cette liste
4. ✅ **Créer une RPC `assign_user_role`** pour validation côté serveur

### Moyenne Priorité
5. ⚠️ Créer un composant `WorkflowRoleManager` pour gérer `workflow_roles`
6. ⚠️ Ajouter validation dans `SimpleSelect` pour rejeter rôles invalides
7. ⚠️ Documenter la différence entre user_roles et workflow_roles

### Basse Priorité
8. 📝 Nettoyer `completeSystemRoles.ts` ou le renommer en `workflowRoles.ts`
9. 📝 Créer une page dédiée `/admin/workflow-roles`
10. 📝 Ajouter des tests de validation des rôles

---

## 📌 Mapping Actuel

### Rôles Système (user_roles) → Permissions
```
admin       → Full access
librarian   → Catalog management, viewing
researcher  → Advanced search, reproductions
subscriber  → Premium features
partner     → Institutional access
public_user → Basic access
visitor     → Limited viewing
```

### Rôles Workflow Principaux
```
Dépôt Légal:
  - Auteur/Éditeur
  - Agent Dépôt Légal
  - Validateur BN
  - Archiviste GED

Catalogage:
  - Catalogueur
  - Responsable Validation
  - Administrateur BNRM

CBM:
  - Bibliothèque Partenaire
  - Coordinateur CBM
  - Formateur

Inscriptions:
  - Agent Inscription
  - Responsable Inscriptions

Adhésions:
  - Gestionnaire Adhésions
  - Responsable Adhésions
```

---

## 🔍 Fichiers à Auditer

### Hooks de rôles
- ✅ `src/hooks/useUserRoles.tsx` (user_roles)
- ✅ `src/hooks/useSecureRoles.tsx` (user_roles)
- ✅ `src/hooks/useAccessControl.tsx` (user_roles)
- ⚠️ `src/hooks/usePermissions.tsx` (RPC non documentée)

### Composants de gestion
- ⚠️ `src/pages/UserManagement.tsx` (assigne user_roles)
- ✅ `src/pages/admin/RolesManagement.tsx` (UI principale)
- ⚠️ `src/components/roles/RolesList.tsx` (données statiques)
- ⚠️ `src/components/roles/RolePermissionsMatrix.tsx`

### Configuration
- ⚠️ `src/config/completeSystemRoles.ts` (50+ rôles non dans enum)
- ⚠️ `src/config/accessPolicies.ts` (utilisé par useAccessControl)

---

## 📊 Statistiques

- **user_roles** (enum): 16 valeurs
- **workflow_roles** (table): 20+ entrées
- **completeSystemRoles.ts**: 50+ définitions
- **permissions**: 5 entrées
- **workflow_permissions**: 20 entrées

**Taux de cohérence**: ⚠️ ~40%

---

## 🎯 Conclusion

Le système BNRM utilise **deux systèmes de rôles parallèles** qui ne sont pas correctement intégrés:

1. **user_roles**: Pour l'authentification et RLS
2. **workflow_roles**: Pour les workflows métier

**Recommandation finale**: Garder les deux systèmes mais les **clarifier et les documenter**, en créant des interfaces distinctes pour chacun.
