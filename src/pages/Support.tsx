import React, { useEffect } from 'react';
import { Link } from 'react-router';
import { 
  ArrowLeft, 
  HelpCircle, 
  Mail, 
  KeyRound, 
  Inbox, 
  School, 
  ShieldCheck, 
  FileText, 
  UserX,
  AlertTriangle
} from 'lucide-react';
import { SUPPORT_CONFIG } from '../config/legalConfig';

export default function Support() {
  useEffect(() => {
    document.title = 'Soporte | EcoViG';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full flex flex-col justify-between">
      <div>
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Iniciar Sesión</span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            title="Inicio EcoViG"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-[0_0_12px_rgba(52,211,153,0.3)] border border-emerald-500/30 flex items-center justify-center bg-black/40 group-hover:border-emerald-400 transition-colors">
              <img 
                src="/ecovig-logo.svg" 
                alt="EcoViG" 
                className="w-full h-full object-cover select-none pointer-events-none" 
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-bold tracking-tight text-sm hidden sm:inline"><span className="text-white">Eco</span><span className="text-emerald-400">ViG</span></span>
          </Link>

          <Link
            to="/policies"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ver Políticas</span>
          </Link>
        </div>

        {/* Header Hero */}
        <header className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <HelpCircle className="w-4 h-4" />
            <span>Centro de Ayuda</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Soporte EcoViG
          </h1>
          <p className="text-xl font-light text-emerald-300 mb-3">
            ¿Necesitas ayuda?
          </p>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Estamos aquí para ayudarte con el acceso y uso de la plataforma EcoViG. Revisa las preguntas frecuentes a continuación o ponte en contacto con nuestro equipo.
          </p>
        </header>

        {/* Support Sections Grid */}
        <div className="space-y-6">
          {/* Section A: Problemas para iniciar sesión */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white mb-2">
                  A. Problemas para iniciar sesión
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Si no recuerdas tu contraseña, utiliza la opción <strong className="text-emerald-400 font-medium">"¿Olvidaste tu contraseña?"</strong> desde la pantalla de inicio de sesión para recibir un código de recuperación en tu correo.
                </p>
              </div>
            </div>
          </section>

          {/* Section B: No recibí mi código de recuperación */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white mb-2">
                  B. No recibí mi código de recuperación
                </h2>
                <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                  Si solicitaste un código de restablecimiento y no lo encuentras, te sugerimos seguir estos pasos:
                </p>
                <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside pl-1">
                  <li>Revisar tu bandeja de entrada principal.</li>
                  <li>Revisar la carpeta de correo no deseado (spam) o promociones.</li>
                  <li>Verificar que el correo ingresado esté escrito correctamente y corresponda a tu cuenta registrada en EcoViG.</li>
                  <li>Esperar unos momentos, ya que la entrega puede tardar unos instantes según el proveedor de correo.</li>
                  <li>Utilizar la opción <em>"Reenviar código"</em> una vez que termine el temporizador en pantalla.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section C: Problemas con mi escuela o maestro */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <School className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white mb-2">
                  C. Problemas con mi escuela o maestro
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Si tu escuela, maestro o código de vinculación de 6 dígitos no corresponde o muestra un error de discrepancia escolar, comunícate con el docente a cargo de tu grupo o con el equipo responsable de EcoViG para verificar tu registro escolar.
                </p>
              </div>
            </div>
          </section>

          {/* Section D: Problemas con mi cuenta */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white mb-2">
                  D. Problemas con mi cuenta
                </h2>
                <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                  Podemos ayudarte si experimentas alguna de las siguientes situaciones:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-300">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>No puedo iniciar sesión</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Mi cuenta no aparece registrada</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Problemas con contraseña</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Problemas con código de vinculación</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 sm:col-span-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Dificultades generales de acceso a la plataforma</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section E: Eliminación de cuenta */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                <UserX className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white mb-2">
                  E. Eliminación de cuenta y datos
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Si deseas solicitar la baja definitiva de tu cuenta y los datos asociados, puedes realizar la solicitud directamente desde la sección de configuración de tu perfil dentro de la aplicación o escribiendo al equipo de soporte.
                </p>
              </div>
            </div>
          </section>

          {/* Section F: Contacto Directo */}
          <section className="bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-teal-950/30 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Mail className="w-4 h-4" />
                  <span>Contacto Oficial</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  ¿Aún necesitas asistencia?
                </h3>
                <p className="text-sm text-slate-300 mb-3">
                  Escríbenos indicando tu escuela y el problema que presentas:
                </p>
                <div className="inline-block text-sm text-slate-400">
                  <span>Correo de soporte: </span>
                  <a
                    href={`mailto:${SUPPORT_CONFIG.supportEmail}`}
                    className="font-mono text-emerald-400 font-semibold hover:underline break-all"
                  >
                    {SUPPORT_CONFIG.supportEmail}
                  </a>
                </div>
              </div>

              <a
                href={`mailto:${SUPPORT_CONFIG.supportEmail}?subject=Soporte%20EcoViG`}
                className="px-6 py-3 rounded-2xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 shrink-0 text-sm inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar Correo</span>
              </a>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} EcoViG — Plataforma de Educación y Vigilancia Ambiental.</p>
        <div className="flex items-center gap-4">
          <Link to="/policies" className="hover:text-emerald-400 transition-colors">
            Políticas de Privacidad y Uso
          </Link>
          <span>•</span>
          <Link to="/login" className="hover:text-emerald-400 transition-colors">
            Iniciar Sesión
          </Link>
        </div>
      </footer>
    </div>
  );
}
