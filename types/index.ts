export type UserRole = "admin" | "professionnel" | "etablissement";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  nom: string;
  prenom?: string | null;
  telephone?: string | null;
  ville?: string | null;
  avatar_url?: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Professionnel extends Profile {
  role: "professionnel";
  specialite?: string | null;
  rpps?: string | null;
  disponible: boolean;
  rayon_km?: number | null;
  cv_url?: string | null;
  bio?: string | null;
}

export interface Etablissement extends Profile {
  role: "etablissement";
  nom_etablissement?: string | null;
  type_etablissement?: string | null;
  siret?: string | null;
  finess?: string | null;
  adresse?: string | null;
  code_postal?: string | null;
  description?: string | null;
}

export type TypeContrat = "remplacement" | "vacataire" | "cdi" | "cdd" | "liberal";
export type StatutOffre = "ouverte" | "pourvue" | "annulee";
export type StatutCandidature = "en_attente" | "acceptee" | "refusee";

export interface Offre {
  id: string;
  etablissement_id: string;
  titre: string;
  description?: string | null;
  specialite_requise?: string | null;
  type_contrat: TypeContrat;
  date_debut: string;
  date_fin?: string | null;
  remuneration?: number | null;
  remuneration_unite?: "heure" | "jour" | "mois" | null;
  statut: StatutOffre;
  created_at: string;
  etablissement?: Pick<Profile, "nom" | "ville">;
}

export interface Candidature {
  id: string;
  offre_id: string;
  professionnel_id: string;
  message?: string | null;
  statut: StatutCandidature;
  created_at: string;
  offre?: Pick<Offre, "titre" | "date_debut" | "type_contrat">;
  professionnel?: Pick<Profile, "nom" | "prenom" | "email">;
}
