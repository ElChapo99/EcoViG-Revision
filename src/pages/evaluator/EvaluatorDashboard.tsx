import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function EvaluatorDashboard() {
  const { logout } = useAuth();

  return (
    <div className="p-8 text-white relative z-10">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(52,211,153,0.3)] border border-emerald-500/30 flex items-center justify-center bg-black/40">
            <img 
              src="/ecovig-logo.svg" 
              alt="EcoViG" 
              className="w-full h-full object-cover select-none pointer-events-none" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-emerald-400 uppercase">EcoViG</span>
              <span className="text-slate-500">•</span>
              <h1 className="text-xl font-bold">Panel de Evaluador</h1>
            </div>
            <p className="text-xs text-slate-400">Estadísticas agregadas y comparativas socioambientales</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors p-2 bg-white/5 rounded-xl border border-white/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
      <p>Aquí se visualizarán estadísticas agregadas y comparativas entre escuelas.</p>
    </div>
  );
}
