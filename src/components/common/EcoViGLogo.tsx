import React from 'react';

interface EcoViGLogoProps {
  className?: string;
  size?: number | string;
}

export const EcoViGLogo: React.FC<EcoViGLogoProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <img
      src="/ecovig-logo.svg"
      alt="Ícono Oficial EcoViG"
      className={`object-contain rounded-xl select-none pointer-events-none drop-shadow-[0_0_15px_rgba(16,185,129,0.35)] ${className}`}
      style={size ? { width: size, height: size } : undefined}
      referrerPolicy="no-referrer"
    />
  );
};

export default EcoViGLogo;
