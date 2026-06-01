"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleLogin = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setError("");
const supabase = createClient();
const { error } = await supabase.auth.signInWithPassword({
email,
password,
});
if (error) {
setError(error.message);
setLoading(false);
} else {
window.location.href = "/admin";
}
};

return (
<div style={{ padding: 32 }}>
<h1>Connexion Ortherim</h1>
<form onSubmit={handleLogin}>
<input
type="email"
placeholder="Email"
value={email}
onChange={(e) => setEmail(e.target.value)}
style={{ display: "block", marginBottom: 12, padding: 8, width: "300px" }}
/>
<input
type="password"
placeholder="Mot de passe"
value={password}
onChange={(e) => setPassword(e.target.value)}
style={{ display: "block", marginBottom: 12, padding: 8, width: "300px" }}
/>
{error && <p style={{ color: "red" }}>{error}</p>}
<button
type="submit"
disabled={loading}
style={{ padding: "10px 24px", background: "#2563eb", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 16 }}
>
{loading ? "Connexion..." : "Se connecter"}
</button>
</form>
</div>
);
}
