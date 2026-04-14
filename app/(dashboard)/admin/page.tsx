import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, Building2, FileText, TrendingUp, AlertCircle, CheckCircle2, Clock, Activity } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Admin — Vue d'ensemble" };

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Stats
  const [
    { count: totalProfessionnels },
    { count: totalEtablissements },
    { count: totalOffres },
    { count: totalCandidatures },
    { data: recentUsers },
    { data: recentOffres },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "professionnel"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "etablissement"),
    supabase.from("offres").select("*", { count: "exact", head: true }).eq("statut", "ouverte"),
    supabase.from("candidatures").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("id, nom, prenom, role, created_at, email")
      .order("created_at", { ascending: false }).limit(5),
    supabase.from("offres").select("id, titre, statut, type_contrat, created_at")
      .order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Professionnels", value: totalProfessionnels ?? 0, Icon: Users,      color: "text-brand-green",       bg: "bg-brand-green/12"      },
    { label: "Établissements", value: totalEtablissements ?? 0, Icon: Building2,  color: "text-brand-blue-dark",   bg: "bg-brand-blue/50"       },
    { label: "Offres ouvertes", value: totalOffres ?? 0,        Icon: FileText,    color: "text-brand-orange-dark", bg: "bg-brand-orange/15"     },
    { label: "Candidatures",    value: totalCandidatures ?? 0,  Icon: TrendingUp,  color: "text-ink-muted",         bg: "bg-surface-hover"       },
  ];

  const statutColor: Record<string, string> = {
    ouverte:  "badge-success",
    pourvue:  "badge-neutral",
    annulee:  "badge-error",
    expiree:  "badge-warning",
  };

  return (
    <div className="p-8 space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink font-display">Vue d'ensemble</h1>
        <p className="text-ink-muted text-sm mt-1">Tableau de bord administrateur Ortherim</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, Icon, color, bg }, i) => (
          <div key={label} className={`stat-card animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between">
              <span className="stat-label">{label}</span>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={17} className={color} />
              </div>
            </div>
            <p className="stat-value">{value.toLocaleString("fr-FR")}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Derniers inscrits */}
        <div className="card p-0 overflow-hidden animate-fade-up stagger-3">
          <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
            <h2 className="font-semibold text-ink text-sm">Derniers inscrits</h2>
            <Activity size={15} className="text-ink-subtle" />
          </div>
          <div className="divide-y divide-surface-border">
            {(recentUsers ?? []).length === 0 ? (
              <p className="px-5 py-6 text-sm text-ink-subtle text-center">Aucun utilisateur pour l'instant</p>
            ) : (recentUsers ?? []).map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-hover transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(u.prenom ?? u.nom ?? "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {u.prenom ? `${u.prenom} ${u.nom}` : u.nom}
                  </p>
                  <p className="text-xs text-ink-subtle truncate">{u.email}</p>
                </div>
                <span className={u.role === "professionnel" ? "badge-professionnel" : "badge-etablissement"}>
                  {u.role === "professionnel" ? "Pro" : "Étab."}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dernières offres */}
        <div className="card p-0 overflow-hidden animate-fade-up stagger-4">
          <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
            <h2 className="font-semibold text-ink text-sm">Dernières offres</h2>
            <Clock size={15} className="text-ink-subtle" />
          </div>
          <div className="divide-y divide-surface-border">
            {(recentOffres ?? []).length === 0 ? (
              <p className="px-5 py-6 text-sm text-ink-subtle text-center">Aucune offre pour l'instant</p>
            ) : (recentOffres ?? []).map((o) => (
              <div key={o.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-hover transition-colors">
                <div className="w-8 h-8 rounded-xl bg-surface-hover flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-ink-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{o.titre}</p>
                  <p className="text-xs text-ink-subtle">{formatDate(o.created_at, { day: "numeric", month: "short" })}</p>
                </div>
                <span className={statutColor[o.statut] ?? "badge-neutral"}>
                  {o.statut}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertes système */}
      <div className="card bg-brand-blue/30 border-brand-blue animate-fade-up stagger-5">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-brand-blue-dark mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-ink">Configuration initiale</p>
            <p className="text-xs text-ink-muted mt-0.5">
              Pensez à configurer les e-mails de notification Supabase et à vérifier les politiques RLS dans votre dashboard.
            </p>
          </div>
          <CheckCircle2 size={16} className="text-brand-green ml-auto shrink-0 mt-0.5" />
        </div>
      </div>
    </div>
  );
}
