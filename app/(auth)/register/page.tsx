"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, Stethoscope, Building2, CheckCircle2 } from "lucide-react";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";

const ROLES: { value: UserRole; label: string; sub: string; Icon: React.ElementType; color: string }[] = [
  { value: "professionnel", label: "Professionnel de santé", sub: "Infirmier, médecin, aide-soignant, kiné…", Icon: Stethoscope, color: "brand-green" },
  { value: "etablissement", label: "Établissement de santé", sub: "EHPAD, clinique, cabinet médical…", Icon: Building2, color: "brand-blue-mid" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep]         = useState<1 | 2>(1);
  const [role, setRole]         = useState<UserRole | null>(null);
  const [nom, setNom]           = useState("");
  const [prenom, setPrenom]     = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [pwdStrength, setPwdStrength] = useState(0);

  function checkPassword(val: string) {
    setPassword(val);
    let s = 0;
    if (val.length >= 8) s++;
    if (/[A-Z]/.test(val)) s++;
    if (/[0-9]/.test(val)) s++;
    if (/[^A-Za-z0-9]/.test(val)) s++;
    setPwdStrength(s);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { role, nom, prenom } },
    });

    if (signUpError) { setError(signUpError.message); setLoading(false); return; }

    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, email, role, nom, prenom });
      router.push(`/${role}`);
      router.refresh();
    }
  }

  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-brand-green"];
  const strengthLabels = ["Trop court", "Faible", "Moyen", "Fort"];

  return (
    <div className="animate-fade-up">
      {/* Étape 1 : choix du rôle */}
      {step === 1 && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ink font-display">Créer un compte</h1>
            <p className="text-ink-muted text-sm mt-1.5">Quel est votre profil ?</p>
          </div>

          <div className="space-y-3">
            {ROLES.map(({ value, label, sub, Icon }) => (
              <button key={value} onClick={() => { setRole(value); setStep(2); }}
                className="w-full card group flex items-center gap-4 text-left hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                  value === "professionnel" ? "bg-brand-green/15 group-hover:bg-brand-green/25" : "bg-brand-blue/60 group-hover:bg-brand-blue-mid/30"
                )}>
                  <Icon size={22} className={value === "professionnel" ? "text-brand-green-dark" : "text-brand-blue-dark"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink">{label}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{sub}</p>
                </div>
                <ArrowRight size={16} className="text-ink-ghost group-hover:text-brand-green transition-colors shrink-0" />
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-surface-border text-center">
            <p className="text-sm text-ink-muted">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-brand-green font-semibold hover:text-brand-green-dark transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </>
      )}

      {/* Étape 2 : formulaire */}
      {step === 2 && (
        <>
          <button onClick={() => setStep(1)}
            className="flex items-center gap-1.5 text-ink-muted text-sm mb-6 hover:text-ink transition-colors">
            <ArrowLeft size={15} /> Retour
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ink font-display">Vos informations</h1>
            <p className="text-ink-muted text-sm mt-1.5 flex items-center gap-2">
              Compte
              <span className={role === "professionnel" ? "badge-professionnel" : "badge-etablissement"}>
                {role === "professionnel" ? "Professionnel" : "Établissement"}
              </span>
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {role === "professionnel" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Prénom</label>
                  <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Marie" required className="input" />
                </div>
                <div>
                  <label className="input-label">Nom</label>
                  <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                    placeholder="Dupont" required className="input" />
                </div>
              </div>
            ) : (
              <div>
                <label className="input-label">Nom de l'établissement</label>
                <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                  placeholder="EHPAD Les Jardins" required className="input" />
              </div>
            )}

            <div>
              <label className="input-label">Adresse e-mail professionnelle</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr" required className="input" />
            </div>

            <div>
              <label className="input-label">Mot de passe</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={password}
                  onChange={(e) => checkPassword(e.target.value)}
                  placeholder="8 caractères minimum" required minLength={8} className="input pr-12" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors",
                        pwdStrength >= i ? strengthColors[pwdStrength - 1] : "bg-surface-border")} />
                    ))}
                  </div>
                  <p className="text-xs text-ink-subtle">{strengthLabels[pwdStrength - 1] ?? "Entrez un mot de passe"}</p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Création du compte…</>
                : <><CheckCircle2 size={16} /> Créer mon compte</>}
            </button>

            <p className="text-xs text-ink-ghost text-center leading-relaxed">
              En créant un compte, vous acceptez nos{" "}
              <a href="#" className="underline hover:text-ink-muted transition-colors">CGU</a> et notre{" "}
              <a href="#" className="underline hover:text-ink-muted transition-colors">Politique de confidentialité</a>.
            </p>
          </form>
        </>
      )}
    </div>
  );
}
