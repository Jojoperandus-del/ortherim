"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestLogin() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [msg, setMsg] = useState("");

const login = async () => {
const supabase = createClient();
const { error } = await supabase.auth.signInWithPassword({ email, password });
if (error) setMsg("Erreur: " + error.message);
else window.location.href = "/admin";
};

return (
<div style={{ padding: 40 }}>
<h1>Test Login</h1>
<input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} style={{ display: "block", marginBottom: 8, padding: 8 }} />
<input type="password" placeholder="Mot de passe" onChange={e => setPassword(e.target.value)} style={{ display: "block", marginBottom: 8, padding: 8 }} />
<button onClick={login} style={{ padding: "8px 20px", background: "blue", color: "white", border: "none" }}>Login</button>
<p>{msg}</p>
</div>
);
}
