import { useState } from "react";

export default function LoginDataFlow() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login:", form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-8"
      style={{
        backgroundImage:
          "radial-gradient(at 0% 0%, rgba(213,227,253,0.4) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(185,199,224,0.25) 0px, transparent 50%)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div className="w-full max-w-[440px] flex flex-col gap-8">

        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-[52px] h-[52px] bg-[#131b2e] rounded-xl flex items-center justify-center mb-1 shadow-md">
            <span
              className="material-symbols-outlined text-[#adc6ff] text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              database
            </span>
          </div>
          <h1
            className="text-[28px] font-semibold text-[#131b2e] tracking-tight leading-tight"
            style={{ fontFamily: "IBM Plex Sans, sans-serif" }}
          >
            SINSI NARIÑO
          </h1>
          <p className="text-sm text-[#45464d]">
            Sistema Integrado de Niñez en Salud Infantil
          </p>
        </div>

        {/* Login Card */}
        <div
          className="bg-white border border-[#c6c6cd] rounded-xl px-8 py-9"
          style={{
            boxShadow:
              "0 1px 3px 0 rgba(15,23,42,0.08), 0 10px 15px -3px rgba(15,23,42,0.03)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="text-sm font-medium text-[#191c1e] tracking-wide"
              >
                Nombre de usuario
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d] text-xl transition-colors group-focus-within:text-[#3980f4]">
                  person
                </span>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder=" correo@ejemplo.com"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full h-12 pl-11 pr-4 border border-[#76777d] rounded-lg bg-white text-sm text-[#191c1e] placeholder:text-[#76777d]/50 outline-none focus:border-[#3980f4] focus:ring-2 focus:ring-[#3980f4]/15 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#191c1e] tracking-wide"
                >
                  Contraseña
                </label>
                <a
                  href="#"
                  className="text-xs font-semibold text-[#3980f4] hover:underline underline-offset-4 decoration-2"
                >
                  ¿Olvidó su contraseña?
                </a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d] text-xl  group-focus-within:text-[#3980f4] transition-colors">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full h-12 pl-11 pr-11 border border-[#76777d] rounded-lg bg-white text-sm text-[#191c1e] placeholder:text-[#76777d]/50 outline-none focus:border-[#3980f4] focus:ring-2 focus:ring-[#3980f4]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#191c1e] transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-[#76777d] text-[#131b2e] focus:ring-[#131b2e] cursor-pointer accent-[#131b2e]"
              />
              <label
                htmlFor="remember"
                className="text-sm text-[#45464d] cursor-pointer select-none"
              >
                Recordar mis credenciales en este equipo
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-12 bg-[#131b2e] text-white text-sm font-medium tracking-wide rounded-lg flex items-center justify-center gap-2 mt-1 shadow-md hover:bg-[#1e2d47] active:scale-[0.98] transition-all"
            >
              <span>Acceder al Sistema</span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <footer className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-5 text-xs font-semibold text-[#45464d]">
            <a href="#" className="hover:text-[#131b2e] transition-colors">
              Términos de Servicio
            </a>
            <span className="w-1 h-1 bg-[#76777d] rounded-full" />
            <a href="#" className="hover:text-[#131b2e] transition-colors">
              Privacidad
            </a>
            <span className="w-1 h-1 bg-[#76777d] rounded-full" />
            <a href="#" className="hover:text-[#131b2e] transition-colors">
              Soporte Técnico
            </a>
          </div>

        </footer>
      </div>
    </div>
  );
}
