/**
 * StatCard — Tarjeta de estadística resumida.
 *
 * Props:
 *  - icon: string          (Material Symbols icon name)
 *  - label: string         (descripción/etiqueta)
 *  - value: string         (valor principal)
 *  - variant: "success" | "neutral" | "error"
 */

const VARIANT_CONFIG = {
    success: {
        iconWrapClass: "bg-tertiary-fixed text-on-tertiary-fixed",
    },
    neutral: {
        iconWrapClass: "bg-secondary-container text-on-secondary-container",
    },
    error: {
        iconWrapClass: "bg-error-container text-on-error-container",
    },
};

export default function StatCard({ icon, label, value, variant = "neutral" }: { icon: string; label: string; value: string; variant: "success" | "neutral" | "error" }) {
    const cfg = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.neutral;

    return (
        <div className="flex items-center gap-md p-md bg-surface-container rounded-lg">
            <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${cfg.iconWrapClass}`}
            >
                <span className="material-symbols-outlined text-xl">{icon}</span>
            </div>
            <div>
                <p className="font-sans text-label-sm text-outline">{label}</p>
                <p className="font-display font-semibold text-h3 text-primary">{value}</p>
            </div>
        </div>
    );
}
