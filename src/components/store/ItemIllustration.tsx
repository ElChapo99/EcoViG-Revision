import React from 'react';

interface ItemIllustrationProps {
  itemId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'scene';
  animate?: boolean;
}

/**
 * Ultra-high-detail, organic, realistic animated vector illustrations for every item in all 4 biomes.
 * Designed without crude geometric shapes: features rich curves, fur textures, multi-layer shading, 
 * realistic eye reflections, atmospheric glows, and natural anatomy.
 */
export function ItemIllustration({ itemId, className = '', size = 'md', animate = true }: ItemIllustrationProps) {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-32 h-32 sm:w-36 sm:h-36',
    scene: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24'
  };

  const animClass = animate ? 'transition-all duration-300 transform-gpu' : '';

  switch (itemId) {
    // =============================================================
    // 🌲 BIOMA 1: BOSQUE (FOREST) - ULTRA REALISTIC & ORGANIC
    // =============================================================
    
    // 1. Gato Montés (Bobcat / Wildcat)
    case 'forest_cat':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <radialGradient id="fc_fur" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="85%" stopColor="#92400e" />
                <stop offset="100%" stopColor="#78350f" />
              </radialGradient>
              <linearGradient id="fc_belly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#fde68a" />
              </linearGradient>
              <radialGradient id="fc_eye" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="60%" stopColor="#10b981" />
                <stop offset="90%" stopColor="#047857" />
                <stop offset="100%" stopColor="#064e3b" />
              </radialGradient>
            </defs>

            {/* Bobcat Short Wagging Tail */}
            <g className={animate ? "anim-tail" : ""}>
              <path d="M 68 68 C 78 66, 88 58, 86 46 C 85 40, 78 42, 76 48 C 74 54, 66 60, 64 64" fill="#b45309" stroke="#78350f" strokeWidth="1" />
              <path d="M 86 46 C 85 41, 79 43, 81 48 Z" fill="#18181b" />
              <path d="M 80 52 C 78 48, 84 46, 85 50" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Main Body Breathing */}
            <g className={animate ? "anim-breathe" : ""}>
              {/* Hind Quarters & Body (Muscular, organic curves) */}
              <path d="M 30 72 C 24 64, 26 52, 36 46 C 44 42, 58 42, 68 48 C 76 54, 78 66, 72 74 C 66 80, 36 80, 30 72 Z" fill="url(#fc_fur)" />
              
              {/* Natural Leopard/Bobcat spots */}
              <path d="M 36 54 C 38 52, 40 56, 38 58 C 36 57, 34 56, 36 54 Z" fill="#451a03" opacity="0.7" />
              <path d="M 46 48 C 48 46, 52 48, 50 52 C 48 52, 46 50, 46 48 Z" fill="#451a03" opacity="0.6" />
              <path d="M 58 52 C 62 50, 64 54, 62 58 C 58 58, 58 54, 58 52 Z" fill="#451a03" opacity="0.7" />
              <path d="M 66 60 C 70 58, 72 62, 68 66 C 66 65, 64 62, 66 60 Z" fill="#451a03" opacity="0.75" />
              <path d="M 38 64 C 42 62, 44 66, 40 68 C 38 67, 36 66, 38 64 Z" fill="#451a03" opacity="0.65" />

              {/* Soft Fluffy Chest Bib */}
              <path d="M 40 50 C 44 46, 56 46, 60 50 C 64 58, 62 70, 50 74 C 38 70, 36 58, 40 50 Z" fill="url(#fc_belly)" opacity="0.95" />

              {/* Paws */}
              <path d="M 34 74 C 32 76, 32 82, 38 83 C 44 83, 44 76, 40 74 Z" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />
              <path d="M 58 74 C 56 76, 56 82, 62 83 C 68 83, 68 76, 64 74 Z" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />
              
              {/* Characteristic Bobcat Face & Cheek Ruffs */}
              <path d="M 28 36 C 24 44, 22 52, 28 56 C 34 58, 38 52, 42 48 C 46 48, 54 48, 58 48 C 62 52, 66 58, 72 56 C 78 52, 76 44, 72 36 C 68 28, 32 28, 28 36 Z" fill="url(#fc_fur)" />
              
              {/* Fluffy white cheek flares */}
              <path d="M 26 48 C 22 54, 28 60, 34 56 C 32 52, 30 48, 26 48 Z" fill="#ffffff" />
              <path d="M 74 48 C 78 54, 72 60, 66 56 C 68 52, 70 48, 74 48 Z" fill="#ffffff" />

              {/* Left Lynx Ear with hair tuft */}
              <g className={animate ? "anim-ear-l" : ""}>
                <path d="M 32 32 C 30 24, 28 14, 26 10 C 30 14, 38 20, 42 26 Z" fill="#78350f" />
                <path d="M 33 29 C 32 22, 30 16, 29 13 C 32 16, 36 21, 38 26 Z" fill="#fbcfe8" />
                <path d="M 26 10 C 24 5, 23 3, 22 2 M 26 10 C 25 4, 25 2, 24 1" stroke="#09090b" strokeWidth="1.8" strokeLinecap="round" />
              </g>

              {/* Right Lynx Ear with hair tuft */}
              <g className={animate ? "anim-ear-r" : ""}>
                <path d="M 68 32 C 70 24, 72 14, 74 10 C 70 14, 62 20, 58 26 Z" fill="#78350f" />
                <path d="M 67 29 C 68 22, 70 16, 71 13 C 68 16, 64 21, 62 26 Z" fill="#fbcfe8" />
                <path d="M 74 10 C 76 5, 77 3, 78 2 M 74 10 C 75 4, 75 2, 76 1" stroke="#09090b" strokeWidth="1.8" strokeLinecap="round" />
              </g>

              {/* Forehead markings */}
              <path d="M 46 28 C 47 34, 47 38, 47 40 M 50 26 C 50 33, 50 37, 50 41 M 54 28 C 53 34, 53 38, 53 40" stroke="#451a03" strokeWidth="1.6" strokeLinecap="round" />

              {/* Blinking Feline Eyes */}
              <g className={animate ? "anim-blink" : ""}>
                <path d="M 36 38 C 38 34, 44 34, 46 38 C 44 42, 38 42, 36 38 Z" fill="url(#fc_eye)" stroke="#18181b" strokeWidth="1.2" />
                <ellipse cx="41" cy="38" rx="1.5" ry="3" fill="#09090b" />
                <circle cx="42" cy="36.5" r="1" fill="#ffffff" />
                <circle cx="39.5" cy="39" r="0.5" fill="#ffffff" />

                <path d="M 64 38 C 62 34, 56 34, 54 38 C 56 42, 62 42, 64 38 Z" fill="url(#fc_eye)" stroke="#18181b" strokeWidth="1.2" />
                <ellipse cx="59" cy="38" rx="1.5" ry="3" fill="#09090b" />
                <circle cx="60" cy="36.5" r="1" fill="#ffffff" />
                <circle cx="57.5" cy="39" r="0.5" fill="#ffffff" />
              </g>

              {/* Soft Muzzle & Pink Nose Pad */}
              <path d="M 44 45 C 44 42, 56 42, 56 45 C 56 50, 44 50, 44 45 Z" fill="#ffffff" />
              <path d="M 48 44 C 49 42, 51 42, 52 44 C 52 46, 48 46, 48 44 Z" fill="#f43f5e" />
              <path d="M 50 45 L 50 47 M 47 47 C 49 49, 50 49, 50 47 C 50 49, 51 49, 53 47" stroke="#451a03" strokeWidth="1" fill="none" />

              {/* Tapered Whiskers */}
              <path d="M 38 46 C 26 44, 18 43, 12 45 M 38 48 C 24 48, 16 51, 10 54 M 38 50 C 26 52, 20 57, 14 62" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
              <path d="M 62 46 C 74 44, 82 43, 88 45 M 62 48 C 76 48, 84 51, 90 54 M 62 50 C 74 52, 80 57, 86 62" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.9" />
            </g>
          </svg>
        </div>
      );

    // 2. Perro Explorador (Golden Explorer Hound)
    case 'forest_dog':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <radialGradient id="fd_fur" cx="50%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="40%" stopColor="#eab308" />
                <stop offset="80%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#854d0e" />
              </radialGradient>
              <linearGradient id="fd_bandana" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            {/* Feathery Wagging Golden Tail */}
            <g className={animate ? "anim-tail" : ""}>
              <path d="M 70 66 C 82 62, 92 52, 90 38 C 88 34, 82 36, 80 42 C 78 48, 72 58, 68 62" fill="#ca8a04" />
              <path d="M 84 40 C 90 44, 88 54, 78 60" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
            </g>
            
            {/* Main Hound Body Breathing */}
            <g className={animate ? "anim-breathe" : ""}>
              <path d="M 32 72 C 26 62, 28 48, 38 44 C 50 40, 62 42, 70 48 C 78 56, 76 68, 70 74 C 64 80, 38 80, 32 72 Z" fill="url(#fd_fur)" />
              
              {/* Paws */}
              <ellipse cx="38" cy="80" rx="6" ry="4" fill="#fef08a" />
              <ellipse cx="62" cy="80" rx="6" ry="4" fill="#fef08a" />

              {/* Bandana */}
              <path d="M 36 50 C 44 62, 56 62, 64 50 L 58 68 C 52 74, 48 74, 42 68 Z" fill="url(#fd_bandana)" stroke="#047857" strokeWidth="1" />
              <circle cx="50" cy="62" r="3" fill="#facc15" stroke="#854d0e" strokeWidth="0.8" />
              <path d="M 50 60 L 50 64 M 48 62 L 52 62" stroke="#854d0e" strokeWidth="0.8" />

              {/* Head & Drooping Velvet Ears */}
              <g className={animate ? "anim-ear-l" : ""}>
                <path d="M 28 36 C 24 44, 22 56, 26 60 C 30 62, 34 54, 34 46 Z" fill="#a16207" />
              </g>
              <g className={animate ? "anim-ear-r" : ""}>
                <path d="M 72 36 C 76 44, 78 56, 74 60 C 70 62, 66 54, 66 46 Z" fill="#a16207" />
              </g>
              
              <circle cx="50" cy="40" r="18" fill="url(#fd_fur)" />

              {/* Blinking Eyes */}
              <g className={animate ? "anim-blink" : ""}>
                <ellipse cx="43" cy="38" rx="3.5" ry="4" fill="#1e1b4b" />
                <circle cx="44.5" cy="36.5" r="1.5" fill="#ffffff" />
                <circle cx="42" cy="39" r="0.6" fill="#ffffff" />

                <ellipse cx="57" cy="38" rx="3.5" ry="4" fill="#1e1b4b" />
                <circle cx="58.5" cy="36.5" r="1.5" fill="#ffffff" />
                <circle cx="56" cy="39" r="0.6" fill="#ffffff" />
              </g>

              {/* Expressive eyebrows */}
              <path d="M 40 33 Q 44 31 46 33" stroke="#854d0e" strokeWidth="1.5" fill="none" />
              <path d="M 54 33 Q 56 31 60 33" stroke="#854d0e" strokeWidth="1.5" fill="none" />

              {/* Snout & Wet Nose */}
              <ellipse cx="50" cy="46" rx="9" ry="7" fill="#fef08a" />
              <path d="M 46 43 C 48 40, 52 40, 54 43 C 54 46, 46 46, 46 43 Z" fill="#0f172a" />
              <ellipse cx="49" cy="42.5" rx="1.5" ry="0.8" fill="#ffffff" opacity="0.6" />
              <path d="M 50 45 L 50 48 M 46 48 Q 50 51 54 48" stroke="#451a03" strokeWidth="1.2" fill="none" />
            </g>
          </svg>
        </div>
      );

    // 3. Zorro Rojo (Red Fox)
    case 'forest_fox':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <radialGradient id="ff_orange" cx="45%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="50%" stopColor="#ea580c" />
                <stop offset="90%" stopColor="#c2410c" />
                <stop offset="100%" stopColor="#7c2d12" />
              </radialGradient>
            </defs>

            {/* Grand Fluffy Fox Tail Swaying */}
            <g className={animate ? "anim-fox-tail" : ""}>
              <path d="M 64 68 C 76 64, 94 56, 90 40 C 86 28, 76 36, 70 48 C 66 56, 62 64, 64 68 Z" fill="url(#ff_orange)" />
              <path d="M 88 38 C 92 42, 88 48, 80 50 C 76 46, 80 38, 88 38 Z" fill="#ffffff" />
            </g>

            {/* Main Fox Body Breathing */}
            <g className={animate ? "anim-breathe" : ""}>
              {/* Slender Agile Body */}
              <path d="M 32 70 C 26 60, 30 46, 42 42 C 54 38, 66 42, 70 50 C 76 60, 72 70, 64 74 C 54 78, 38 78, 32 70 Z" fill="url(#ff_orange)" />
              
              {/* White Throat & Chest Plume */}
              <path d="M 40 44 C 46 42, 54 42, 60 44 C 64 54, 58 68, 50 72 C 42 68, 36 54, 40 44 Z" fill="#ffffff" />

              {/* Black Stalking Socks */}
              <path d="M 36 74 C 34 78, 34 82, 38 84 C 42 84, 42 78, 40 74 Z" fill="#18181b" />
              <path d="M 58 74 C 56 78, 56 82, 60 84 C 64 84, 64 78, 62 74 Z" fill="#18181b" />

              {/* Head Silhouette with natural facial ruffs */}
              <path d="M 28 36 C 24 44, 30 52, 50 64 C 70 52, 76 44, 72 36 C 66 26, 34 26, 28 36 Z" fill="url(#ff_orange)" />
              <path d="M 32 44 C 36 52, 44 58, 50 64 C 56 58, 64 52, 68 44 C 64 42, 58 48, 50 48 C 42 48, 36 42, 32 44 Z" fill="#ffffff" />

              {/* Large Alert Fox Ears */}
              <g className={animate ? "anim-ear-l" : ""}>
                <path d="M 32 32 C 28 22, 24 10, 22 6 C 28 10, 38 18, 42 24 Z" fill="#18181b" />
                <path d="M 33 29 C 30 22, 26 14, 25 11 C 28 14, 34 20, 38 24 Z" fill="#fed7aa" />
              </g>
              <g className={animate ? "anim-ear-r" : ""}>
                <path d="M 68 32 C 72 22, 76 10, 78 6 C 72 10, 62 18, 58 24 Z" fill="#18181b" />
                <path d="M 67 29 C 70 22, 74 14, 75 11 C 72 14, 66 20, 62 24 Z" fill="#fed7aa" />
              </g>

              {/* Blinking Amber Wild Fox Eyes */}
              <g className={animate ? "anim-blink" : ""}>
                <ellipse cx="42" cy="40" rx="3.5" ry="4.5" fill="#f59e0b" stroke="#18181b" strokeWidth="1" />
                <ellipse cx="42.5" cy="40" rx="1.5" ry="3.5" fill="#09090b" />
                <circle cx="43.5" cy="38" r="1.2" fill="#ffffff" />

                <ellipse cx="58" cy="40" rx="3.5" ry="4.5" fill="#f59e0b" stroke="#18181b" strokeWidth="1" />
                <ellipse cx="57.5" cy="40" rx="1.5" ry="3.5" fill="#09090b" />
                <circle cx="58.5" cy="38" r="1.2" fill="#ffffff" />
              </g>

              {/* Sleek Fox Nose */}
              <circle cx="50" cy="62" r="2.8" fill="#09090b" />
            </g>
          </svg>
        </div>
      );

    // 4. Ciervo Noble (Majestic Stag)
    case 'forest_deer':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="fd_coat" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ca8a04" />
                <stop offset="60%" stopColor="#a16207" />
                <stop offset="100%" stopColor="#713f12" />
              </linearGradient>
            </defs>

            {/* Main Stag Body Breathing */}
            <g className={animate ? "anim-breathe" : ""}>
              {/* Velvety Branching Antlers */}
              <path d="M 44 26 C 40 18, 32 10, 24 5 M 34 16 C 26 14, 20 16, 16 20 M 28 10 C 22 5, 26 1, 30 2 M 38 20 C 32 20, 28 24, 26 28" stroke="#582f0e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 56 26 C 60 18, 68 10, 76 5 M 66 16 C 74 14, 80 16, 84 20 M 72 10 C 78 5, 74 1, 70 2 M 62 20 C 68 20, 72 24, 74 28" stroke="#582f0e" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* Graceful Torso */}
              <path d="M 34 70 C 26 62, 30 48, 42 44 C 54 40, 68 44, 72 52 C 78 62, 74 72, 66 76 C 54 80, 40 78, 34 70 Z" fill="url(#fd_coat)" />

              {/* Dappled Fawn Spots */}
              <circle cx="44" cy="58" r="1.8" fill="#fef08a" opacity="0.85" />
              <circle cx="52" cy="54" r="1.6" fill="#fef08a" opacity="0.85" />
              <circle cx="60" cy="58" r="1.8" fill="#fef08a" opacity="0.85" />
              <circle cx="50" cy="66" r="1.8" fill="#fef08a" opacity="0.85" />
              <circle cx="62" cy="68" r="1.5" fill="#fef08a" opacity="0.85" />

              {/* Slender Strong Neck & Head */}
              <path d="M 42 56 C 42 42, 46 32, 46 28 C 48 24, 52 24, 54 28 C 54 32, 58 42, 58 56 Z" fill="url(#fd_coat)" />
              <path d="M 42 34 C 40 38, 44 48, 50 48 C 56 48, 60 38, 58 34 C 56 28, 44 28, 42 34 Z" fill="#ca8a04" />
              <ellipse cx="50" cy="42" rx="6" ry="5" fill="#fef3c7" />

              {/* Twitching Alert Ears */}
              <g className={animate ? "anim-ear-l" : ""}>
                <path d="M 40 28 C 30 26, 26 30, 24 36 C 30 36, 36 34, 40 30 Z" fill="#a16207" />
                <path d="M 38 29 C 32 28, 28 31, 27 34 C 30 34, 35 33, 38 30 Z" fill="#fed7aa" />
              </g>
              <g className={animate ? "anim-ear-r" : ""}>
                <path d="M 60 28 C 70 26, 74 30, 76 36 C 70 36, 64 34, 60 30 Z" fill="#a16207" />
                <path d="M 62 29 C 68 28, 72 31, 73 34 C 70 34, 65 33, 62 30 Z" fill="#fed7aa" />
              </g>

              {/* Blinking Doe Eyes */}
              <g className={animate ? "anim-blink" : ""}>
                <ellipse cx="44" cy="33" rx="2.8" ry="3.5" fill="#0f172a" />
                <circle cx="45" cy="31.5" r="1.2" fill="#ffffff" />
                <ellipse cx="56" cy="33" rx="2.8" ry="3.5" fill="#0f172a" />
                <circle cx="57" cy="31.5" r="1.2" fill="#ffffff" />
              </g>

              {/* Soft Black Nose Pad */}
              <ellipse cx="50" cy="43" rx="2.5" ry="1.8" fill="#18181b" />
              
              {/* Slender legs */}
              <path d="M 38 76 L 38 88 L 42 88 L 42 76" fill="#713f12" />
              <rect x="38" y="86" width="4" height="3" fill="#18181b" />
              <path d="M 58 76 L 58 88 L 62 88 L 62 76" fill="#713f12" />
              <rect x="58" y="86" width="4" height="3" fill="#18181b" />
            </g>
          </svg>
        </div>
      );

    // 5. Búho Sabio (Great Horned Owl)
    case 'forest_owl':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <radialGradient id="fo_feather" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#581c87" />
                <stop offset="60%" stopColor="#3b0764" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </radialGradient>
              <radialGradient id="fo_eye" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="60%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </radialGradient>
            </defs>
            {/* Textured Mossy Perch Log */}
            <path d="M 12 84 C 35 80, 65 80, 88 84 C 88 88, 12 88, 12 84 Z" fill="#582f0e" stroke="#371d06" strokeWidth="1" />
            <path d="M 28 82 Q 35 78 42 82 M 62 82 Q 70 78 78 82" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

            {/* Owl Breathing */}
            <g className={animate ? "anim-breathe" : ""}>
              {/* Layered Plumage Body */}
              <path d="M 30 76 C 24 64, 26 44, 34 38 C 42 34, 58 34, 66 38 C 74 44, 76 64, 70 76 C 62 82, 38 82, 30 76 Z" fill="url(#fo_feather)" />
              
              {/* Downy Speckled Breast */}
              <path d="M 40 48 C 44 44, 56 44, 60 48 C 64 58, 62 72, 50 76 C 38 72, 36 58, 40 48 Z" fill="#e9d5ff" opacity="0.9" />
              <path d="M 46 54 L 50 56 L 54 54 M 44 62 L 50 65 L 56 62 M 46 70 L 50 72 L 54 70" stroke="#7e22ce" strokeWidth="1.6" strokeLinecap="round" fill="none" />

              {/* Feathered Ear Horns */}
              <path d="M 34 36 C 30 26, 26 14, 22 8 C 28 14, 38 22, 42 28 Z" fill="#3b0764" />
              <path d="M 66 36 C 70 26, 74 14, 78 8 C 72 14, 62 22, 58 28 Z" fill="#3b0764" />

              {/* Heart-Shaped Facial Disc */}
              <path d="M 30 38 C 28 46, 32 54, 50 54 C 68 54, 72 46, 70 38 C 66 30, 56 28, 50 32 C 44 28, 34 30, 30 38 Z" fill="#f5d0fe" />

              {/* Hypnotic Glowing Golden Owl Eyes with slow blink */}
              <g className={animate ? "anim-owl-blink" : ""}>
                <circle cx="41" cy="40" r="8" fill="url(#fo_eye)" stroke="#3b0764" strokeWidth="1.5" />
                <circle cx="41" cy="40" r="4.5" fill="#09090b" />
                <circle cx="43" cy="38" r="1.5" fill="#ffffff" />
                <circle cx="39.5" cy="41.5" r="0.7" fill="#ffffff" />

                <circle cx="59" cy="40" r="8" fill="url(#fo_eye)" stroke="#3b0764" strokeWidth="1.5" />
                <circle cx="59" cy="40" r="4.5" fill="#09090b" />
                <circle cx="61" cy="38" r="1.5" fill="#ffffff" />
                <circle cx="57.5" cy="41.5" r="0.7" fill="#ffffff" />
              </g>

              {/* Sharp Curved Beak */}
              <path d="M 48 44 C 48 42, 52 42, 52 44 L 51 52 C 50 54, 50 54, 49 52 Z" fill="#f97316" />

              {/* Talons */}
              <path d="M 40 80 C 40 76, 44 76, 44 82 M 44 80 C 44 76, 48 76, 48 82" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 52 80 C 52 76, 56 76, 56 82 M 56 80 C 56 76, 60 76, 60 82" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      );

    // 6. Erizo del Musgo (Moss Hedgehog)
    case 'forest_hedgehog':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-lg ${animClass}`}>
            <defs>
              <radialGradient id="fh_quill" cx="40%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#a16207" />
                <stop offset="70%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#451a03" />
              </radialGradient>
            </defs>
            {/* Organic breathing body */}
            <g className={animate ? "anim-breathe" : ""}>
              {/* Layered Organic Quills with natural gradient tips & rustle animation */}
              <g className={animate ? "anim-quill-rustle origin-bottom" : ""}>
                <path d="M 26 62 C 16 48, 22 28, 44 20 C 66 14, 86 28, 88 48 C 90 66, 78 78, 54 80 C 36 80, 24 74, 26 62 Z" fill="url(#fh_quill)" />
                
                {/* Detailed individual quill spines with realistic natural texture */}
                <path d="M 36 24 L 32 14 M 48 18 L 48 8 M 62 20 L 66 10 M 76 28 L 84 20 M 86 42 L 96 38 M 86 58 L 94 62 M 78 70 L 86 78" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                <path d="M 40 28 L 38 18 M 54 22 L 56 12 M 70 26 L 76 16 M 80 38 L 90 32 M 82 50 L 92 50" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Moss & Dewdrop Sprig on Head */}
                <g className={animate ? "anim-spore-float" : ""}>
                  <path d="M 42 36 C 36 30, 46 26, 44 32 C 48 28, 54 34, 46 36 Z" fill="#10b981" />
                  <circle cx="44" cy="32" r="1.2" fill="#ffffff" opacity="0.85" />
                  <circle cx="48" cy="30" r="0.8" fill="#a7f3d0" />
                </g>
              </g>

              {/* Soft Furry Face & Twitched Nose */}
              <g className={animate ? "anim-wiggle origin-[28px_60px]" : ""}>
                <path d="M 18 64 C 18 54, 28 46, 38 52 C 44 56, 44 70, 36 74 C 26 78, 18 72, 18 64 Z" fill="#fde68a" />
                {/* Expressive Eye with blink */}
                <g className={animate ? "anim-blink origin-[28px_58px]" : ""}>
                  <circle cx="28" cy="58" r="2.8" fill="#09090b" />
                  <circle cx="29" cy="57" r="1" fill="#ffffff" />
                </g>
                {/* Cute Sniffing Wet Nose */}
                <ellipse cx="18" cy="64" rx="2.5" ry="2" fill="#f43f5e" />
                {/* Whiskers */}
                <line x1="22" y1="62" x2="14" y2="58" stroke="#78350f" strokeWidth="0.8" opacity="0.6" />
                <line x1="22" y1="65" x2="13" y2="66" stroke="#78350f" strokeWidth="0.8" opacity="0.6" />
              </g>

              {/* Tiny Paws */}
              <ellipse cx="28" cy="79" rx="3" ry="2" fill="#fde68a" />
              <ellipse cx="50" cy="80" rx="3.5" ry="2" fill="#fde68a" />
            </g>
          </svg>
        </div>
      );

    // 7. Tejón Constructor (European Badger)
    case 'forest_badger':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Heavy-set Stocky Furry Body with realistic silver-grey gradient */}
              <path d="M 28 72 C 20 60, 26 44, 42 40 C 60 36, 76 44, 80 56 C 84 68, 76 78, 58 80 C 40 82, 28 80, 28 72 Z" fill="#475569" />
              <path d="M 32 68 C 30 52, 45 44, 58 45 C 70 46, 75 56, 72 68 C 65 74, 42 75, 32 68 Z" fill="#334155" opacity="0.6" />
              
              {/* Head with iconic organic badger stripes */}
              <g className={animate ? "anim-wiggle origin-[50px_40px]" : ""}>
                <path d="M 48 24 C 36 28, 32 44, 40 54 C 46 60, 54 60, 60 54 C 68 44, 64 28, 52 24 Z" fill="#f8fafc" />
                {/* Deep Black Facial Stripes */}
                <path d="M 40 28 C 36 34, 36 46, 42 50 C 44 48, 44 34, 44 28 Z" fill="#0f172a" />
                <path d="M 60 28 C 64 34, 64 46, 58 50 C 56 48, 56 34, 56 28 Z" fill="#0f172a" />

                {/* Eyes with lifelike catchlights */}
                <g className={animate ? "anim-blink origin-[50px_38px]" : ""}>
                  <circle cx="42" cy="38" r="2.2" fill="#0f172a" />
                  <circle cx="42.5" cy="37.5" r="0.8" fill="#ffffff" />
                  <circle cx="58" cy="38" r="2.2" fill="#0f172a" />
                  <circle cx="58.5" cy="37.5" r="0.8" fill="#ffffff" />
                </g>

                {/* Snout & Nose with realistic twitch */}
                <ellipse cx="50" cy="52" rx="3.5" ry="2.5" fill="#0f172a" />
                <ellipse cx="49.5" cy="51.5" rx="1" ry="0.6" fill="#64748b" />

                {/* Small Rounded Furry Ears */}
                <path d="M 36 26 C 33 22, 36 18, 40 22 Z" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
                <path d="M 64 26 C 67 22, 64 18, 60 22 Z" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
              </g>

              {/* Strong Digging Paws & Claws */}
              <path d="M 32 78 C 30 82, 36 85, 40 84" stroke="#e2e8f0" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M 56 84 C 60 85, 66 82, 64 78" stroke="#e2e8f0" strokeWidth="2.8" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      );

    // 8. Personajes (Guardabosques / Bióloga)
    case 'forest_hiker':
    case 'forest_ranger':
    case 'forest_botanist':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="fr_jacket" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#065f46" />
              </linearGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Natural hair waving in wind */}
              <path d="M 36 28 C 34 18, 66 18, 64 28 C 68 34, 66 40, 64 44 C 58 46, 42 46, 36 44 Z" fill="#582f0e" />
              
              {/* Ranger Brimmed Hat */}
              <ellipse cx="50" cy="22" rx="20" ry="5" fill="#78350f" stroke="#451a03" strokeWidth="1" />
              <path d="M 38 22 C 38 14, 62 14, 62 22 Z" fill="#92400e" />
              <circle cx="50" cy="18" r="2" fill="#facc15" />

              {/* Expressive Face with blinking */}
              <ellipse cx="50" cy="32" rx="10" ry="9" fill="#fde047" />
              <g className={animate ? "anim-blink origin-[50px_32px]" : ""}>
                <circle cx="46" cy="32" r="1.6" fill="#0f172a" />
                <circle cx="46.5" cy="31.5" r="0.6" fill="#ffffff" />
                <circle cx="54" cy="32" r="1.6" fill="#0f172a" />
                <circle cx="54.5" cy="31.5" r="0.6" fill="#ffffff" />
              </g>
              <path d="M 47 36 Q 50 39 53 36" stroke="#854d0e" strokeWidth="1.2" fill="none" />

              {/* Field Jacket with Fabric Folds */}
              <path d="M 34 44 C 40 40, 60 40, 66 44 L 70 70 L 30 70 Z" fill="url(#fr_jacket)" />
              <line x1="50" y1="44" x2="50" y2="70" stroke="#047857" strokeWidth="2" />
              <rect x="36" y="52" width="8" height="7" rx="1.5" fill="#047857" />
              <rect x="56" y="52" width="8" height="7" rx="1.5" fill="#047857" />

              {/* Binoculars on strap with subtle pendulum sway */}
              <g className={animate ? "anim-wiggle origin-[50px_46px]" : ""}>
                <rect x="46" y="56" width="8" height="6" rx="1.5" fill="#18181b" />
                <circle cx="48" cy="62" r="2" fill="#38bdf8" />
                <circle cx="52" cy="62" r="2" fill="#38bdf8" />
              </g>
            </g>
          </svg>
        </div>
      );

    // 9. Cabaña de Madera Caída (Fallen Log Bioclimatic Cabin)
    case 'forest_cabin':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            <defs>
              <linearGradient id="fc_wood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="50%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
            </defs>
            {/* Natural Fieldstone Chimney */}
            <path d="M 68 32 L 76 32 L 78 55 L 66 55 Z" fill="#64748b" stroke="#334155" strokeWidth="1" />
            
            {/* Realistic soft rising smoke particles */}
            <g className={animate ? "anim-smoke-rise origin-[72px_30px]" : ""}>
              <circle cx="72" cy="22" r="4.5" fill="#cbd5e1" opacity="0.6" />
              <circle cx="76" cy="14" r="6" fill="#e2e8f0" opacity="0.45" />
              <circle cx="73" cy="7" r="7.5" fill="#f1f5f9" opacity="0.3" />
            </g>

            {/* Cedar-Shake Shingled Roof covered with rich velvety moss */}
            <path d="M 12 52 C 26 36, 44 24, 50 20 C 56 24, 74 36, 88 52 Z" fill="#065f46" stroke="#047857" strokeWidth="2" />
            <path d="M 22 48 Q 50 26 78 48" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />

            {/* Hand-hewn Interlocking Round Wood Logs */}
            <rect x="22" y="50" width="56" height="38" rx="4" fill="url(#fc_wood)" />
            <line x1="22" y1="58" x2="78" y2="58" stroke="#371d06" strokeWidth="2" />
            <line x1="22" y1="66" x2="78" y2="66" stroke="#371d06" strokeWidth="2" />
            <line x1="22" y1="74" x2="78" y2="74" stroke="#371d06" strokeWidth="2" />
            <line x1="22" y1="82" x2="78" y2="82" stroke="#371d06" strokeWidth="2" />

            {/* Rustic Plank Door */}
            <rect x="42" y="60" width="16" height="28" rx="2" fill="#371d06" />
            <circle cx="54" cy="74" r="1.5" fill="#facc15" />

            {/* Multi-pane Window with glowing amber lantern flicker */}
            <g className={animate ? "anim-flame-1" : ""}>
              <rect x="26" y="60" width="12" height="12" rx="2" fill="#fef08a" stroke="#371d06" strokeWidth="1.5" />
              <line x1="32" y1="60" x2="32" y2="72" stroke="#371d06" strokeWidth="1" />
              <line x1="26" y1="66" x2="38" y2="66" stroke="#371d06" strokeWidth="1" />
            </g>
          </svg>
        </div>
      );

    // 10. Campamento Solar (Solar Expedition Tent)
    case 'forest_tent':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            {/* Canvas Bell Tent with organic draping */}
            <path d="M 50 20 C 38 42, 22 66, 16 80 C 38 84, 62 84, 84 80 C 78 66, 62 42, 50 20 Z" fill="#0f766e" stroke="#115e59" strokeWidth="2" />
            <path d="M 50 20 L 50 82 C 64 82, 76 80, 84 80 C 78 66, 62 42, 50 20 Z" fill="#134e4a" />
            <path d="M 50 45 C 44 60, 38 74, 34 82 C 44 82, 56 82, 66 82 C 62 74, 56 60, 50 45 Z" fill="#042f2e" />
            {/* Glowing Warm Interior Lantern */}
            <circle cx="50" cy="65" r="5" fill="#fef08a" className={animate ? "anim-flame-2" : ""} />
            {/* Rooftop Solar Collector with active LED indicator */}
            <rect x="46" y="16" width="8" height="5" rx="1" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1" />
            <circle cx="52" cy="18.5" r="0.8" fill="#34d399" className="animate-ping" />
          </svg>
        </div>
      );

    // 11. Puente de Liana Viva (Living Root Suspension Bridge)
    case 'forest_bridge':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            {/* Crystal Rushing Stream */}
            <path d="M 10 82 C 30 78, 70 78, 90 82 C 70 88, 30 88, 10 82 Z" fill="#38bdf8" opacity="0.85" />
            <path d="M 18 83 Q 50 80 82 83" stroke="#e0f2fe" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />

            {/* Natural Intertwined Root Vines with swaying wind animation */}
            <g className={animate ? "anim-canopy origin-top" : ""}>
              <path d="M 8 64 C 30 76, 70 76, 92 64" stroke="#78350f" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M 8 48 C 30 60, 70 60, 92 48" stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round" />
              {/* Hanging Vines & Moss Foliage */}
              <line x1="24" y1="55" x2="24" y2="72" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
              <line x1="40" y1="59" x2="40" y2="76" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
              <line x1="60" y1="59" x2="60" y2="76" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
              <line x1="76" y1="55" x2="76" y2="72" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
              <circle cx="40" cy="76" r="1.5" fill="#86efac" />
              <circle cx="60" cy="76" r="1.5" fill="#86efac" />
            </g>
          </svg>
        </div>
      );

    // 12. Hongos Bioluminiscentes (Bioluminescent Mushrooms)
    case 'forest_mushrooms':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            <defs>
              <radialGradient id="fm_glow" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="60%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </radialGradient>
            </defs>
            {/* Spore Glowing Atmosphere */}
            <circle cx="50" cy="40" r="30" fill="#34d399" opacity="0.25" className={animate ? "anim-flame-1" : ""} />
            
            {/* Stems with organic curves */}
            <path d="M 46 54 C 44 68, 42 78, 40 84 C 48 84, 52 84, 54 84 C 52 78, 50 68, 48 54 Z" fill="#f1f5f9" />
            <path d="M 68 62 C 66 72, 64 80, 62 84 C 68 84, 72 84, 74 84 C 72 80, 70 72, 70 62 Z" fill="#f1f5f9" />

            {/* Glowing Bell Caps with floating spores */}
            <g className={animate ? "anim-breathe origin-bottom" : ""}>
              <path d="M 22 52 C 24 24, 72 24, 74 52 C 58 56, 38 56, 22 52 Z" fill="url(#fm_glow)" />
              <circle cx="36" cy="38" r="3.5" fill="#ffffff" opacity="0.9" />
              <circle cx="50" cy="30" r="4.5" fill="#ffffff" opacity="0.9" />
              <circle cx="64" cy="40" r="3.5" fill="#ffffff" opacity="0.9" />

              <path d="M 54 62 C 56 44, 84 44, 86 62 C 76 65, 64 65, 54 62 Z" fill="url(#fm_glow)" />
            </g>

            {/* Levitating Floating Spores */}
            <g className={animate ? "anim-spore-float" : ""}>
              <circle cx="30" cy="24" r="1.5" fill="#6ee7b7" />
              <circle cx="65" cy="18" r="2" fill="#a7f3d0" />
              <circle cx="48" cy="12" r="1.2" fill="#fef08a" />
            </g>
          </svg>
        </div>
      );

    // 13. Flores Silvestres Nativas (Native Wildflowers)
    case 'forest_flowers':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            {/* Natural Stems with Leaves */}
            <path d="M 50 86 C 48 70, 52 54, 50 42" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 50 66 C 36 60, 32 68, 30 64 C 36 72, 46 70, 50 66" fill="#16a34a" />
            <path d="M 50 56 C 64 50, 68 58, 70 54 C 64 62, 54 60, 50 56" fill="#16a34a" />

            {/* Blooming Native Petals with velvety gradients & gentle sway */}
            <g className={animate ? "anim-canopy origin-bottom" : ""}>
              <circle cx="38" cy="40" r="10" fill="#f43f5e" />
              <circle cx="62" cy="40" r="10" fill="#f43f5e" />
              <circle cx="50" cy="28" r="10" fill="#fb7185" />
              <circle cx="50" cy="52" r="10" fill="#e11d48" />
              <circle cx="50" cy="40" r="8" fill="#fde047" />
              <circle cx="50" cy="40" r="4" fill="#f59e0b" />
            </g>
          </svg>
        </div>
      );

    // 14. Fogata Ecológica (Riverstone Eco-Campfire)
    case 'forest_campfire':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            {/* Natural River Cobblestones */}
            <ellipse cx="26" cy="80" rx="8" ry="5" fill="#64748b" />
            <ellipse cx="42" cy="84" rx="9" ry="5" fill="#475569" />
            <ellipse cx="58" cy="84" rx="9" ry="5" fill="#475569" />
            <ellipse cx="74" cy="80" rx="8" ry="5" fill="#64748b" />

            {/* Charred Hardwood Logs */}
            <path d="M 28 78 L 72 68" stroke="#451a03" strokeWidth="7" strokeLinecap="round" />
            <path d="M 72 78 L 28 68" stroke="#451a03" strokeWidth="7" strokeLinecap="round" />
            
            {/* Layered Organic Flickering & Dancing Flames */}
            <g className={animate ? "anim-flame-1 origin-bottom" : ""}>
              <path d="M 50 20 C 68 44, 62 68, 50 74 C 38 68, 32 44, 50 20 Z" fill="#ea580c" />
            </g>
            <g className={animate ? "anim-flame-2 origin-bottom" : ""}>
              <path d="M 50 32 C 60 48, 56 66, 50 72 C 44 66, 40 48, 50 32 Z" fill="#facc15" />
              <circle cx="50" cy="58" r="5" fill="#38bdf8" opacity="0.8" />
            </g>
            {/* Floating Campfire Embers */}
            <g className={animate ? "anim-spore-float" : ""}>
              <circle cx="44" cy="18" r="1.5" fill="#fdba74" />
              <circle cx="56" cy="12" r="1.8" fill="#fef08a" />
              <circle cx="51" cy="6" r="1.2" fill="#ea580c" />
            </g>
          </svg>
        </div>
      );

    // 15. Árbol Milenario Ancestro (Ancient Ancestral Tree)
    case 'forest_tree_spirit':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            <defs>
              <radialGradient id="ts_canopy" cx="50%" cy="30%" r="55%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#064e3b" />
              </radialGradient>
            </defs>
            {/* Spirit Glow Aura */}
            <circle cx="50" cy="40" r="38" fill="#10b981" opacity="0.25" className={animate ? "anim-flame-1" : ""} />

            {/* Massive Gnarled Trunk with Natural Bark Grain */}
            <g className={animate ? "anim-breathe origin-bottom" : ""}>
              <path d="M 38 48 C 42 70, 30 84, 20 88 C 40 92, 60 92, 80 88 C 70 84, 58 70, 62 48 Z" fill="#451a03" />
              <path d="M 44 56 C 46 68, 44 78, 38 86" stroke="#290f02" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 56 56 C 54 68, 56 78, 62 86" stroke="#290f02" strokeWidth="2.5" strokeLinecap="round" />

              {/* Benevolent Wise Face carved by Nature in the Wood */}
              <g className={animate ? "anim-blink origin-[50px_62px]" : ""}>
                <ellipse cx="45" cy="62" rx="2.5" ry="3.5" fill="#34d399" />
                <ellipse cx="55" cy="62" rx="2.5" ry="3.5" fill="#34d399" />
              </g>
              <path d="M 46 72 Q 50 76 54 72" stroke="#34d399" strokeWidth="2" fill="none" />
            </g>

            {/* Lush Multi-Layered Swaying Canopy */}
            <g className={animate ? "anim-canopy origin-bottom" : ""}>
              <circle cx="50" cy="34" r="28" fill="url(#ts_canopy)" />
              <circle cx="34" cy="28" r="18" fill="#10b981" opacity="0.9" />
              <circle cx="66" cy="28" r="18" fill="#047857" opacity="0.9" />
              <circle cx="50" cy="18" r="16" fill="#6ee7b7" opacity="0.8" />
            </g>

            {/* Levitating Glowing Spirit Orbs */}
            <g className={animate ? "anim-spore-float" : ""}>
              <circle cx="42" cy="24" r="3" fill="#fde047" />
              <circle cx="58" cy="26" r="3" fill="#fde047" />
              <circle cx="50" cy="36" r="2.5" fill="#fde047" />
              <circle cx="32" cy="18" r="2" fill="#a7f3d0" />
              <circle cx="68" cy="16" r="2" fill="#a7f3d0" />
            </g>
          </svg>
        </div>
      );

    // 16. Tótem de los Cuatro Elementos (Ancestral Redwood Totem)
    case 'forest_guardian_totem':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            {/* Carved Redwood Column */}
            <path d="M 34 20 C 34 16, 66 16, 66 20 L 68 88 L 32 88 Z" fill="#78350f" stroke="#451a03" strokeWidth="2" />
            
            {/* Carved Eagle Crest with Wings that gently breathe */}
            <g className={animate ? "anim-canopy origin-center" : ""}>
              <path d="M 34 24 C 20 18, 14 30, 34 36 Z" fill="#b45309" />
              <path d="M 66 24 C 80 18, 86 30, 66 36 Z" fill="#b45309" />
            </g>
            
            {/* 4 Element Gem Inlays with Specular Glow */}
            <g className={animate ? "anim-flame-1" : ""}>
              <circle cx="50" cy="28" r="6" fill="#38bdf8" /> {/* Water */}
              <circle cx="50" cy="28" r="2" fill="#ffffff" />
            </g>
            <g className={animate ? "anim-flame-2" : ""}>
              <circle cx="50" cy="46" r="6" fill="#34d399" /> {/* Earth */}
              <circle cx="50" cy="46" r="2" fill="#ffffff" />
            </g>
            <g className={animate ? "anim-flame-1" : ""}>
              <circle cx="50" cy="64" r="6" fill="#f87171" /> {/* Fire */}
              <circle cx="50" cy="64" r="2" fill="#ffffff" />
            </g>
            <g className={animate ? "anim-flame-2" : ""}>
              <circle cx="50" cy="80" r="6" fill="#facc15" /> {/* Sun */}
              <circle cx="50" cy="80" r="2" fill="#ffffff" />
            </g>
          </svg>
        </div>
      );


    // =============================================================
    // 🌵 BIOMA 2: DESÉRTICO (DESERT)
    // =============================================================
    // 1. Gato de las Arenas (Sand Cat - Felis margarita)
    case 'desert_cat':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <radialGradient id="dc_fur" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="60%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#d97706" />
              </radialGradient>
              <linearGradient id="dc_ear_inner" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fecdd3" />
                <stop offset="100%" stopColor="#fda4af" />
              </linearGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Tail with dark rings & animated wag */}
              <g className={animate ? "anim-tail origin-[72px_65px]" : ""}>
                <path d="M 70 65 C 84 62, 92 72, 88 84 C 85 92, 78 94, 74 88" stroke="#f59e0b" strokeWidth="6.5" fill="none" strokeLinecap="round" />
                <path d="M 85 86 C 84 89, 79 91, 75 88" stroke="#78350f" strokeWidth="6.5" fill="none" strokeLinecap="round" />
                <circle cx="86" cy="80" r="1.5" fill="#78350f" />
                <circle cx="88" cy="74" r="1.5" fill="#78350f" />
              </g>

              {/* Compact Sandy Torso with soft curves */}
              <path d="M 28 66 C 26 50, 42 42, 60 46 C 74 50, 78 65, 75 75 C 72 82, 35 84, 28 66 Z" fill="url(#dc_fur)" />
              {/* Soft Cream Chest Fluff */}
              <path d="M 32 58 C 36 50, 48 50, 52 58 C 48 68, 36 68, 32 58 Z" fill="#fffbeb" opacity="0.95" />
              {/* Faint Desert Stripe markings on flank */}
              <path d="M 52 50 Q 56 58 54 66 M 60 52 Q 64 60 62 68 M 68 56 Q 71 62 70 70" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" fill="none" />

              {/* Wide Flat Head (Classic Sand Cat Anatomy) */}
              <path d="M 26 38 C 24 24, 64 24, 62 38 C 64 48, 56 54, 44 54 C 32 54, 24 48, 26 38 Z" fill="url(#dc_fur)" />

              {/* Iconic Wide Low-Set Ears with Inner Fluff */}
              <g className={animate ? "anim-ear-l origin-[28px_28px]" : ""}>
                <path d="M 30 32 L 14 22 C 12 28, 20 38, 26 38 Z" fill="#d97706" />
                <path d="M 28 32 L 17 24 C 16 28, 22 35, 26 36 Z" fill="url(#dc_ear_inner)" />
                <path d="M 22 30 L 18 28 M 24 33 L 20 32" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              </g>
              <g className={animate ? "anim-ear-r origin-[60px_28px]" : ""}>
                <path d="M 58 32 L 74 22 C 76 28, 68 38, 62 38 Z" fill="#d97706" />
                <path d="M 60 32 L 71 24 C 72 28, 66 35, 62 36 Z" fill="url(#dc_ear_inner)" />
                <path d="M 66 30 L 70 28 M 64 33 L 68 32" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              </g>

              {/* Facial Markings: Reddish-brown tear lines */}
              <path d="M 33 42 Q 30 46 28 50" stroke="#b45309" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M 55 42 Q 58 46 60 50" stroke="#b45309" strokeWidth="1.2" fill="none" strokeLinecap="round" />

              {/* Large Hazel-Green Cat Eyes with reflective slit pupils and blink */}
              <g className={animate ? "anim-blink origin-[44px_38px]" : ""}>
                <ellipse cx="36" cy="38" rx="4.2" ry="4.8" fill="#10b981" />
                <ellipse cx="36" cy="38" rx="1.3" ry="3.8" fill="#064e3b" />
                <circle cx="34.5" cy="36" r="1.3" fill="#ffffff" />

                <ellipse cx="52" cy="38" rx="4.2" ry="4.8" fill="#10b981" />
                <ellipse cx="52" cy="38" rx="1.3" ry="3.8" fill="#064e3b" />
                <circle cx="50.5" cy="36" r="1.3" fill="#ffffff" />
              </g>

              {/* Delicate Snout, Nose & Whiskers */}
              <ellipse cx="44" cy="46" rx="5" ry="3.5" fill="#fffbeb" />
              <polygon points="44,45 42,43 46,43" fill="#f43f5e" />
              <path d="M 44 45 L 44 47 M 42 47 Q 44 48.5 46 47" stroke="#78350f" strokeWidth="0.8" fill="none" />
              
              {/* Whiskers */}
              <line x1="39" y1="46" x2="24" y2="44" stroke="#ffffff" strokeWidth="0.9" opacity="0.9" />
              <line x1="39" y1="48" x2="25" y2="49" stroke="#ffffff" strokeWidth="0.9" opacity="0.9" />
              <line x1="49" y1="46" x2="64" y2="44" stroke="#ffffff" strokeWidth="0.9" opacity="0.9" />
              <line x1="49" y1="48" x2="63" y2="49" stroke="#ffffff" strokeWidth="0.9" opacity="0.9" />

              {/* Paws with Fur-cushioned Desert Pads */}
              <ellipse cx="33" cy="78" rx="4.8" ry="3.2" fill="#fffbeb" />
              <ellipse cx="45" cy="79" rx="4.8" ry="3.2" fill="#fffbeb" />
              <ellipse cx="65" cy="77" rx="5" ry="3.5" fill="#fde68a" />
            </g>
          </svg>
        </div>
      );

    // 2. Coyote Explorador (Coyote - Canis latrans)
    case 'desert_dog':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="coy_coat" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Bushy Tail with Black Tip */}
              <g className={animate ? "anim-fox-tail origin-[74px_62px]" : ""}>
                <path d="M 72 60 C 88 56, 96 70, 92 84 C 90 90, 84 92, 80 84 C 76 76, 70 70, 72 60 Z" fill="#b45309" />
                <path d="M 91 80 C 89 88, 83 90, 80 84 C 83 78, 88 76, 91 80 Z" fill="#18181b" />
              </g>

              {/* Slender Agile Body */}
              <path d="M 28 66 C 24 50, 42 42, 64 46 C 76 48, 78 64, 72 74 C 64 80, 36 82, 28 66 Z" fill="url(#coy_coat)" />
              {/* Cream Underside & Chest Ruff */}
              <path d="M 30 54 C 36 44, 48 46, 52 56 C 44 68, 34 68, 30 54 Z" fill="#fffbeb" />

              {/* Tall Alert Ears */}
              <g className={animate ? "anim-ear-l origin-[34px_22px]" : ""}>
                <path d="M 32 26 L 24 6 C 30 10, 38 18, 38 28 Z" fill="#78350f" />
                <path d="M 31 24 L 26 10 C 30 14, 35 20, 35 26 Z" fill="#fed7aa" />
              </g>
              <g className={animate ? "anim-ear-r origin-[54px_22px]" : ""}>
                <path d="M 50 28 L 56 6 C 62 10, 58 20, 56 26 Z" fill="#78350f" />
                <path d="M 52 26 L 55 10 C 58 14, 56 20, 54 24 Z" fill="#fed7aa" />
              </g>

              {/* Slender Head & Snout */}
              <path d="M 32 36 C 28 26, 54 24, 52 34 C 54 44, 48 48, 38 48 C 30 46, 32 40, 32 36 Z" fill="#d97706" />
              <path d="M 30 40 L 16 46 C 18 50, 26 52, 34 48 Z" fill="#fde68a" />
              <ellipse cx="16" cy="46" rx="2" ry="1.6" fill="#0f172a" />

              {/* Keen Golden Eyes with Blink */}
              <g className={animate ? "anim-blink origin-[38px_34px]" : ""}>
                <circle cx="34" cy="34" r="2.8" fill="#facc15" />
                <circle cx="34" cy="34" r="1.5" fill="#0f172a" />
                <circle cx="33" cy="33" r="0.8" fill="#ffffff" />
              </g>

              {/* Strong Slender Paws */}
              <path d="M 30 68 L 26 84 M 40 68 L 38 85" stroke="#b45309" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 60 70 L 62 85 M 70 68 L 74 84" stroke="#92400e" strokeWidth="3.5" strokeLinecap="round" />
              <ellipse cx="26" cy="85" rx="3.5" ry="2" fill="#78350f" />
              <ellipse cx="38" cy="86" rx="3.5" ry="2" fill="#78350f" />
              <ellipse cx="62" cy="86" rx="3.5" ry="2" fill="#78350f" />
              <ellipse cx="74" cy="85" rx="3.5" ry="2" fill="#78350f" />
            </g>
          </svg>
        </div>
      );

    // 3. Dromedario de Carga (Desert Dromedary - Camelus dromedarius)
    case 'desert_camel':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <radialGradient id="drom_hump" cx="50%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="70%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#92400e" />
              </radialGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Strong Body & Massive Woolly Hump */}
              <path d="M 24 64 C 18 56, 26 44, 40 46 C 42 30, 60 30, 64 46 C 78 48, 84 62, 78 74 C 70 82, 34 82, 24 64 Z" fill="url(#drom_hump)" />
              {/* Hump Texture Folds */}
              <path d="M 44 38 C 48 34, 56 34, 60 38" stroke="#78350f" strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" />

              {/* Graceful S-Curved Neck & Noble Head */}
              <g className={animate ? "anim-canopy origin-bottom" : ""}>
                <path d="M 68 56 C 76 46, 78 32, 74 20 C 78 16, 86 18, 88 24 C 88 32, 82 50, 76 60 Z" fill="#d97706" />
                <ellipse cx="82" cy="20" rx="9" ry="6.5" fill="#fde68a" />
                <ellipse cx="88" cy="22" rx="3.5" ry="2.5" fill="#b45309" />
                {/* Nostril slit */}
                <ellipse cx="89" cy="22" rx="1.2" ry="0.8" fill="#451a03" />

                {/* Expressive Eye with Long Protective Eyelashes */}
                <g className={animate ? "anim-blink origin-[80px_19px]" : ""}>
                  <ellipse cx="80" cy="19" rx="2.5" ry="2" fill="#0f172a" />
                  <circle cx="79.5" cy="18.5" r="0.8" fill="#ffffff" />
                  <line x1="77" y1="17" x2="82" y2="16" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
                </g>

                {/* Small Furry Ear */}
                <ellipse cx="74" cy="16" rx="2" ry="3.5" fill="#92400e" transform="rotate(-20 74 16)" />
              </g>

              {/* Ornate Bedouin Saddle Blanket with Hanging Tassels */}
              <path d="M 40 50 L 64 50 L 66 64 L 38 64 Z" fill="#dc2626" stroke="#facc15" strokeWidth="1.2" />
              <line x1="40" y1="56" x2="64" y2="56" stroke="#0284c7" strokeWidth="1.5" />
              <line x1="40" y1="60" x2="64" y2="60" stroke="#facc15" strokeWidth="1.5" />
              {/* Swinging Tassels */}
              <g className={animate ? "anim-canopy origin-top" : ""}>
                <circle cx="42" cy="67" r="1.5" fill="#facc15" />
                <circle cx="48" cy="67" r="1.5" fill="#0284c7" />
                <circle cx="54" cy="67" r="1.5" fill="#facc15" />
                <circle cx="60" cy="67" r="1.5" fill="#0284c7" />
              </g>

              {/* Sturdy Legs with Wide Splayed Dune Pads */}
              <path d="M 30 72 L 28 88 M 38 72 L 36 88" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
              <path d="M 64 74 L 62 88 M 72 72 L 70 88" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="28" cy="89" rx="4.5" ry="2.2" fill="#78350f" />
              <ellipse cx="36" cy="89" rx="4.5" ry="2.2" fill="#78350f" />
              <ellipse cx="62" cy="89" rx="4.5" ry="2.2" fill="#58240c" />
              <ellipse cx="70" cy="89" rx="4.5" ry="2.2" fill="#58240c" />

              {/* Tufted Tail */}
              <path d="M 24 64 C 18 68, 16 76, 18 84" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="18" cy="84" r="2.5" fill="#78350f" />
            </g>
          </svg>
        </div>
      );

    // 4. Zorro Fénec (Fennec Fox - Vulpes zerda)
    case 'desert_fennec':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="fen_ear" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fecdd3" />
                <stop offset="100%" stopColor="#fda4af" />
              </linearGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Fluffy Curled Tail */}
              <g className={animate ? "anim-fox-tail origin-[72px_74px]" : ""}>
                <path d="M 66 74 C 82 66, 94 76, 88 88 C 84 94, 76 94, 72 88 C 68 82, 64 78, 66 74 Z" fill="#fde68a" />
                <path d="M 87 86 C 85 91, 78 93, 75 88" stroke="#78350f" strokeWidth="4" fill="none" strokeLinecap="round" />
              </g>

              {/* Petite Cream Body */}
              <path d="M 34 68 C 30 56, 44 50, 58 54 C 68 58, 70 72, 66 82 C 60 88, 38 88, 34 68 Z" fill="#fef3c7" />

              {/* Massive Oversized Velvety Ears (Key Fennec Feature) */}
              <g className={animate ? "anim-ear-l origin-[34px_38px]" : ""}>
                <path d="M 38 42 C 32 30, 16 10, 14 4 C 8 16, 18 36, 30 46 Z" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
                <path d="M 34 40 C 29 30, 18 14, 16 8 C 12 18, 20 34, 28 42 Z" fill="url(#fen_ear)" />
                {/* Delicate ear vessel capillaries */}
                <path d="M 24 34 L 20 22 M 22 28 L 18 24" stroke="#fb7185" strokeWidth="0.8" opacity="0.6" />
                <path d="M 32 44 L 26 40 M 34 46 L 28 43" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              </g>

              <g className={animate ? "anim-ear-r origin-[66px_38px]" : ""}>
                <path d="M 62 42 C 68 30, 84 10, 86 4 C 92 16, 82 36, 70 46 Z" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
                <path d="M 66 40 C 71 30, 82 14, 84 8 C 88 18, 80 34, 72 42 Z" fill="url(#fen_ear)" />
                <path d="M 76 34 L 80 22 M 78 28 L 82 24" stroke="#fb7185" strokeWidth="0.8" opacity="0.6" />
                <path d="M 68 44 L 74 40 M 66 46 L 72 43" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              </g>

              {/* Adorable Sweet Face & Snout */}
              <path d="M 32 46 C 30 36, 70 36, 68 46 C 70 56, 60 62, 50 62 C 40 62, 30 56, 32 46 Z" fill="#fffbeb" />
              
              {/* Huge Sparkling Obsidian Eyes with Blink */}
              <g className={animate ? "anim-blink origin-[50px_48px]" : ""}>
                <circle cx="42" cy="48" r="4.5" fill="#0f172a" />
                <circle cx="40.5" cy="46" r="1.6" fill="#ffffff" />
                <circle cx="43.5" cy="49.5" r="0.8" fill="#ffffff" />

                <circle cx="58" cy="48" r="4.5" fill="#0f172a" />
                <circle cx="56.5" cy="46" r="1.6" fill="#ffffff" />
                <circle cx="59.5" cy="49.5" r="0.8" fill="#ffffff" />
              </g>

              {/* Tiny Pointed Nose */}
              <polygon points="50,56 47,53 53,53" fill="#0f172a" />
              <ellipse cx="50" cy="57" rx="3" ry="1.5" fill="#fecdd3" opacity="0.5" />

              {/* Tiny Paws */}
              <ellipse cx="40" cy="84" rx="3.5" ry="2.5" fill="#ffffff" />
              <ellipse cx="54" cy="84" rx="3.5" ry="2.5" fill="#ffffff" />
            </g>
          </svg>
        </div>
      );

    // 5. Escorpión Dorado (Deathstalker Scorpion)
    case 'desert_scorpion':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <radialGradient id="scorp_glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </radialGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Multi-jointed Walking Legs */}
              <path d="M 38 60 L 22 52 L 14 62 M 40 65 L 20 62 L 12 74 M 42 70 L 22 74 L 16 86" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M 58 60 L 74 52 L 82 62 M 56 65 L 76 62 L 84 74 M 54 70 L 74 74 L 80 86" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" fill="none" />

              {/* Powerful Pedipalps & Pincers (Chelae) */}
              <g className={animate ? "anim-canopy origin-[38px_50px]" : ""}>
                <path d="M 38 52 C 26 44, 22 36, 26 26" stroke="#b45309" strokeWidth="3" fill="none" strokeLinecap="round" />
                {/* Left Claws */}
                <path d="M 26 26 C 22 22, 22 14, 28 16 C 30 18, 28 24, 26 26 Z" fill="url(#scorp_glow)" stroke="#92400e" strokeWidth="1" />
                <path d="M 26 26 C 28 20, 34 16, 36 20 C 34 24, 30 26, 26 26 Z" fill="url(#scorp_glow)" stroke="#92400e" strokeWidth="1" />
              </g>

              <g className={animate ? "anim-canopy origin-[58px_50px]" : ""}>
                <path d="M 58 52 C 70 44, 74 36, 70 26" stroke="#b45309" strokeWidth="3" fill="none" strokeLinecap="round" />
                {/* Right Claws */}
                <path d="M 70 26 C 74 22, 74 14, 68 16 C 66 18, 68 24, 70 26 Z" fill="url(#scorp_glow)" stroke="#92400e" strokeWidth="1" />
                <path d="M 70 26 C 68 20, 62 16, 60 20 C 62 24, 66 26, 70 26 Z" fill="url(#scorp_glow)" stroke="#92400e" strokeWidth="1" />
              </g>

              {/* Segmented Prosoma & Mesosoma (Exoskeleton Body) */}
              <ellipse cx="48" cy="62" rx="14" ry="16" fill="url(#scorp_glow)" stroke="#78350f" strokeWidth="1.2" />
              {/* Chitin Segments */}
              <line x1="36" y1="54" x2="60" y2="54" stroke="#78350f" strokeWidth="1.2" />
              <line x1="34" y1="60" x2="62" y2="60" stroke="#78350f" strokeWidth="1.2" />
              <line x1="36" y1="66" x2="60" y2="66" stroke="#78350f" strokeWidth="1.2" />
              <line x1="38" y1="72" x2="58" y2="72" stroke="#78350f" strokeWidth="1.2" />

              {/* Median Eyes */}
              <circle cx="46" cy="50" r="1.2" fill="#0f172a" />
              <circle cx="50" cy="50" r="1.2" fill="#0f172a" />

              {/* Segmented Metasoma (Arching Tail with Glowing Stinger) */}
              <g className={animate ? "anim-scorpion-tail" : ""}>
                {/* 5 Tail Segments */}
                <ellipse cx="50" cy="78" rx="6" ry="4" fill="#d97706" stroke="#78350f" strokeWidth="1" />
                <ellipse cx="56" cy="84" rx="5.5" ry="3.8" fill="#d97706" stroke="#78350f" strokeWidth="1" />
                <ellipse cx="64" cy="85" rx="5" ry="3.5" fill="#d97706" stroke="#78350f" strokeWidth="1" />
                <ellipse cx="72" cy="80" rx="4.8" ry="3.5" fill="#d97706" stroke="#78350f" strokeWidth="1" />
                <ellipse cx="74" cy="70" rx="4.5" ry="3.2" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                <ellipse cx="70" cy="58" rx="4.2" ry="3.2" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />

                {/* Telson (Venom Bulb) & Aculeus (Curved Needle Stinger) */}
                <path d="M 64 48 C 66 40, 58 34, 52 38 C 48 42, 54 48, 64 48 Z" fill="#ea580c" stroke="#9a3412" strokeWidth="1" />
                <path d="M 52 38 Q 44 38 42 44" stroke="#18181b" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* Glowing Amber Venom Droplet */}
                <circle cx="42" cy="45" r="1.8" fill="#fde047" className={animate ? "anim-flame-1" : ""} />
              </g>
            </g>
          </svg>
        </div>
      );

    // 6. Monstruo de Gila / Lagarto del Sol (Heloderma suspectum)
    case 'desert_lizard':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <pattern id="bead_skin" width="4" height="4" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#f97316" />
              </pattern>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Thick Heavy Tail with Coral Bands */}
              <g className={animate ? "anim-tail origin-[25px_65px]" : ""}>
                <path d="M 28 66 C 14 70, 6 80, 8 92 C 14 96, 26 86, 32 74 Z" fill="#18181b" />
                <path d="M 22 72 Q 16 80 18 84" stroke="#fb923c" strokeWidth="5" fill="none" strokeLinecap="round" />
              </g>

              {/* Sturdy Muscular Body with Beaded Texture */}
              <path d="M 26 68 C 22 52, 42 40, 68 46 C 80 50, 78 68, 70 76 C 54 84, 32 82, 26 68 Z" fill="#18181b" />
              {/* Coral/Orange Warning Splotches */}
              <path d="M 36 50 C 44 46, 48 54, 42 62 C 34 60, 32 54, 36 50 Z" fill="#ea580c" />
              <path d="M 52 48 C 62 46, 66 56, 58 64 C 50 62, 48 54, 52 48 Z" fill="#fb923c" />
              <path d="M 44 64 C 54 62, 56 72, 48 76 C 40 74, 38 68, 44 64 Z" fill="#ea580c" />

              {/* Clawed Sprawling Legs Gripping Sandstone */}
              <path d="M 32 64 L 18 60 L 14 66 M 28 74 L 16 78 L 14 86" stroke="#18181b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M 64 64 L 78 60 L 82 66 M 60 76 L 74 78 L 76 86" stroke="#18181b" strokeWidth="4.5" strokeLinecap="round" fill="none" />

              {/* Broad Rounded Reptilian Head */}
              <g className={animate ? "anim-canopy origin-[68px_50px]" : ""}>
                <path d="M 64 48 C 68 36, 86 36, 92 48 C 94 56, 88 64, 76 64 C 68 64, 64 56, 64 48 Z" fill="#18181b" />
                <ellipse cx="82" cy="46" rx="6" ry="4" fill="#ea580c" />

                {/* Keen Reptilian Eye with Slit Pupil */}
                <circle cx="80" cy="44" r="2.5" fill="#facc15" />
                <line x1="80" y1="42" x2="80" y2="46" stroke="#000000" strokeWidth="1.2" />
                <circle cx="79.2" cy="43.2" r="0.6" fill="#ffffff" />

                {/* Fast Flicking Dark-Pink Forked Tongue */}
                <g className={animate ? "anim-tongue origin-[92px_54px]" : ""}>
                  <path d="M 92 52 L 100 50 M 100 50 L 103 47 M 100 50 L 103 53" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </g>
              </g>
            </g>
          </svg>
        </div>
      );

    // 7. Guía Nómada del Sol (Sun Nomad Guide)
    case 'desert_nomad':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="nomad_robe" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="50%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Walking Acacia Desert Staff */}
              <line x1="72" y1="20" x2="72" y2="92" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
              <circle cx="72" cy="18" r="4" fill="#f59e0b" />
              <circle cx="72" cy="18" r="2" fill="#fef08a" className="animate-pulse" />

              {/* Layered Desert Tagelmust Robes */}
              <path d="M 32 46 L 68 46 L 74 90 L 26 90 Z" fill="url(#nomad_robe)" />
              {/* Gold Embroidered Border */}
              <line x1="26" y1="88" x2="74" y2="88" stroke="#facc15" strokeWidth="2" />
              
              {/* Brass Solar Canteen & Leather Cross-Strap */}
              <line x1="36" y1="46" x2="64" y2="76" stroke="#78350f" strokeWidth="2.5" />
              <circle cx="58" cy="70" r="5.5" fill="#d97706" stroke="#fef08a" strokeWidth="1" />
              <circle cx="58" cy="70" r="2" fill="#38bdf8" />

              {/* Indigo Desert Turban / Tagelmust Headwrap */}
              <g className={animate ? "anim-canopy origin-bottom" : ""}>
                <ellipse cx="50" cy="28" rx="16" ry="14" fill="#1e40af" />
                <path d="M 36 28 C 36 20, 64 20, 64 28 C 66 36, 62 42, 50 42 C 38 42, 34 36, 36 28 Z" fill="#1d4ed8" />
                {/* Flowing Scarf End fluttering in the breeze */}
                <path d="M 34 36 Q 22 46 26 62" stroke="#2563eb" strokeWidth="4" fill="none" strokeLinecap="round" />
                
                {/* Weathered Observant Eyes Peeking Through Veil */}
                <rect x="40" y="27" width="20" height="7" rx="2" fill="#fed7aa" />
                <g className={animate ? "anim-blink origin-[50px_30px]" : ""}>
                  <circle cx="45" cy="30.5" r="1.6" fill="#0f172a" />
                  <circle cx="45.5" cy="30" r="0.6" fill="#ffffff" />
                  <circle cx="55" cy="30.5" r="1.6" fill="#0f172a" />
                  <circle cx="55.5" cy="30" r="0.6" fill="#ffffff" />
                </g>
              </g>
            </g>
          </svg>
        </div>
      );

    // 8. Astrónoma de Cielos Claros (Clear Sky Astronomer)
    case 'desert_astronomer':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="astro_robe" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="60%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Midnight Star-Patterned Cloak */}
              <path d="M 30 44 L 70 44 L 76 90 L 24 90 Z" fill="url(#astro_robe)" />
              {/* Embroidered Constellation Stars */}
              <circle cx="38" cy="58" r="1.2" fill="#fef08a" />
              <circle cx="48" cy="68" r="1.5" fill="#fef08a" className="animate-ping" />
              <circle cx="62" cy="62" r="1.2" fill="#fef08a" />
              <line x1="38" y1="58" x2="48" y2="68" stroke="#fde047" strokeWidth="0.8" opacity="0.6" />
              <line x1="48" y1="68" x2="62" y2="62" stroke="#fde047" strokeWidth="0.8" opacity="0.6" />

              {/* Expressive Face & Hood */}
              <ellipse cx="50" cy="28" rx="14" ry="12" fill="#1e1b4b" />
              <ellipse cx="50" cy="30" rx="9" ry="8" fill="#fde68a" />
              <g className={animate ? "anim-blink origin-[50px_30px]" : ""}>
                <circle cx="46" cy="30" r="1.6" fill="#0f172a" />
                <circle cx="46.5" cy="29.5" r="0.6" fill="#ffffff" />
                <circle cx="54" cy="30" r="1.6" fill="#0f172a" />
                <circle cx="54.5" cy="29.5" r="0.6" fill="#ffffff" />
              </g>

              {/* Brass Astrolabe with Concentric Rings */}
              <g className={animate ? "anim-turbine" : ""} style={{ transformOrigin: '50px 72px' }}>
                <circle cx="50" cy="72" r="12" fill="#78350f" stroke="#facc15" strokeWidth="2" opacity="0.9" />
                <circle cx="50" cy="72" r="8" fill="none" stroke="#fde047" strokeWidth="1.2" />
                <line x1="50" y1="60" x2="50" y2="84" stroke="#facc15" strokeWidth="1.2" />
                <line x1="38" y1="72" x2="62" y2="72" stroke="#facc15" strokeWidth="1.2" />
                <circle cx="50" cy="72" r="3" fill="#38bdf8" />
              </g>

              {/* Brass Telescope on Shoulder */}
              <path d="M 64 36 L 84 20 L 88 24 L 68 40 Z" fill="#ca8a04" stroke="#fde047" strokeWidth="1" />
              <circle cx="86" cy="22" r="3.5" fill="#38bdf8" opacity="0.9" className="animate-pulse" />
            </g>
          </svg>
        </div>
      );

    // 9. Domo Geodésico Térmico / Choza de Oasis (Thermal Adobe Dome)
    case 'desert_oasis_hut':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <radialGradient id="adobe_glow" cx="45%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="60%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#9a3412" />
              </radialGradient>
            </defs>
            {/* Hand-sculpted Sun-baked Adobe Dome */}
            <path d="M 16 82 C 14 42, 86 42, 84 82 Z" fill="url(#adobe_glow)" stroke="#7c2d12" strokeWidth="2" />
            
            {/* Palm Thatch Overhang Eaves */}
            <path d="M 14 56 C 24 50, 76 50, 86 56" stroke="#a16207" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M 18 58 C 30 52, 70 52, 82 58" stroke="#ca8a04" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Natural Adobe Clay Texture Lines */}
            <path d="M 28 68 Q 50 64 72 68" stroke="#c2410c" strokeWidth="1.5" fill="none" />
            
            {/* Cooling Terracotta Ollas at Entrance */}
            <ellipse cx="26" cy="78" rx="5" ry="6.5" fill="#c2410c" stroke="#7c2d12" strokeWidth="1" />
            <ellipse cx="26" cy="72" rx="3" ry="1.2" fill="#7c2d12" />
            <ellipse cx="34" cy="80" rx="4" ry="5.5" fill="#ea580c" stroke="#7c2d12" strokeWidth="1" />

            {/* Archway Entrance with Warm Glowing Lantern Light */}
            <path d="M 42 82 L 42 62 C 42 56, 58 56, 58 62 L 58 82 Z" fill="#451a03" />
            <g className={animate ? "anim-flame-1" : ""}>
              <ellipse cx="50" cy="70" rx="5" ry="7" fill="#fde047" opacity="0.9" />
              <circle cx="50" cy="70" r="3" fill="#ffffff" />
            </g>

            {/* Rooftop Ceramic Ventilation Chimney */}
            <rect x="46" y="34" width="8" height="8" rx="2" fill="#9a3412" />
            <ellipse cx="50" cy="34" rx="4" ry="1.5" fill="#7c2d12" />
          </svg>
        </div>
      );

    // 10. Bomba Eólica de Acuífero (Aquifer Windmill Pump)
    case 'desert_windpump':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            {/* Steel Lattice Tower */}
            <polygon points="50,25 24,88 76,88" fill="none" stroke="#64748b" strokeWidth="2.8" />
            <line x1="32" y1="70" x2="68" y2="70" stroke="#475569" strokeWidth="2" />
            <line x1="38" y1="52" x2="62" y2="52" stroke="#475569" strokeWidth="2" />
            <line x1="44" y1="36" x2="56" y2="36" stroke="#475569" strokeWidth="2" />
            {/* Cross braces */}
            <line x1="32" y1="70" x2="62" y2="52" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="68" y1="70" x2="38" y2="52" stroke="#94a3b8" strokeWidth="1.2" />

            {/* Vertical Pumping Rod */}
            <line x1="50" y1="25" x2="50" y2="88" stroke="#cbd5e1" strokeWidth="2" />

            {/* Directional Wind Vane (Tail) */}
            <path d="M 50 25 L 72 20 L 70 28 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />

            {/* Continuous Spinning Multi-blade Wind Turbine */}
            <g className={animate ? "anim-turbine" : ""}>
              {/* Hub */}
              <circle cx="50" cy="25" r="4.5" fill="#0f172a" />
              {/* Blades */}
              <line x1="50" y1="7" x2="50" y2="43" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              <line x1="32" y1="25" x2="68" y2="25" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              <line x1="37" y1="12" x2="63" y2="38" stroke="#0ea5e9" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="37" y1="38" x2="63" y2="12" stroke="#0ea5e9" strokeWidth="2.8" strokeLinecap="round" />
              {/* Outer circular reinforcing rim */}
              <circle cx="50" cy="25" r="16" fill="none" stroke="#7dd3fc" strokeWidth="1" opacity="0.7" />
            </g>

            {/* Clear Oasis Water Reservoir Basin with Ripples */}
            <ellipse cx="50" cy="88" rx="26" ry="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            <ellipse cx="50" cy="88" rx="18" ry="5" fill="#7dd3fc" opacity="0.8" className={animate ? "anim-ripple" : ""} />
          </svg>
        </div>
      );

    // 11. Saguaros Gigantes en Flor (Carnegiea gigantea)
    case 'desert_cactus_giant':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="sag_green" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#166534" />
              </linearGradient>
            </defs>
            <g className={animate ? "anim-breathe origin-bottom" : ""}>
              {/* Left Branching Curved Arm */}
              <path d="M 42 54 C 26 54, 22 48, 22 36 L 22 24 C 22 20, 30 20, 30 24 L 30 38 C 30 44, 34 46, 42 46 Z" fill="url(#sag_green)" />
              {/* Rib lines left arm */}
              <line x1="26" y1="22" x2="26" y2="40" stroke="#14532d" strokeWidth="1" strokeDasharray="1,2" />

              {/* Right Branching Curved Arm */}
              <path d="M 58 64 C 74 64, 78 58, 78 46 L 78 32 C 78 28, 86 28, 86 32 L 86 48 C 86 56, 80 58, 58 58 Z" fill="url(#sag_green)" />
              {/* Rib lines right arm */}
              <line x1="82" y1="30" x2="82" y2="50" stroke="#14532d" strokeWidth="1" strokeDasharray="1,2" />

              {/* Monumental Central Trunk */}
              <rect x="40" y="14" width="20" height="76" rx="10" fill="url(#sag_green)" />
              {/* Fluted Accordion Ribs */}
              <line x1="45" y1="16" x2="45" y2="88" stroke="#14532d" strokeWidth="1.2" strokeDasharray="2,3" />
              <line x1="50" y1="14" x2="50" y2="88" stroke="#86efac" strokeWidth="1.2" strokeDasharray="2,3" />
              <line x1="55" y1="16" x2="55" y2="88" stroke="#14532d" strokeWidth="1.2" strokeDasharray="2,3" />

              {/* Natural Nesting Cavity with Cute Elf Owl */}
              <ellipse cx="50" cy="52" rx="4.5" ry="6" fill="#18181b" />
              <g className={animate ? "anim-blink origin-[50px_52px]" : ""}>
                <circle cx="48.5" cy="51" r="1.5" fill="#facc15" />
                <circle cx="48.5" cy="51" r="0.8" fill="#000000" />
                <circle cx="51.5" cy="51" r="1.5" fill="#facc15" />
                <circle cx="51.5" cy="51" r="0.8" fill="#000000" />
              </g>

              {/* Crown of Blooming White/Pink Nocturnal Flowers */}
              <g className={animate ? "anim-canopy origin-bottom" : ""}>
                <circle cx="50" cy="12" r="5" fill="#ffffff" />
                <circle cx="50" cy="12" r="3" fill="#fef08a" />
                <circle cx="50" cy="12" r="1.5" fill="#f59e0b" />
                <circle cx="26" cy="22" r="3.5" fill="#ffffff" />
                <circle cx="26" cy="22" r="1.8" fill="#fef08a" />
                <circle cx="82" cy="30" r="3.5" fill="#ffffff" />
                <circle cx="82" cy="30" r="1.8" fill="#fef08a" />
              </g>
            </g>
          </svg>
        </div>
      );

    // 12. Palmeras Datileras de Oasis (Phoenix dactylifera)
    case 'desert_oasis_palms':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            {/* Shimmering Oasis Water Base */}
            <ellipse cx="50" cy="86" rx="34" ry="10" fill="#0284c7" />
            <ellipse cx="50" cy="86" rx="26" ry="6" fill="#38bdf8" className={animate ? "anim-ripple" : ""} />

            {/* Graceful Curving Fibrous Trunk with Diamond Palm-Bark Pattern */}
            <path d="M 44 86 C 42 60, 56 46, 54 28 L 60 28 C 62 46, 50 60, 52 86 Z" fill="#78350f" stroke="#451a03" strokeWidth="1" />
            {/* Bark rings */}
            <path d="M 46 76 Q 50 74 54 76 M 46 64 Q 52 62 56 64 M 48 52 Q 54 50 58 52 M 52 40 Q 56 38 60 40" stroke="#92400e" strokeWidth="1.5" fill="none" />

            {/* Golden Clusters of Sweet Dates */}
            <g className={animate ? "anim-canopy origin-top" : ""}>
              <circle cx="53" cy="32" r="2.2" fill="#d97706" />
              <circle cx="56" cy="33" r="2.2" fill="#b45309" />
              <circle cx="58" cy="32" r="2.2" fill="#f59e0b" />
              <circle cx="55" cy="36" r="2" fill="#d97706" />
            </g>

            {/* Lush Swaying Feathery Palm Fronds */}
            <g className={animate ? "anim-canopy origin-[56px_28px]" : ""}>
              {/* Back Fronds */}
              <path d="M 56 28 Q 78 16 92 26 C 82 24, 70 24, 56 28 Z" fill="#15803d" />
              <path d="M 56 28 Q 32 14 14 24 C 26 22, 40 24, 56 28 Z" fill="#15803d" />
              {/* Front Fronds with rich layers */}
              <path d="M 56 28 Q 72 8 82 2 C 76 10, 68 18, 56 28 Z" fill="#22c55e" />
              <path d="M 56 28 Q 40 8 28 2 C 34 10, 42 18, 56 28 Z" fill="#22c55e" />
              <path d="M 56 28 Q 58 4 60 0 C 56 8, 56 18, 56 28 Z" fill="#86efac" />
              {/* Drooping side fronds */}
              <path d="M 56 28 Q 80 34 94 48 C 84 42, 70 36, 56 28 Z" fill="#166534" />
              <path d="M 56 28 Q 30 34 12 48 C 22 42, 38 36, 56 28 Z" fill="#166534" />
            </g>
          </svg>
        </div>
      );

    // 13. Tinajas de Barro Ancestrales (Ancestral Terracotta Amphorae)
    case 'desert_pottery':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <radialGradient id="pot_clay" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="60%" stopColor="#c2410c" />
                <stop offset="100%" stopColor="#7c2d12" />
              </radialGradient>
            </defs>
            {/* Large Central Clay Amphora */}
            <g className={animate ? "anim-breathe" : ""}>
              <ellipse cx="50" cy="64" rx="24" ry="22" fill="url(#pot_clay)" stroke="#431407" strokeWidth="1.5" />
              <path d="M 40 42 L 36 26 L 64 26 L 60 42 Z" fill="#ea580c" stroke="#431407" strokeWidth="1.5" />
              <ellipse cx="50" cy="26" rx="14" ry="4" fill="#7c2d12" stroke="#431407" strokeWidth="1" />
              <ellipse cx="50" cy="26" rx="10" ry="2.5" fill="#38bdf8" /> {/* Cool Water Interior */}

              {/* Intricate Handcrafted Solar Spiral Glyphs */}
              <path d="M 38 64 Q 50 72 62 64 M 34 58 Q 50 66 66 58" stroke="#fef3c7" strokeWidth="2" fill="none" strokeLinecap="round" />
              <circle cx="50" cy="62" r="3" fill="#facc15" />

              {/* Amphora Loop Handles */}
              <path d="M 38 32 C 26 36, 26 50, 36 54" stroke="#9a3412" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 62 32 C 74 36, 74 50, 64 54" stroke="#9a3412" strokeWidth="3.5" fill="none" strokeLinecap="round" />

              {/* Smaller Companion Terracotta Jug */}
              <ellipse cx="76" cy="74" rx="12" ry="14" fill="#c2410c" stroke="#431407" strokeWidth="1.2" />
              <ellipse cx="76" cy="60" rx="6" ry="2" fill="#7c2d12" />

              {/* Desert Sage Sprig */}
              <path d="M 50 26 Q 38 12 30 16" stroke="#15803d" strokeWidth="2" fill="none" strokeLinecap="round" />
              <circle cx="30" cy="16" r="2.5" fill="#86efac" />
            </g>
          </svg>
        </div>
      );

    // 14. Santuario Solar del Desierto (Sun Sanctuary / Solar Temple)
    case 'desert_sun_temple':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            <defs>
              <radialGradient id="sun_core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#fef08a" />
                <stop offset="80%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ea580c" />
              </radialGradient>
            </defs>
            {/* Monumental Sandstone Plinth & Steps */}
            <rect x="10" y="80" width="80" height="12" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
            <rect x="18" y="70" width="64" height="11" rx="2" fill="#92400e" stroke="#451a03" strokeWidth="1.2" />
            <rect x="26" y="58" width="48" height="13" rx="2" fill="#b45309" stroke="#451a03" strokeWidth="1.2" />

            {/* Twin Sandstone Obelisks */}
            <polygon points="16,80 20,38 22,38 26,80" fill="#d97706" stroke="#78350f" strokeWidth="1" />
            <polygon points="20,38 21,30 22,38" fill="#facc15" />

            <polygon points="74,80 78,38 80,38 84,80" fill="#d97706" stroke="#78350f" strokeWidth="1" />
            <polygon points="78,38 79,30 80,38" fill="#facc15" />

            {/* Central Temple Altar Pillars & Pediment */}
            <rect x="34" y="44" width="6" height="15" fill="#fde68a" />
            <rect x="60" y="44" width="6" height="15" fill="#fde68a" />
            <polygon points="50,30 30,44 70,44" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />

            {/* Radiant Rotating Solar Core & Sunbeams */}
            <g className={animate ? "anim-sun-rays" : ""} style={{ transformOrigin: '50px 22px' }}>
              {/* 8 Sun Rays */}
              <line x1="50" y1="4" x2="50" y2="40" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
              <line x1="32" y1="22" x2="68" y2="22" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
              <line x1="37" y1="9" x2="63" y2="35" stroke="#facc15" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="37" y1="35" x2="63" y2="9" stroke="#facc15" strokeWidth="1.8" strokeLinecap="round" />
            </g>

            {/* Pulsing Central Sun Sphere */}
            <circle cx="50" cy="22" r="11" fill="url(#sun_core)" className={animate ? "anim-flame-1" : ""} />
            <circle cx="50" cy="22" r="5" fill="#ffffff" />
          </svg>
        </div>
      );

    // 15. Manantial Espejo Eterno (Eternal Mirror Oasis Spring)
    case 'desert_crystal_fountain':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            <defs>
              <radialGradient id="oasis_pool" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="40%" stopColor="#38bdf8" />
                <stop offset="80%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0c4a6e" />
              </radialGradient>
            </defs>
            {/* Natural Terraced Riverstone Basin */}
            <ellipse cx="50" cy="74" rx="42" ry="18" fill="#475569" stroke="#1e293b" strokeWidth="2" />
            <ellipse cx="50" cy="74" rx="36" ry="14" fill="url(#oasis_pool)" />

            {/* Shimmering Water Caustics & Ripples */}
            <g className={animate ? "anim-ripple" : ""}>
              <ellipse cx="50" cy="74" rx="26" ry="9" fill="none" stroke="#e0f2fe" strokeWidth="1.5" opacity="0.8" />
              <ellipse cx="50" cy="74" rx="14" ry="5" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />
            </g>

            {/* Crystalline Geyser / Floating Crystal Pillar */}
            <g className={animate ? "anim-breathe origin-bottom" : ""}>
              <polygon points="50,18 42,62 58,62" fill="#7dd3fc" stroke="#38bdf8" strokeWidth="1" opacity="0.85" />
              <polygon points="50,18 47,62 53,62" fill="#ffffff" opacity="0.9" />
            </g>

            {/* Levitating Aqua Water Drops & Shimmering Mist */}
            <g className={animate ? "anim-spore-float" : ""}>
              <circle cx="50" cy="14" r="3.5" fill="#38bdf8" />
              <circle cx="50" cy="14" r="1.5" fill="#ffffff" />
              <circle cx="36" cy="30" r="2.2" fill="#7dd3fc" />
              <circle cx="64" cy="28" r="2.2" fill="#7dd3fc" />
              <circle cx="44" cy="22" r="1.5" fill="#e0f2fe" />
              <circle cx="56" cy="22" r="1.5" fill="#e0f2fe" />
            </g>

            {/* Floating Water Lily & Pink Lotus Flower */}
            <ellipse cx="28" cy="75" rx="6" ry="3" fill="#15803d" />
            <circle cx="28" cy="73" r="3.5" fill="#f43f5e" />
            <circle cx="28" cy="73" r="1.5" fill="#fef08a" />
          </svg>
        </div>
      );

    // =============================================================
    // ⛰️ BIOMA 3: MONTAÑAS (MOUNTAIN)
    // =============================================================
    // 1. Leopardo de las Nieves (Snow Leopard - Panthera uncia)
    case 'mountain_cat':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <radialGradient id="sn_fur" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="60%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#64748b" />
              </radialGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Extra-long Thick Bushy Snow Leopard Tail with Rosettes */}
              <g className={animate ? "anim-tail origin-[74px_62px]" : ""}>
                <path d="M 68 62 C 86 58, 96 72, 92 86 C 88 94, 76 94, 70 86 C 66 80, 68 70, 72 64" stroke="#94a3b8" strokeWidth="8" fill="none" strokeLinecap="round" />
                <circle cx="86" cy="74" r="2" fill="#334155" />
                <circle cx="90" cy="84" r="2.2" fill="#334155" />
                <circle cx="78" cy="90" r="2.5" fill="#1e293b" />
                <circle cx="86" cy="74" r="1" fill="#cbd5e1" />
                <circle cx="90" cy="84" r="1" fill="#cbd5e1" />
              </g>

              {/* Muscular Low-slung Mountain Body */}
              <path d="M 28 66 C 24 50, 42 42, 64 46 C 76 48, 78 66, 74 76 C 68 82, 34 82, 28 66 Z" fill="url(#sn_fur)" />
              {/* Frost White Chest Ruff */}
              <path d="M 30 56 C 36 46, 50 48, 54 58 C 46 70, 34 70, 30 56 Z" fill="#ffffff" />
              
              {/* Smoky Charcoal Rosettes on Flank */}
              <ellipse cx="58" cy="56" rx="3.5" ry="2.5" fill="none" stroke="#334155" strokeWidth="1.5" />
              <ellipse cx="68" cy="62" rx="3" ry="2" fill="none" stroke="#334155" strokeWidth="1.5" />
              <ellipse cx="50" cy="66" rx="3.2" ry="2" fill="none" stroke="#334155" strokeWidth="1.5" />

              {/* Broad Rounded Mountain Feline Head */}
              <path d="M 28 38 C 26 24, 62 24, 60 38 C 62 48, 56 54, 44 54 C 32 54, 26 48, 28 38 Z" fill="url(#sn_fur)" />

              {/* Short Rounded Ears with Dark Rims (Heat conservation) */}
              <g className={animate ? "anim-ear-l origin-[30px_28px]" : ""}>
                <path d="M 32 30 C 26 22, 28 16, 36 24 Z" fill="#1e293b" />
                <circle cx="33" cy="24" r="3.5" fill="#f8fafc" />
              </g>
              <g className={animate ? "anim-ear-r origin-[58px_28px]" : ""}>
                <path d="M 56 30 C 62 22, 60 16, 52 24 Z" fill="#1e293b" />
                <circle cx="55" cy="24" r="3.5" fill="#f8fafc" />
              </g>

              {/* Piercing Icy-Blue Mountain Eyes with blink */}
              <g className={animate ? "anim-blink origin-[44px_38px]" : ""}>
                <circle cx="36" cy="38" r="3.6" fill="#38bdf8" />
                <circle cx="36" cy="38" r="1.8" fill="#0f172a" />
                <circle cx="35" cy="36.5" r="1" fill="#ffffff" />

                <circle cx="52" cy="38" r="3.6" fill="#38bdf8" />
                <circle cx="52" cy="38" r="1.8" fill="#0f172a" />
                <circle cx="51" cy="36.5" r="1" fill="#ffffff" />
              </g>

              {/* Soft Pink Nose & Wide Furry Muzzle */}
              <ellipse cx="44" cy="46" rx="6" ry="4" fill="#ffffff" />
              <polygon points="44,45 41.5,43 46.5,43" fill="#f43f5e" />
              <path d="M 44 45 L 44 47 M 42 47 Q 44 48.5 46 47" stroke="#334155" strokeWidth="0.8" fill="none" />
              
              {/* Whiskers */}
              <line x1="38" y1="46" x2="22" y2="44" stroke="#ffffff" strokeWidth="0.9" opacity="0.9" />
              <line x1="38" y1="48" x2="24" y2="50" stroke="#ffffff" strokeWidth="0.9" opacity="0.9" />
              <line x1="50" y1="46" x2="66" y2="44" stroke="#ffffff" strokeWidth="0.9" opacity="0.9" />
              <line x1="50" y1="48" x2="64" y2="50" stroke="#ffffff" strokeWidth="0.9" opacity="0.9" />

              {/* Wide Fur-Padded Snowshoe Paws */}
              <ellipse cx="32" cy="78" rx="6" ry="4" fill="#ffffff" />
              <ellipse cx="46" cy="79" rx="6" ry="4" fill="#ffffff" />
              <ellipse cx="66" cy="77" rx="6" ry="4" fill="#cbd5e1" />
            </g>
          </svg>
        </div>
      );

    // 2. Cabra Montés Alpina (Alpine Ibex - Capra ibex)
    case 'mountain_goat':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="ibex_coat" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="horn_grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="50%" stopColor="#451a03" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Rocky Mountain Ledge Base */}
              <polygon points="12,88 88,88 84,78 18,78" fill="#334155" stroke="#1e293b" strokeWidth="1" />

              {/* Magnificent Backward-Sweeping Ridged Ibex Horns */}
              <g className={animate ? "anim-canopy origin-bottom" : ""}>
                {/* Left Horn */}
                <path d="M 44 26 C 36 10, 22 2, 12 12 C 16 2, 32 6, 42 22 Z" fill="url(#horn_grad)" stroke="#334155" strokeWidth="1" />
                {/* Ridges on Horn */}
                <line x1="38" y1="20" x2="42" y2="16" stroke="#fde047" strokeWidth="1.2" opacity="0.8" />
                <line x1="32" y1="14" x2="36" y2="10" stroke="#fde047" strokeWidth="1.2" opacity="0.8" />
                <line x1="24" y1="10" x2="28" y2="6" stroke="#fde047" strokeWidth="1.2" opacity="0.8" />
                <line x1="16" y1="10" x2="19" y2="6" stroke="#fde047" strokeWidth="1.2" opacity="0.8" />

                {/* Right Horn */}
                <path d="M 56 26 C 64 10, 78 2, 88 12 C 84 2, 68 6, 58 22 Z" fill="url(#horn_grad)" stroke="#334155" strokeWidth="1" />
                <line x1="62" y1="20" x2="58" y2="16" stroke="#fde047" strokeWidth="1.2" opacity="0.8" />
                <line x1="68" y1="14" x2="64" y2="10" stroke="#fde047" strokeWidth="1.2" opacity="0.8" />
                <line x1="76" y1="10" x2="72" y2="6" stroke="#fde047" strokeWidth="1.2" opacity="0.8" />
                <line x1="84" y1="10" x2="81" y2="6" stroke="#fde047" strokeWidth="1.2" opacity="0.8" />
              </g>

              {/* Stocky Agile Mountain Body */}
              <path d="M 28 64 C 22 50, 42 42, 64 46 C 76 50, 80 66, 74 76 C 66 82, 34 82, 28 64 Z" fill="url(#ibex_coat)" />
              {/* White Belly & Flank */}
              <path d="M 32 60 C 38 52, 54 52, 58 60 C 52 70, 38 70, 32 60 Z" fill="#ffffff" opacity="0.9" />

              {/* Ibex Head & Alert Ears */}
              <path d="M 38 34 C 36 24, 64 24, 62 34 C 64 46, 56 52, 50 54 C 44 52, 36 46, 38 34 Z" fill="#e2e8f0" />
              
              {/* Characteristic Chin Goatee Beard */}
              <path d="M 48 54 L 50 62 L 52 54 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />

              {/* Horizontal-slit Golden Goat Eyes with blink */}
              <g className={animate ? "anim-blink origin-[50px_36px]" : ""}>
                <ellipse cx="43" cy="36" rx="2.8" ry="2.2" fill="#facc15" />
                <line x1="41" y1="36" x2="45" y2="36" stroke="#0f172a" strokeWidth="1.5" />

                <ellipse cx="57" cy="36" rx="2.8" ry="2.2" fill="#facc15" />
                <line x1="55" y1="36" x2="59" y2="36" stroke="#0f172a" strokeWidth="1.5" />
              </g>

              {/* Dark Snout */}
              <ellipse cx="50" cy="48" rx="4" ry="3" fill="#475569" />
              <circle cx="48.5" cy="48" r="0.8" fill="#0f172a" />
              <circle cx="51.5" cy="48" r="0.8" fill="#0f172a" />

              {/* Powerful Legs & Split Gripping Hooves */}
              <path d="M 32 68 L 30 84 M 42 68 L 40 84" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 62 70 L 60 84 M 70 68 L 72 84" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
              <rect x="28" y="83" width="4" height="4" rx="1" fill="#0f172a" />
              <rect x="38" y="83" width="4" height="4" rx="1" fill="#0f172a" />
              <rect x="58" y="83" width="4" height="4" rx="1" fill="#0f172a" />
              <rect x="70" y="83" width="4" height="4" rx="1" fill="#0f172a" />
            </g>
          </svg>
        </div>
      );

    // 3. Águila Real (Golden Eagle - Aquila chrysaetos)
    case 'mountain_eagle':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="eagle_feather" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="60%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>
            </defs>
            <g className={animate ? "anim-wing-soar" : ""}>
              {/* Left Soaring Wing with Flight Primaries */}
              <g className={animate ? "anim-wing-l" : ""}>
                <path d="M 44 48 C 30 30, 14 18, 4 28 C 12 40, 24 54, 42 58 Z" fill="url(#eagle_feather)" />
                {/* Feather Separations */}
                <path d="M 4 28 L 8 20 M 8 22 L 14 18 M 14 18 L 22 16" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* Right Soaring Wing with Flight Primaries */}
              <g className={animate ? "anim-wing-r" : ""}>
                <path d="M 56 48 C 70 30, 86 18, 96 28 C 88 40, 76 54, 58 58 Z" fill="url(#eagle_feather)" />
                <path d="M 96 28 L 92 20 M 92 22 L 86 18 M 86 18 L 78 16" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* Fan-spread Tail Feathers with Gold Band */}
              <polygon points="42,66 58,66 50,88" fill="#451a03" />
              <path d="M 44 76 Q 50 78 56 76" stroke="#d97706" strokeWidth="2.5" fill="none" />

              {/* Muscular Torso */}
              <ellipse cx="50" cy="54" rx="14" ry="18" fill="url(#eagle_feather)" />

              {/* Golden Nape Hackles & Raptor Head */}
              <g className={animate ? "anim-breathe" : ""}>
                <circle cx="50" cy="34" r="11" fill="#78350f" />
                {/* Shimmering Golden Nape Feathers */}
                <path d="M 42 26 Q 50 18 58 26 L 56 34 L 44 34 Z" fill="#f59e0b" />

                {/* Sharp Hooked Raptor Beak */}
                <path d="M 50 34 L 64 36 C 64 42, 56 44, 52 42 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
                <path d="M 64 36 C 66 40, 62 44, 58 44" stroke="#ca8a04" strokeWidth="1.2" fill="none" />

                {/* Fierce Golden Raptor Eye with blink */}
                <g className={animate ? "anim-blink origin-[46px_32px]" : ""}>
                  <circle cx="46" cy="32" r="2.8" fill="#facc15" />
                  <circle cx="46" cy="32" r="1.4" fill="#0f172a" />
                  <circle cx="45" cy="31" r="0.6" fill="#ffffff" />
                  <line x1="43" y1="29" x2="49" y2="30" stroke="#451a03" strokeWidth="1.2" />
                </g>
              </g>

              {/* Powerful Yellow Talons Gripping Air */}
              <path d="M 44 68 L 42 78 M 46 68 L 46 78 M 54 68 L 54 78 M 56 68 L 58 78" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      );

    // 4. Oso Pardo Guardián (Grizzly Bear - Ursus arctos)
    case 'mountain_bear':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            <defs>
              <radialGradient id="grizz_coat" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="70%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#451a03" />
              </radialGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Massive Shoulders & Muscular Hump */}
              <path d="M 22 72 C 16 54, 28 40, 48 38 C 58 38, 78 46, 82 60 C 86 74, 76 84, 52 86 C 34 86, 24 82, 22 72 Z" fill="url(#grizz_coat)" />
              
              {/* Grizzled Fur Texture Highlights */}
              <path d="M 32 50 Q 42 46 54 48 M 60 52 Q 68 54 74 62" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" fill="none" />

              {/* Broad Powerful Head with rounded furry ears */}
              <g className={animate ? "anim-canopy origin-[50px_42px]" : ""}>
                {/* Rounded Ears */}
                <circle cx="34" cy="24" r="7" fill="#451a03" />
                <circle cx="34" cy="24" r="4.5" fill="#92400e" />
                <circle cx="66" cy="24" r="7" fill="#451a03" />
                <circle cx="66" cy="24" r="4.5" fill="#92400e" />

                {/* Massive Skull */}
                <circle cx="50" cy="38" r="20" fill="url(#grizz_coat)" />

                {/* Light Tawny Muzzle Snout */}
                <ellipse cx="50" cy="45" rx="10" ry="8" fill="#d97706" />
                {/* Moist Black Nose */}
                <ellipse cx="50" cy="42" rx="4.5" ry="3.2" fill="#0f172a" />
                <ellipse cx="48.5" cy="41" rx="1.2" ry="0.8" fill="#64748b" />
                <path d="M 50 45 L 50 48 M 47 48 Q 50 50 53 48" stroke="#451a03" strokeWidth="1.2" fill="none" />

                {/* Deep Intelligent Dark Eyes with catchlight and blink */}
                <g className={animate ? "anim-blink origin-[50px_35px]" : ""}>
                  <circle cx="42" cy="35" r="2.8" fill="#0f172a" />
                  <circle cx="41.5" cy="34" r="0.8" fill="#ffffff" />
                  <circle cx="58" cy="35" r="2.8" fill="#0f172a" />
                  <circle cx="57.5" cy="34" r="0.8" fill="#ffffff" />
                </g>
              </g>

              {/* Heavy Forepaws with Ivory Digging Claws */}
              <ellipse cx="32" cy="80" rx="8" ry="5.5" fill="#451a03" />
              <ellipse cx="68" cy="80" rx="8" ry="5.5" fill="#451a03" />
              {/* Claws */}
              <path d="M 26 83 L 24 88 M 30 84 L 29 89 M 35 84 L 35 89 M 39 83 L 41 88" stroke="#f1f5f9" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 61 83 L 59 88 M 65 84 L 65 89 M 70 84 L 71 89 M 75 83 L 77 88" stroke="#f1f5f9" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      );

    // 5. Llama Andina (Andean Llama - Lama glama)
    case 'mountain_llama':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <radialGradient id="llama_wool" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="80%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </radialGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Long Graceful Neck & Fluffy Head */}
              <g className={animate ? "anim-canopy origin-bottom" : ""}>
                <path d="M 52 56 L 56 22 L 68 22 L 64 56 Z" fill="url(#llama_wool)" stroke="#cbd5e1" strokeWidth="1" />
                
                {/* Banana-shaped Tall Ears */}
                <g className={animate ? "anim-ear-l origin-[54px_16px]" : ""}>
                  <path d="M 56 16 C 54 4, 48 2, 50 12 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.8" />
                  <path d="M 55 14 C 53 6, 50 5, 51 12 Z" fill="#fda4af" />
                </g>
                <g className={animate ? "anim-ear-r origin-[66px_16px]" : ""}>
                  <path d="M 64 16 C 66 4, 72 2, 70 12 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.8" />
                  <path d="M 65 14 C 67 6, 70 5, 69 12 Z" fill="#fda4af" />
                </g>

                {/* Sweet Head & Snout */}
                <circle cx="62" cy="18" r="9" fill="url(#llama_wool)" />
                <ellipse cx="68" cy="21" rx="4" ry="3" fill="#cbd5e1" />
                <polygon points="70,20 68,19 72,19" fill="#0f172a" />

                {/* Big Doe Eyes with Long Eyelashes & Blink */}
                <g className={animate ? "anim-blink origin-[60px_17px]" : ""}>
                  <circle cx="60" cy="17" r="2.5" fill="#0f172a" />
                  <circle cx="59.5" cy="16" r="0.8" fill="#ffffff" />
                  <line x1="57" y1="14" x2="62" y2="15" stroke="#0f172a" strokeWidth="1" strokeLinecap="round" />
                </g>

                {/* Colorful Andean Bridle & Pom-poms */}
                <line x1="56" y1="20" x2="68" y2="20" stroke="#f43f5e" strokeWidth="1.5" />
                <circle cx="56" cy="22" r="1.8" fill="#facc15" />
                <circle cx="58" cy="24" r="1.8" fill="#38bdf8" />
                <circle cx="60" cy="26" r="1.8" fill="#10b981" />
              </g>

              {/* Fluffy Cloud-like Wool Body */}
              <ellipse cx="44" cy="62" rx="24" ry="18" fill="url(#llama_wool)" stroke="#cbd5e1" strokeWidth="1" />

              {/* Traditional Woven Andean Blanket (Aguayo) */}
              <path d="M 32 50 L 56 50 L 58 66 L 30 66 Z" fill="#f43f5e" stroke="#e11d48" strokeWidth="1" />
              <line x1="31" y1="55" x2="57" y2="55" stroke="#facc15" strokeWidth="2" />
              <line x1="31" y1="60" x2="57" y2="60" stroke="#0284c7" strokeWidth="2" />
              {/* Swinging Tassels */}
              <g className={animate ? "anim-canopy origin-top" : ""}>
                <circle cx="34" cy="68" r="1.5" fill="#facc15" />
                <circle cx="40" cy="68" r="1.5" fill="#38bdf8" />
                <circle cx="46" cy="68" r="1.5" fill="#10b981" />
                <circle cx="52" cy="68" r="1.5" fill="#facc15" />
              </g>

              {/* Slender Agile Legs */}
              <path d="M 28 72 L 26 88 M 36 72 L 34 88" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 52 72 L 50 88 M 60 72 L 58 88" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
              <ellipse cx="26" cy="88" rx="2.5" ry="1.5" fill="#475569" />
              <ellipse cx="34" cy="88" rx="2.5" ry="1.5" fill="#475569" />
              <ellipse cx="50" cy="88" rx="2.5" ry="1.5" fill="#334155" />
              <ellipse cx="58" cy="88" rx="2.5" ry="1.5" fill="#334155" />

              {/* Short Woolly Tail */}
              <ellipse cx="20" cy="60" rx="3" ry="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" transform="rotate(-30 20 60)" />
            </g>
          </svg>
        </div>
      );

    // 6. Lobo de Cumbre (Alpine Timber Wolf - Canis lupus)
    case 'mountain_wolf':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="wolf_fur" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="50%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Thick Bushy Silver Tail */}
              <g className={animate ? "anim-tail origin-[72px_65px]" : ""}>
                <path d="M 70 64 C 86 60, 94 72, 90 86 C 86 92, 78 92, 74 84 Z" fill="#475569" />
                <path d="M 88 84 C 86 89, 80 91, 75 85" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
              </g>

              {/* Muscular Sentinel Body */}
              <path d="M 28 66 C 24 50, 42 42, 64 46 C 76 48, 78 65, 72 75 C 64 82, 34 82, 28 66 Z" fill="url(#wolf_fur)" />
              {/* Frost White Chest Ruff */}
              <path d="M 30 54 C 36 44, 48 46, 52 56 C 44 68, 34 68, 30 54 Z" fill="#ffffff" />

              {/* Sharp Alert Triangular Ears */}
              <g className={animate ? "anim-ear-l origin-[34px_22px]" : ""}>
                <path d="M 34 26 L 26 8 C 32 10, 40 18, 40 28 Z" fill="#1e293b" />
                <path d="M 33 24 L 28 12 C 32 14, 37 20, 37 26 Z" fill="#cbd5e1" />
              </g>
              <g className={animate ? "anim-ear-r origin-[54px_22px]" : ""}>
                <path d="M 52 28 L 58 8 C 64 10, 60 20, 58 26 Z" fill="#1e293b" />
                <path d="M 54 26 L 57 12 C 60 14, 58 20, 56 24 Z" fill="#cbd5e1" />
              </g>

              {/* Proud Wolf Head & Strong Snout */}
              <path d="M 32 36 C 28 26, 56 24, 54 34 C 56 44, 50 48, 40 48 C 30 46, 32 40, 32 36 Z" fill="#475569" />
              <path d="M 30 40 L 16 46 C 18 50, 26 52, 34 48 Z" fill="#f8fafc" />
              <ellipse cx="16" cy="46" rx="2.2" ry="1.8" fill="#0f172a" />

              {/* Piercing Amber Eyes with Blink */}
              <g className={animate ? "anim-blink origin-[38px_34px]" : ""}>
                <circle cx="36" cy="34" r="2.8" fill="#facc15" />
                <circle cx="36" cy="34" r="1.4" fill="#0f172a" />
                <circle cx="35" cy="33" r="0.8" fill="#ffffff" />
              </g>

              {/* Frost Breath Vapor Rising in Cold Mountain Air */}
              <g className={animate ? "anim-spore-float origin-[14px_46px]" : ""}>
                <circle cx="12" cy="44" r="2" fill="#e0f2fe" opacity="0.6" />
                <circle cx="8" cy="40" r="3" fill="#f0f9ff" opacity="0.4" />
              </g>

              {/* Strong Mountain Paws */}
              <path d="M 30 68 L 28 85 M 40 68 L 38 86" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
              <path d="M 60 70 L 62 86 M 70 68 L 74 85" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="28" cy="86" rx="3.5" ry="2" fill="#1e293b" />
              <ellipse cx="38" cy="87" rx="3.5" ry="2" fill="#1e293b" />
              <ellipse cx="62" cy="87" rx="3.5" ry="2" fill="#0f172a" />
              <ellipse cx="74" cy="86" rx="3.5" ry="2" fill="#0f172a" />
            </g>
          </svg>
        </div>
      );

    // 7. Cóndor Andino (Andean Condor - Vultur gryphus)
    case 'mountain_condor':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="condor_black" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="60%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>
            <g className={animate ? "anim-wing-soar" : ""}>
              {/* Massive Soaring Wings with White Wing Bars */}
              <g className={animate ? "anim-wing-l" : ""}>
                <path d="M 44 46 C 26 24, 10 16, 2 24 C 10 38, 22 52, 42 56 Z" fill="url(#condor_black)" />
                {/* Snowy White Upper-Wing Patch */}
                <path d="M 18 24 Q 28 32 38 34" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" />
                {/* Primary Wingtips */}
                <path d="M 2 24 L 6 16 M 6 18 L 12 14 M 12 14 L 18 12" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
              </g>

              <g className={animate ? "anim-wing-r" : ""}>
                <path d="M 56 46 C 74 24, 90 16, 98 24 C 90 38, 78 52, 58 56 Z" fill="url(#condor_black)" />
                <path d="M 82 24 Q 72 32 62 34" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 98 24 L 94 16 M 94 18 L 88 14 M 88 14 L 82 12" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
              </g>

              {/* Fan Tail */}
              <polygon points="44,64 56,64 50,86" fill="#0f172a" />

              {/* Heavy Body */}
              <ellipse cx="50" cy="52" rx="13" ry="16" fill="url(#condor_black)" />

              {/* Pure White Downy Neck Ruff Collar */}
              <ellipse cx="50" cy="34" rx="9" ry="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

              {/* Bare Reddish-Caruncled Condor Head */}
              <g className={animate ? "anim-breathe" : ""}>
                <circle cx="50" cy="24" r="8" fill="#e11d48" />
                {/* Fleshy Comb Crest (Caruncle) */}
                <path d="M 46 16 Q 50 12 54 18 Z" fill="#9f1239" />

                {/* Strong Ivory Hooked Bill */}
                <path d="M 50 24 L 62 26 C 62 30, 56 32, 52 30 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
                <path d="M 62 26 C 64 29, 60 32, 58 32" stroke="#ca8a04" strokeWidth="1.2" fill="none" />

                {/* Piercing Red Raptor Eye with blink */}
                <g className={animate ? "anim-blink origin-[47px_23px]" : ""}>
                  <circle cx="47" cy="23" r="2.2" fill="#ffffff" />
                  <circle cx="47" cy="23" r="1.2" fill="#0f172a" />
                </g>
              </g>
            </g>
          </svg>
        </div>
      );

    // 8. Alpinista Sustentable (Sustainable Mountaineer)
    case 'mountain_climber':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="climber_jacket" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#c2410c" />
              </linearGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Technical Climbing Ice Axe (Piolet) */}
              <g className={animate ? "anim-canopy origin-[70px_50px]" : ""}>
                <line x1="68" y1="28" x2="78" y2="88" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
                <path d="M 62 30 L 74 26 L 76 34 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                <polygon points="62,30 58,34 64,34" fill="#0284c7" />
              </g>

              {/* Insulated Alpine Parka Body with Harness */}
              <path d="M 32 44 L 68 44 L 72 74 L 28 74 Z" fill="url(#climber_jacket)" />
              {/* Safety Harness Straps */}
              <line x1="32" y1="58" x2="68" y2="58" stroke="#18181b" strokeWidth="2.5" />
              <line x1="42" y1="44" x2="42" y2="74" stroke="#18181b" strokeWidth="2" />
              <line x1="58" y1="44" x2="58" y2="74" stroke="#18181b" strokeWidth="2" />
              {/* Carabiner */}
              <circle cx="50" cy="58" r="3" fill="none" stroke="#facc15" strokeWidth="1.5" />

              {/* Coiled Dynamic Climbing Rope across chest */}
              <path d="M 36 46 Q 50 60 64 46" stroke="#3b82f6" strokeWidth="3.5" fill="none" strokeLinecap="round" />

              {/* Hooded Head & Mirrored Polarized Goggles */}
              <ellipse cx="50" cy="28" rx="14" ry="13" fill="#ea580c" />
              <ellipse cx="50" cy="28" rx="9" ry="8" fill="#fed7aa" />
              {/* Polarized UV Goggles with Glint */}
              <rect x="40" y="24" width="20" height="7" rx="3" fill="#0284c7" stroke="#0f172a" strokeWidth="1.2" />
              <line x1="43" y1="25" x2="57" y2="29" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
              {/* Balaclava / Face Mask */}
              <path d="M 42 30 C 42 36, 58 36, 58 30 Z" fill="#334155" />

              {/* Reinforced Alpine Mountaineering Boots & Crampons */}
              <rect x="36" y="74" width="9" height="16" rx="2" fill="#1e293b" />
              <rect x="55" y="74" width="9" height="16" rx="2" fill="#1e293b" />
              <line x1="34" y1="90" x2="47" y2="90" stroke="#94a3b8" strokeWidth="2" />
              <line x1="53" y1="90" x2="66" y2="90" stroke="#94a3b8" strokeWidth="2" />
            </g>
          </svg>
        </div>
      );

    // 9. Sabio de la Cumbre (Summit Sage / Himalayan Monk)
    case 'mountain_monk':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            <defs>
              <radialGradient id="monk_aura" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ea580c" />
              </radialGradient>
            </defs>
            {/* Meditative Levitation Aura */}
            <circle cx="50" cy="50" r="38" fill="url(#monk_aura)" opacity="0.25" className={animate ? "anim-glint" : ""} />

            {/* Levitation Motion */}
            <g className={animate ? "anim-float" : ""}>
              {/* Saffron & Deep Maroon Robes in Lotus Pose */}
              <path d="M 28 68 C 24 60, 36 44, 50 44 C 64 44, 76 60, 72 68 C 70 82, 30 82, 28 68 Z" fill="#991b1b" />
              {/* Saffron Golden Sash over shoulder */}
              <path d="M 38 44 C 44 48, 54 60, 58 78 L 48 78 C 44 64, 38 52, 38 44 Z" fill="#f59e0b" />

              {/* Folded Legs in Padmasana (Lotus) */}
              <ellipse cx="50" cy="78" rx="26" ry="9" fill="#7f1d1d" />
              <ellipse cx="32" cy="78" rx="5" ry="3.5" fill="#fde68a" />
              <ellipse cx="68" cy="78" rx="5" ry="3.5" fill="#fde68a" />

              {/* Serene Head & Wisdom Third Eye */}
              <ellipse cx="50" cy="30" rx="11" ry="12" fill="#fed7aa" />
              <circle cx="50" cy="24" r="1.5" fill="#e11d48" /> {/* Bindi / Urna mark */}

              {/* Calm Closed Meditative Eyes & Gentle Smile */}
              <path d="M 44 30 Q 47 33 50 30" stroke="#78350f" strokeWidth="1.2" fill="none" />
              <path d="M 50 30 Q 53 33 56 30" stroke="#78350f" strokeWidth="1.2" fill="none" />
              <path d="M 47 36 Q 50 38 53 36" stroke="#991b1b" strokeWidth="1.2" fill="none" />

              {/* Floating Tibetan Singing Bowl / Prayer Beads */}
              <g className={animate ? "anim-flame-1 origin-[50px_60px]" : ""}>
                <ellipse cx="50" cy="60" rx="7" ry="4.5" fill="#ca8a04" stroke="#facc15" strokeWidth="1.2" />
                <circle cx="50" cy="58" r="2.5" fill="#38bdf8" />
              </g>
            </g>
          </svg>
        </div>
      );

    // 10. Refugio Térmico de Altura (Alpine Thermal Chalet)
    case 'mountain_refuge':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            {/* Fieldstone Foundation */}
            <rect x="22" y="74" width="56" height="14" rx="2" fill="#475569" stroke="#334155" strokeWidth="1.5" />
            
            {/* Natural Alpine Timber Walls */}
            <rect x="26" y="48" width="48" height="28" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
            <line x1="26" y1="56" x2="74" y2="56" stroke="#451a03" strokeWidth="1" />
            <line x1="26" y1="64" x2="74" y2="64" stroke="#451a03" strokeWidth="1" />

            {/* Fieldstone Chimney with Rising Hearth Smoke */}
            <path d="M 64 24 L 72 24 L 74 46 L 62 46 Z" fill="#64748b" stroke="#334155" strokeWidth="1" />
            <g className={animate ? "anim-smoke-rise origin-[68px_22px]" : ""}>
              <circle cx="68" cy="18" r="4" fill="#cbd5e1" opacity="0.65" />
              <circle cx="72" cy="11" r="5.5" fill="#e2e8f0" opacity="0.45" />
              <circle cx="69" cy="4" r="7" fill="#f8fafc" opacity="0.3" />
            </g>

            {/* Steep Snow-Capped A-Frame Roof */}
            <polygon points="50,14 12,50 88,50" fill="#334155" stroke="#1e293b" strokeWidth="2" />
            {/* Pillow Soft Snow Blanket on Roof */}
            <path d="M 50 14 C 40 24, 24 38, 10 50 C 14 53, 20 48, 26 51 C 34 47, 42 51, 50 48 C 58 51, 66 47, 74 51 C 80 48, 86 53, 90 50 C 76 38, 60 24, 50 14 Z" fill="#f8fafc" />

            {/* Multi-pane Windows with Warm Glowing Amber Hearthlight */}
            <g className={animate ? "anim-flame-1" : ""}>
              <rect x="32" y="54" width="10" height="12" rx="1.5" fill="#fef08a" stroke="#451a03" strokeWidth="1.2" />
              <line x1="37" y1="54" x2="37" y2="66" stroke="#451a03" strokeWidth="1" />
              <line x1="32" y1="60" x2="42" y2="60" stroke="#451a03" strokeWidth="1" />

              <rect x="58" y="54" width="10" height="12" rx="1.5" fill="#fef08a" stroke="#451a03" strokeWidth="1.2" />
              <line x1="63" y1="54" x2="63" y2="66" stroke="#451a03" strokeWidth="1" />
              <line x1="58" y1="60" x2="68" y2="60" stroke="#451a03" strokeWidth="1" />
            </g>

            {/* Heavy Insulated Wooden Door */}
            <rect x="45" y="58" width="10" height="20" rx="1" fill="#451a03" />
            <circle cx="52" cy="68" r="1" fill="#facc15" />

            {/* Skis Leaning on Porch */}
            <line x1="22" y1="60" x2="26" y2="86" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
            <line x1="25" y1="60" x2="29" y2="86" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    // 11. Aerogenerador de Viento Fuerte (Mountain Gale Wind Turbine)
    case 'mountain_wind_turbine':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            {/* High Altitude Aerodynamic Steel Tower */}
            <polygon points="50,26 44,90 56,90" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
            <line x1="47" y1="58" x2="53" y2="58" stroke="#94a3b8" strokeWidth="1" />
            <line x1="45" y1="76" x2="55" y2="76" stroke="#94a3b8" strokeWidth="1" />

            {/* Heavy Reinforced Concrete Base on Mountain Crag */}
            <rect x="38" y="88" width="24" height="6" rx="1.5" fill="#475569" stroke="#1e293b" strokeWidth="1" />

            {/* Aviation Safety Red Strobe Beacon */}
            <circle cx="50" cy="22" r="2.2" fill="#ef4444" className="animate-ping" />
            <circle cx="50" cy="22" r="1.5" fill="#f87171" />

            {/* Continuous High-Speed 3-Blade Rotor */}
            <g className={animate ? "anim-turbine" : ""} style={{ transformOrigin: '50px 26px' }}>
              {/* Rotor Hub */}
              <circle cx="50" cy="26" r="4.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              
              {/* 3 Aerodynamic Carbon Blades */}
              {/* Blade 1 (Top) */}
              <path d="M 50 26 C 48 16, 49 6, 50 0 C 51 6, 52 16, 50 26 Z" fill="#38bdf8" />
              {/* Blade 2 (Bottom-Right 120deg) */}
              <path d="M 50 26 C 58 32, 68 39, 72 44 C 66 42, 57 36, 50 26 Z" fill="#0284c7" />
              {/* Blade 3 (Bottom-Left 240deg) */}
              <path d="M 50 26 C 42 32, 32 39, 28 44 C 34 42, 43 36, 50 26 Z" fill="#0284c7" />
            </g>
          </svg>
        </div>
      );

    // 12. Geoda de Cuarzo Puro (Pure Alpine Quartz Geode)
    case 'mountain_crystal':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            <defs>
              <linearGradient id="q_facet1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#7dd3fc" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="q_facet2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="60%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
            </defs>
            {/* Dark Granite Geode Matrix Outer Crust */}
            <path d="M 16 78 C 12 56, 26 34, 50 30 C 74 34, 88 56, 84 78 C 76 88, 24 88, 16 78 Z" fill="#334155" stroke="#1e293b" strokeWidth="2" />
            
            {/* Clustered Prismatic Quartz Pillars with Glint */}
            <g className={animate ? "anim-glint" : ""}>
              {/* Center Tall Pillar */}
              <polygon points="50,14 62,38 50,76 38,38" fill="url(#q_facet1)" stroke="#e0f2fe" strokeWidth="1" />
              <polygon points="50,14 50,76 38,38" fill="url(#q_facet2)" />

              {/* Left Secondary Crystal Pillar */}
              <polygon points="34,26 44,46 36,76 26,46" fill="url(#q_facet1)" stroke="#e0f2fe" strokeWidth="0.8" />
              <polygon points="34,26 36,76 26,46" fill="#0284c7" />

              {/* Right Secondary Crystal Pillar */}
              <polygon points="66,26 74,46 64,76 56,46" fill="url(#q_facet2)" stroke="#e0f2fe" strokeWidth="0.8" />
              <polygon points="66,26 64,76 56,46" fill="url(#q_facet1)" />
            </g>

            {/* Specular Glint Crosses & Floating Light Spores */}
            <g className={animate ? "anim-spore-float" : ""}>
              <polygon points="50,14 52,18 56,20 52,22 50,26 48,22 44,20 48,18" fill="#ffffff" />
              <circle cx="34" cy="26" r="2.5" fill="#ffffff" />
              <circle cx="66" cy="26" r="2.5" fill="#ffffff" />
              <circle cx="50" cy="46" r="1.8" fill="#ffffff" />
              <circle cx="40" cy="36" r="1.2" fill="#7dd3fc" />
              <circle cx="60" cy="38" r="1.2" fill="#7dd3fc" />
            </g>
          </svg>
        </div>
      );

    // 13. Pinos Nevados de Altura (Alpine Snow Pine - Pinus cembra)
    case 'mountain_pine_snow':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="pine_green" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#065f46" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
            </defs>
            {/* Trunk */}
            <rect x="46" y="74" width="8" height="18" fill="#451a03" stroke="#290f02" strokeWidth="1" />

            {/* Swaying Layered Pine Canopy */}
            <g className={animate ? "anim-canopy origin-bottom" : ""}>
              {/* Bottom Tier */}
              <polygon points="50,42 16,76 84,76" fill="url(#pine_green)" />
              {/* Bottom Tier Snow Blanket */}
              <path d="M 50 42 C 38 56, 24 66, 16 76 C 24 78, 34 72, 42 75 C 50 72, 58 76, 68 73 C 76 77, 82 74, 84 76 C 76 66, 62 56, 50 42 Z" fill="#f8fafc" />

              {/* Middle Tier */}
              <polygon points="50,26 24,56 76,56" fill="url(#pine_green)" />
              {/* Middle Tier Snow Blanket */}
              <path d="M 50 26 C 40 38, 30 46, 24 56 C 32 58, 40 53, 50 55 C 60 53, 68 58, 76 56 C 70 46, 60 38, 50 26 Z" fill="#f8fafc" />

              {/* Top Tier */}
              <polygon points="50,8 32,36 68,36" fill="url(#pine_green)" />
              {/* Top Tier Snow Cap */}
              <path d="M 50 8 C 42 18, 36 28, 32 36 C 38 38, 44 34, 50 35 C 56 34, 62 38, 68 36 C 64 28, 58 18, 50 8 Z" fill="#ffffff" />
            </g>

            {/* Drifting Floating Snowflakes */}
            <g className={animate ? "anim-spore-float" : ""}>
              <circle cx="20" cy="30" r="1.5" fill="#ffffff" />
              <circle cx="80" cy="38" r="2" fill="#ffffff" />
              <circle cx="28" cy="65" r="1.8" fill="#ffffff" />
              <circle cx="74" cy="68" r="1.5" fill="#ffffff" />
            </g>
          </svg>
        </div>
      );

    // 14. Arroyo de Deshielo Puro (Glacial Meltwater Stream)
    case 'mountain_glacier_stream':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="melt_water" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            {/* Layered Mountain Riverstones */}
            <ellipse cx="28" cy="45" rx="10" ry="7" fill="#475569" stroke="#334155" strokeWidth="1" />
            <ellipse cx="72" cy="65" rx="12" ry="8" fill="#475569" stroke="#334155" strokeWidth="1" />
            <ellipse cx="22" cy="80" rx="14" ry="9" fill="#334155" stroke="#1e293b" strokeWidth="1" />
            <ellipse cx="80" cy="35" rx="9" ry="6" fill="#64748b" />

            {/* Cascading Rushing Glacial Stream Channel */}
            <path d="M 50 10 Q 32 38 60 58 Q 36 78 50 94" stroke="url(#melt_water)" strokeWidth="16" fill="none" strokeLinecap="round" />
            {/* White Water Foam Rapids */}
            <path d="M 50 10 Q 32 38 60 58 Q 36 78 50 94" stroke="#ffffff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9" className={animate ? "anim-ripple" : ""} />
            <path d="M 48 24 Q 38 42 54 54" stroke="#e0f2fe" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Glacial Water Splashes & Droplets */}
            <g className={animate ? "anim-spore-float" : ""}>
              <circle cx="42" cy="38" r="2" fill="#7dd3fc" />
              <circle cx="58" cy="56" r="2.2" fill="#ffffff" />
              <circle cx="44" cy="74" r="2.5" fill="#38bdf8" />
              <circle cx="56" cy="88" r="1.8" fill="#e0f2fe" />
            </g>
          </svg>
        </div>
      );

    // 15. Faro Solar de las Nieves (Alpine Solar Beacon)
    case 'mountain_beacon':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            <defs>
              <radialGradient id="beacon_glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#fef08a" />
                <stop offset="80%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </radialGradient>
            </defs>
            {/* High-Tech Granite Obelisk Tower */}
            <polygon points="50,22 36,88 64,88" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            
            {/* Integrated Solar Photovoltaic Panels on Tower Face */}
            <rect x="42" y="38" width="16" height="12" rx="1" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" />
            <line x1="50" y1="38" x2="50" y2="50" stroke="#60a5fa" strokeWidth="1" />
            
            <rect x="40" y="56" width="20" height="14" rx="1" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" />
            <line x1="50" y1="56" x2="50" y2="70" stroke="#60a5fa" strokeWidth="1" />

            {/* Glowing Searchlight Beam Piercing Blizzards */}
            <g className={animate ? "anim-sun-rays" : ""} style={{ transformOrigin: '50px 20px' }}>
              <polygon points="50,20 10,0 90,0" fill="#fef08a" opacity="0.35" />
              <line x1="50" y1="20" x2="0" y2="0" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
              <line x1="50" y1="20" x2="100" y2="0" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
            </g>

            {/* Pulsing Concentrated Beacon Crystal Lens */}
            <circle cx="50" cy="20" r="10" fill="url(#beacon_glow)" className={animate ? "anim-glint" : ""} />
            <circle cx="50" cy="20" r="4" fill="#ffffff" />
          </svg>
        </div>
      );

    // 16. Dragón Guardián de los Hielos (Frost Guardian Dragon)
    case 'mountain_crystal_dragon':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            <defs>
              <linearGradient id="dragon_ice" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
              <linearGradient id="dragon_wing" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Dragon Soaring Animation */}
            <g className={animate ? "anim-float" : ""}>
              {/* Left Ice Wing */}
              <g className={animate ? "anim-wing-l" : ""}>
                <path d="M 46 44 C 24 20, 8 16, 2 24 C 12 36, 26 48, 44 54 Z" fill="url(#dragon_wing)" stroke="#38bdf8" strokeWidth="1.2" />
                <path d="M 2 24 L 20 38 M 8 16 L 24 32" stroke="#ffffff" strokeWidth="1" />
              </g>

              {/* Right Ice Wing */}
              <g className={animate ? "anim-wing-r" : ""}>
                <path d="M 54 44 C 76 20, 92 16, 98 24 C 88 36, 74 48, 56 54 Z" fill="url(#dragon_wing)" stroke="#38bdf8" strokeWidth="1.2" />
                <path d="M 98 24 L 80 38 M 92 16 L 76 32" stroke="#ffffff" strokeWidth="1" />
              </g>

              {/* Serpentine Crystalline Tail with Diamond Spines */}
              <path d="M 50 64 C 54 78, 42 88, 50 94" stroke="url(#dragon_ice)" strokeWidth="6" fill="none" strokeLinecap="round" />
              <polygon points="50,94 45,90 55,90" fill="#ffffff" />

              {/* Dragon Muscular Body with Diamond Scales */}
              <ellipse cx="50" cy="52" rx="14" ry="20" fill="url(#dragon_ice)" stroke="#7dd3fc" strokeWidth="1" />
              <polygon points="50,40 47,46 53,46" fill="#ffffff" />
              <polygon points="50,48 46,56 54,56" fill="#ffffff" />
              <polygon points="50,58 47,64 53,64" fill="#ffffff" />

              {/* Dragon Noble Head & Crystalline Horns */}
              <g className={animate ? "anim-breathe" : ""}>
                {/* Crown Horns */}
                <polygon points="46,24 38,10 46,18" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" />
                <polygon points="54,24 62,10 54,18" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" />

                {/* Head */}
                <circle cx="50" cy="30" r="11" fill="url(#dragon_ice)" />
                <polygon points="50,30 44,40 56,40" fill="#0284c7" />

                {/* Piercing Glowing Gold/Cyan Eyes with Blink */}
                <g className={animate ? "anim-blink origin-[50px_28px]" : ""}>
                  <circle cx="45" cy="28" r="2.5" fill="#facc15" />
                  <circle cx="45" cy="28" r="1.2" fill="#0f172a" />
                  <circle cx="55" cy="28" r="2.5" fill="#facc15" />
                  <circle cx="55" cy="28" r="1.2" fill="#0f172a" />
                </g>
              </g>

              {/* Floating Frost Particles & Aurora Mist */}
              <g className={animate ? "anim-spore-float" : ""}>
                <circle cx="34" cy="20" r="1.8" fill="#ffffff" />
                <circle cx="66" cy="22" r="1.8" fill="#ffffff" />
                <circle cx="28" cy="46" r="2.2" fill="#7dd3fc" />
                <circle cx="72" cy="46" r="2.2" fill="#7dd3fc" />
                <circle cx="50" cy="72" r="1.5" fill="#e0f2fe" />
              </g>
            </g>
          </svg>
        </div>
      );


    // =============================================================
    // 🏙️ BIOMA 4: CIUDAD VERDE (CITY)
    // =============================================================
    // 1. Gato Urbano Adoptado (Rescued Urban Cat)
    case 'city_cat':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="tux_coat" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Sleek Black Tail with White Tip Wagging */}
              <g className={animate ? "anim-tail origin-[72px_65px]" : ""}>
                <path d="M 68 64 C 84 60, 92 72, 88 84 C 84 92, 76 92, 72 84" stroke="#1e293b" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M 86 86 C 84 90, 78 91, 74 86" stroke="#ffffff" strokeWidth="6" fill="none" strokeLinecap="round" />
              </g>

              {/* Tuxedo Body */}
              <path d="M 28 66 C 24 50, 42 42, 64 46 C 76 48, 78 65, 74 75 C 68 82, 34 82, 28 66 Z" fill="url(#tux_coat)" />
              {/* Pure White Chest Bib ("Tuxedo Shirt") */}
              <path d="M 32 54 C 38 44, 48 46, 52 56 C 46 68, 36 68, 32 54 Z" fill="#ffffff" />

              {/* Head with Alert Ears */}
              <path d="M 28 38 C 26 24, 62 24, 60 38 C 62 48, 56 54, 44 54 C 32 54, 26 48, 28 38 Z" fill="url(#tux_coat)" />

              {/* Ears */}
              <g className={animate ? "anim-ear-l origin-[30px_28px]" : ""}>
                <polygon points="32,28 22,12 40,20" fill="#0f172a" />
                <polygon points="31,26 25,16 37,21" fill="#fda4af" />
              </g>
              <g className={animate ? "anim-ear-r origin-[58px_28px]" : ""}>
                <polygon points="56,28 66,12 48,20" fill="#0f172a" />
                <polygon points="57,26 63,16 51,21" fill="#fda4af" />
              </g>

              {/* Emerald Green Eyes with Blink */}
              <g className={animate ? "anim-blink origin-[44px_38px]" : ""}>
                <ellipse cx="36" cy="38" rx="3.8" ry="4.5" fill="#10b981" />
                <ellipse cx="36" cy="38" rx="1.2" ry="3.8" fill="#064e3b" />
                <circle cx="34.5" cy="36.5" r="1.2" fill="#ffffff" />

                <ellipse cx="52" cy="38" rx="3.8" ry="4.5" fill="#10b981" />
                <ellipse cx="52" cy="38" rx="1.2" ry="3.8" fill="#064e3b" />
                <circle cx="50.5" cy="36.5" r="1.2" fill="#ffffff" />
              </g>

              {/* White Muzzle, Pink Nose & Whiskers */}
              <ellipse cx="44" cy="46" rx="5.5" ry="3.5" fill="#ffffff" />
              <polygon points="44,45 42,43 46,43" fill="#f43f5e" />
              <path d="M 44 45 L 44 47 M 42 47 Q 44 48.5 46 47" stroke="#334155" strokeWidth="0.8" fill="none" />
              
              <line x1="38" y1="46" x2="24" y2="44" stroke="#ffffff" strokeWidth="0.8" />
              <line x1="38" y1="48" x2="25" y2="49" stroke="#ffffff" strokeWidth="0.8" />
              <line x1="50" y1="46" x2="64" y2="44" stroke="#ffffff" strokeWidth="0.8" />
              <line x1="50" y1="48" x2="63" y2="49" stroke="#ffffff" strokeWidth="0.8" />

              {/* Eco Collar with Leaf Medal */}
              <path d="M 34 52 Q 44 56 54 52" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="44" cy="56" r="2.5" fill="#facc15" />
              <circle cx="44" cy="56" r="1" fill="#15803d" />

              {/* White Paws ("Socks") */}
              <ellipse cx="32" cy="78" rx="5" ry="3.5" fill="#ffffff" />
              <ellipse cx="46" cy="79" rx="5" ry="3.5" fill="#ffffff" />
              <ellipse cx="66" cy="77" rx="5.5" ry="3.5" fill="#ffffff" />
            </g>
          </svg>
        </div>
      );

    // 2. Perro Guía Comunitario (Community Service Dog)
    case 'city_dog':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="ret_fur" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Happy Wagging Golden Tail */}
              <g className={animate ? "anim-fox-tail origin-[74px_64px]" : ""}>
                <path d="M 70 64 C 86 58, 94 70, 92 84 C 88 90, 80 92, 74 84 Z" fill="#f59e0b" />
              </g>

              {/* Golden Retriever Body */}
              <path d="M 28 66 C 24 50, 42 42, 64 46 C 76 48, 78 66, 74 76 C 66 82, 34 82, 28 66 Z" fill="url(#ret_fur)" />
              {/* Service Dog Blue/Green Eco-Vest */}
              <path d="M 40 48 L 66 50 L 64 68 L 38 66 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <line x1="40" y1="58" x2="65" y2="59" stroke="#facc15" strokeWidth="2" />
              <circle cx="52" cy="58" r="3" fill="#ffffff" />
              <path d="M 50 58 L 54 58 M 52 56 L 52 60" stroke="#0284c7" strokeWidth="1.5" />

              {/* Floppy Soft Ears with subtle sway */}
              <g className={animate ? "anim-ear-l origin-[34px_28px]" : ""}>
                <ellipse cx="28" cy="38" rx="6" ry="12" fill="#d97706" transform="rotate(-15 28 38)" />
              </g>
              <g className={animate ? "anim-ear-r origin-[58px_28px]" : ""}>
                <ellipse cx="62" cy="38" rx="6" ry="12" fill="#d97706" transform="rotate(15 62 38)" />
              </g>

              {/* Friendly Dog Head */}
              <circle cx="45" cy="36" r="16" fill="url(#ret_fur)" />
              {/* Muzzle */}
              <ellipse cx="45" cy="44" rx="7.5" ry="6" fill="#fef08a" />
              <ellipse cx="45" cy="40" rx="3.5" ry="2.5" fill="#0f172a" />
              {/* Happy Open Smile & Tongue */}
              <path d="M 41 46 Q 45 52 49 46" stroke="#78350f" strokeWidth="1.5" fill="none" />
              <path d="M 43 47 C 43 53, 47 53, 47 47 Z" fill="#f43f5e" />

              {/* Warm Intelligent Brown Eyes with blink */}
              <g className={animate ? "anim-blink origin-[45px_34px]" : ""}>
                <circle cx="38" cy="34" r="2.8" fill="#451a03" />
                <circle cx="37.5" cy="33" r="0.8" fill="#ffffff" />
                <circle cx="52" cy="34" r="2.8" fill="#451a03" />
                <circle cx="51.5" cy="33" r="0.8" fill="#ffffff" />
              </g>

              {/* Paws */}
              <ellipse cx="32" cy="78" rx="4.5" ry="3" fill="#fef08a" />
              <ellipse cx="44" cy="79" rx="4.5" ry="3" fill="#fef08a" />
              <ellipse cx="64" cy="77" rx="5" ry="3.5" fill="#d97706" />
            </g>
          </svg>
        </div>
      );

    // 3. Paloma Mensajera Ecológica (Urban Ecological Dove)
    case 'city_pigeon':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="pigeon_neck" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <g className={animate ? "anim-float" : ""}>
              {/* Fluttering Wings */}
              <g className={animate ? "anim-wing-l" : ""}>
                <path d="M 44 48 C 26 34, 12 24, 6 32 C 14 46, 26 58, 42 62 Z" fill="#94a3b8" />
                <path d="M 12 36 L 24 48 M 18 32 L 30 46" stroke="#475569" strokeWidth="1.5" />
              </g>

              {/* Body */}
              <ellipse cx="50" cy="56" rx="14" ry="16" fill="#64748b" />
              
              {/* Iridescent Neck Collar Sheen */}
              <path d="M 42 38 C 42 32, 58 32, 58 38 L 56 48 L 44 48 Z" fill="url(#pigeon_neck)" opacity="0.9" />

              {/* Dove Head */}
              <circle cx="50" cy="30" r="9" fill="#94a3b8" />

              {/* Ruby Pigeon Eye with blink */}
              <g className={animate ? "anim-blink origin-[47px_28px]" : ""}>
                <circle cx="47" cy="28" r="2.5" fill="#f97316" />
                <circle cx="47" cy="28" r="1.2" fill="#0f172a" />
                <circle cx="46.5" cy="27.5" r="0.6" fill="#ffffff" />
              </g>

              {/* Beak Holding Green Olive Branch */}
              <polygon points="50,30 62,32 52,34" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
              
              {/* Fresh Green Olive Twig */}
              <path d="M 58 32 Q 72 26 80 34" stroke="#15803d" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <ellipse cx="68" cy="28" rx="3.5" ry="2" fill="#22c55e" transform="rotate(-30 68 28)" />
              <ellipse cx="76" cy="30" rx="3.5" ry="2" fill="#22c55e" transform="rotate(20 76 30)" />

              {/* Coral Red Feet */}
              <path d="M 46 68 L 44 78 M 48 68 L 48 78 M 54 68 L 54 78" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      );

    // 4. Colmena de Abejas Urbanas (Rooftop Flow Beehive)
    case 'city_bee_hive':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            {/* Cedar Hive Box Stand */}
            <rect x="26" y="80" width="48" height="8" rx="2" fill="#78350f" />
            <line x1="30" y1="88" x2="30" y2="94" stroke="#451a03" strokeWidth="3" />
            <line x1="70" y1="88" x2="70" y2="94" stroke="#451a03" strokeWidth="3" />

            {/* Bottom Brood Chamber */}
            <rect x="28" y="58" width="44" height="22" rx="2" fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
            <rect x="42" y="74" width="16" height="3" rx="1.5" fill="#0f172a" /> {/* Flight Entrance */}

            {/* Honey Super Chamber */}
            <rect x="28" y="36" width="44" height="20" rx="2" fill="#f59e0b" stroke="#92400e" strokeWidth="1.5" />
            <circle cx="50" cy="46" r="4" fill="#fef08a" stroke="#d97706" strokeWidth="1" />
            <circle cx="50" cy="46" r="2" fill="#f59e0b" />

            {/* Gabled Weather-proof Outer Roof */}
            <polygon points="50,20 22,34 78,34" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
            <polygon points="50,22 26,34 74,34" fill="#38bdf8" />

            {/* Dripping Golden Honey Drop */}
            <path d="M 50 56 C 48 56, 48 60, 50 62 C 52 60, 52 56, 50 56 Z" fill="#facc15" className="animate-bounce" />

            {/* Active Flying Urban Honeybees */}
            <g className={animate ? "anim-bee" : ""} style={{ transformOrigin: '72px 28px' }}>
              <ellipse cx="72" cy="28" rx="4" ry="2.5" fill="#facc15" stroke="#0f172a" strokeWidth="0.8" />
              <line x1="70" y1="26" x2="70" y2="30" stroke="#0f172a" strokeWidth="1.2" />
              <line x1="74" y1="26" x2="74" y2="30" stroke="#0f172a" strokeWidth="1.2" />
              {/* Fluttering Wings */}
              <ellipse cx="71" cy="24" rx="2.5" ry="1.5" fill="#e0f2fe" opacity="0.85" />
              <ellipse cx="74" cy="24" rx="2.5" ry="1.5" fill="#e0f2fe" opacity="0.85" />
            </g>

            <g className={animate ? "anim-bee" : ""} style={{ transformOrigin: '24px 45px', animationDelay: '-1.2s' }}>
              <ellipse cx="24" cy="45" rx="3.5" ry="2.2" fill="#facc15" stroke="#0f172a" strokeWidth="0.8" />
              <line x1="23" y1="43" x2="23" y2="47" stroke="#0f172a" strokeWidth="1" />
              <ellipse cx="23" cy="42" rx="2" ry="1.2" fill="#e0f2fe" opacity="0.85" />
            </g>
          </svg>
        </div>
      );

    // 5. Mariposas Monarca Urbanas (Urban Monarch Sanctuary)
    case 'city_butterfly_sanctuary':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            {/* Urban Wildflower Stem & Blooms */}
            <path d="M 35 90 Q 45 65 42 45" stroke="#16a34a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 65 90 Q 55 70 58 55" stroke="#16a34a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="42" cy="45" r="7" fill="#a855f7" />
            <circle cx="42" cy="45" r="3" fill="#fde047" />
            <circle cx="58" cy="55" r="6" fill="#ec4899" />
            <circle cx="58" cy="55" r="2.5" fill="#fde047" />

            {/* Monarch Butterfly 1 (Large Top) with 3D Flap */}
            <g className={animate ? "anim-butterfly" : ""} style={{ transformOrigin: '50px 30px' }}>
              {/* Left Wing with stained-glass pattern */}
              <path d="M 50 30 C 40 10, 18 14, 20 28 C 22 38, 38 42, 50 32 Z" fill="#f97316" stroke="#0f172a" strokeWidth="1.5" />
              <circle cx="28" cy="20" r="1.5" fill="#ffffff" />
              <circle cx="24" cy="26" r="1.2" fill="#ffffff" />

              {/* Right Wing with stained-glass pattern */}
              <path d="M 50 30 C 60 10, 82 14, 80 28 C 78 38, 62 42, 50 32 Z" fill="#f97316" stroke="#0f172a" strokeWidth="1.5" />
              <circle cx="72" cy="20" r="1.5" fill="#ffffff" />
              <circle cx="76" cy="26" r="1.2" fill="#ffffff" />

              {/* Butterfly Body & Antennae */}
              <ellipse cx="50" cy="30" rx="2" ry="7" fill="#0f172a" />
              <path d="M 49 23 Q 45 16 42 18 M 51 23 Q 55 16 58 18" stroke="#0f172a" strokeWidth="1" fill="none" />
            </g>
          </svg>
        </div>
      );

    // 6. Ciclista de Movilidad Cero Emisiones (Zero-Emission Cyclist)
    case 'city_cyclist':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Back Wheel with Spinning Spokes */}
              <g className={animate ? "anim-turbine" : ""} style={{ transformOrigin: '24px 72px' }}>
                <circle cx="24" cy="72" r="15" fill="none" stroke="#0f172a" strokeWidth="2.5" />
                <circle cx="24" cy="72" r="13" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="9" y1="72" x2="39" y2="72" stroke="#94a3b8" strokeWidth="1" />
                <line x1="24" y1="57" x2="24" y2="87" stroke="#94a3b8" strokeWidth="1" />
              </g>

              {/* Front Wheel with Spinning Spokes */}
              <g className={animate ? "anim-turbine" : ""} style={{ transformOrigin: '76px 72px' }}>
                <circle cx="76" cy="72" r="15" fill="none" stroke="#0f172a" strokeWidth="2.5" />
                <circle cx="76" cy="72" r="13" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="61" y1="72" x2="91" y2="72" stroke="#94a3b8" strokeWidth="1" />
                <line x1="76" y1="57" x2="76" y2="87" stroke="#94a3b8" strokeWidth="1" />
              </g>

              {/* Modern Lightweight Emerald Bike Frame */}
              <polygon points="24,72 48,72 64,52 38,52" fill="none" stroke="#10b981" strokeWidth="3" />
              <line x1="48" y1="72" x2="36" y2="44" stroke="#10b981" strokeWidth="3" /> {/* Seat post */}
              <line x1="76" y1="72" x2="68" y2="42" stroke="#10b981" strokeWidth="3" /> {/* Fork */}
              <path d="M 64 42 L 72 42" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" /> {/* Handlebars */}
              <ellipse cx="35" cy="44" rx="5" ry="2" fill="#0f172a" /> {/* Saddle */}

              {/* Cyclist Torso & Legs */}
              <path d="M 38 44 L 52 36 L 66 45" stroke="#0284c7" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 38 44 L 46 58 L 48 72" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />

              {/* Cyclist Head & Aerodynamic Helmet */}
              <circle cx="54" cy="24" r="8" fill="#fed7aa" />
              <path d="M 46 20 C 46 14, 64 12, 66 22 Z" fill="#10b981" stroke="#047857" strokeWidth="1" />
              {/* Commuter Glasses */}
              <line x1="56" y1="24" x2="62" y2="24" stroke="#0f172a" strokeWidth="2" />
            </g>
          </svg>
        </div>
      );

    // 7. Agricultor Urbano en Azoteas (Rooftop Urban Farmer)
    case 'city_gardener':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Straw Sunhat */}
              <ellipse cx="50" cy="20" rx="20" ry="5" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
              <path d="M 38 20 C 38 12, 62 12, 62 20 Z" fill="#eab308" />
              <path d="M 38 20 Q 50 18 62 20" stroke="#15803d" strokeWidth="1.5" fill="none" />

              {/* Face & Smile */}
              <ellipse cx="50" cy="28" rx="9" ry="8" fill="#fed7aa" />
              <g className={animate ? "anim-blink origin-[50px_28px]" : ""}>
                <circle cx="46" cy="28" r="1.5" fill="#0f172a" />
                <circle cx="54" cy="28" r="1.5" fill="#0f172a" />
              </g>
              <path d="M 47 32 Q 50 34 53 32" stroke="#b45309" strokeWidth="1.2" fill="none" />

              {/* Green Canvas Apron with Pocket */}
              <path d="M 34 38 L 66 38 L 70 72 L 30 72 Z" fill="#047857" stroke="#065f46" strokeWidth="1.5" />
              <rect x="42" y="50" width="16" height="12" rx="2" fill="#065f46" />
              {/* Garden Trowel sticking out of pocket */}
              <path d="M 52 46 L 56 40 L 58 44 Z" fill="#cbd5e1" />

              {/* Wooden Crate of Fresh Harvested Vegetables */}
              <g className={animate ? "anim-canopy origin-[50px_65px]" : ""}>
                <rect x="36" y="60" width="28" height="16" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1" />
                {/* Carrots & Tomatoes */}
                <circle cx="42" cy="58" r="3.5" fill="#ef4444" />
                <circle cx="48" cy="57" r="3.5" fill="#ef4444" />
                <polygon points="56,54 52,60 60,60" fill="#f97316" />
                {/* Green Leafy tops */}
                <path d="M 42 54 C 40 50, 44 50, 42 54" fill="#22c55e" />
                <path d="M 56 50 C 54 46, 58 46, 56 50" fill="#22c55e" />
              </g>

              {/* Rubber Gardening Boots */}
              <rect x="36" y="72" width="10" height="18" rx="2" fill="#d97706" />
              <rect x="54" y="72" width="10" height="18" rx="2" fill="#d97706" />
            </g>
          </svg>
        </div>
      );

    // 8. Embajadora de Economía Circular (Circular Economy Recycler)
    case 'city_recycler':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Natural Hair Waving */}
              <path d="M 36 24 C 32 14, 68 14, 64 24 C 68 34, 66 44, 62 48 C 56 46, 44 46, 38 48 Z" fill="#1e293b" />

              {/* Face & Glasses */}
              <ellipse cx="50" cy="28" rx="10" ry="9" fill="#fed7aa" />
              {/* Stylish Eco Eyeglasses */}
              <rect x="42" y="24" width="7" height="6" rx="1.5" fill="none" stroke="#10b981" strokeWidth="1.2" />
              <rect x="51" y="24" width="7" height="6" rx="1.5" fill="none" stroke="#10b981" strokeWidth="1.2" />
              <line x1="49" y1="27" x2="51" y2="27" stroke="#10b981" strokeWidth="1.2" />
              <g className={animate ? "anim-blink origin-[50px_27px]" : ""}>
                <circle cx="45.5" cy="27" r="1.2" fill="#0f172a" />
                <circle cx="54.5" cy="27" r="1.2" fill="#0f172a" />
              </g>
              <path d="M 47 32 Q 50 34 53 32" stroke="#b45309" strokeWidth="1.2" fill="none" />

              {/* Eco Blazer with Mobius Recycling Loop Pin */}
              <path d="M 32 40 L 68 40 L 72 72 L 28 72 Z" fill="#0d9488" />
              <line x1="50" y1="40" x2="50" y2="72" stroke="#115e59" strokeWidth="1.5" />
              {/* Recycling Badge */}
              <circle cx="40" cy="48" r="4" fill="#ffffff" />
              <path d="M 38 48 L 42 46 L 40 50 Z" fill="#10b981" />

              {/* Digital Tablet with Circular Economy Charts */}
              <g className={animate ? "anim-canopy origin-[50px_60px]" : ""}>
                <rect x="44" y="52" width="22" height="16" rx="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
                <circle cx="55" cy="60" r="4" fill="none" stroke="#22c55e" strokeWidth="1.5" />
                <line x1="55" y1="60" x2="58" y2="58" stroke="#fde047" strokeWidth="1" />
              </g>

              {/* Slacks */}
              <rect x="36" y="72" width="10" height="18" rx="1" fill="#1e293b" />
              <rect x="54" y="72" width="10" height="18" rx="1" fill="#1e293b" />
            </g>
          </svg>
        </div>
      );

    // 9. Estudiante en Monopatín Eléctrico (E-Scooter Commuter)
    case 'city_scooter':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <g className={animate ? "anim-breathe" : ""}>
              {/* Scooter Deck & Wheels */}
              <rect x="22" y="80" width="54" height="5" rx="2.5" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
              {/* Rear Wheel */}
              <circle cx="24" cy="84" r="6" fill="#1e293b" stroke="#0284c7" strokeWidth="1.5" />
              {/* Front Wheel */}
              <circle cx="74" cy="84" r="6" fill="#1e293b" stroke="#0284c7" strokeWidth="1.5" />
              {/* Steering Column & Handlebars */}
              <line x1="72" y1="80" x2="68" y2="42" stroke="#0f172a" strokeWidth="3" />
              <line x1="64" y1="42" x2="72" y2="42" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              {/* Glowing Front LED Headlight */}
              <circle cx="70" cy="44" r="2.5" fill="#fef08a" className="animate-pulse" />

              {/* Commuter Riding Scooter */}
              <path d="M 40 78 L 48 54 L 66 44" stroke="#0284c7" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              {/* Teal Windbreaker Jacket & Backpack */}
              <path d="M 38 44 L 56 40 L 52 58 L 36 56 Z" fill="#0d9488" />
              <rect x="30" y="44" width="8" height="12" rx="3" fill="#ea580c" />

              {/* Head & Helmet with wind-blown scarf */}
              <circle cx="52" cy="26" r="8" fill="#fed7aa" />
              <path d="M 44 22 C 44 14, 62 14, 62 24 Z" fill="#38bdf8" />
              {/* Fluttering Scarf */}
              <path d="M 46 32 Q 32 36 24 32" stroke="#facc15" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      );

    // 10. Estación de Autobús Solar (Solar Smart Transit Stop)
    case 'city_solar_bus':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            {/* Concrete Pavement Base */}
            <rect x="12" y="84" width="76" height="8" rx="2" fill="#475569" stroke="#334155" strokeWidth="1" />

            {/* Tempered Safety Glass Shelter Walls */}
            <rect x="22" y="32" width="56" height="52" rx="3" fill="#a5f3fc" opacity="0.45" stroke="#0f766e" strokeWidth="2" />
            {/* Steel Support Posts */}
            <line x1="26" y1="32" x2="26" y2="84" stroke="#0f766e" strokeWidth="3" />
            <line x1="74" y1="32" x2="74" y2="84" stroke="#0f766e" strokeWidth="3" />

            {/* Recycled Wood Waiting Bench */}
            <rect x="30" y="62" width="40" height="5" rx="1.5" fill="#b45309" />
            <line x1="36" y1="67" x2="36" y2="84" stroke="#18181b" strokeWidth="2" />
            <line x1="64" y1="67" x2="64" y2="84" stroke="#18181b" strokeWidth="2" />

            {/* Real-time Solar Arrival Digital Screen */}
            <rect x="32" y="40" width="22" height="12" rx="1" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
            <line x1="35" y1="44" x2="48" y2="44" stroke="#34d399" strokeWidth="1" />
            <line x1="35" y1="48" x2="44" y2="48" stroke="#38bdf8" strokeWidth="1" />

            {/* Angled High-Efficiency Solar Photovoltaic Roof Canopy */}
            <polygon points="16,24 84,20 86,28 14,32" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
            <line x1="38" y1="23" x2="36" y2="31" stroke="#60a5fa" strokeWidth="1" />
            <line x1="62" y1="21" x2="60" y2="29" stroke="#60a5fa" strokeWidth="1" />
            <circle cx="82" cy="18" r="3" fill="#facc15" className="animate-ping" />
          </svg>
        </div>
      );

    // 11. Mini Molino Eólico Urbano (Urban Micro-Wind Turbine)
    case 'city_wind_turbine':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            {/* Elegant Urban Tapered White Mast */}
            <polygon points="50,26 46,88 54,88" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
            
            {/* Streetlight Luminaire with Green Clean Glow */}
            <path d="M 48 48 Q 36 44 32 50" stroke="#64748b" strokeWidth="2.5" fill="none" />
            <ellipse cx="32" cy="52" rx="4" ry="2" fill="#0284c7" />
            <circle cx="32" cy="54" r="2" fill="#fef08a" className="animate-pulse" />

            {/* Continuous Spinning Helical/Tri-blade Urban Turbine */}
            <g className={animate ? "anim-turbine" : ""} style={{ transformOrigin: '50px 24px' }}>
              <circle cx="50" cy="24" r="4" fill="#0f766e" stroke="#14b8a6" strokeWidth="1" />
              {/* 3 Curved Modern Blades */}
              <path d="M 50 24 Q 44 10 50 2 Q 54 10 50 24 Z" fill="#14b8a6" />
              <path d="M 50 24 Q 64 30 70 40 Q 58 34 50 24 Z" fill="#0d9488" />
              <path d="M 50 24 Q 36 30 30 40 Q 42 34 50 24 Z" fill="#0d9488" />
            </g>

            {/* Park Planter Base */}
            <ellipse cx="50" cy="88" rx="22" ry="6" fill="#15803d" stroke="#166534" strokeWidth="1.5" />
            <circle cx="42" cy="86" r="2.5" fill="#f43f5e" />
            <circle cx="58" cy="87" r="2.5" fill="#facc15" />
          </svg>
        </div>
      );

    // 12. Edificio con Fachada Vegetal (Vertical Forest Bosco Skyscraper)
    case 'city_green_building':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            {/* Modern Slate Glass Facade */}
            <rect x="24" y="16" width="52" height="74" rx="3" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />

            {/* Glowing Windows Grid */}
            <g className={animate ? "anim-flame-1" : ""}>
              <rect x="30" y="22" width="6" height="6" fill="#fef08a" opacity="0.9" />
              <rect x="42" y="22" width="6" height="6" fill="#38bdf8" opacity="0.8" />
              <rect x="54" y="22" width="6" height="6" fill="#fef08a" opacity="0.9" />
              <rect x="64" y="22" width="6" height="6" fill="#38bdf8" opacity="0.8" />

              <rect x="30" y="42" width="6" height="6" fill="#38bdf8" opacity="0.8" />
              <rect x="42" y="42" width="6" height="6" fill="#fef08a" opacity="0.9" />
              <rect x="54" y="42" width="6" height="6" fill="#38bdf8" opacity="0.8" />
              <rect x="64" y="42" width="6" height="6" fill="#fef08a" opacity="0.9" />

              <rect x="30" y="62" width="6" height="6" fill="#fef08a" opacity="0.9" />
              <rect x="42" y="62" width="6" height="6" fill="#38bdf8" opacity="0.8" />
              <rect x="54" y="62" width="6" height="6" fill="#fef08a" opacity="0.9" />
              <rect x="64" y="62" width="6" height="6" fill="#38bdf8" opacity="0.8" />
            </g>

            {/* Cascading Living Balcony Planters with Swaying Trees & Vines */}
            <g className={animate ? "anim-canopy origin-bottom" : ""}>
              {/* Level 1 Balcony */}
              <rect x="20" y="32" width="60" height="6" rx="2" fill="#065f46" stroke="#047857" strokeWidth="1" />
              <circle cx="28" cy="30" r="5" fill="#10b981" />
              <circle cx="48" cy="29" r="6" fill="#22c55e" />
              <circle cx="68" cy="30" r="5" fill="#10b981" />
              <path d="M 32 35 L 32 40 M 64 35 L 64 41" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />

              {/* Level 2 Balcony */}
              <rect x="20" y="52" width="60" height="6" rx="2" fill="#065f46" stroke="#047857" strokeWidth="1" />
              <circle cx="34" cy="50" r="6" fill="#22c55e" />
              <circle cx="56" cy="49" r="6" fill="#10b981" />
              <circle cx="72" cy="50" r="5" fill="#34d399" />
              <path d="M 40 55 L 40 60 M 52 55 L 52 61" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />

              {/* Level 3 Balcony */}
              <rect x="20" y="72" width="60" height="6" rx="2" fill="#065f46" stroke="#047857" strokeWidth="1" />
              <circle cx="26" cy="70" r="5" fill="#10b981" />
              <circle cx="46" cy="69" r="6" fill="#22c55e" />
              <circle cx="66" cy="70" r="5" fill="#10b981" />
            </g>

            {/* Rooftop Solar Pergola & Green Roof Garden */}
            <rect x="28" y="10" width="44" height="6" rx="1.5" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" />
            <circle cx="50" cy="8" r="3" fill="#10b981" />
          </svg>
        </div>
      );

    // 13. Tranvía 100% Eléctrico (Zero-Emission Light-Rail Tram)
    case 'city_tram':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            {/* Grassy Green Track Bed */}
            <rect x="6" y="80" width="88" height="12" rx="2" fill="#15803d" />
            <line x1="8" y1="84" x2="92" y2="84" stroke="#475569" strokeWidth="2.5" />

            {/* Rooftop Electric Pantograph with Spark */}
            <path d="M 40 22 L 50 12 L 60 22" stroke="#0f172a" strokeWidth="2.5" fill="none" />
            <line x1="44" y1="12" x2="56" y2="12" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="50" cy="12" r="2.5" fill="#38bdf8" className={animate ? "anim-tram-spark" : ""} />

            {/* Sleek Aerodynamic Tram Body */}
            <rect x="14" y="24" width="72" height="54" rx="8" fill="#0d9488" stroke="#115e59" strokeWidth="2" />
            <line x1="14" y1="58" x2="86" y2="58" stroke="#10b981" strokeWidth="3" />

            {/* Large Panoramic Tinted Windows */}
            <rect x="20" y="32" width="16" height="20" rx="3" fill="#a5f3fc" opacity="0.9" />
            <rect x="42" y="32" width="16" height="20" rx="3" fill="#a5f3fc" opacity="0.9" />
            <rect x="64" y="32" width="16" height="20" rx="3" fill="#a5f3fc" opacity="0.9" />

            {/* Warm Glowing Headlights */}
            <circle cx="20" cy="68" r="3.5" fill="#fef08a" className={animate ? "anim-tram-spark" : ""} />
            <circle cx="80" cy="68" r="3.5" fill="#fef08a" className={animate ? "anim-tram-spark" : ""} />

            {/* Low-Floor Wheels */}
            <circle cx="28" cy="80" r="5" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="72" cy="80" r="5" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
          </svg>
        </div>
      );

    // 14. Huerto Orgánico Comunitario (Community Organic Garden)
    case 'city_rooftop_garden':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            {/* Cedar Raised Planter Bed */}
            <rect x="14" y="58" width="72" height="30" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="2" />
            <line x1="14" y1="68" x2="86" y2="68" stroke="#451a03" strokeWidth="1.5" />
            <line x1="14" y1="78" x2="86" y2="78" stroke="#451a03" strokeWidth="1.5" />

            {/* Rich Organic Loam Soil */}
            <rect x="16" y="54" width="68" height="6" rx="2" fill="#290f02" />

            {/* Wooden Climbing Trellis */}
            <line x1="28" y1="24" x2="28" y2="56" stroke="#b45309" strokeWidth="2" />
            <line x1="44" y1="24" x2="44" y2="56" stroke="#b45309" strokeWidth="2" />
            <line x1="24" y1="32" x2="48" y2="32" stroke="#b45309" strokeWidth="1.5" />
            <line x1="24" y1="42" x2="48" y2="42" stroke="#b45309" strokeWidth="1.5" />

            {/* Vine-Ripened Plump Red Tomatoes & Leafy Greens */}
            <g className={animate ? "anim-canopy origin-bottom" : ""}>
              {/* Tomato Vines on Trellis */}
              <circle cx="32" cy="34" r="4.5" fill="#ef4444" />
              <circle cx="40" cy="42" r="4.5" fill="#ef4444" />
              <circle cx="30" cy="48" r="4.5" fill="#ef4444" />
              <circle cx="32" cy="34" r="1.5" fill="#fde047" opacity="0.6" />

              {/* Crisp Lettuce & Cabbages */}
              <circle cx="58" cy="48" r="7" fill="#22c55e" />
              <circle cx="58" cy="48" r="4.5" fill="#86efac" />
              <circle cx="72" cy="50" r="6" fill="#16a34a" />
              <circle cx="72" cy="50" r="3.5" fill="#86efac" />
            </g>

            {/* Small Cute Watering Can */}
            <path d="M 76 68 L 84 68 L 82 78 L 74 78 Z" fill="#0284c7" />
            <line x1="84" y1="70" x2="88" y2="64" stroke="#0284c7" strokeWidth="2" />
          </svg>
        </div>
      );

    // 15. Parque de Paneles Solares (Silicon Solar Array)
    case 'city_solar_panels':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            <defs>
              <linearGradient id="pv_silicon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="60%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Galvanized Steel Ground Mounting Rack */}
            <line x1="28" y1="74" x2="34" y2="44" stroke="#64748b" strokeWidth="3" />
            <line x1="72" y1="74" x2="66" y2="44" stroke="#64748b" strokeWidth="3" />
            <line x1="20" y1="84" x2="80" y2="84" stroke="#334155" strokeWidth="2" />

            {/* Monocrystalline Solar Panel Grid with Glint */}
            <polygon points="12,68 34,26 88,26 66,68" fill="url(#pv_silicon)" stroke="#3b82f6" strokeWidth="2" />
            
            {/* Silicon Grid Busbars */}
            <line x1="23" y1="47" x2="77" y2="47" stroke="#60a5fa" strokeWidth="1.2" />
            <line x1="38" y1="26" x2="26" y2="68" stroke="#60a5fa" strokeWidth="1.2" />
            <line x1="56" y1="26" x2="44" y2="68" stroke="#60a5fa" strokeWidth="1.2" />
            <line x1="72" y1="26" x2="60" y2="68" stroke="#60a5fa" strokeWidth="1.2" />

            {/* Specular Sun Reflection & Energy Inverter */}
            <g className={animate ? "anim-glint" : ""}>
              <circle cx="50" cy="38" r="4" fill="#ffffff" />
              <polygon points="50,38 52,32 56,36 52,40 50,44 48,40 44,36 48,32" fill="#ffffff" />
            </g>

            {/* Smart Micro-Inverter Box with Green Status LED */}
            <rect x="44" y="72" width="12" height="10" rx="1.5" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
            <circle cx="50" cy="77" r="1.5" fill="#22c55e" className="animate-ping" />
          </svg>
        </div>
      );

    // 16. Banca con Sombra de Madera Reciclada (Recycled Wood Eco-Bench)
    case 'city_bench':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            {/* Modern Cast-Iron Legs */}
            <path d="M 22 52 L 22 84 M 32 68 L 32 84" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 78 52 L 78 84 M 68 68 L 68 84" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />

            {/* Ergonomic Recycled Composite Slats */}
            <rect x="16" y="48" width="68" height="6" rx="2" fill="#d97706" stroke="#92400e" strokeWidth="1" />
            <rect x="16" y="56" width="68" height="6" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1" />
            <rect x="16" y="66" width="68" height="6" rx="2" fill="#d97706" stroke="#92400e" strokeWidth="1" />

            {/* Shading Canopy Pergola with Climbing Ivy */}
            <g className={animate ? "anim-canopy origin-top" : ""}>
              <line x1="20" y1="48" x2="20" y2="18" stroke="#1e293b" strokeWidth="2.5" />
              <line x1="80" y1="48" x2="80" y2="18" stroke="#1e293b" strokeWidth="2.5" />
              <rect x="14" y="14" width="72" height="5" rx="1.5" fill="#78350f" />
              {/* Ivy Foliage */}
              <circle cx="26" cy="18" r="4.5" fill="#10b981" />
              <circle cx="45" cy="16" r="5" fill="#22c55e" />
              <circle cx="65" cy="18" r="4.5" fill="#10b981" />
              <circle cx="78" cy="17" r="4" fill="#34d399" />
            </g>

            {/* Reusable Steel Water Bottle on Bench */}
            <rect x="68" y="58" width="4" height="8" rx="1" fill="#38bdf8" />
            <rect x="69" y="56" width="2" height="2" fill="#0f172a" />
          </svg>
        </div>
      );

    // 17. Centro de Clasificación 5 Fracciones (5-Fraction Smart Recycling Hub)
    case 'city_recycle_station':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-xl ${animClass}`}>
            {/* Ground Curb */}
            <rect x="10" y="82" width="80" height="6" rx="2" fill="#475569" />

            {/* Bin 1: Paper (Blue) */}
            <rect x="12" y="44" width="14" height="38" rx="2" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
            <rect x="10" y="40" width="18" height="5" rx="1.5" fill="#0369a1" />
            <circle cx="19" cy="54" r="3" fill="#ffffff" opacity="0.9" />

            {/* Bin 2: Plastic (Yellow) */}
            <rect x="28" y="44" width="14" height="38" rx="2" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
            <rect x="26" y="40" width="18" height="5" rx="1.5" fill="#ca8a04" />
            <circle cx="35" cy="54" r="3" fill="#ffffff" opacity="0.9" />

            {/* Bin 3: Glass (Green) */}
            <rect x="44" y="44" width="14" height="38" rx="2" fill="#10b981" stroke="#059669" strokeWidth="1" />
            <rect x="42" y="40" width="18" height="5" rx="1.5" fill="#059669" />
            <circle cx="51" cy="54" r="3" fill="#ffffff" opacity="0.9" />

            {/* Bin 4: Organic (Brown) */}
            <rect x="60" y="44" width="14" height="38" rx="2" fill="#92400e" stroke="#78350f" strokeWidth="1" />
            <rect x="58" y="40" width="18" height="5" rx="1.5" fill="#78350f" />
            <circle cx="67" cy="54" r="3" fill="#ffffff" opacity="0.9" />

            {/* Bin 5: E-Waste (Red) */}
            <rect x="76" y="44" width="14" height="38" rx="2" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
            <rect x="74" y="40" width="18" height="5" rx="1.5" fill="#dc2626" />
            <circle cx="83" cy="54" r="3" fill="#ffffff" opacity="0.9" />

            {/* Overhead Solar Sensor Roof */}
            <rect x="8" y="32" width="84" height="4" rx="1.5" fill="#1e293b" />
            <circle cx="50" cy="34" r="1.8" fill="#34d399" className="animate-ping" />
          </svg>
        </div>
      );

    // 18. Monumento a la Madre Tierra (Monument to Mother Earth)
    case 'city_tree_of_life':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            <defs>
              <radialGradient id="sphere_glow" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="60%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </radialGradient>
            </defs>
            {/* Monument Granite Pedestal */}
            <rect x="22" y="76" width="56" height="14" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
            <rect x="28" y="70" width="44" height="6" rx="2" fill="#475569" />

            {/* Spiraling Sculpted Living Bio-Pillars */}
            <g className={animate ? "anim-breathe origin-bottom" : ""}>
              <path d="M 36 70 C 32 50, 48 36, 44 22" stroke="#b45309" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 64 70 C 68 50, 52 36, 56 22" stroke="#b45309" strokeWidth="4" fill="none" strokeLinecap="round" />
            </g>

            {/* Floating Pulsing Eco-Sphere of Gaia */}
            <g className={animate ? "anim-float" : ""}>
              <circle cx="50" cy="32" r="16" fill="url(#sphere_glow)" className={animate ? "anim-glint" : ""} />
              {/* Earth Continents Filigree */}
              <circle cx="46" cy="30" r="4" fill="#3b82f6" opacity="0.6" />
              <circle cx="54" cy="34" r="5" fill="#3b82f6" opacity="0.6" />
            </g>

            {/* Crown of Living Leaves & Levitating Spores */}
            <g className={animate ? "anim-canopy origin-bottom" : ""}>
              <circle cx="34" cy="24" r="7" fill="#22c55e" />
              <circle cx="66" cy="24" r="7" fill="#22c55e" />
              <circle cx="50" cy="14" r="8" fill="#10b981" />
            </g>

            <g className={animate ? "anim-spore-float" : ""}>
              <circle cx="38" cy="16" r="2" fill="#fef08a" />
              <circle cx="62" cy="18" r="2" fill="#fef08a" />
              <circle cx="50" cy="6" r="2.5" fill="#a7f3d0" />
            </g>
          </svg>
        </div>
      );

    // 19. Biósfera Urbana Autosuficiente (Self-Sustaining Eco-Dome)
    case 'city_eco_dome':
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${animClass}`}>
            <defs>
              <linearGradient id="dome_glass" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#2dd4bf" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f766e" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            {/* Foundation Base Rim */}
            <rect x="12" y="74" width="76" height="14" rx="4" fill="#0f172a" stroke="#2dd4bf" strokeWidth="2" />
            
            {/* Geodesic Hexagonal Facets & Internal Rainforest */}
            <g className={animate ? "anim-glint" : ""}>
              <path d="M 16 74 A 34 34 0 0 1 84 74 Z" fill="url(#dome_glass)" stroke="#2dd4bf" strokeWidth="2" />
              {/* Geodesic Triangulation Ribs */}
              <line x1="50" y1="40" x2="50" y2="74" stroke="#a5f3fc" strokeWidth="1.2" />
              <line x1="50" y1="40" x2="26" y2="56" stroke="#a5f3fc" strokeWidth="1.2" />
              <line x1="50" y1="40" x2="74" y2="56" stroke="#a5f3fc" strokeWidth="1.2" />
              <line x1="26" y1="56" x2="50" y2="74" stroke="#a5f3fc" strokeWidth="1.2" />
              <line x1="74" y1="56" x2="50" y2="74" stroke="#a5f3fc" strokeWidth="1.2" />
            </g>

            {/* Internal Tropical Forest & Waterfall */}
            <g className={animate ? "anim-breathe origin-bottom" : ""}>
              <circle cx="36" cy="64" r="8" fill="#10b981" />
              <circle cx="50" cy="58" r="10" fill="#059669" />
              <circle cx="64" cy="64" r="8" fill="#10b981" />
              {/* Internal Waterfall */}
              <line x1="50" y1="58" x2="50" y2="74" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Specular Apex Crystal & Floating Clean Air Particles */}
            <circle cx="50" cy="40" r="3.5" fill="#ffffff" />
            <g className={animate ? "anim-spore-float" : ""}>
              <circle cx="32" cy="48" r="1.5" fill="#a5f3fc" />
              <circle cx="68" cy="48" r="1.5" fill="#a5f3fc" />
              <circle cx="50" cy="28" r="2" fill="#6ee7b7" />
            </g>
          </svg>
        </div>
      );


    // Fallback
    default:
      return (
        <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
          <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-lg ${animClass}`}>
            <circle cx="50" cy="50" r="38" fill="#10b981" opacity="0.2" />
            <circle cx="50" cy="50" r="28" fill="#047857" />
            <circle cx="50" cy="50" r="14" fill="#34d399" className="animate-pulse" />
          </svg>
        </div>
      );
  }
}

export default ItemIllustration;
