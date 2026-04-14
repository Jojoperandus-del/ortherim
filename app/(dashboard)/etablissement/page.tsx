import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Users, CheckCircle2, Plus, ArrowRight, Clock, Briefcase, Building2 } from "lucide-react";
import { formatDate, formatContrat } from "@/lib/utils";

export const metadata = { title: "Espace Établissement" };

export default async function EtablissementPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();
  if (!profile || profile.role !== "etablissement") redirect("/login");

  const [
    { count: offresActives },
    { count: candidaturesRecues },
    { count: candidaturesEnAttente },
    { count: postesPourvus },
    { data: mesOffres },
    { data: candidaturesRecentes },
  ] = await Promise.all([
    supabase.from("offres").select("*", { count: "exact", head: true })
      .eq("etablissement_id", user.id).eq("statut", "ouverte"),
    supabase.from("candidatures").select("candidatures.*, offres!inner(etablissement_id)", { count: "exact", head: true })
      .eq("offres.etablissement_id", user.id),
    supabase.from("candidatures").select("candidatures.*, offres!inner(etablissement_id)", { count: "exact", head: true })
      .eq("offres.etablissement_id", user.id).eq("statut", "en_attente"),
    supabase.from("offres").select("*", { count: "exact", head: true })
      .eq("etablissement_id", user.id).eq("statut", "pourvue"),
    supabase.from("offres").select("id, titre, type_contrat, statut, date_debut, date_fin, created_at")
      .eq("etablissement_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("candidatures")
      .select("id, statut, created_at, professionnel:profiles(nom, prenom, specialite), offre:offres(titre)")
      .eq("offres.etablissement_id", user.id).order("created_at", { ascending: false }).limit(5),
  ]);

  const statutOffre: Record<string, { label: string; cls: string }> = {
    ouverte:  { label: "Ouverte",   cls: "badge-success"  },
    pourvue:  { label: "Pourvue",   cls: "badge-neutral"  },
    annulee:  { label: "Annulée",   cls: "badge-error"    },
    expiree:  { label: "Expirée",   cls: "badge-warning"  },
  };

  return (
    <div className="p-8 space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink font-display">{profile.nom}</h1>
          <p className="text-ink-muted text-sm mt-1">
            {profile.type_etablissement ?? "Établissement de santé"} · {profile.ville ?? "Région"}
          </p>
        </div>
        <Link href="/etablissement/offres/nouvelle" className="btn-primary shrink-0">
          <Plus size={16} /> Publier une offre
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Offres actives",          value: offresActives ?? 0,         Icon: FileText,     color: "text-brand-green-dark",  bg: "bg-brand-green/15"  },
          { label: "Candidatures reçues",      value: candidaturesRecues ?? 0,    Icon: Users,        color: "text-brand-blue-dark",   bg: "bg-brand-blue/50"   },
          { label: "En attente de réponse",    value: candidaturesEnAttente ?? 0, Icon: Clock,        color: "text-brand-orange-dark", bg: "bg-brand-orange/15" },
          { label: "Postes pourvus",           value: postesPourvus ?? 0,         Icon: CheckCircle2, color: "text-ink-muted",         bg: "bg-surface-hover"   },
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
        {/* Mes offres */}
        <div className="space-y-3 animate-fade-up stagger-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink text-sm">Mes offres publiées</h2>
            <Link href="/etablissement/offres" className="text-xs text-brand-green hover:text-brand-green-dark font-medium flex items-center gap-1">
              Gérer <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card p-0 overflow-hidden">
            {(mesOffres ?? []).length === 0 ? (
              <div className="text-center py-10">
                <FileText size={28} className="text-ink-ghost mx-auto mb-3" />
                <p className="text-sm text-ink-muted mb-3">Aucune offre publiée</p>
                <Link href="/etablissement/offres/nouvelle" className="btn-primary btn-sm inline-flex">
                  <Plus size={14} /> Créer ma première offre
                </Link>
              </div>
            ) : (mesOffres ?? []).map((o: any) => (
              <div key={o.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-border last:border-0 hover:bg-surface-hover transition-colors group">
                <div className="w-8 h-8 rounded-xl bg-surface-hover group-hover:bg-brand-green/15 flex items-center justify-center shrink-0 transition-colors">
                  <FileText size={14} className="text-ink-muted group-hover:text-brand-green-dark transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{o.titre}</p>
                  <p className="text-2xs text-ink-subtle">
                    {formatContrat(o.type_contrat)} · {formatDate(o.date_debut, { day: "numeric", month: "short" })}
                  </p>
                </div>
                <span className={(statutOffre[o.statut] ?? statutOffre.ouverte).cls}>
                  {(statutOffre[o.statut] ?? statutOffre.ouverte).label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Candidatures récentes */}
        <div className="space-y-3 animate-fade-up stagger-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink text-sm">Candidatures récentes</h2>
            <Link href="/etablissement/candidatures" className="text-xs text-brand-green hover:text-brand-green-dark font-medium flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card p-0 overflow-hidden">
            {(candidaturesRecentes ?? []).length === 0 ? (
              <div className="text-center py-10">
                <Briefcase size={28} className="text-ink-ghost mx-auto mb-3" />
                <p className="text-sm text-ink-muted">Aucune candidature reçue</p>
              </div>
            ) : (candidaturesRecentes ?? []).map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-border last:border-0 hover:bg-surface-hover transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(c.professionnel?.prenom ?? c.professionnel?.nom ?? "?")[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {c.professionnel?.prenom ? `${c.professionnel.prenom} ${c.professionnel.nom}` : c.professionnel?.nom ?? "—"}
                  </p>
                  <p className="text-2xs text-ink-subtle truncate">
                    {c.professionnel?.specialite ?? "Professionnel"} · {c.offre?.titre ?? ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={c.statut === "en_attente" ? "badge-warning" : c.statut === "acceptee" ? "badge-success" : "badge-error"}>
                    {c.statut === "en_attente" ? "En attente" : c.statut === "acceptee" ? "Acceptée" : "Refusée"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compléter le profil */}
      {(!profile.siret || !profile.adresse) && (
        <div className="card border-brand-blue/40 bg-brand-blue/10 animate-fade-up stagger-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/30 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-brand-blue-dark" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">Complétez la fiche de votre établissement</p>
              <p className="text-xs text-ink-muted mt-0.5">SIRET, adresse, description — cela rassure les professionnels qui postulent.</p>
            </div>
            <Link href="/etablissement/profil" className="btn-secondary btn-sm shrink-0">
              Compléter <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
