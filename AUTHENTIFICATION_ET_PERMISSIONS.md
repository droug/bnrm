# Système d'Authentification et de Permissions - BNRM

## 🔐 Authentification Unifiée

### Persistance de Session
Le système utilise Supabase Auth avec **persistance automatique** de la session :

- ✅ **Authentification unique** : L'utilisateur se connecte une seule fois sur le portail
- ✅ **Session globale** : La session persiste à travers toutes les plateformes :
  - Page d'accueil du portail
  - Bibliothèque Numérique
  - Plateforme des Manuscrits Numérisés
  - Toutes les pages administratives
- ✅ **Pas de réauthentification** : L'utilisateur n'a pas besoin de se reconnecter en changeant de plateforme
- ✅ **Auto-refresh des tokens** : Les tokens sont automatiquement rafraîchis en arrière-plan

### Implémentation Technique

```typescript
// Hook useAuth - Gestion globale de la session
const { user, session, profile, loading } = useAuth();

// Le contexte AuthProvider enveloppe toute l'application
// La session est stockée dans localStorage par Supabase
// Les tokens sont rafraîchis automatiquement
```

---

## 🎯 Politiques d'Accès Paramétrables

### 1. Rôles Utilisateurs

| Rôle | Description | Niveau d'Accès |
|------|-------------|----------------|
| **visitor** | Visiteur non connecté | Public uniquement |
| **subscriber** | Adhérent BNRM | Public + Restreint |
| **researcher** | Chercheur académique | Public + Restreint |
| **partner** | Institution partenaire | Public + Restreint |
| **librarian** | Bibliothécaire | Accès complet |
| **admin** | Administrateur | Accès complet |

### 2. Niveaux d'Accès aux Contenus

| Niveau | Description | Accessible Par |
|--------|-------------|----------------|
| **public** | Contenu accessible à tous | Tous les utilisateurs |
| **restricted** | Contenu réservé aux membres | subscriber, researcher, partner, librarian, admin |
| **confidential** | Contenu confidentiel | librarian, admin uniquement |

### 3. Limites par Rôle

#### Visiteur (visitor)
- 🔹 Demandes max : 5
- 🔹 Téléchargements/jour : 0
- 🔹 Téléchargement : ❌
- 🔹 Demande reproduction : ❌
- 🔹 Recherche avancée : ❌

#### Adhérent (subscriber)
- 🔹 Demandes max : 100
- 🔹 Téléchargements/jour : 10
- 🔹 Téléchargement : ✅
- 🔹 Demande reproduction : ✅
- 🔹 Recherche avancée : ✅

#### Chercheur (researcher)
- 🔹 Demandes max : 50
- 🔹 Téléchargements/jour : 20
- 🔹 Téléchargement : ✅
- 🔹 Demande reproduction : ✅
- 🔹 Recherche avancée : ✅

#### Partenaire (partner)
- 🔹 Demandes max : 200
- 🔹 Téléchargements/jour : 50
- 🔹 Téléchargement : ✅
- 🔹 Demande reproduction : ✅
- 🔹 Traitement prioritaire : ✅
- 🔹 Recherche avancée : ✅

#### Bibliothécaire / Admin
- 🔹 Demandes max : Illimitées
- 🔹 Téléchargements/jour : Illimités
- 🔹 Téléchargement : ✅
- 🔹 Demande reproduction : ✅
- 🔹 Traitement prioritaire : ✅
- 🔹 Recherche avancée : ✅
- 🔹 Accès backoffice : ✅

---

## 📋 Utilisation dans le Code

### Vérification d'Accès à un Contenu

```typescript
import { useAccessControl } from "@/hooks/useAccessControl";

function MyComponent() {
  const { checkAccess } = useAccessControl();
  
  const manuscript = { access_level: 'restricted' };
  const { allowed, message } = checkAccess(manuscript.access_level);
  
  if (!allowed) {
    return <div className="alert">{message}</div>;
  }
  
  return <div>Contenu accessible</div>;
}
```

### Vérification des Permissions

```typescript
import { useAccessControl } from "@/hooks/useAccessControl";

function DownloadButton() {
  const { checkDownload, checkReproduction } = useAccessControl();
  
  return (
    <>
      {checkDownload() && (
        <Button>Télécharger</Button>
      )}
      
      {checkReproduction() && (
        <Button>Demander une reproduction</Button>
      )}
    </>
  );
}
```

### Affichage Conditionnel selon le Rôle

```typescript
import { useAccessControl } from "@/hooks/useAccessControl";

function Navigation() {
  const { isAdmin, isLibrarian, isSubscriber } = useAccessControl();
  
  return (
    <nav>
      {/* Visible pour tous */}
      <Link to="/digital-library">Bibliothèque</Link>
      
      {/* Visible pour les adhérents et + */}
      {isSubscriber && (
        <Link to="/manuscripts">Manuscrits</Link>
      )}
      
      {/* Visible pour les bibliothécaires et admins */}
      {isLibrarian && (
        <Link to="/admin">Administration</Link>
      )}
    </nav>
  );
}
```

---

## 🛡️ Sécurité RLS (Row Level Security)

Les politiques RLS Supabase sont configurées pour respecter les niveaux d'accès :

### Exemple : Table `manuscripts`

```sql
-- Politique SELECT
CREATE POLICY "Access based on user role and content level"
ON manuscripts FOR SELECT
USING (
  access_level = 'public'
  OR
  (access_level = 'restricted' AND 
   EXISTS (SELECT 1 FROM profiles 
           WHERE user_id = auth.uid() 
           AND role IN ('subscriber', 'researcher', 'partner', 'librarian', 'admin')))
  OR
  (access_level = 'confidential' AND
   EXISTS (SELECT 1 FROM profiles 
           WHERE user_id = auth.uid() 
           AND role IN ('librarian', 'admin')))
);
```

---

## 📱 Pages Disponibles

### Page d'Information sur les Politiques
- URL : `/access-policies` ou `/politiques-acces`
- Affiche :
  - Le statut actuel de l'utilisateur
  - Les limites de son rôle
  - La matrice complète des permissions
  - Les descriptions des niveaux d'accès

---

## ⚙️ Configuration

Toutes les politiques sont centralisées dans :
- **Fichier** : `src/config/accessPolicies.ts`
- **Hook** : `src/hooks/useAccessControl.tsx`

Pour modifier les politiques d'accès, éditez simplement ces fichiers.

### Exemple de Modification

```typescript
// Dans accessPolicies.ts
export const ROLE_LIMITS: Record<UserRole, {
  maxRequests: number;
  // ...
}> = {
  subscriber: {
    maxRequests: 150, // Modifier de 100 à 150
    // ...
  },
};
```

---

## 🎓 Workflow Utilisateur

1. **Visiteur arrive sur le portail** → Accès public uniquement
2. **Visiteur s'inscrit/se connecte** → Session créée et persistée
3. **Utilisateur navigue** → Session maintenue sur toutes les plateformes
4. **Utilisateur accède à un contenu** → Vérification automatique des permissions
5. **Utilisateur se déconnecte** → Session effacée, retour en mode visiteur

---

## ✅ Avantages du Système

- 🔒 **Sécurité renforcée** : Contrôle d'accès à plusieurs niveaux
- 🎯 **Flexibilité** : Politiques facilement modifiables
- 🔄 **Persistance** : Session unique pour toutes les plateformes
- 📊 **Traçabilité** : Tous les accès peuvent être loggés
- 👥 **Granularité** : 6 rôles différents avec permissions spécifiques
- 🚀 **Performance** : Vérifications côté client ET serveur (RLS)
