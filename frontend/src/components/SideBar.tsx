import NavItem from "./NavItem";


const NAV_ITEMS = [
  { key: "dashboard", icon: "dashboard", label: "Dashboard" },
  { key: "upload", icon: "cloud_upload", label: "Carga de Datos" },
  { key: "reports", icon: "analytics", label: "Informes" },
  { key: "users", icon: "group", label: "Usuarios" },
  { key: "history", icon: "history", label: "Historial" },
  { key: "settings", icon: "settings", label: "Configuración" },
];

export default function SideBar({ activeItem = "upload", onNavChange, onNewUpload }: { activeItem?: string; onNavChange?: (key: string) => void; onNewUpload?: () => void }) {
  return (
    <aside className="flex flex-col h-screen fixed left-0 top-0 pt-16 w-64 bg-primary-container shadow-md z-40">
      <div className="p-md flex flex-col gap-sm flex-1">
        <div className="flex items-center gap-md mb-lg">
          <div className="w-10 h-10 bg-on-tertiary-container rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">corporate_fare</span>
          </div>
          <div>
            <h2 className="font-sans font-bold text-label-md text-white">Nombre del municipio</h2>
            <p className="text-[10px] text-on-primary-container opacity-70 uppercase tracking-wider">
              Gestión Institucional
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-xs">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={activeItem === item.key}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                onNavChange?.(item.key);
              }}
            />
          ))}
        </nav>

        <div className="mt-xl px-md">
          <button
            onClick={onNewUpload}
            className="w-full bg-on-tertiary-container text-white py-2 rounded-lg font-sans font-medium text-label-md shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            Nueva Carga
          </button>
        </div>
      </div>
      <div className="p-md border-t border-on-primary-container/20">
        <NavItem icon="contact_support" label="Soporte" />
      </div>
    </aside>
  )
}