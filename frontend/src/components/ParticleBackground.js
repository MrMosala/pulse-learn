// frontend/src/components/ParticleBackground.js
import React, { useRef } from 'react';

const ParticleBackground = () => {
  const mountRef = useRef(null);
  
  // Simple CSS-only background - no Three.js
  return (
    <div 
      ref={mountRef}
      className="particle-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Simple gradient background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)',
        filter: 'blur(40px)'
      }} />
      
      {/* Simple particles using CSS */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            background: `rgba(139, 92, 246, ${Math.random() * 0.3 + 0.1})`,
            borderRadius: '50%',
            animation: `float ${Math.random() * 20 + 10}s infinite ease-in-out`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
    </div>
  );
};

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(10px, -10px) scale(1.1); }
    50% { transform: translate(-5px, 5px) scale(0.9); }
    75% { transform: translate(-10px, -5px) scale(1.05); }
  }
`;
document.head.appendChild(style);

export default ParticleBackground;