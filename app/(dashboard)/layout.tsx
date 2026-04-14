import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { UserRole } from "@/types";
import { initials } from "@/lib/utils";
import {
  LayoutDashboard, Users, Building2, FileText,
  Settings, Bell, LogOut, Briefcase, Search,
} from "lucide-react";

const NAV: Record<UserRole, { href: string; label: string; Icon: React.ElementType }[]> = {
  admin: [
    { href: "/admin",              label: "Vue d'ensemble", Icon: LayoutDashboard },
    { href: "/admin/utilisateurs", label: "Utilisateurs",   Icon: Users           },
    { href: "/admin/offres",       label: "Offres",         Icon: FileText        },
    { href: "/admin/parametres",   label: "Paramètres",     Icon: Settings        },
  ],
  professionnel: [
    { href: "/professionnel",         label: "Tableau de bord",    Icon: LayoutDashboard },
    { href: "/professionnel/offres",  label: "Offres disponibles", Icon: Search          },
    { href: "/professionnel/mes-candidatures", label: "Mes candidatures", Icon: Briefcase },
    { href: "/professionnel/alertes", label: "Alertes e-mail",     Icon: Bell            },
    { href: "/professionnel/profil",  label: "Mon profil",         Icon: Users           },
  ],
  etablissement: [
    { href: "/etablissement",              label: "Tableau de bord",  Icon: LayoutDashboard },
    { href: "/etablissement/offres",       label: "Mes offres",       Icon: FileText        },
    { href: "/etablissement/candidatures", label: "Candidatures",     Icon: Briefcase       },
    { href: "/etablissement/recherche",    label: "Rechercher",       Icon: Search          },
    { href: "/etablissement/profil",       label: "Profil",           Icon: Building2       },
  ],
};

const ROLE_META: Record<UserRole, { label: string; badgeClass: string; color: string }> = {
  admin:         { label: "Administrateur", badgeClass: "badge-admin",         color: "bg-brand-orange/20 text-brand-orange-text" },
  professionnel: { label: "Professionnel",  badgeClass: "badge-professionnel", color: "bg-brand-green/20 text-brand-green-text"   },
  etablissement: { label: "Établissement",  badgeClass: "badge-etablissement", color: "bg-brand-blue/60 text-brand-blue-text"     },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const role = profile.role as UserRole;
  const meta = ROLE_META[role];
  const navItems = NAV[role];
  const displayName = role === "professionnel"
    ? `${profile.prenom ?? ""} ${profile.nom}`.trim()
    : profile.nom;

  return (
    <div className="min-h-screen flex bg-surface">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 flex flex-col bg-surface-card border-r border-surface-border">
        {/* Logo */}
        <div className="p-5 border-b border-surface-border">
          <Link href={`/${role}`} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-xs transition-shadow group-hover:shadow-card">
              <span className="text-white font-bold text-sm font-display">O</span>
            </div>
            <span className="text-ink font-bold text-lg font-display">Ortherim</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className="nav-item">
              <Icon size={16} className="shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-surface-border space-y-1">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-xs shrink-0">
              {initials(profile.nom, profile.prenom)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ink truncate">{displayName}</p>
              <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded-full ${meta.color}`}>
                {meta.label}
              </span>
            </div>
          </div>

          <form action="/api/auth/logout" method="POST">
            <button className="btn-ghost w-full text-ink-muted text-xs">
              <LogOut size={13} /> Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* ── Contenu ── */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
