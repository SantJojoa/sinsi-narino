import { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";
import ModuleCard from "../components/ModuleCard";
import StatCard from "../components/StatCard";

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Module {
    id: string;
    key: string;
    icon: string;
    title: string;
    description: string;
    enabled: boolean;
}

// ── Datos de estadísticas ─────────────────────────────────────────────────────
const STATS = [
    { icon: "trending_up", label: "Total Cargados", value: "124 Archivos", variant: "success" },
    { icon: "data_usage", label: "Peso de Datos", value: "2.4 GB", variant: "neutral" },
    { icon: "sync_problem", label: "Errores Reportados", value: "3 Incidencias", variant: "error" },
];

// ── Página principal ──────────────────────────────────────────────────────────
export default function DataUploadPage() {
    const [activeNav, setActiveNav] = useState("upload");
    const [searchQuery, setSearchQuery] = useState("");
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        (m) =>
            m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUpload = (moduleId: string) => {
        // TODO: implementar lógica de carga por módulo
        console.log("Cargar módulo:", moduleId);
    };

    return (
        <div className="bg-background min-h-screen font-sans text-on-background">
            {/* Barra superior */}
            <TopBar onSearch={setSearchQuery} />

            {/* Sidebar */}
            <SideBar
                activeItem={activeNav}
                onNavChange={setActiveNav}
                onNewUpload={() => console.log("Nueva carga")}
            />

            {/* Contenido principal */}
            <main className="ml-64 pt-24 px-xl pb-xl min-h-screen">
                <div className="max-w-[1440px] mx-auto">

                    {/* Encabezado de página */}
                    <header className="mb-xl">
                        <h1 className="font-display font-semibold text-h1 text-primary">
                            Carga de Datos Operativos
                        </h1>
                        <p className="font-sans text-body-lg text-on-surface-variant mt-sm">
                            Gestione la importación de archivos Excel para los diferentes módulos institucionales.
                        </p>
                    </header>

                    {/* Grid de módulos */}
                    {loading && (
                        <p className="font-sans text-body-md text-on-surface-variant">Cargando módulos…</p>
                    )}
                    {error && (
                        <p className="font-sans text-body-md text-error">Error al cargar módulos: {error}</p>
                    )}
                    {!loading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
                            {filteredModules.map((mod) => (
                                <ModuleCard
                                    key={mod.id}
                                    icon={mod.icon}
                                    title={mod.title}
                                    description={mod.description}
                                    status="pending"
                                    meta="Sin archivo"
                                    onUpload={() => handleUpload(mod.id)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Sección de resumen */}
                    <section className="mt-2xl">
                        <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
                            <div className="flex items-center justify-between mb-lg">
                                <h2 className="font-display font-semibold text-h2 text-primary">
                                    Resumen de Actividad
                                </h2>
                                <span className="font-sans text-body-sm text-on-surface-variant">
                                    Últimos mes
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
                                {STATS.map((stat) => (
                                    <StatCard
                                        key={stat.label}
                                        icon={stat.icon}
                                        label={stat.label}
                                        value={stat.value}
                                        variant={stat.variant as "error" | "success" | "neutral"}
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
