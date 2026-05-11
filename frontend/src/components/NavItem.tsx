export default function NavItem({icon, label, href = "#", active = false, onClick}: {icon: string, label: string, href?: string, active?: boolean, onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void}) {

    const base = "flex items-center gap-md p-md font-sans text-label-md font-medium rounded-r-lg transition-all duration-150";


  const activeClass =
    "bg-tertiary-container text-on-tertiary-container border-l-4 border-on-tertiary-container";

  const inactiveClass =
    "text-on-primary-container opacity-70 hover:bg-primary-fixed-dim hover:text-on-primary-fixed-variant hover:opacity-100 scale-95 hover:scale-100";

    
    return (
     <a
      href={href}
      onClick={onClick}
      className={`${base} ${active ? activeClass : inactiveClass}`}
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
      {label}
    </a>
    )
}