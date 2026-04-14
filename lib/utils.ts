import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric", month: "long", year: "numeric", ...opts,
  }).format(new Date(iso));
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1)  return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7)     return `il y a ${days}j`;
  return formatDate(iso, { day: "numeric", month: "short" });
}

export function initials(nom?: string | null, prenom?: string | null): string {
  const parts = [prenom, nom].filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.map((p) => p![0].toUpperCase()).join("");
}

export function formatContrat(type: string): string {
  const map: Record<string, string> = {
    remplacement: "Remplacement",
    vacataire: "Vacataire",
    cdi: "CDI",
    cdd: "CDD",
    liberal: "Libéral",
  };
  return map[type] ?? type;
}
