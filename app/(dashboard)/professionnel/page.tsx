import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Search, Bell, CheckCircle2, Clock, MapPin, ArrowRight, User } from "lucide-react";
import { formatDate, formatContrat } from "@/lib/utils";

export const metadata = { title: "Espace Professionnel" };

export default async function ProfessionnelPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();
  if (!profile || profile.role !== "professionnel") redirect("/login");

  const [
    { count: candidaturesEnCours },
    { count: candidaturesAcceptees },
    { data: offresRecentes },
    { data: mesCandidatures },
  ] = await Promise.all([
    supabase.from("candidatures").select("*", { count: "exact", head: true })
      .eq("professionnel_id", user.id).eq("statut", "en_attente"),
    supabase.from("candidatures").select("*", { count: "exact", head: true })
      .eq("professionnel_id", user.id).eq("statut", "acceptee"),
    supabase.from("offres").select("id, titre, type_contrat, date_debut, date_fin, ville:profiles(ville), remuneration, remuneration_unite")
      .eq("statut", "ouverte").order("created_at", { ascending: false }).limit(4),
    supabase.from("candidatures")
      .select("id, statut, created_at, offre:offres(titre, type_contrat, date_debut)")
      .eq("professionnel_id", user.id).order("created_at", { ascending: false }).limit(5),
  ]);

  const displayName = profile.prenom ? `${profile.prenom} ${profile.nom}` : profile.nom;

  const statutCandidature: Record<string, { label: string; cls: string }> = {
    en_attente: { label: "En attente",  cls: "badge-warning"  },
    acceptee:   { label: "Acceptée",    cls: "badge-success"  },
    refusee:    { label: "Refusée",     cls: "badge-error"    },
    retiree:    { label: "Retirée",     cls: "badge-neutral"  },
  };

  return (
    <div className="p-8 space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink font-display">
            Bonjour, {displayName} 👋
          </h1>
          <p className="text-ink-muted text-sm mt-1">
            {profile.specialite ?? "Professionnel de santé"} · Ortherim
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`badge ${profile.disponible ? "badge-success" : "badge-neutral"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${profile.disponible ? "bg-brand-green" : "bg-ink-ghost"}`} />
            {profile.disponible ? "Disponible" : "Non disponible"}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Candidatures en cours", value: candidaturesEnCours ?? 0, Icon: Briefcase,    color: "text-brand-orange-dark", bg: "bg-brand-orange/15" },
          { label: "Candidatures acceptées", value: candidaturesAcceptees ?? 0, Icon: CheckCircle2, color: "text-brand-green-dark", bg: "bg-brand-green/15" },
          { label: "Offres disponibles",     value: offresRecentes?.length ?? 0, Icon: Search, color: "text-brand-blue-dark", bg: "bg-brand-blue/50" },
        ].map(({ label, value, Icon, color, bg }, i) => (
          <div key={label} className={`stat-card animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between">
              <span className="stat-label">{label}</span>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            <p className="stat-value">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Offres récentes */}
        <div className="space-y-3 animate-fade-up stagger-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink text-sm">Offres disponibles</h2>
            <Link href="/professionnel/offres" className="text-xs text-brand-green hover:text-brand-green-dark font-medium flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {(offresRecentes ?? []).length === 0 ? (
              <div className="card text-center py-8">
                <Search size={24} className="text-ink-ghost mx-auto mb-2" />
                <p className="text-sm text-ink-muted">Aucune offre disponible pour le moment</p>
              </div>
            ) : (offresRecentes ?? []).map((o: any) => (
              <div key={o.id} className="card-hover">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-green/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Briefcase size={15} className="text-brand-green-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-ink">{o.titre}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="badge-professionnel text-2xs">{formatContrat(o.type_contrat)}</span>
                      <span className="flex items-center gap-1 text-2xs text-ink-subtle">
                        <Clock size={11} /> {formatDate(o.date_debut, { day: "numeric", month: "short" })}
                      </span>
                      {o.remuneration && (
                        <span className="text-2xs font-semibold text-brand-green-dark">
                          {o.remuneration}€/{o.remuneration_unite ?? "j"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mes candidatures */}
        <div className="space-y-3 animate-fade-up stagger-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink text-sm">Mes candidatures récentes</h2>
            <Link href="/professionnel/mes-candidatures" className="text-xs text-brand-green hover:text-brand-green-dark font-medium flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card p-0 overflow-hidden">
            {(mesCandidatures ?? []).length === 0 ? (
              <div className="text-center py-8">
                <Briefcase size={24} className="text-ink-ghost mx-auto mb-2" />
                <p className="text-sm text-ink-muted">Vous n'avez pas encore candidaté</p>
                <Link href="/professionnel/offres" className="btn-primary btn-sm inline-flex mt-3">
                  Parcourir les offres
                </Link>
              </div>
            ) : (mesCandidatures ?? []).map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-border last:border-0 hover:bg-surface-hover transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{c.offre?.titre ?? "Offre"}</p>
                  <p className="text-2xs text-ink-subtle">
                    {c.offre?.type_contrat ? formatContrat(c.offre.type_contrat) : ""} ·{" "}
                    {c.offre?.date_debut ? formatDate(c.offre.date_debut, { day: "numeric", month: "short" }) : ""}
                  </p>
                </div>
                <span className={(statutCandidature[c.statut] ?? statutCandidature.en_attente).cls}>
                  {(statutCandidature[c.statut] ?? statutCandidature.en_attente).label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compléter son profil */}
      {(!profile.specialite || !profile.telephone) && (
        <div className="card border-brand-orange/40 bg-brand-orange/5 animate-fade-up stagger-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center shrink-0">
              <User size={18} className="text-brand-orange-dark" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">Complétez votre profil</p>
              <p className="text-xs text-ink-muted mt-0.5">Un profil complet augmente vos chances d'être contacté par les établissements.</p>
            </div>
            <Link href="/professionnel/profil" className="btn-secondary btn-sm shrink-0">
              Compléter <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
