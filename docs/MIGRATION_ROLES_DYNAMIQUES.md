# Migration vers Rôles Dynamiques

**Date**: 2025-11-15  
**Version**: 2.0  
**Statut**: ✅ Complété

---

## 🎯 Objectif

Migrer tous les rôles système (sauf `admin`) depuis l'enum PostgreSQL vers des tables dynamiques, permettant:
- ✅ Ajout/modification de rôles sans migration SQL
- ✅ Gestion des permissions et limites par rôle
- ✅ Catégorisation des rôles
- ✅ Activation/désactivation dynamique

---

## 📊 Avant / Après

### AVANT
```
user_roles (table)
├─ user_id → auth.users
├─ role → user_role (enum 16 valeurs)
└─ granted_by, granted_at, expires_at

Problème: Enum rigide, nécessite migrations SQL
```

### APRÈS
```
🔴 ADMIN (reste dans enum)
user_roles (table)
├─ user_id → auth.users
├─ role = 'admin' (enum fixe)
└─ granted_by, granted_at, expires_at

🟢 AUTRES RÔLES (dynamiques)
system_roles (table) ← Définition des rôles
├─ role_code (UNIQUE)
├─ role_name, description
├─ role_category (administration/user/professional/internal)
├─ permissions (JSONB)
├─ limits (JSONB)
└─ is_active

user_system_roles (table) ← Attribution
├─ user_id → auth.users
├─ role_id → system_roles
└─ granted_by, granted_at, expires_at, is_active
```

---

## 🗂️ Nouvelles Tables

### system_roles
Définition de tous les rôles (sauf admin)

```sql
id              UUID PRIMARY KEY
role_code       TEXT UNIQUE    -- Ex: 'librarian', 'researcher'
role_name       TEXT           -- Ex: 'Bibliothécaire'
role_category   TEXT           -- 'administration' | 'user' | 'professional' | 'internal'
description     TEXT
is_active       BOOLEAN
permissions     JSONB          -- ["catalog.manage", "manuscripts.view"]
limits          JSONB          -- {"maxRequests": 999, "canDownload": true}
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### user_system_roles
Attribution des rôles aux utilisateurs

```sql
id              UUID PRIMARY KEY
user_id         UUID → auth.users
role_id         UUID → system_roles
granted_by      UUID → auth.users
granted_at      TIMESTAMP
expires_at      TIMESTAMP
is_active       BOOLEAN
UNIQUE(user_id, role_id)
```

---

## 🔧 Nouvelles Fonctions SQL

### 1. has_system_role(_user_id, _role_code)
Remplace `has_role` pour vérifier n'importe quel rôle

```sql
-- Vérifie admin dans user_roles OU autre rôle dans user_system_roles
SELECT has_system_role(auth.uid(), 'librarian');  -- TRUE/FALSE
SELECT has_system_role(auth.uid(), 'admin');       -- TRUE/FALSE (vérifie user_roles)
```

### 2. get_user_all_system_roles(_user_id)
Retourne tous les rôles actifs

```sql
SELECT * FROM get_user_all_system_roles(auth.uid());

-- Retourne:
role_id    | role_code  | role_name       | role_category   | granted_at | expires_at
-----------+------------+-----------------+-----------------+------------+-----------
uuid...    | admin      | Administrateur  | administration  | 2025-...   | null
uuid...    | librarian  | Bibliothécaire  | administration  | 2025-...   | null
```

### 3. get_user_primary_system_role(_user_id)
Retourne le rôle principal (plus haute priorité)

```sql
SELECT get_user_primary_system_role(auth.uid());
-- Retourne: 'admin' ou 'librarian' ou autre
```

### 4. is_admin_or_librarian(_user_id)
Fonction helper (inchangée, fonctionne avec le nouveau système)

```sql
SELECT is_admin_or_librarian(auth.uid());
-- Retourne: TRUE/FALSE
```

---

## 📝 Modifications du Code

### Nouveau Hook: useSystemRoles

```typescript
import { useSystemRoles } from '@/hooks/useSystemRoles';

function MyComponent() {
  const { 
    userRoles,         // Tous les rôles de l'utilisateur
    availableRoles,    // Tous les rôles système disponibles
    hasRole,           // Vérifier un rôle
    getPrimaryRole,    // Obtenir le rôle principal
    grantRole,         // Attribuer un rôle (admin only)
    revokeRole,        // Révoquer un rôle (admin only)
    getRoleDetails,    // Détails d'un rôle spécifique
    isAdmin,           // Shortcut pour admin
    loading
  } = useSystemRoles();

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {hasRole('librarian') && <CatalogPanel />}
      {availableRoles.map(role => (
        <RoleCard key={role.id} role={role} />
      ))}
    </div>
  );
}
```

### Assignation de Rôle dans UserManagement

```typescript
const updateUserRole = async (userId: string, newRoleCode: string) => {
  // Si admin → utiliser user_roles (enum)
  if (newRoleCode === 'admin') {
    // Supprimer system_roles
    await supabase.from('user_system_roles').delete()...
    // Ajouter dans user_roles
    await supabase.from('user_roles').insert({ role: 'admin' })...
  } else {
    // Trouver dans system_roles
    const systemRole = availableRoles.find(r => r.role_code === newRoleCode);
    // Supprimer admin
    await supabase.from('user_roles').delete()...
    // Ajouter dans user_system_roles
    await supabase.from('user_system_roles').insert({ role_id: systemRole.id })...
  }
};
```

---

## 🔐 Sécurité (RLS)

### system_roles
```sql
✅ SELECT: Tous peuvent voir les rôles actifs
✅ ALL: Seuls admins/librarians peuvent gérer
```

### user_system_roles
```sql
✅ SELECT: Utilisateurs voient leurs rôles OU admins voient tout
✅ INSERT/UPDATE/DELETE: Seuls admins/librarians
```

---

## 📦 15 Rôles Système Migrés

### Administration (4)
1. **librarian** - Bibliothécaire
2. **direction** - Direction BNRM  
3. **dac** - Direction Affaires Culturelles
4. **comptable** - Comptable

### Utilisateurs (5)
5. **visitor** - Visiteur
6. **public_user** - Grand Public
7. **subscriber** - Abonné Premium
8. **researcher** - Chercheur
9. **partner** - Partenaire Institutionnel

### Professionnels (5)
10. **author** - Auteur
11. **editor** - Éditeur
12. **printer** - Imprimeur
13. **producer** - Producteur
14. **distributor** - Distributeur

### Autres (1)
15. **read_only** - Lecture Seule

---

## ✅ Avantages

### 🚀 Flexibilité
- Ajout de rôles via l'interface admin (pas de migration SQL)
- Modification des permissions/limites en temps réel
- Activation/désactivation de rôles

### 🔒 Sécurité
- Admin protégé dans enum (ne peut pas être désactivé)
- RLS policies conservées et fonctionnelles
- Fonctions SECURITY DEFINER pour validation

### 📊 Granularité
- Permissions stockées en JSONB par rôle
- Limites configurables (maxRequests, canDownload, etc.)
- Catégorisation pour filtrage

---

## 🔄 Migration Automatique des Données

La migration a **automatiquement** copié:
- ✅ 3 utilisateurs avec rôles non-admin (producer, editor, printer)
- ✅ Leurs dates d'attribution (granted_at)
- ✅ Leurs dates d'expiration (expires_at)
- ✅ Attribution par (granted_by)

**Rôles admin** (7 utilisateurs) restent dans `user_roles` intacts.

---

## 🎨 Interface Admin Mise à Jour

### Page `/admin/users`
- ✅ Liste les 15 rôles dynamiques + admin
- ✅ Assignation via system_roles
- ✅ Affichage des catégories
- ✅ Validation avant insertion

### À Créer: Page `/admin/system-roles`
```typescript
// Interface dédiée pour:
- Créer/modifier des rôles
- Configurer permissions et limites
- Activer/désactiver des rôles
- Voir les utilisateurs par rôle
```

---

## 📋 Checklist Post-Migration

### ✅ Complété
- [x] Tables créées (system_roles, user_system_roles)
- [x] 15 rôles insérés
- [x] Données migrées (3 rôles non-admin)
- [x] Fonctions SQL créées (has_system_role, get_user_all_system_roles)
- [x] RLS policies configurées
- [x] Hook useSystemRoles créé
- [x] UserManagement.tsx mis à jour

### ⚠️ À Faire
- [ ] Mettre à jour useUserRoles pour utiliser les nouvelles fonctions
- [ ] Créer page /admin/system-roles pour gestion des rôles
- [ ] Migrer useSecureRoles vers system_roles
- [ ] Tests unitaires
- [ ] Formation utilisateurs admin

---

## 🧪 Tests de Validation

### Test 1: Assignation Admin
```sql
-- Vérifier qu'admin reste dans user_roles
SELECT * FROM user_roles WHERE role = 'admin';
-- ✅ Doit retourner 7 lignes (inchangé)
```

### Test 2: Assignation Autres Rôles
```sql
-- Vérifier les rôles système
SELECT u.email, sr.role_name 
FROM user_system_roles usr
JOIN auth.users u ON u.id = usr.user_id
JOIN system_roles sr ON sr.id = usr.role_id;
-- ✅ Doit retourner producer, editor, printer
```

### Test 3: Fonction has_system_role
```sql
SELECT has_system_role(auth.uid(), 'librarian');  -- Test rôle système
SELECT has_system_role(auth.uid(), 'admin');      -- Test admin
```

### Test 4: RLS Policies
```sql
-- En tant que user normal
SELECT * FROM system_roles;  -- ✅ Voit seulement actifs
SELECT * FROM user_system_roles;  -- ✅ Voit seulement ses rôles

-- En tant qu'admin
SELECT * FROM system_roles;  -- ✅ Voit tout
SELECT * FROM user_system_roles;  -- ✅ Voit tout
```

---

## 🚨 Points d'Attention

### ⚠️ Rôle Admin Spécial
- Admin reste dans `user_roles` avec enum
- NE PAS créer un rôle 'admin' dans `system_roles`
- Toujours vérifier admin avec `has_role()` ou `has_system_role('admin')`

### ⚠️ Compatibilité
- Les anciennes fonctions `has_role`, `get_user_primary_role` continuent de fonctionner
- Préférer les nouvelles fonctions `has_system_role`, `get_user_all_system_roles`
- Les RLS policies existantes restent fonctionnelles

### ⚠️ Performance
- Index créés sur role_code, is_active, user_id
- Requêtes optimisées via fonctions SECURITY DEFINER
- Éviter les requêtes N+1 (utiliser get_user_all_system_roles en batch)

---

##  Rollback (Si Nécessaire)

Si problème critique, revenir en arrière:

```sql
-- 1. Supprimer les nouvelles tables
DROP TABLE IF EXISTS user_system_roles CASCADE;
DROP TABLE IF EXISTS system_roles CASCADE;

-- 2. Supprimer les nouvelles fonctions
DROP FUNCTION IF EXISTS has_system_role(UUID, TEXT);
DROP FUNCTION IF EXISTS get_user_all_system_roles(UUID);
DROP FUNCTION IF EXISTS get_user_primary_system_role(UUID);

-- 3. Recréer is_admin_or_librarian originale
CREATE FUNCTION is_admin_or_librarian(user_uuid UUID)...
```

---

## 📚 Documentation Associée

- [Architecture Système](./ROLES_SYSTEM_ARCHITECTURE.md)
- [Audit Rôles](./AUDIT_ROLES_PERMISSIONS.md)
- [Guide Sécurité](./SECURITY_ROLES_GUIDE.md)

---

**Migration réalisée par**: Architecture BNRM  
**Approuvé par**: Admin système  
**Testé sur**: Environnement production
