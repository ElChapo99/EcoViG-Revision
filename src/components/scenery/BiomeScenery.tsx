import React from 'react';

interface BiomeSceneryProps {
  biomeId: 'forest' | 'desert' | 'mountain' | 'city';
}

export default function BiomeScenery({ biomeId }: BiomeSceneryProps) {
  if (biomeId === 'forest') {
    return <ForestScenery />;
  }
  if (biomeId === 'desert') {
    return <DesertScenery />;
  }
  if (biomeId === 'mountain') {
    return <MountainScenery />;
  }
  if (biomeId === 'city') {
    return <CityScenery />;
  }
  return null;
}

/**
 * 🌲 BOSQUE MÁGICO Y REALISTA (FOREST SCENERY)
 * - Atmósfera con rayos crepusculares (God Rays)
 * - Cordillera lejana con neblina matutina en movimiento
 * - Silueta de árboles ancestrales con vaivén orgánico por el viento
 * - Río cristalino serpenteante con ondas y destellos
 * - Luciérnagas luminosas y hojas danzantes en el aire
 * - Colinas con musgo, helechos y tréboles
 */
function ForestScenery() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
      {/* 1. SKY GRADIENT & SUN GLOW */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c2420] via-[#08332b] to-[#041c17]" />

      {/* 2. RADIANT SUN & VOLUMETRIC GOD RAYS */}
      <div className="absolute -top-10 right-1/4 sm:right-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-amber-300/30 via-emerald-400/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 sm:right-1/3 w-40 h-40 rounded-full bg-amber-200/40 blur-2xl animate-pulse pointer-events-none" />

      {/* God Rays (Haces de luz solar que atraviesan la copa del bosque) */}
      <svg className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 600">
        <defs>
          <linearGradient id="godRay1" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.55" />
            <stop offset="40%" stopColor="#6ee7b7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="godRay2" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Ray 1 */}
        <polygon points="650,0 720,0 450,600 320,600" fill="url(#godRay1)" className="anim-god-ray" />
        {/* Ray 2 */}
        <polygon points="680,0 770,0 600,600 480,600" fill="url(#godRay2)" className="anim-god-ray" style={{ animationDelay: '2s' }} />
        {/* Ray 3 */}
        <polygon points="610,0 660,0 280,600 200,600" fill="url(#godRay1)" className="anim-god-ray" style={{ animationDelay: '4s' }} />
      </svg>

      {/* 3. DISTANT BIRDS SOARING (Aves rapaces en la lejanía) */}
      <div className="absolute top-12 left-1/4 anim-bird-soar opacity-60">
        <svg viewBox="0 0 40 18" className="w-7 h-3 text-emerald-300 fill-current">
          <path d="M0,12 Q10,0 20,8 Q30,0 40,12 Q28,5 20,10 Q12,5 0,12 Z" />
        </svg>
      </div>
      <div className="absolute top-20 left-1/3 anim-bird-soar opacity-45" style={{ animationDelay: '-6s', transform: 'scale(0.6)' }}>
        <svg viewBox="0 0 40 18" className="w-5 h-2.5 text-emerald-200 fill-current">
          <path d="M0,12 Q10,0 20,8 Q30,0 40,12 Q28,5 20,10 Q12,5 0,12 Z" />
        </svg>
      </div>

      {/* 4. DISTANT MOUNTAIN SILHOUETTES & HORIZON (Capas lejanas con bruma) */}
      <svg className="absolute bottom-[28%] inset-x-0 w-full h-56 opacity-75" preserveAspectRatio="none" viewBox="0 0 1200 300">
        <defs>
          <linearGradient id="farMountain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f3d35" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#06241f" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="midMountain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0b463a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#04211a" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Far Ridge */}
        <path d="M0,180 Q160,80 320,140 T640,100 T960,130 T1200,80 L1200,300 L0,300 Z" fill="url(#farMountain)" />
        {/* Mid Ridge */}
        <path d="M0,220 Q200,120 400,170 T800,140 T1200,160 L1200,300 L0,300 Z" fill="url(#midMountain)" opacity="0.8" />
      </svg>

      {/* 5. FLOATING MIST / FOG LAYERS (Bruma del bosque en movimiento continuo) */}
      <div className="absolute bottom-[30%] inset-x-0 h-28 pointer-events-none opacity-45 anim-mist-1">
        <div className="w-[140%] -ml-[20%] h-full bg-gradient-to-t from-emerald-800/40 via-teal-700/20 to-transparent blur-xl" />
      </div>
      <div className="absolute bottom-[24%] inset-x-0 h-24 pointer-events-none opacity-35 anim-mist-2">
        <div className="w-[140%] -ml-[10%] h-full bg-gradient-to-t from-emerald-600/30 via-emerald-900/15 to-transparent blur-2xl" />
      </div>

      {/* 6. DISTANT WATERFALL & CASCADE (Cascada lejana en las rocas) */}
      <div className="absolute bottom-[32%] right-[18%] sm:right-[22%] w-6 h-28 opacity-80 pointer-events-none">
        <svg viewBox="0 0 24 100" className="w-full h-full">
          <defs>
            <linearGradient id="waterfallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#99f6e4" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#67e8f9" />
            </linearGradient>
          </defs>
          <path d="M6,0 Q12,40 10,70 Q8,90 12,100 L16,100 Q14,90 16,70 Q18,40 14,0 Z" fill="url(#waterfallGrad)" className="anim-river-shimmer" />
          <circle cx="12" cy="98" r="6" fill="#a7f3d0" className="animate-ping opacity-60" />
        </svg>
      </div>

      {/* 7. MIDGROUND ANCIENT FOREST CANOPY SILHOUETTE (Bosque profundo con copas de robles y pinos mecidas por el viento) */}
      <svg className="absolute bottom-[25%] inset-x-0 w-full h-64" preserveAspectRatio="none" viewBox="0 0 1200 320">
        <defs>
          <linearGradient id="forestCanopyBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#093f34" />
            <stop offset="60%" stopColor="#052821" />
            <stop offset="100%" stopColor="#021612" />
          </linearGradient>
          <linearGradient id="forestCanopyFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0d5244" />
            <stop offset="60%" stopColor="#07332a" />
            <stop offset="100%" stopColor="#031b15" />
          </linearGradient>
        </defs>

        {/* Back swaying tree group */}
        <g className="anim-tree-sway-2" opacity="0.85">
          {/* Cluster Left */}
          <path d="M-20,320 L-20,130 C10,90 60,85 80,120 C100,75 160,70 190,110 C220,80 270,95 280,140 C310,105 360,115 370,160 C390,130 430,140 440,200 L440,320 Z" fill="url(#forestCanopyBack)" />
          {/* Cluster Mid-Right */}
          <path d="M520,320 L520,160 C550,110 610,105 640,140 C670,90 740,95 770,130 C800,100 860,110 880,150 C920,120 970,130 990,180 L990,320 Z" fill="url(#forestCanopyBack)" />
        </g>

        {/* Front swaying tree group with rich organic contours */}
        <g className="anim-tree-sway-1">
          {/* Detailed Pine / Oak Tree silhouettes */}
          <path d="M60,320 L60,180 C80,140 120,135 140,165 C160,120 220,115 250,155 C280,130 330,140 340,185 C370,160 410,170 420,220 L420,320 Z" fill="url(#forestCanopyFront)" />
          <path d="M720,320 L720,170 C750,125 810,120 840,155 C870,110 930,115 960,150 C990,125 1050,135 1070,180 C1100,150 1150,160 1170,210 L1170,320 Z" fill="url(#forestCanopyFront)" />
          {/* Central majestic Ancient Oak branch reach */}
          <path d="M420,320 L420,200 C450,160 490,155 510,185 C540,140 600,145 620,180 C660,150 710,165 730,210 L730,320 Z" fill="url(#forestCanopyFront)" />
        </g>
      </svg>

      {/* 8. FLOWING CRYSTAL STREAM / RIVER (Río vivo serpenteando por el valle) */}
      <svg className="absolute bottom-0 inset-x-0 w-full h-44 z-10" preserveAspectRatio="none" viewBox="0 0 1200 240">
        <defs>
          <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f766e" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#14b8a6" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0e7490" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="riverBankGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3a2f" />
            <stop offset="100%" stopColor="#0a2019" />
          </linearGradient>
        </defs>

        {/* River Bed Silhouette */}
        <path d="M750,0 Q680,60 560,100 Q420,145 280,180 Q140,215 0,240 L1200,240 L1200,210 Q980,170 880,120 Q800,75 790,0 Z" fill="#042f2e" opacity="0.8" />
        
        {/* Flowing Water Surface */}
        <path d="M760,0 Q690,60 570,100 Q430,145 290,180 Q150,215 0,240 L60,240 Q200,210 340,175 Q480,140 620,95 Q730,55 780,0 Z" fill="url(#riverGrad)" className="anim-river-shimmer" />

        {/* River Foam and Animated Wavelets */}
        <g className="anim-river-shimmer" opacity="0.8">
          <path d="M600,105 Q620,100 650,106" stroke="#ccfbf1" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M460,142 Q490,137 520,144" stroke="#a5f3fc" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M310,180 Q345,175 380,182" stroke="#e0f2fe" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M160,215 Q200,210 240,218" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      </svg>

      {/* 9. FOREGROUND TERRAIN WITH MOSSY HILLS & FLORA (Suelo orgánico con lomas de musgo y helechos) */}
      <svg className="absolute bottom-0 inset-x-0 w-full h-36 z-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1200 200">
        <defs>
          <linearGradient id="mossHill1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="40%" stopColor="#043c2e" />
            <stop offset="100%" stopColor="#021c15" />
          </linearGradient>
          <linearGradient id="mossHill2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="40%" stopColor="#065f46" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>
          <radialGradient id="mushroomGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Back Hill Layer */}
        <path d="M0,130 Q180,50 360,95 T720,70 T1080,105 T1200,80 L1200,200 L0,200 Z" fill="url(#mossHill1)" opacity="0.95" />

        {/* Foreground Layer (Left and Right Bank contours) */}
        <path d="M0,90 Q160,40 320,110 L320,200 L0,200 Z" fill="url(#mossHill2)" />
        <path d="M820,100 Q980,55 1200,90 L1200,200 L820,200 Z" fill="url(#mossHill2)" />

        {/* Decorative wild clover & ferns along the moss edge */}
        <g fill="#10b981" opacity="0.8">
          <circle cx="90" cy="75" r="4" />
          <circle cx="95" cy="72" r="3.5" />
          <circle cx="100" cy="76" r="4" />

          <circle cx="210" cy="90" r="5" fill="#34d399" />
          <circle cx="216" cy="86" r="4" fill="#34d399" />
          
          <circle cx="940" cy="85" r="4" fill="#34d399" />
          <circle cx="948" cy="82" r="4.5" fill="#10b981" />
          <circle cx="1050" cy="95" r="5" fill="#059669" />
        </g>

        {/* Bioluminescent Woodland Mini Mushrooms on the banks */}
        <g>
          <circle cx="160" cy="82" r="10" fill="url(#mushroomGlow)" className="animate-pulse" />
          <ellipse cx="160" cy="82" rx="4" ry="2.5" fill="#6ee7b7" />
          <rect x="159" y="82" width="2" height="5" fill="#e2e8f0" />

          <circle cx="990" cy="78" r="12" fill="url(#mushroomGlow)" className="animate-pulse" style={{ animationDelay: '1s' }} />
          <ellipse cx="990" cy="78" rx="5" ry="3" fill="#34d399" />
          <rect x="989" y="78" width="2" height="6" fill="#e2e8f0" />
        </g>
      </svg>

      {/* 10. ANIMATED FOREST PARTICLES (Luciérnagas vivas y hojas de otoño flotantes) */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Firefly 1 */}
        <div className="absolute top-[35%] left-[18%] anim-firefly-1">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#34d399]" />
        </div>
        {/* Firefly 2 */}
        <div className="absolute top-[48%] left-[42%] anim-firefly-2">
          <div className="w-3 h-3 rounded-full bg-amber-300 shadow-[0_0_14px_#f59e0b]" />
        </div>
        {/* Firefly 3 */}
        <div className="absolute top-[40%] right-[25%] anim-firefly-1" style={{ animationDelay: '-3s' }}>
          <div className="w-2 h-2 rounded-full bg-emerald-200 shadow-[0_0_10px_#10b981]" />
        </div>
        {/* Firefly 4 */}
        <div className="absolute bottom-[28%] right-[38%] anim-firefly-2" style={{ animationDelay: '-1.5s' }}>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-200 shadow-[0_0_12px_#fde047]" />
        </div>
        {/* Firefly 5 */}
        <div className="absolute top-[25%] right-[15%] anim-firefly-1" style={{ animationDelay: '-4.5s' }}>
          <div className="w-2 h-2 rounded-full bg-teal-300 shadow-[0_0_10px_#2dd4bf]" />
        </div>

        {/* Tumbling Golden & Amber Leaves */}
        <div className="absolute top-10 left-[15%] anim-leaf-1">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-400 fill-current drop-shadow-sm opacity-80">
            <path d="M12,2 C12,2 18,7 18,13 C18,17 15,20 12,22 C9,20 6,17 6,13 C6,7 12,2 12,2 Z" />
          </svg>
        </div>
        <div className="absolute top-16 right-[28%] anim-leaf-2">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-emerald-400 fill-current drop-shadow-sm opacity-75">
            <path d="M12,2 C12,2 18,7 18,13 C18,17 15,20 12,22 C9,20 6,17 6,13 C6,7 12,2 12,2 Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * 🌵 DESIERTO DORADO Y OASIS (DESERT SCENERY)
 * - Sol abrasador con corona solar animada y rayos térmicos
 * - Mesas y cañones de arenisca estratificada en la lejanía
 * - Dunas ondulantes con sombras de viento y oleaje de arena
 * - Espejismo de calor (Heat Shimmer) y polvo dorado en suspensión
 * - Laguna de oasis turquesa con ondas cristalinas
 * - Rodadora del desierto (Tumbleweed) rodando por el terreno
 */
function DesertScenery() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
      {/* 1. SKY GRADIENT & WARM THERMAL ATMOSPHERE */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2d1205] via-[#4d1f08] to-[#1c0a02]" />

      {/* 2. BLAZING SUN WITH CORONA & THERMAL RAYS */}
      <div className="absolute -top-12 right-1/4 sm:right-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-amber-200/40 via-orange-500/20 to-transparent blur-3xl pointer-events-none anim-sun-corona" />
      <div className="absolute top-2 right-1/4 sm:right-1/3 w-36 h-36 rounded-full bg-amber-100/50 blur-xl animate-pulse pointer-events-none" />

      {/* Thermal Rays & Solar Flares */}
      <svg className="absolute inset-0 w-full h-full opacity-50 mix-blend-screen pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 600">
        <defs>
          <linearGradient id="desertRay" x1="0%" y1="0%" x2="40%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points="680,0 750,0 480,600 360,600" fill="url(#desertRay)" className="anim-god-ray" />
        <polygon points="720,0 790,0 620,600 500,600" fill="url(#desertRay)" className="anim-god-ray" style={{ animationDelay: '3s' }} />
      </svg>

      {/* 3. CIRCLING DESERT HAWKS / VULTURES (Aves rapaces en las térmicas) */}
      <div className="absolute top-10 left-1/4 anim-bird-soar opacity-55">
        <svg viewBox="0 0 40 18" className="w-6 h-3 text-amber-200 fill-current">
          <path d="M0,12 Q10,0 20,8 Q30,0 40,12 Q28,5 20,10 Q12,5 0,12 Z" />
        </svg>
      </div>
      <div className="absolute top-16 left-1/3 anim-bird-soar opacity-40" style={{ animationDelay: '-8s', transform: 'scale(0.55)' }}>
        <svg viewBox="0 0 40 18" className="w-5 h-2.5 text-amber-300 fill-current">
          <path d="M0,12 Q10,0 20,8 Q30,0 40,12 Q28,5 20,10 Q12,5 0,12 Z" />
        </svg>
      </div>

      {/* 4. DISTANT STRATIFIED RED ROCK MESAS & CANYONS (Mesetas y cañones lejanos) */}
      <svg className="absolute bottom-[28%] inset-x-0 w-full h-56 opacity-85" preserveAspectRatio="none" viewBox="0 0 1200 300">
        <defs>
          <linearGradient id="mesaBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7c2d12" />
            <stop offset="40%" stopColor="#591c0b" />
            <stop offset="100%" stopColor="#2e0e05" />
          </linearGradient>
          <linearGradient id="mesaFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9a3412" />
            <stop offset="40%" stopColor="#6c220a" />
            <stop offset="100%" stopColor="#3d1205" />
          </linearGradient>
        </defs>

        {/* Far Mesas */}
        <path d="M0,210 L100,210 L140,160 L240,160 L280,210 L440,210 L480,140 L620,140 L660,210 L820,210 L860,150 L980,150 L1020,210 L1200,210 L1200,300 L0,300 Z" fill="url(#mesaBack)" />
        {/* Mid Mesas & Eroded Spires */}
        <path d="M60,300 L60,190 L160,190 L190,240 L320,240 L370,170 L510,170 L550,250 L700,250 L750,180 L880,180 L920,260 L1140,260 L1200,200 L1200,300 Z" fill="url(#mesaFront)" opacity="0.9" />

        {/* Stratification Lines on Mesas */}
        <g stroke="#ea580c" strokeWidth="1" opacity="0.4">
          <line x1="145" y1="175" x2="235" y2="175" />
          <line x1="485" y1="155" x2="615" y2="155" />
          <line x1="865" y1="165" x2="975" y2="165" />
          <line x1="375" y1="185" x2="505" y2="185" />
        </g>
      </svg>

      {/* 5. HEAT HAZE & MIRAGE SHIMMER (Espejismo y calima del desierto) */}
      <div className="absolute bottom-[28%] inset-x-0 h-28 pointer-events-none opacity-40 anim-heat-shimmer">
        <div className="w-[140%] -ml-[20%] h-full bg-gradient-to-t from-orange-600/35 via-amber-500/15 to-transparent blur-xl" />
      </div>

      {/* 6. MIDGROUND ROLLING SAND DUNES (Dunas majestuosas con aristas de viento) */}
      <svg className="absolute bottom-[24%] inset-x-0 w-full h-64" preserveAspectRatio="none" viewBox="0 0 1200 320">
        <defs>
          <linearGradient id="duneBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c2410c" />
            <stop offset="40%" stopColor="#852e09" />
            <stop offset="100%" stopColor="#3d1403" />
          </linearGradient>
          <linearGradient id="duneFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="45%" stopColor="#9a3412" />
            <stop offset="100%" stopColor="#451503" />
          </linearGradient>
          <linearGradient id="duneShadow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#451a03" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9a3412" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Back Dune wave */}
        <path d="M0,170 Q260,70 540,150 T1080,100 T1200,160 L1200,320 L0,320 Z" fill="url(#duneBack)" />
        {/* Back Dune wind shadow */}
        <path d="M0,170 Q260,70 540,150 L540,320 L0,320 Z" fill="url(#duneShadow)" opacity="0.6" />

        {/* Front Dune wave with sharp crest */}
        <path d="M0,230 Q300,110 680,190 T1200,140 L1200,320 L0,320 Z" fill="url(#duneFront)" />
        <path d="M0,230 Q300,110 680,190 L680,320 L0,320 Z" fill="url(#duneShadow)" opacity="0.75" />
      </svg>

      {/* 7. OASIS WATER LAGOON (Laguna cristalina turquesa en el oasis) */}
      <svg className="absolute bottom-0 inset-x-0 w-full h-44 z-10" preserveAspectRatio="none" viewBox="0 0 1200 240">
        <defs>
          <linearGradient id="oasisWaterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#2dd4bf" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Oasis Pool Bed */}
        <path d="M720,20 Q650,70 540,110 Q400,150 260,185 Q120,220 0,240 L1200,240 L1200,200 Q960,160 850,110 Q780,65 760,20 Z" fill="#1e293b" opacity="0.7" />

        {/* Oasis Rippling Water */}
        <path d="M730,20 Q660,70 550,110 Q410,150 270,185 Q130,220 0,240 L70,240 Q210,210 350,175 Q490,140 630,95 Q720,55 770,20 Z" fill="url(#oasisWaterGrad)" className="anim-oasis-wave" />

        {/* Water wave highlights */}
        <g className="anim-oasis-wave" opacity="0.85">
          <path d="M580,110 Q610,105 640,112" stroke="#ccfbf1" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M440,148 Q470,143 500,150" stroke="#a5f3fc" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M290,185 Q330,180 370,188" stroke="#e0f2fe" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </g>
      </svg>

      {/* 8. FOREGROUND SAND RIPPLES & DESERT FLOOR (Suelo con ondulaciones de arena de viento y piedras) */}
      <svg className="absolute bottom-0 inset-x-0 w-full h-36 z-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1200 200">
        <defs>
          <linearGradient id="sandFloorFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="35%" stopColor="#852e09" />
            <stop offset="100%" stopColor="#2b0e03" />
          </linearGradient>
          <linearGradient id="sandFloorBank" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="40%" stopColor="#9a3412" />
            <stop offset="100%" stopColor="#3d1403" />
          </linearGradient>
        </defs>

        {/* Back Sand Floor */}
        <path d="M0,120 Q220,50 440,100 T880,75 T1200,90 L1200,200 L0,200 Z" fill="url(#sandFloorFront)" />

        {/* Foreground Banks */}
        <path d="M0,90 Q170,45 340,115 L340,200 L0,200 Z" fill="url(#sandFloorBank)" />
        <path d="M800,105 Q980,60 1200,95 L1200,200 L800,200 Z" fill="url(#sandFloorBank)" />

        {/* Wind Ripples on Sand */}
        <g stroke="#f59e0b" strokeWidth="1.5" opacity="0.3" fill="none" strokeLinecap="round">
          <path d="M80,85 Q120,80 160,86" />
          <path d="M100,105 Q140,100 190,106" />
          <path d="M860,95 Q910,90 960,96" />
          <path d="M920,115 Q970,110 1020,116" />
        </g>

        {/* Desert Terracotta Pebbles */}
        <g fill="#78350f" opacity="0.8">
          <circle cx="120" cy="80" r="3.5" />
          <circle cx="126" cy="82" r="2.5" />
          <circle cx="280" cy="100" r="4" />
          <circle cx="880" cy="90" r="3.5" />
          <circle cx="1040" cy="102" r="4.5" />
        </g>
      </svg>

      {/* 9. ANIMATED DESERT PARTICLES (Polvo dorado en suspensión y rodadora rodante) */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Sand Dust Particles */}
        <div className="absolute top-[38%] left-[12%] anim-sand-dust-1">
          <div className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b]" />
        </div>
        <div className="absolute top-[46%] left-[30%] anim-sand-dust-2">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-200 shadow-[0_0_10px_#fde047]" />
        </div>
        <div className="absolute top-[32%] right-[22%] anim-sand-dust-1" style={{ animationDelay: '-4s' }}>
          <div className="w-2 h-2 rounded-full bg-amber-200 shadow-[0_0_8px_#fbbf24]" />
        </div>
        <div className="absolute bottom-[30%] right-[35%] anim-sand-dust-2" style={{ animationDelay: '-2s' }}>
          <div className="w-2.5 h-2.5 rounded-full bg-orange-300 shadow-[0_0_10px_#ea580c]" />
        </div>

        {/* Rolling Tumbleweed (Rodadora del desierto girando a lo largo del suelo) */}
        <div className="absolute bottom-[22%] left-0 anim-tumbleweed pointer-events-none">
          <svg viewBox="0 0 32 32" className="w-6 h-6 text-amber-600/80 fill-none stroke-current" strokeWidth="1.5">
            <circle cx="16" cy="16" r="13" strokeDasharray="3 2" />
            <path d="M4,16 Q16,8 28,16" />
            <path d="M8,8 Q16,24 24,8" />
            <path d="M6,22 Q16,14 26,22" />
            <circle cx="16" cy="16" r="6" strokeDasharray="2 2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * ⛰️ CUMBRES ALPINAS Y HIELO (MOUNTAIN SCENERY)
 * - Atmósfera de alta montaña con aurora boreal ondulante
 * - Sol frío de montaña / Luna alpina con halo prismático
 * - Cumbres escarpadas con neveros, glaciares y ventiscas de nieve en la cima
 * - Cascada de deshielo y torrente glaciar de aguas azul gélido con espuma viva
 * - Bosque de abetos y pinos de alta montaña mecidos por el viento
 * - Copos de nieve y partículas de hielo flotando en la brisa alpina
 */
function MountainScenery() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
      {/* 1. SKY GRADIENT & HIGH-ALTITUDE TWILIGHT */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b14] via-[#0f172a] to-[#1e1b4b]" />

      {/* 2. AURORA BOREALIS (Luces del norte ondulantes en el cielo alpino) */}
      <svg className="absolute top-0 inset-x-0 w-full h-48 opacity-45 mix-blend-screen pointer-events-none anim-aurora" preserveAspectRatio="none" viewBox="0 0 1000 300">
        <defs>
          <linearGradient id="auroraGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,80 Q250,20 500,70 T1000,40 L1000,180 Q750,240 500,190 T0,220 Z" fill="url(#auroraGrad1)" />
      </svg>

      {/* 3. COLD ALPINE SUN / MOON WITH FROSTY GLOW */}
      <div className="absolute -top-10 right-1/4 sm:right-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-sky-200/35 via-indigo-400/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-2 right-1/4 sm:right-1/3 w-32 h-32 rounded-full bg-sky-100/50 blur-xl animate-pulse pointer-events-none" />

      {/* Glacial Prismatic Light Rays */}
      <svg className="absolute inset-0 w-full h-full opacity-45 mix-blend-screen pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 600">
        <defs>
          <linearGradient id="glacierRay" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#67e8f9" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points="660,0 730,0 440,600 320,600" fill="url(#glacierRay)" className="anim-god-ray" />
        <polygon points="700,0 770,0 600,600 480,600" fill="url(#glacierRay)" className="anim-god-ray" style={{ animationDelay: '2.5s' }} />
      </svg>

      {/* 4. CIRCLING ANDEAN CONDOR / EAGLE (Cóndor andino planeando en la cumbre) */}
      <div className="absolute top-12 left-1/4 anim-bird-soar opacity-60">
        <svg viewBox="0 0 40 18" className="w-8 h-3.5 text-sky-200 fill-current">
          <path d="M0,14 Q8,0 20,7 Q32,0 40,14 Q28,6 20,11 Q12,6 0,14 Z" />
        </svg>
      </div>
      <div className="absolute top-20 left-1/3 anim-bird-soar opacity-40" style={{ animationDelay: '-7s', transform: 'scale(0.55)' }}>
        <svg viewBox="0 0 40 18" className="w-5 h-2.5 text-sky-300 fill-current">
          <path d="M0,14 Q8,0 20,7 Q32,0 40,14 Q28,6 20,11 Q12,6 0,14 Z" />
        </svg>
      </div>

      {/* 5. DISTANT SNOW-CAPPED JAGGED MASSIVE PEAKS (Picos alpinos lejanos con hielo perenne) */}
      <svg className="absolute bottom-[28%] inset-x-0 w-full h-64 opacity-90" preserveAspectRatio="none" viewBox="0 0 1200 320">
        <defs>
          <linearGradient id="mountainBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="mountainMidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
          <linearGradient id="snowcapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="60%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Far Peak Mountain Range */}
        <path d="M0,220 L120,80 L260,200 L400,60 L560,210 L720,50 L860,190 L1020,70 L1200,200 L1200,320 L0,320 Z" fill="url(#mountainBackGrad)" />

        {/* Snowcaps on Far Peaks */}
        <path d="M120,80 L160,130 L80,130 Z M400,60 L450,120 L350,120 Z M720,50 L770,110 L670,110 Z M1020,70 L1070,125 L970,125 Z" fill="url(#snowcapGrad)" opacity="0.85" />

        {/* Mid Jagged Peaks with Detailed Ridges */}
        <path d="M-40,320 L180,100 L380,270 L580,90 L780,260 L980,110 L1240,320 Z" fill="url(#mountainMidGrad)" />

        {/* Razor Snow Ridges on Mid Peaks */}
        <path d="M180,100 L240,170 L190,165 L180,100 L120,170 L170,165 Z" fill="url(#snowcapGrad)" />
        <path d="M580,90 L650,170 L595,160 L580,90 L510,170 L565,160 Z" fill="url(#snowcapGrad)" />
        <path d="M980,110 L1040,180 L990,175 L980,110 L920,180 L970,175 Z" fill="url(#snowcapGrad)" />
      </svg>

      {/* 6. SNOW PLUME / BLIZZARD SWIRL AT SUMMIT (Ventisca de nieve en la cima) */}
      <div className="absolute top-[30%] left-[45%] w-24 h-12 anim-snow-plume pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-sky-200/40 via-white/30 to-transparent blur-md transform rotate-6" />
      </div>

      {/* 7. ALPINE PINE TREE LINE & MELTING GLACIER CASCADE (Laderas con abetos y cascada) */}
      <svg className="absolute bottom-[24%] inset-x-0 w-full h-64" preserveAspectRatio="none" viewBox="0 0 1200 320">
        <defs>
          <linearGradient id="alpineForestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="glacialCascadeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Alpine Slope Tree Silhouettes with Wind Sway */}
        <g className="anim-tree-sway-1">
          {/* Pines Left */}
          <path d="M0,320 L0,210 L30,170 L60,210 L90,160 L120,210 L150,150 L180,210 L220,170 L260,220 L300,180 L340,320 Z" fill="url(#alpineForestGrad)" />
          {/* Pines Right */}
          <path d="M840,320 L880,180 L920,220 L960,160 L1000,210 L1040,150 L1080,210 L1120,170 L1160,210 L1200,180 L1200,320 Z" fill="url(#alpineForestGrad)" />
        </g>

        {/* Glacial Cascade rushing down between crags */}
        <path d="M575,60 Q585,120 580,180 Q575,230 585,270 L595,270 Q585,230 590,180 Q595,120 585,60 Z" fill="url(#glacialCascadeGrad)" className="anim-glacier-wave" />
        <circle cx="585" cy="265" r="8" fill="#e0f2fe" className="animate-ping opacity-60" />
      </svg>

      {/* 8. GLACIAL MELTWATER TORRENT / STREAM (Torrente glaciar cristalino con espuma viva) */}
      <svg className="absolute bottom-0 inset-x-0 w-full h-44 z-10" preserveAspectRatio="none" viewBox="0 0 1200 240">
        <defs>
          <linearGradient id="glacierStreamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#7dd3fc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Glacial Stream Bed */}
        <path d="M740,10 Q670,60 560,100 Q420,145 280,180 Q140,215 0,240 L1200,240 L1200,210 Q980,170 870,120 Q790,75 780,10 Z" fill="#0b1329" opacity="0.8" />

        {/* Glacial Flowing Surface */}
        <path d="M750,10 Q680,60 570,100 Q430,145 290,180 Q150,215 0,240 L60,240 Q200,210 340,175 Q480,140 620,95 Q720,55 770,10 Z" fill="url(#glacierStreamGrad)" className="anim-glacier-wave" />

        {/* White water foaming crests & rapids */}
        <g className="anim-glacier-wave" opacity="0.9">
          <path d="M590,105 Q620,100 650,106" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M450,142 Q480,137 515,144" stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M300,180 Q340,175 380,182" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M150,215 Q190,210 230,218" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      </svg>

      {/* 9. FOREGROUND ROCKY SCREE & FROST FLOOR (Suelo de roca granítica, líquenes y cristales de hielo) */}
      <svg className="absolute bottom-0 inset-x-0 w-full h-36 z-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1200 200">
        <defs>
          <linearGradient id="graniteRock1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="40%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
          <linearGradient id="graniteRock2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="40%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <radialGradient id="crystalGlintGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Back Granite Shelf */}
        <path d="M0,125 Q200,55 420,95 T840,65 T1200,90 L1200,200 L0,200 Z" fill="url(#graniteRock1)" />

        {/* Foreground Rock Ledges */}
        <path d="M0,90 Q170,40 340,110 L340,200 L0,200 Z" fill="url(#graniteRock2)" />
        <path d="M800,100 Q980,55 1200,90 L1200,200 L800,200 Z" fill="url(#graniteRock2)" />

        {/* Mountain Snow Patches & Alpine Lichen on Ledges */}
        <g fill="#e0f2fe" opacity="0.85">
          <ellipse cx="140" cy="78" rx="20" ry="4" />
          <ellipse cx="280" cy="100" rx="24" ry="5" />
          <ellipse cx="900" cy="85" rx="22" ry="4.5" />
          <ellipse cx="1060" cy="98" rx="28" ry="6" />
        </g>

        {/* Wild Edelweiss Flower Tufts */}
        <g fill="#ffffff" opacity="0.9">
          <circle cx="100" cy="72" r="3" />
          <circle cx="104" cy="69" r="2.5" />
          <circle cx="108" cy="73" r="3" />
          <circle cx="104" cy="72" r="2" fill="#fde047" />

          <circle cx="980" cy="80" r="3" />
          <circle cx="984" cy="77" r="2.5" />
          <circle cx="988" cy="81" r="3" />
          <circle cx="984" cy="80" r="2" fill="#fde047" />
        </g>

        {/* Sparkling Glacial Crystal embedded in rocks */}
        <g className="anim-glint">
          <circle cx="180" cy="80" r="8" fill="url(#crystalGlintGlow)" />
          <polygon points="180,74 184,80 180,86 176,80" fill="#a5f3fc" />
          
          <circle cx="1020" cy="88" r="9" fill="url(#crystalGlintGlow)" />
          <polygon points="1020,82 1025,88 1020,94 1015,88" fill="#e0f2fe" />
        </g>
      </svg>

      {/* 10. ANIMATED MOUNTAIN PARTICLES (Copos de nieve y cristales de hielo flotantes) */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Swirling Snow Flurries */}
        <div className="absolute top-10 left-[18%] anim-snow-1">
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
        </div>
        <div className="absolute top-16 left-[40%] anim-snow-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-100 shadow-[0_0_10px_#bae6fd]" />
        </div>
        <div className="absolute top-12 right-[25%] anim-snow-1" style={{ animationDelay: '-4s' }}>
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
        </div>
        <div className="absolute bottom-[35%] right-[38%] anim-snow-2" style={{ animationDelay: '-2s' }}>
          <div className="w-3 h-3 rounded-full bg-sky-200 shadow-[0_0_12px_#7dd3fc]" />
        </div>
        <div className="absolute top-[28%] right-[12%] anim-snow-1" style={{ animationDelay: '-6s' }}>
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
        </div>

        {/* Micro Ice Crystal Sparkles */}
        <div className="absolute top-[45%] left-[28%] anim-glint">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-200 shadow-[0_0_6px_#67e8f9]" />
        </div>
        <div className="absolute top-[52%] right-[20%] anim-glint" style={{ animationDelay: '1.5s' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-100 shadow-[0_0_6px_#a5f3fc]" />
        </div>
      </div>
    </div>
  );
}

/**
 * 🏙️ CIUDAD VERDE SOSTENIBLE (GREEN CITY SCENERY)
 * - Atmósfera de aire puro con haces de fotones solares limpios
 * - Rascacielos bioclimáticos con bosques verticales y cúpulas geodésicas
 * - Aerotram / Monorriel ecológico levitante deslizándose por el skybridge
 * - Turbinas eólicas de eje vertical girando en los techos
 * - Canal urbano restaurado con biofiltros, agua cristalina y ondas activas
 * - Paseo biófilo con pavimento solar, flores nativas y mariposas flotando
 * - Microburbujas de aire puro y partículas de Gaia en suspensión
 */
function CityScenery() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
      {/* 1. SKY GRADIENT & CLEAN AIR ATMOSPHERE */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#022220] via-[#04332d] to-[#011714]" />

      {/* 2. RADIANT CLEAN SUN & PHOTON RAYS */}
      <div className="absolute -top-10 right-1/4 sm:right-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-teal-200/35 via-emerald-400/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-2 right-1/4 sm:right-1/3 w-36 h-36 rounded-full bg-emerald-100/50 blur-xl animate-pulse pointer-events-none" />

      {/* Clean Photon Solar Rays */}
      <svg className="absolute inset-0 w-full h-full opacity-50 mix-blend-screen pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 600">
        <defs>
          <linearGradient id="cityRay" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#99f6e4" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points="670,0 740,0 460,600 340,600" fill="url(#cityRay)" className="anim-god-ray" />
        <polygon points="710,0 780,0 620,600 500,600" fill="url(#cityRay)" className="anim-god-ray" style={{ animationDelay: '2.8s' }} />
      </svg>

      {/* 3. WHITE DOVES / URBAN BIRDS CIRCLING (Palomas de la paz y aves urbanas) */}
      <div className="absolute top-12 left-1/4 anim-bird-soar opacity-65">
        <svg viewBox="0 0 40 18" className="w-7 h-3 text-teal-100 fill-current">
          <path d="M0,12 Q10,0 20,8 Q30,0 40,12 Q28,5 20,10 Q12,5 0,12 Z" />
        </svg>
      </div>
      <div className="absolute top-18 left-1/3 anim-bird-soar opacity-45" style={{ animationDelay: '-6s', transform: 'scale(0.6)' }}>
        <svg viewBox="0 0 40 18" className="w-5 h-2.5 text-emerald-200 fill-current">
          <path d="M0,12 Q10,0 20,8 Q30,0 40,12 Q28,5 20,10 Q12,5 0,12 Z" />
        </svg>
      </div>

      {/* 4. DISTANT ECO-SKYLINE & BIOPHILIC TOWERS (Rascacielos lejanos con bosques verticales) */}
      <svg className="absolute bottom-[28%] inset-x-0 w-full h-64 opacity-85" preserveAspectRatio="none" viewBox="0 0 1200 320">
        <defs>
          <linearGradient id="skylineBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="60%" stopColor="#042f2e" />
            <stop offset="100%" stopColor="#021a16" />
          </linearGradient>
          <linearGradient id="skylineFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="50%" stopColor="#065f46" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>
          <linearGradient id="glassFacet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5eead4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Back Tier Towers */}
        <g fill="url(#skylineBackGrad)" opacity="0.8">
          <rect x="60" y="90" width="70" height="230" rx="6" />
          <rect x="180" y="50" width="90" height="270" rx="8" />
          <rect x="330" y="110" width="60" height="210" rx="6" />
          <rect x="440" y="40" width="100" height="280" rx="8" />
          <rect x="600" y="80" width="80" height="240" rx="6" />
          <rect x="730" y="30" width="110" height="290" rx="10" />
          <rect x="890" y="70" width="90" height="250" rx="8" />
          <rect x="1030" y="100" width="80" height="220" rx="6" />
        </g>

        {/* Skybridge connecting towers */}
        <rect x="180" y="120" width="260" height="12" rx="4" fill="#0f766e" opacity="0.75" />
        <rect x="600" y="110" width="240" height="12" rx="4" fill="#0f766e" opacity="0.75" />

        {/* Front Tier Biophilic Towers with Terraces */}
        <g fill="url(#skylineFrontGrad)">
          {/* Tower 1 */}
          <path d="M110,320 L110,130 Q145,110 180,130 L180,320 Z" />
          <rect x="120" y="145" width="50" height="160" fill="url(#glassFacet)" rx="4" />
          {/* Tower 2: Bosco Verticale */}
          <path d="M260,320 L260,80 Q315,60 370,80 L370,320 Z" />
          <rect x="275" y="100" width="80" height="200" fill="url(#glassFacet)" rx="6" />
          {/* Tower 3: Spiral Eco-Arcology */}
          <path d="M520,320 L520,70 Q570,40 620,70 L620,320 Z" />
          <rect x="535" y="90" width="70" height="210" fill="url(#glassFacet)" rx="6" />
          {/* Tower 4: Solaria Apex */}
          <path d="M820,320 L820,60 Q880,30 940,60 L940,320 Z" />
          <rect x="835" y="80" width="90" height="220" fill="url(#glassFacet)" rx="8" />
          {/* Tower 5 */}
          <path d="M990,320 L990,120 Q1030,100 1070,120 L1070,320 Z" />
          <rect x="1005" y="135" width="50" height="170" fill="url(#glassFacet)" rx="4" />
        </g>

        {/* Vertical Forest Terraces & Greenery on Towers */}
        <g fill="#10b981" opacity="0.9">
          {/* Tower 2 foliage */}
          <circle cx="280" cy="120" r="8" fill="#34d399" />
          <circle cx="350" cy="140" r="9" fill="#10b981" />
          <circle cx="285" cy="180" r="10" fill="#059669" />
          <circle cx="345" cy="210" r="10" fill="#34d399" />
          {/* Tower 3 foliage */}
          <circle cx="540" cy="110" r="8" fill="#34d399" />
          <circle cx="600" cy="130" r="9" fill="#10b981" />
          <circle cx="545" cy="170" r="10" fill="#059669" />
          <circle cx="595" cy="200" r="11" fill="#34d399" />
          {/* Tower 4 foliage */}
          <circle cx="845" cy="100" r="9" fill="#34d399" />
          <circle cx="915" cy="120" r="10" fill="#10b981" />
          <circle cx="850" cy="160" r="11" fill="#059669" />
          <circle cx="920" cy="190" r="12" fill="#34d399" />
        </g>

        {/* Glowing Eco-Nodes on Towers */}
        <g className="anim-eco-pulse">
          <circle cx="315" cy="65" r="4" fill="#5eead4" />
          <circle cx="570" cy="45" r="5" fill="#34d399" />
          <circle cx="880" cy="35" r="5" fill="#5eead4" />
          <circle cx="1030" cy="105" r="4" fill="#6ee7b7" />
        </g>
      </svg>

      {/* 5. SPINNING ROOFTOP MICRO-TURBINES (Turbinas eólicas de eje vertical giratorias) */}
      <div className="absolute bottom-[48%] left-[26%] w-7 h-7 anim-turbine-spin pointer-events-none">
        <svg viewBox="0 0 24 24" className="w-full h-full text-teal-300 fill-current opacity-85">
          <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
          <path d="M12,2 Q15,7 12,12 Q9,7 12,2 Z" />
          <path d="M22,12 Q17,15 12,12 Q17,9 22,12 Z" />
          <path d="M12,22 Q9,17 12,12 Q15,17 12,22 Z" />
          <path d="M2,12 Q7,9 12,12 Q7,15 2,12 Z" />
        </svg>
      </div>
      <div className="absolute bottom-[52%] right-[22%] w-8 h-8 anim-turbine-spin pointer-events-none" style={{ animationDuration: '3s' }}>
        <svg viewBox="0 0 24 24" className="w-full h-full text-emerald-300 fill-current opacity-85">
          <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
          <path d="M12,2 Q15,7 12,12 Q9,7 12,2 Z" />
          <path d="M22,12 Q17,15 12,12 Q17,9 22,12 Z" />
          <path d="M12,22 Q9,17 12,12 Q15,17 12,22 Z" />
          <path d="M2,12 Q7,9 12,12 Q7,15 2,12 Z" />
        </svg>
      </div>

      {/* 6. ELEVATED GLIDING ECO-TRAM (Monorriel aerotransportado con estela luminosa) */}
      <div className="absolute bottom-[36%] inset-x-0 h-10 pointer-events-none overflow-hidden">
        {/* Skybridge Guideway */}
        <div className="absolute bottom-2 inset-x-0 h-1.5 bg-teal-400/30 backdrop-blur-sm border-t border-b border-teal-300/40" />
        {/* Gliding Tram Body */}
        <div className="absolute bottom-2 left-0 anim-tram-glide">
          <div className="flex items-center gap-1 bg-gradient-to-r from-teal-400 to-emerald-400 px-3 py-1 rounded-full shadow-[0_0_15px_#2dd4bf] border border-white/60">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span className="text-[8px] font-bold tracking-widest text-slate-950 uppercase">ECO-TRAM</span>
            <div className="w-1 h-1 rounded-full bg-cyan-200 anim-tram-spark" />
          </div>
        </div>
      </div>

      {/* 7. CLEAN BIO-FILTRATION URBAN CANAL / RIVER (Canal de aguas cristalinas con biofiltros) */}
      <svg className="absolute bottom-0 inset-x-0 w-full h-44 z-10" preserveAspectRatio="none" viewBox="0 0 1200 240">
        <defs>
          <linearGradient id="cityCanalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f766e" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#14b8a6" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#2dd4bf" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Canal Bed */}
        <path d="M750,0 Q680,60 560,100 Q420,145 280,180 Q140,215 0,240 L1200,240 L1200,210 Q980,170 880,120 Q800,75 790,0 Z" fill="#022c22" opacity="0.8" />

        {/* Flowing Water Surface */}
        <path d="M760,0 Q690,60 570,100 Q430,145 290,180 Q150,215 0,240 L60,240 Q200,210 340,175 Q480,140 620,95 Q730,55 780,0 Z" fill="url(#cityCanalGrad)" className="anim-river-shimmer" />

        {/* Canal Ripples & Water Highlights */}
        <g className="anim-river-shimmer" opacity="0.85">
          <path d="M600,105 Q620,100 650,106" stroke="#ccfbf1" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M460,142 Q490,137 520,144" stroke="#a5f3fc" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M310,180 Q345,175 380,182" stroke="#e0f2fe" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M160,215 Q200,210 240,218" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      </svg>

      {/* 8. BIOPHILIC PROMENADE & SOLAR PAVEMENT FLOOR (Paseo con adoquines solares, césped y jardineras) */}
      <svg className="absolute bottom-0 inset-x-0 w-full h-36 z-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1200 200">
        <defs>
          <linearGradient id="promenadeFloor1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#044e46" />
            <stop offset="40%" stopColor="#023832" />
            <stop offset="100%" stopColor="#011c19" />
          </linearGradient>
          <linearGradient id="promenadeFloor2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="40%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#042f2e" />
          </linearGradient>
          <radialGradient id="solarNodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5eead4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Back Promenade Shelf */}
        <path d="M0,125 Q200,55 420,95 T840,65 T1200,90 L1200,200 L0,200 Z" fill="url(#promenadeFloor1)" opacity="0.95" />

        {/* Foreground Promenade Ledges */}
        <path d="M0,90 Q160,40 320,110 L320,200 L0,200 Z" fill="url(#promenadeFloor2)" />
        <path d="M820,100 Q980,55 1200,90 L1200,200 L820,200 Z" fill="url(#promenadeFloor2)" />

        {/* Solar Paver Inlays with Glow */}
        <g stroke="#2dd4bf" strokeWidth="1.5" opacity="0.4" fill="none">
          <rect x="70" y="70" width="30" height="15" rx="3" />
          <rect x="110" y="80" width="30" height="15" rx="3" />
          <rect x="230" y="95" width="35" height="18" rx="4" />
          <rect x="880" y="85" width="35" height="18" rx="4" />
          <rect x="940" y="95" width="35" height="18" rx="4" />
          <rect x="1050" y="100" width="40" height="20" rx="4" />
        </g>

        {/* Native Urban Pollinator Flower Planters */}
        <g fill="#34d399" opacity="0.9">
          <circle cx="150" cy="78" r="4" fill="#a7f3d0" />
          <circle cx="156" cy="75" r="3.5" fill="#f43f5e" />
          <circle cx="162" cy="78" r="4" fill="#38bdf8" />
          <circle cx="156" cy="82" r="3" fill="#fbbf24" />

          <circle cx="980" cy="85" r="4.5" fill="#a7f3d0" />
          <circle cx="988" cy="82" r="4" fill="#f43f5e" />
          <circle cx="996" cy="85" r="4.5" fill="#38bdf8" />
          <circle cx="988" cy="90" r="3.5" fill="#fbbf24" />
        </g>

        {/* Ambient Promenade Lantern Nodes */}
        <g className="anim-eco-pulse">
          <circle cx="180" cy="75" r="10" fill="url(#solarNodeGlow)" />
          <circle cx="180" cy="75" r="3" fill="#ffffff" />

          <circle cx="1020" cy="85" r="12" fill="url(#solarNodeGlow)" />
          <circle cx="1020" cy="85" r="3.5" fill="#ffffff" />
        </g>
      </svg>

      {/* 9. ANIMATED URBAN PARTICLES (Microburbujas de oxígeno puro, mariposas y esporas de Gaia) */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Floating Oxygen Bubbles */}
        <div className="absolute top-[35%] left-[16%] anim-clean-bubble-1">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-200/90 shadow-[0_0_10px_#2dd4bf] border border-white/60" />
        </div>
        <div className="absolute top-[48%] left-[44%] anim-clean-bubble-2">
          <div className="w-3 h-3 rounded-full bg-emerald-200/90 shadow-[0_0_12px_#34d399] border border-white/60" />
        </div>
        <div className="absolute top-[40%] right-[22%] anim-clean-bubble-1" style={{ animationDelay: '-3.5s' }}>
          <div className="w-2 h-2 rounded-full bg-cyan-200/90 shadow-[0_0_8px_#38bdf8] border border-white/60" />
        </div>
        <div className="absolute bottom-[30%] right-[36%] anim-clean-bubble-2" style={{ animationDelay: '-1.5s' }}>
          <div className="w-2.5 h-2.5 rounded-full bg-teal-200/90 shadow-[0_0_10px_#2dd4bf] border border-white/60" />
        </div>

        {/* Fluttering Urban Pollinator Butterfly */}
        <div className="absolute top-[42%] left-[28%] anim-butterfly pointer-events-none">
          <svg viewBox="0 0 20 20" className="w-5 h-5 text-emerald-400 fill-current drop-shadow-md">
            <ellipse cx="6" cy="7" rx="5" ry="4" transform="rotate(-20 6 7)" />
            <ellipse cx="6" cy="13" rx="4" ry="3" transform="rotate(20 6 13)" />
            <ellipse cx="14" cy="7" rx="5" ry="4" transform="rotate(20 14 7)" />
            <ellipse cx="14" cy="13" rx="4" ry="3" transform="rotate(-20 14 13)" />
            <line x1="10" y1="3" x2="10" y2="17" stroke="#042f2e" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Luminescent Eco-Fireflies */}
        <div className="absolute top-[28%] right-[14%] anim-firefly-1">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-300 shadow-[0_0_12px_#14b8a6]" />
        </div>
      </div>
    </div>
  );
}

