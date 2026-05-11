export default function TopBar({title="SINSI Nariño", avatarSrc,onSearch}: {title?: string, avatarSrc?: string, onSearch?: (query: string) => void}) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-[24px] h-16 bg-surface-container-lowest shadow-sm border-b border-outline-variant">
            <div className="flex items-center gap-md">
                <span className="text-h3 font-display font-bold text-primary">{title}</span>
            </div>

        <div className="flex items-center gap-lg">
        {/* Buscador — oculto en móvil */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Buscar módulos..."
            onChange={(e) => onSearch?.(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-outline bg-surface focus:ring-2 focus:ring-on-tertiary-container outline-none text-body-sm w-64 transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-2 text-outline text-xl">
            search
          </span>
        </div>

        {/* Íconos de acción */}
        <div className="flex items-center gap-md">
          {["notifications", "help", "settings"].map((icon) => (
            <button
              key={icon}
              className="material-symbols-outlined text-primary hover:text-on-primary-container transition-colors cursor-pointer bg-transparent border-none"
              aria-label={icon}
            >
              {icon}
            </button>
          ))}

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar de usuario" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container text-base">person</span>
              </div>
            )}
          </div>
        </div>
      </div>
        </header>
    )
}