import { useState } from "react";
import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";
import ModuleCard from "../components/ModuleCard";
import StatCard from "../components/StatCard";

// ── Datos de módulos ──────────────────────────────────────────────────────────
const MODULES = [
    {
        id: "recien_nacido",
        icon: "baby_changing_station",
        title: "Recién Nacido",
        description: "Seguimiento Nominal de Recién Nacidos",
        status: "loaded",
        meta: "v2.4 Final",
    },
    {
        id: "hipotiroidismo_congenito",
        icon: "inventory_2",
        title: "Hipopotiroidismo Congénito",
        description: "Reporte de casos de hipotiroidismo congénito.",
        status: "pending",
        meta: "Sin archivo",
    },
    {
        id: "primera_infancia",
        icon: "child_care",
        title: "Primera Infancia",
        description: "Registro nominal de valoración integral de primera infancia (0-5 años 11 meses y 29 días)",
        status: "error",
        meta: "Error Formato",
    },
    {
        id: "infancia",
        icon: "family_restroom",
        title: "Infancia",
        description: "Registro nominal de valoración integral de infancia (6-11 años 11 meses y 29 días).",
        status: "loaded",
        meta: "Ayer, 18:45",
    },
    {
        id: "era",
        icon: "medical_services",
        title: "Sala ERA",
        description: "Formato institucional para el registro de casos atendidos en sala ERA",
        status: "pending",
        meta: "Pendiente envío",
    },
    {
        id: "eda",
        icon: "water_drop",
        title: "EDA",
        description: "Formato de morbilidad Enfermedad Diarreica Aguda - EDA",
        status: "loaded",
        meta: "Hace 2 horas",
    },
    {
        id: "uaic",
        icon: "local_hospital",
        title: "UAIC",
        description: "Seguimiento a niños atendidos en las unidades de atención integral comunitaria.",
        status: "error",
        meta: "Archivo corrupto",
    },
];

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

    const filteredModules = MODULES.filter(
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
                        {filteredModules.map((mod) => (
                            <ModuleCard
                                key={mod.id}
                                icon={mod.icon}
                                title={mod.title}
                                description={mod.description}
                                status={mod.status as "error" | "loaded" | "pending"}
                                meta={mod.meta}
                                onUpload={() => handleUpload(mod.id)}
                            />
                        ))}
                    </div>

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
