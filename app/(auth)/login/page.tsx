“use client”;

import { Suspense } from “react”;
import { useState } from “react”;
import Link from “next/link”;
import { useRouter, useSearchParams } from “next/navigation”;
import { createClient } from “@/lib/supabase/client”;
import { Eye, EyeOff, ArrowRight, Loader2 } from “lucide-react”;

function LoginForm() {
const router = useRouter();
const searchParams = useSearchParams();
const redirect = searchParams.get(“redirect”) ?? “”;

const [email, setEmail] = useState(””);
const [password, setPassword] = useState(””);
const [showPwd, setShowPwd] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

async function handleSubmit(e: React.FormEvent) {
e.preventDefault();
setLoading(true);
setError(null);
const supabase = createClient();

```
const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
if (authError) {
setError("Email ou mot de passe incorrect.");
setLoading(false);
return;
}

const { data: { user } } = await supabase.auth.getUser();
if (user) {
const { data: profile } = await supabase
.from("profiles").select("role").eq("id", user.id).single();
const dest = redirect || (profile?.role ? `/${profile.role}` : "/login");
router.push(dest);
router.refresh();
}
```

}

return (
<div className="animate-fade-up">
<div className="mb-8">
<h1 className="text-2xl font-bold text-ink">Bon retour 👋</h1>
<p className="text-ink-muted text-sm mt-1.5">Connectez-vous à votre espace Ortherim</p>
</div>

```
<form onSubmit={handleSubmit} className="space-y-4">
<div>
<label htmlFor="email" className="input-label">Adresse e-mail</label>
<input id="email" type="email" value={email}
onChange={(e) => setEmail(e.target.value)}
placeholder="vous@exemple.fr" required autoComplete="email" className="input" />
</div>

<div>
<div className="flex items-center justify-between mb-1.5">
<label htmlFor="password" className="input-label mb-0">Mot de passe</label>
<Link href="#" className="text-xs text-brand-green font-medium">
Mot de passe oublié ?
</Link>
</div>
<div className="relative">
<input id="password" type={showPwd ? "text" : "password"} value={password}
onChange={(e) => setPassword(e.target.value)}
placeholder="••••••••" required autoComplete="current-password" className="input pr-12" />
<button type="button" onClick={() => setShowPwd(!showPwd)}
className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors">
{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
</button>
</div>
</div>

{error && (
<div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
{error}
</div>
)}

<button type="submit" disabled={loading} className="btn-primary w-full mt-2">
{loading
? <><Loader2 size={16} className="animate-spin" /> Connexion…</>
: <>Se connecter <ArrowRight size={16} /></>}
</button>
</form>

<div className="mt-6 pt-6 border-t border-surface-border text-center">
<p className="text-sm text-ink-muted">
Pas encore de compte ?{" "}
<Link href="/register" className="text-brand-green font-semibold">
Créer un compte
</Link>
</p>
</div>
</div>
```

);
}

export default function LoginPage() {
return (
<Suspense fallback={<div className="animate-pulse">Chargement…</div>}>
<LoginForm />
</Suspense>
);
}
