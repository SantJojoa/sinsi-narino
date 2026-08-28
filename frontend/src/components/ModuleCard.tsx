/**
 * ModuleCard — Tarjeta de módulo de carga de datos.
 *
 * Props:
 *  - icon: string          (Material Symbols icon name)
 *  - title: string
 *  - description: string
 *  - status: "loaded" | "pending" | "error"
 *  - meta: string          (texto secundario: versión, fecha, mensaje de error…)
 *  - onUpload: () => void
 */

const STATUS_CONFIG = {
    loaded: {
        label: "Cargado",
        icon: "check_circle",
        badgeClass: "bg-tertiary-fixed text-on-tertiary-fixed",
        actionLabel: "Cargar",
        metaClass: "text-outline",
    },
    pending: {
        label: "Pendiente",
        icon: "schedule",
        badgeClass: "bg-secondary-container text-on-secondary-container",
        actionLabel: "Cargar",
        metaClass: "text-outline",
    },
    error: {
        label: "Error",
        icon: "error",
        badgeClass: "bg-error-container text-on-error-container",
        actionLabel: "Reintentar",
        metaClass: "text-error font-bold",
    },
};

export default function ModuleCard({
    icon = "upload_file",
    title,
    description,
    status = "pending",
    meta = "",
    onUpload,
    uploading = false,
    hasResult = false,
    resultExpanded = false,
    onViewResult,
}: {
    icon: string;
    title: string;
    description: string;
    status: "loaded" | "pending" | "error";
    meta: string;
    onUpload: () => void;
    uploading?: boolean;
    hasResult?: boolean;
    resultExpanded?: boolean;
    onViewResult?: () => void;
}) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    const actionLabel = uploading ? "Subiendo..." : cfg.actionLabel;

    return (
        <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-sm hover:shadow-md transition-all group flex flex-col">
            {/* Cabecera: ícono + badge */}
            <div className="flex justify-between items-start mb-md">
                <div className="p-sm bg-surface-container rounded-lg">
                    <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
                </div>
                <span
                    className={`px-sm py-1 rounded-full text-label-sm font-sans font-semibold flex items-center gap-xs ${cfg.badgeClass}`}
                >
                    <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
                    {cfg.label}
                </span>
            </div>

            {/* Contenido */}
            <h3 className="font-display font-semibold text-h3 text-primary mb-xs">{title}</h3>
            <p
                className="font-sans text-body-sm text-on-surface-variant mb-xl flex-1 line-clamp-2"
                title={description}
            >
                {description}
            </p>

            {/* Pie: meta + acción */}
            <div className="flex items-center justify-between gap-sm border-t border-outline-variant pt-md">
                {hasResult ? (
                    <button
                        onClick={onViewResult}
                        aria-expanded={resultExpanded}
                        className={`flex items-center gap-xs font-sans text-label-sm hover:underline underline-offset-2 bg-transparent border-none cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-tertiary-container ${cfg.metaClass}`}
                    >
                        <span className="truncate max-w-[140px]">{meta}</span>
                        <span className="material-symbols-outlined text-[16px]">
                            {resultExpanded ? "expand_less" : "expand_more"}
                        </span>
                    </button>
                ) : (
                    <span className={`font-sans text-label-sm ${cfg.metaClass}`}>{meta}</span>
                )}
                <button
                    onClick={onUpload}
                    disabled={uploading}
                    className="flex items-center gap-xs text-on-tertiary-container font-sans font-medium text-label-md hover:underline underline-offset-2 bg-transparent border-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-tertiary-container"
                >
                    <span className={`material-symbols-outlined text-[18px] ${uploading ? "animate-spin" : ""}`}>
                        {uploading ? "progress_activity" : "upload_file"}
                    </span>
                    {actionLabel}
                </button>
            </div>
        </div>
    );
}
