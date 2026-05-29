import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin – Vue d'ensemble" };

export default async function AdminPage() {
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/login");

const [
{ count: totalProfessionnels },
{ count: totalEtablissements },
{ count: totalOffres },
{ data: recentUsers },
] = await Promise.all([
supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "professionnel"),
supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "etablissement"),
supabase.from("offres").select("*", { count: "exact", head: true }),
supabase.from("profiles").select("id, nom, prenom, role, created_at, email").order("created_at", { ascending: false }).limit(5),
]);

return (
<div style={{ padding: 32 }}>
<h1>Admin — Vue d'ensemble</h1>
<div style={{ display: "flex", gap: 24, marginTop: 24 }}>
<div style={{ padding: 16, background: "#f0f4ff", borderRadius: 8 }}>
<h3>Professionnels</h3>
<p style={{ fontSize: 32, fontWeight: "bold" }}>{totalProfessionnels ?? 0}</p>
</div>
<div style={{ padding: 16, background: "#f0fff4", borderRadius: 8 }}>
<h3>Établissements</h3>
<p style={{ fontSize: 32, fontWeight: "bold" }}>{totalEtablissements ?? 0}</p>
</div>
<div style={{ padding: 16, background: "#fff7f0", borderRadius: 8 }}>
<h3>Offres</h3>
<p style={{ fontSize: 32, fontWeight: "bold" }}>{totalOffres ?? 0}</p>
</div>
</div>
<h2 style={{ marginTop: 32 }}>Derniers inscrits</h2>
<table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
<thead>
<tr style={{ borderBottom: "2px solid #eee" }}>
<th style={{ textAlign: "left", padding: 8 }}>Nom</th>
<th style={{ textAlign: "left", padding: 8 }}>Email</th>
<th style={{ textAlign: "left", padding: 8 }}>Rôle</th>
</tr>
</thead>
<tbody>
{recentUsers?.map((u) => (
<tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
<td style={{ padding: 8 }}>{u.prenom} {u.nom}</td>
<td style={{ padding: 8 }}>{u.email}</td>
<td style={{ padding: 8 }}>{u.role}</td>
</tr>
))}
</tbody>
</table>
</div>
);
}
