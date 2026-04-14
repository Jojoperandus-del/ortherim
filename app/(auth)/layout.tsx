export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-surface">
      {/* Panneau gauche branding */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 relative overflow-hidden bg-ink p-10">
        <div className="absolute inset-0 bg-mesh-green opacity-30" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-card">
            <span className="text-white font-bold text-lg font-display">O</span>
          </div>
          <span className="text-white font-bold text-xl font-display tracking-tight">Ortherim</span>
        </div>

        {/* Tagline */}
        <div className="relative z-10 space-y-5">
          <p className="text-3xl font-display font-bold leading-tight text-white">
            Le réseau santé qui connecte les équipes.
          </p>
          <p className="text-ink-subtle text-sm leading-relaxed max-w-xs">
            Professionnels et établissements en Isère, Lyon et Marseille — réunis sur une plateforme sécurisée.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            {[
              { color: "bg-brand-green", label: "Professionnels de santé" },
              { color: "bg-brand-blue-mid", label: "Établissements (EHPAD, cliniques…)" },
              { color: "bg-brand-orange", label: "Remplacements & recrutements" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${color} shrink-0`} />
                <span className="text-sm text-ink-ghost">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse-dot" />
          <span className="text-ink-subtle text-xs">Plateforme sécurisée · Conforme RGPD</span>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-soft">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-base font-display">O</span>
            </div>
            <span className="text-ink font-bold text-xl font-display">Ortherim</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
