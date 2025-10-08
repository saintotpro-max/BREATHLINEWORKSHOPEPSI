# 🌬️ BREATHE LINE - Escape Game Éducatif

Escape game multijoueur coopératif sur la qualité de l'air intérieur, développé pour le Workshop EPSI/WIS 2025.

## 📋 Prérequis

- **Node.js** 18+ et npm/yarn/pnpm
- **Compte Supabase** (pour le mode multijoueur)

## 🚀 Installation Locale

### 1. Télécharger le projet

Téléchargez le ZIP depuis v0 et extrayez-le, ou clonez depuis GitHub.

### 2. Installer les dépendances

\`\`\`bash
npm install
# ou
yarn install
# ou
pnpm install
\`\`\`

### 3. Configuration Supabase (Mode Multijoueur)

#### A. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **Project URL** et **anon key**

#### B. Créer les tables nécessaires

Exécutez ce SQL dans l'éditeur SQL de Supabase :

\`\`\`sql
-- Table pour les états de jeu
CREATE TABLE game_states (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  state JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les messages de chat
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_game_states_room ON game_states(room_id);
CREATE INDEX idx_chat_messages_room ON chat_messages(room);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);

-- Activer Row Level Security (RLS)
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (lecture/écriture publique pour le jeu)
CREATE POLICY "Allow public read access" ON game_states
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON game_states
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON game_states
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read messages" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert messages" ON chat_messages
  FOR INSERT WITH CHECK (true);
\`\`\`

#### C. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-ici

# Optionnel : Clé de service (pour les opérations admin)
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key-ici
\`\`\`

**⚠️ Important** : 
- Remplacez `votre-projet` par l'URL de votre projet Supabase
- Remplacez `votre-anon-key-ici` par votre clé anonyme Supabase
- Ne commitez JAMAIS le fichier `.env.local` dans Git

### 4. Lancer le projet

\`\`\`bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
\`\`\`

Le jeu sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🎮 Modes de Jeu

### Mode Solo (Offline)
- Fonctionne sans Supabase
- Pas besoin de configuration
- Idéal pour tester le jeu

### Mode Multijoueur (Online)
- Nécessite Supabase configuré
- Collaboration en temps réel
- Chat d'équipe
- Synchronisation des états

## 🔑 Variables d'Environnement Complètes

\`\`\`env
# === SUPABASE (OBLIGATOIRE pour multijoueur) ===
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# === OPTIONNEL ===
# Clé de service Supabase (pour opérations admin)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Secret (généré automatiquement par Supabase)
SUPABASE_JWT_SECRET=votre-jwt-secret

# === POSTGRES (Auto-configuré par Supabase) ===
POSTGRES_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
POSTGRES_PRISMA_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=votre-password
POSTGRES_DATABASE=postgres
POSTGRES_HOST=db.xxxxx.supabase.co
\`\`\`

## 📦 Services Nécessaires

### Obligatoires
- **Supabase** : Base de données et temps réel (mode multijoueur)
  - Tables : `game_states`, `chat_messages`
  - Realtime activé sur les deux tables

### Optionnels
- Aucun autre service externe requis
- Le jeu fonctionne entièrement côté client

## 🛠️ Dépannage

### Le mode multijoueur ne fonctionne pas
1. Vérifiez que `.env.local` existe et contient les bonnes clés
2. Vérifiez que les tables Supabase sont créées
3. Vérifiez que RLS est activé avec les bonnes politiques
4. Redémarrez le serveur de développement

### Les toasts ne disparaissent pas
- Corrigé dans cette version (auto-dismiss après 3 secondes)

### Les objets ne sont pas interactifs
- Appuyez sur `*` (astérisque) ou `Entrée` pour interagir
- Assurez-vous d'être proche de l'objet (distance ≤ 5)

### Mode debug
- Appuyez sur `+` pour activer le mode debug
- `R` : Changer de rôle
- `1-4` : Téléportation entre salles

## 📚 Documentation Technique

### Architecture
- **Framework** : Next.js 14 (App Router)
- **UI** : React + Tailwind CSS + shadcn/ui
- **État** : React hooks + Supabase Realtime
- **Rendu** : Canvas 2D isométrique

### Structure du Projet
\`\`\`
├── app/                    # Pages Next.js
├── components/             # Composants React
│   ├── ui/                # Composants UI (shadcn)
│   ├── iso-room.tsx       # Rendu isométrique
│   ├── MiniGameModal.tsx  # Mini-jeux interactifs
│   └── ...
├── hooks/                  # Hooks React personnalisés
├── lib/                    # Utilitaires et logique métier
├── public/game/           # Données de jeu (JSON)
└── scripts/               # Scripts utilitaires
\`\`\`

## 🎓 Crédits

Développé pour le Workshop EPSI/WIS 2025 - "Escape Tech : Crée ton Aventure Numérique"

Thème : Environnement - Qualité de l'air intérieur

## 📄 Licence

Projet éducatif - EPSI/WIS 2025
