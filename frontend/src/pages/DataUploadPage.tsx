import { useEffect, useMemo, useRef, useState } from "react";
import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";
import ModuleCard from "../components/ModuleCard";
import StatCard from "../components/StatCard";

interface Module {
    id: string;
    key: string;
    icon: string;
    title: string;
    description: string;
    enabled: boolean;
}

type UploadStatus = "loaded" | "pending" | "error";

interface UploadResult {
    moduleKey: string;
    fileName: string;
    sheetName?: string;
    message?: string;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    errors: Array<{
        rowNumber: number;
        errors: string[];
    }>;
}

interface ModuleUploadState {
    status: UploadStatus;
    meta: string;
    uploading?: boolean;
    result?: UploadResult;
    updatedAt?: number;
}

export default function DataUploadPage() {
    const [activeNav, setActiveNav] = useState("upload");
    const [searchQuery, setSearchQuery] = useState("");
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedModuleKey, setSelectedModuleKey] = useState<string | null>(null);
    const [uploadStates, setUploadStates] = useState<Record<string, ModuleUploadState>>({});
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
    const [pendingScrollKey, setPendingScrollKey] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const resultRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        fetch("http://localhost:3000/modules")
            .then((res) => {
                if (!res.ok) throw new Error(`Error ${res.status}`);
                return res.json();
            })
            .then((data: Module[]) => setModules(data))
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const filteredModules = modules.filter(
        (module) =>
            module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            module.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (!pendingScrollKey) return;
        const node = resultRefs.current[pendingScrollKey];
        node?.scrollIntoView({ behavior: "smooth", block: "start" });
        setPendingScrollKey(null);
    }, [pendingScrollKey]);

    const expandResult = (moduleKey: string) => {
        setExpandedKeys((current) => new Set(current).add(moduleKey));
        setPendingScrollKey(moduleKey);
    };

    const toggleResult = (moduleKey: string) => {
        if (expandedKeys.has(moduleKey)) {
            setExpandedKeys((current) => {
                const next = new Set(current);
                next.delete(moduleKey);
                return next;
            });
        } else {
            expandResult(moduleKey);
        }
    };

    const handleUpload = (moduleKey: string) => {
        setSelectedModuleKey(moduleKey);
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const moduleKey = selectedModuleKey;
        event.target.value = "";

        if (!file || !moduleKey) return;

        setUploadStates((current) => ({
            ...current,
            [moduleKey]: {
                ...(current[moduleKey] ?? { status: "pending", meta: "Subiendo archivo" }),
                uploading: true,
                meta: "Validando Excel",
            },
        }));

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`http://localhost:3000/modules/${moduleKey}/upload`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (!response.ok) {
                const detail = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
                throw new Error(detail || `Error ${response.status}`);
            }

            const result = data as UploadResult;
            setUploadStates((current) => ({
                ...current,
                [moduleKey]: {
                    status: result.invalidRows > 0 ? "error" : "loaded",
                    meta:
                        result.totalRows > 0
                            ? `${result.validRows}/${result.totalRows} filas validas`
                            : result.message ?? "Archivo recibido",
                    uploading: false,
                    result,
                    updatedAt: Date.now(),
                },
            }));
            expandResult(moduleKey);
        } catch (err) {
            setUploadStates((current) => ({
                ...current,
                [moduleKey]: {
                    status: "error",
                    meta: err instanceof Error ? err.message : "No se pudo cargar",
                    uploading: false,
                    updatedAt: Date.now(),
                },
            }));
        } finally {
            setSelectedModuleKey(null);
        }
    };

    const resultsList = useMemo(() => {
        return modules
            .map((module) => ({ module, state: uploadStates[module.key] }))
            .filter(
                (entry): entry is { module: Module; state: ModuleUploadState & { result: UploadResult } } =>
                    Boolean(entry.state?.result)
            )
            .sort((a, b) => (b.state.updatedAt ?? 0) - (a.state.updatedAt ?? 0));
    }, [modules, uploadStates]);

    const stats = useMemo(() => {
        const totalRows = resultsList.reduce((sum, { state }) => sum + state.result.totalRows, 0);
        const validRows = resultsList.reduce((sum, { state }) => sum + state.result.validRows, 0);
        const invalidRows = resultsList.reduce((sum, { state }) => sum + state.result.invalidRows, 0);

        return [
            {
                icon: "cloud_done",
                label: "Módulos Cargados",
                value: `${resultsList.length}/${modules.length}`,
                variant: "success" as const,
            },
            {
                icon: "fact_check",
                label: "Filas Validadas",
                value: `${validRows}/${totalRows}`,
                variant: "neutral" as const,
            },
            {
                icon: "sync_problem",
                label: "Errores Reportados",
                value: invalidRows > 0 ? `${invalidRows} filas` : "Sin errores",
                variant: invalidRows > 0 ? ("error" as const) : ("success" as const),
            },
        ];
    }, [resultsList, modules.length]);

    return (
        <div className="bg-background min-h-screen font-sans text-on-background">
            <TopBar onSearch={setSearchQuery} />

            <SideBar
                activeItem={activeNav}
                onNavChange={setActiveNav}
                onNewUpload={() => setActiveNav("upload")}
            />

            <main className="ml-64 pt-24 px-xl pb-xl min-h-screen">
                <div className="max-w-[1440px] mx-auto">
                    <header className="mb-xl">
                        <h1 className="font-display font-semibold text-h1 text-primary">
                            Carga de Datos Operativos
                        </h1>
                        <p className="font-sans text-body-lg text-on-surface-variant mt-sm">
                            Gestione la importacion de archivos Excel para los diferentes modulos institucionales.
                        </p>
                    </header>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        className="hidden"
                        onChange={handleFileSelected}
                    />

                    {loading && (
                        <div className="flex items-center gap-sm font-sans text-body-md text-on-surface-variant">
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            Cargando modulos...
                        </div>
                    )}
                    {error && (
                        <p className="flex items-center gap-sm font-sans text-body-md text-error">
                            <span className="material-symbols-outlined">error</span>
                            Error al cargar modulos: {error}
                        </p>
                    )}
                    {!loading && !error && filteredModules.length === 0 && (
                        <p className="font-sans text-body-md text-on-surface-variant">
                            No se encontraron módulos que coincidan con "{searchQuery}".
                        </p>
                    )}
                    {!loading && !error && filteredModules.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
                            {filteredModules.map((module) => {
                                const uploadState = uploadStates[module.key];

                                return (
                                    <ModuleCard
                                        key={module.id}
                                        icon={module.icon}
                                        title={module.title}
                                        description={module.description}
                                        status={uploadState?.status ?? "pending"}
                                        meta={uploadState?.meta ?? "Sin archivo"}
                                        uploading={uploadState?.uploading}
                                        hasResult={Boolean(uploadState?.result)}
                                        resultExpanded={expandedKeys.has(module.key)}
                                        onViewResult={() => toggleResult(module.key)}
                                        onUpload={() => handleUpload(module.key)}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {resultsList.length > 0 && (
                        <section className="mt-xl flex flex-col gap-md">
                            <div className="flex items-center justify-between">
                                <h2 className="font-display font-semibold text-h2 text-primary">
                                    Resultados de validación
                                </h2>
                                <span className="font-sans text-body-sm text-on-surface-variant">
                                    {resultsList.length} módulo{resultsList.length === 1 ? "" : "s"} cargado
                                    {resultsList.length === 1 ? "" : "s"}
                                </span>
                            </div>

                            {resultsList.map(({ module, state }) => {
                                const result = state.result;
                                const expanded = expandedKeys.has(module.key);

                                return (
                                    <div
                                        key={module.key}
                                        ref={(el) => {
                                            resultRefs.current[module.key] = el;
                                        }}
                                        className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden"
                                    >
                                        <button
                                            onClick={() => toggleResult(module.key)}
                                            aria-expanded={expanded}
                                            className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-md p-lg text-left bg-transparent border-none cursor-pointer hover:bg-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-tertiary-container"
                                        >
                                            <div className="flex items-center gap-md min-w-0">
                                                <span className="material-symbols-outlined text-primary text-2xl shrink-0">
                                                    {module.icon}
                                                </span>
                                                <div className="min-w-0">
                                                    <h3 className="font-display font-semibold text-h3 text-primary truncate">
                                                        {module.title}
                                                    </h3>
                                                    <p className="font-sans text-body-sm text-on-surface-variant mt-xs truncate">
                                                        {result.fileName}
                                                        {result.sheetName ? ` · Hoja: ${result.sheetName}` : ""}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-md shrink-0">
                                                {result.totalRows > 0 ? (
                                                    <div className="flex items-center gap-xs flex-wrap">
                                                        <span className="px-sm py-1 rounded-full bg-surface-container text-label-sm font-sans font-semibold text-on-surface-variant">
                                                            {result.totalRows} filas
                                                        </span>
                                                        <span className="px-sm py-1 rounded-full bg-tertiary-fixed text-label-sm font-sans font-semibold text-on-tertiary-fixed">
                                                            {result.validRows} válidas
                                                        </span>
                                                        {result.invalidRows > 0 && (
                                                            <span className="px-sm py-1 rounded-full bg-error-container text-label-sm font-sans font-semibold text-on-error-container">
                                                                {result.invalidRows} errores
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="font-sans text-label-sm text-on-surface-variant">
                                                        {result.message ?? "Archivo recibido"}
                                                    </span>
                                                )}
                                                <span className="material-symbols-outlined text-outline">
                                                    {expanded ? "expand_less" : "expand_more"}
                                                </span>
                                            </div>
                                        </button>

                                        {expanded && (
                                            <div className="px-lg pb-lg border-t border-outline-variant pt-md">
                                                {result.errors.length > 0 ? (
                                                    <>
                                                        <h4 className="font-sans font-semibold text-body-md text-error mb-sm">
                                                            Filas por corregir
                                                        </h4>
                                                        <div className="flex flex-col gap-sm max-h-72 overflow-auto">
                                                            {result.errors.map((item) => (
                                                                <div
                                                                    key={item.rowNumber}
                                                                    className="bg-error-container/60 rounded-lg p-md"
                                                                >
                                                                    <p className="font-sans font-semibold text-label-md text-on-error-container">
                                                                        Fila {item.rowNumber}
                                                                    </p>
                                                                    <p className="font-sans text-body-sm text-on-error-container mt-xs">
                                                                        {item.errors.join(" ")}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : result.totalRows > 0 ? (
                                                    <p className="font-sans text-body-sm text-on-tertiary-fixed flex items-center gap-xs">
                                                        <span className="material-symbols-outlined text-lg">
                                                            check_circle
                                                        </span>
                                                        Todas las filas son válidas.
                                                    </p>
                                                ) : (
                                                    <p className="font-sans text-body-sm text-on-surface-variant flex items-center gap-xs">
                                                        <span className="material-symbols-outlined text-lg">info</span>
                                                        No se encontraron filas con datos para validar.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </section>
                    )}

                    <section className="mt-2xl">
                        <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
                            <div className="flex items-center justify-between mb-lg">
                                <h2 className="font-display font-semibold text-h2 text-primary">
                                    Resumen de Actividad
                                </h2>
                                <span className="font-sans text-body-sm text-on-surface-variant">
                                    Sesión actual
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
                                {stats.map((stat) => (
                                    <StatCard
                                        key={stat.label}
                                        icon={stat.icon}
                                        label={stat.label}
                                        value={stat.value}
                                        variant={stat.variant}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
