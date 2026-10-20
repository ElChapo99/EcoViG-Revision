import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="min-h-screen text-white font-sans selection:bg-emerald-500/30">
      <header className="h-[80px] flex items-center justify-between px-6 md:px-10 border-b border-white/5 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(52,211,153,0.4)] border border-emerald-500/30 flex items-center justify-center bg-black/40">
            <img 
              src="/ecovig-logo.svg" 
              alt="EcoViG" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-xl font-bold tracking-tight"><span className="text-white">Eco</span><span className="text-emerald-400">ViG</span></span>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">Entrar</Link>
          <Link to="/register" className="bg-emerald-500 text-black px-5 py-2 rounded-full font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:bg-emerald-400 transition-all">
            Comenzar
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-6">
            Proyecto de Educación Ambiental
          </span>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white mb-8 leading-tight">
            Descubre tu impacto, <br />
            <span className="text-emerald-400 font-medium">transforma tu mundo.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Una experiencia interactiva para estudiantes donde tus hábitos diarios evolucionan tu propio ecosistema virtual.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto bg-emerald-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.4)]">
              Crear mi cuenta <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full max-w-5xl"
        >
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-md">
            <div className="text-emerald-400 mb-6 opacity-80">
              <span className="text-4xl">💧</span>
            </div>
            <h3 className="text-2xl font-light mb-3">Mide tus hábitos</h3>
            <p className="text-slate-400 leading-relaxed text-sm">Responde situaciones cotidianas para conocer cómo interactúas con el medio ambiente de forma honesta.</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-md">
            <div className="text-green-400 mb-6 opacity-80">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-2xl font-light mb-3">Cumple retos</h3>
            <p className="text-slate-400 leading-relaxed text-sm">Recibe misiones personalizadas diseñadas especialmente para las áreas donde puedes hacer el mayor impacto.</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[32px] backdrop-blur-md relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-400/10 blur-2xl"></div>
            <div className="text-emerald-400 mb-6">
              <span className="text-4xl">🌱</span>
            </div>
            <h3 className="text-2xl font-light mb-3">Evoluciona</h3>
            <p className="text-emerald-100/70 leading-relaxed text-sm">Observa cómo tu propio ecosistema virtual cobra vida y crece al completar tus misiones diarias.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
