
import React, { useState } from 'react';

const BreadLogo = ({ className = "" }: { className?: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showCrumbs, setShowCrumbs] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setShowCrumbs(true);
    // Hide crumbs after animation
    setTimeout(() => setShowCrumbs(false), 2000);
  };

  return (
    <div 
      className={`relative inline-flex items-center gap-2 cursor-pointer ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Breadcrumbs */}
      {showCrumbs && (
        <>
          <div className="breadcrumb animate-breadcrumb-fall" style={{left: '10px', animationDelay: '0.1s'}} />
          <div className="breadcrumb animate-breadcrumb-fall" style={{left: '20px', animationDelay: '0.3s'}} />
          <div className="breadcrumb animate-breadcrumb-fall" style={{left: '30px', animationDelay: '0.5s'}} />
        </>
      )}
      
      {/* Bread Icon */}
      <div className={`text-2xl transition-transform duration-300 ${isHovered ? 'animate-bread-rise' : ''}`}>
        🍞
      </div>
      
      {/* Logo Text */}
      <span className="text-xl font-semibold tracking-tight">Bread</span>
    </div>
  );
};

export default BreadLogo;
