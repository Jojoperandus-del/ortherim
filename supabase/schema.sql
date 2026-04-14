-- ═══════════════════════════════════════════════════════
--  ORTHERIM — Schéma Supabase complet
--  Coller dans : Supabase Dashboard > SQL Editor > Run
-- ═══════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- recherche full-text

-- ── Types ENUM ──────────────────────────────────────────

CREATE TYPE user_role        AS ENUM ('admin', 'professionnel', 'etablissement');
CREATE TYPE type_contrat     AS ENUM ('remplacement', 'vacataire', 'cdi', 'cdd', 'liberal');
CREATE TYPE statut_offre     AS ENUM ('ouverte', 'pourvue', 'annulee', 'expiree');
CREATE TYPE statut_candidature AS ENUM ('en_attente', 'acceptee', 'refusee', 'retiree');
CREATE TYPE remuneration_unite AS ENUM ('heure', 'jour', 'mois');

-- ── Table profiles ──────────────────────────────────────

CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  role            user_role NOT NULL,
  nom             TEXT NOT NULL,
  prenom          TEXT,
  telephone       TEXT,
  ville           TEXT,
  avatar_url      TEXT,
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  -- Champs professionnel
  specialite      TEXT,
  rpps            TEXT UNIQUE,
  disponible      BOOLEAN NOT NULL DEFAULT true,
  rayon_km        INTEGER DEFAULT 50,
  cv_url          TEXT,
  bio             TEXT,
  -- Champs établissement
  nom_etablissement  TEXT,
  type_etablissement TEXT,
  siret           TEXT UNIQUE,
  finess          TEXT UNIQUE,
  adresse         TEXT,
  code_postal     TEXT,
  description     TEXT,
  site_web        TEXT,
  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Table offres ────────────────────────────────────────

CREATE TABLE public.offres (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etablissement_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titre                TEXT NOT NULL,
  description          TEXT,
  specialite_requise   TEXT,
  type_contrat         type_contrat NOT NULL,
  date_debut           DATE NOT NULL,
  date_fin             DATE,
  remuneration         NUMERIC(10,2),
  remuneration_unite   remuneration_unite,
  statut               statut_offre NOT NULL DEFAULT 'ouverte',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Table candidatures ──────────────────────────────────

CREATE TABLE public.candidatures (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offre_id          UUID NOT NULL REFERENCES public.offres(id) ON DELETE CASCADE,
  professionnel_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message           TEXT,
  statut            statut_candidature NOT NULL DEFAULT 'en_attente',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(offre_id, professionnel_id)
);

-- ── Table alertes (notifications email) ────────────────

CREATE TABLE public.alertes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professionnel_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialite        TEXT,
  type_contrat      type_contrat,
  ville             TEXT,
  rayon_km          INTEGER DEFAULT 50,
  active            BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Fonction updated_at automatique ────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_offres_updated_at
  BEFORE UPDATE ON public.offres
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_candidatures_updated_at
  BEFORE UPDATE ON public.candidatures
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Trigger : créer un profil à l'inscription ───────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, nom, prenom)
  VALUES (
    NEW.id,
    NEW.email,
    (NEW.raw_user_meta_data->>'role')::user_role,
    COALESCE(NEW.raw_user_meta_data->>'nom', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'prenom'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Index pour les performances ─────────────────────────

CREATE INDEX idx_profiles_role          ON public.profiles(role);
CREATE INDEX idx_profiles_disponible    ON public.profiles(disponible) WHERE role = 'professionnel';
CREATE INDEX idx_offres_statut          ON public.offres(statut);
CREATE INDEX idx_offres_etablissement   ON public.offres(etablissement_id);
CREATE INDEX idx_candidatures_offre     ON public.candidatures(offre_id);
CREATE INDEX idx_candidatures_pro       ON public.candidatures(professionnel_id);
CREATE INDEX idx_alertes_pro            ON public.alertes(professionnel_id);

-- ── Row Level Security (RLS) ────────────────────────────

ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offres       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertes      ENABLE ROW LEVEL SECURITY;

-- profiles : chacun lit son profil ; admin lit tout
CREATE POLICY "profiles_select_own"    ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin"  ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "profiles_update_own"    ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own"    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- offres : lecture publique (authentifié) ; écriture = établissement propriétaire ou admin
CREATE POLICY "offres_select_all"     ON public.offres FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "offres_insert_etab"    ON public.offres FOR INSERT WITH CHECK (auth.uid() = etablissement_id);
CREATE POLICY "offres_update_etab"    ON public.offres FOR UPDATE USING (auth.uid() = etablissement_id);
CREATE POLICY "offres_delete_etab"    ON public.offres FOR DELETE USING (auth.uid() = etablissement_id);

-- candidatures : le professionnel gère les siennes ; l'établissement voit celles sur ses offres
CREATE POLICY "cand_select_pro"  ON public.candidatures FOR SELECT USING (auth.uid() = professionnel_id);
CREATE POLICY "cand_select_etab" ON public.candidatures FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.offres o WHERE o.id = offre_id AND o.etablissement_id = auth.uid())
);
CREATE POLICY "cand_insert_pro"  ON public.candidatures FOR INSERT WITH CHECK (auth.uid() = professionnel_id);
CREATE POLICY "cand_update_etab" ON public.candidatures FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.offres o WHERE o.id = offre_id AND o.etablissement_id = auth.uid())
);
CREATE POLICY "cand_delete_pro"  ON public.candidatures FOR DELETE USING (auth.uid() = professionnel_id);

-- alertes : chacun gère les siennes
CREATE POLICY "alertes_own" ON public.alertes USING (auth.uid() = professionnel_id);

-- ── Données de test (admin initial) ────────────────────
-- Remplacer l'UUID par celui de votre utilisateur admin Supabase Auth
-- INSERT INTO public.profiles (id, email, role, nom, is_verified)
-- VALUES ('VOTRE_UUID_ADMIN', 'contact@ortherim.fr', 'admin', 'Ortherim Admin', true);

