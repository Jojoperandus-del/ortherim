# Ortherim v2

Plateforme de mise en relation entre professionnels de santé et établissements.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (Auth + PostgreSQL + RLS)
- **Tailwind CSS** (palette Ortherim)
- **Vercel** (déploiement)

## Routes

| URL | Accès |
|-----|-------|
| `/login` | Public |
| `/register` | Public |
| `/admin` | Rôle `admin` uniquement |
| `/professionnel` | Rôle `professionnel` uniquement |
| `/etablissement` | Rôle `etablissement` uniquement |

## Installation locale

```bash
# 1. Cloner et installer
npm install

# 2. Variables d'environnement
cp .env.local.example .env.local
# → Remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Base de données
# → Aller dans Supabase Dashboard > SQL Editor
# → Coller et exécuter supabase/schema.sql

# 4. Lancer
npm run dev
```

## Déploiement Vercel

1. Push sur GitHub
2. Importer le repo sur vercel.com
3. Ajouter les variables d'env dans Vercel > Settings > Environment Variables
4. Deploy ✓

## Palette couleurs

| Nom | HEX |
|-----|-----|
| Bleu pastel | `#C8DEFF` |
| Vert sage | `#52C49A` |
| Orange clair | `#FFAD6A` |

## Structure

```
app/
├── (auth)/           → /login  /register
├── (dashboard)/      → /admin  /professionnel  /etablissement
├── api/auth/logout/  → POST déconnexion
└── page.tsx          → redirect intelligent

lib/supabase/
├── client.ts         → Browser client
└── server.ts         → Server Component client

middleware.ts         → Protection des routes par rôle
supabase/schema.sql   → Schéma complet + RLS
types/index.ts        → TypeScript types
```
