import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Ortherim", template: "%s | Ortherim" },
  description: "La plateforme de mise en relation entre professionnels de santé et établissements en Isère, Lyon et Marseille.",
  keywords: ["santé", "remplacement médical", "EHPAD", "infirmier", "médecin", "Isère", "Lyon", "Marseille"],
  openGraph: {
    title: "Ortherim — Réseau des professionnels de santé",
    description: "Connectez professionnels et établissements de santé.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
