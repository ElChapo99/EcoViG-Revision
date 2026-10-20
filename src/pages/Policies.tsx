import React, { useEffect } from 'react';
import { Link } from 'react-router';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  GraduationCap, 
  Database, 
  UserX, 
  FileText, 
  Clock, 
  Mail, 
  HelpCircle,
  CheckCircle2,
  School
} from 'lucide-react';
import { SUPPORT_CONFIG } from '../config/legalConfig';

export default function Policies() {
  useEffect(() => {
    document.title = 'Políticas | EcoViG';
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
            to="/support"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Ir a Soporte</span>
          </Link>
        </div>

        {/* Header Hero */}
        <header className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Marco Institucional y de Privacidad</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Políticas de EcoViG
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Última actualización: {SUPPORT_CONFIG.lastPoliciesUpdate}</span>
          </div>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Transparencia en el manejo de datos, privacidad, seguridad y condiciones de uso dentro del entorno educativo de EcoViG.
          </p>
        </header>

        {/* Policies Content */}
        <div className="space-y-8">
          {/* Section 1: Política de Privacidad */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <Database className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">1. Política de Privacidad y Datos Recopilados</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              EcoViG recopila y gestiona únicamente la información necesaria para el funcionamiento formativo y operativo de la plataforma. La información manejada incluye:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Nombre del participante:</strong> para identificación escolar y certificados.</span>
              </li>
              <li className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Correo electrónico:</strong> para autenticación, acceso y recuperación de cuenta.</span>
              </li>
              <li className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Escuela y docente vinculado:</strong> para asignación de grupo académico.</span>
              </li>
              <li className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Encuesta diagnóstica:</strong> respuestas para calcular puntajes iniciales pro-ambientales.</span>
              </li>
              <li className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Misiones y actividades:</strong> registro de misiones completadas y evidencias ecológicas.</span>
              </li>
              <li className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Progreso y gamificación:</strong> nivel, monedas ecológicas, experiencia (XP) y decoraciones.</span>
              </li>
            </ul>
          </section>

          {/* Section 2: Finalidad de los Datos */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <GraduationCap className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">2. Finalidad del Tratamiento de Datos</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              Los datos recolectados se utilizan exclusivamente para fines pedagógicos y operativos del proyecto EcoViG:
            </p>
            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside pl-1">
              <li>Permitir el acceso seguro a la cuenta del usuario.</li>
              <li>Vincular al estudiante con su centro escolar y profesor correspondiente.</li>
              <li>Dar seguimiento a las actividades y misiones ambientales realizadas.</li>
              <li>Visualizar el avance en el ecosistema virtual y niveles de aprendizaje.</li>
              <li>Permitir a los docentes y evaluadores generar reportes de participación de sus grupos.</li>
              <li>Garantizar la seguridad y prevenir accesos no autorizados a la plataforma.</li>
            </ul>
          </section>

          {/* Section 3: Seguridad de Contraseñas y Autenticación */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <Lock className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">3. Contraseñas y Autenticación</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              EcoViG <strong>no almacena contraseñas en texto plano</strong> ni tiene acceso a la contraseña del usuario. Las credenciales de acceso se gestionan de forma segura mediante los servicios de infraestructura de Firebase Authentication, aplicando estándares de cifrado para proteger la integridad de las cuentas.
            </p>
          </section>

          {/* Section 4: Recuperación de Contraseña */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <KeyRound className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">4. Recuperación Segura de Contraseña</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              En caso de olvido de contraseña, el usuario puede solicitar un código temporal de recuperación de 6 dígitos que se envía de forma exclusiva a su correo registrado. Este código cuenta con un tiempo de vigencia limitado y protección contra intentos repetidos, asegurando que solo el titular de la cuenta pueda restablecer el acceso.
            </p>
          </section>

          {/* Section 5: Entorno Educativo y Menores */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 text-teal-400">
              <School className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">5. Datos en el Entorno Educativo</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              EcoViG está destinado a escuelas, docentes y estudiantes en un marco educativo de vigilancia y conciencia ambiental. El uso de la plataforma se realiza en coordinación con los centros escolares participantes, limitando el tratamiento de datos al ámbito académico correspondiente.
            </p>
          </section>

          {/* Section 6: Conservación y Medidas de Seguridad */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">6. Conservación y Seguridad</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              Se aplican controles de acceso por roles estrictos (estudiante, docente, evaluador, administrador) para asegurar que cada usuario acceda únicamente a la información pertinente a su función académica:
            </p>
            <ul className="space-y-1.5 text-sm text-slate-300 list-disc list-inside pl-1">
              <li>Los estudiantes solo pueden ver y editar su propio perfil y progreso.</li>
              <li>Los docentes solo tienen acceso a los datos de los alumnos de su grupo escolar.</li>
              <li>Se aplican protocolos de comunicación segura HTTPS en todas las transacciones.</li>
            </ul>
          </section>

          {/* Section 7: Eliminación de Cuenta y Datos */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <UserX className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">7. Eliminación de Cuenta y Datos</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              EcoViG garantiza el derecho de los usuarios a gestionar sus datos personales conforme a los lineamientos de Google Play Store y el marco de privacidad escolar:
            </p>
            <ul className="space-y-3 text-sm text-slate-300 list-disc list-inside pl-1">
              <li>
                <strong>Desde la aplicación:</strong> Los estudiantes pueden tramitar tanto su <em>Baja académica</em> escolar como la <em>Eliminación definitiva de cuenta y datos personales</em> desde la pestaña de Perfil y Privacidad.
              </li>
              <li>
                <strong>Página pública oficial de eliminación:</strong> Cualquier usuario puede tramitar la supresión de su cuenta sin iniciar sesión desde la web oficial:{' '}
                <a href="https://ecovig.net/eliminar-cuenta" className="text-red-400 font-semibold underline underline-offset-2 hover:text-red-300">
                  https://ecovig.net/eliminar-cuenta
                </a>.
              </li>
              <li>
                <strong>Verificación segura de identidad:</strong> Para evitar solicitudes fraudulentas o de terceros no autorizados, el trámite web requiere la confirmación de un enlace criptográfico de corta duración enviado al correo registrado del titular.
              </li>
              <li>
                <strong>Alcance de la eliminación:</strong> Se eliminan permanentemente las credenciales de Firebase Authentication, el perfil de Firestore, evidencias fotográficas o multimedia en Firebase Storage, registros de misiones y puntos. Si existen métricas agregadas de participación institucional requeridas por la escuela, se conservan de forma estrictamente disociada y anonimizada.
              </li>
              <li>
                <strong>Por correo de soporte:</strong> También es posible canalizar consultas de privacidad contactando a <a href={`mailto:${SUPPORT_CONFIG.supportEmail}`} className="text-emerald-400 hover:underline">{SUPPORT_CONFIG.supportEmail}</a>.
              </li>
            </ul>
          </section>

          {/* Section 8: Términos de Uso */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <FileText className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">8. Términos de Uso de la Plataforma</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              Al utilizar EcoViG, los usuarios se comprometen a:
            </p>
            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside pl-1">
              <li>Hacer un uso legítimo y respetuoso de la plataforma con fines educativos.</li>
              <li>No intentar acceder a cuentas ajenas ni compartir credenciales personales.</li>
              <li>No manipular códigos de vinculación, actividades, encuestas o registros de evidencia ambiental.</li>
              <li>Respetar las directrices de convivencia y trabajo establecidas por sus docentes y escuelas.</li>
            </ul>
          </section>

          {/* Section 9: Actualizaciones */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <Clock className="w-5 h-5" />
              <h2 className="text-xl font-bold text-white">9. Actualizaciones de estas Políticas</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Estas políticas pueden ser actualizadas periódicamente para reflejar mejoras operativas, pedagógicas o técnicas en EcoViG. La fecha de la versión más reciente se muestra al inicio de este documento.
            </p>
          </section>

          {/* Section 10: Contacto */}
          <section className="bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-teal-950/30 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Mail className="w-4 h-4" />
                  <span>Contacto de Privacidad</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Dudas sobre privacidad o tus datos
                </h3>
                <p className="text-sm text-slate-300 mb-3">
                  Para cualquier aclaración relacionada con el tratamiento de tus datos o términos de uso:
                </p>
                <div className="inline-block text-sm text-slate-400">
                  <span>Correo oficial: </span>
                  <a
                    href={`mailto:${SUPPORT_CONFIG.supportEmail}`}
                    className="font-mono text-emerald-400 font-semibold hover:underline break-all"
                  >
                    {SUPPORT_CONFIG.supportEmail}
                  </a>
                </div>
              </div>

              <a
                href={`mailto:${SUPPORT_CONFIG.supportEmail}?subject=Consulta%20de%20Privacidad%20EcoViG`}
                className="px-6 py-3 rounded-2xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 shrink-0 text-sm inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Contactar Soporte</span>
              </a>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} EcoViG — Plataforma de Educación y Vigilancia Ambiental.</p>
        <div className="flex items-center gap-4">
          <Link to="/support" className="hover:text-emerald-400 transition-colors">
            Centro de Soporte
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
