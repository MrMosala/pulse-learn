#!/bin/bash

# Navbar Component
cat > /home/claude/pulse-learn-full/frontend/src/components/Navbar.js << 'EOF'
// frontend/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { currentUser, logout, userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <div className="logo-icon">⚡</div>
          <div className="logo-text">PULSE LEARN</div>
        </Link>

        <div className="nav-links">
          {!currentUser ? (
            <>
              <Link to="/" className="nav-btn">Home</Link>
              <Link to="/login" className="nav-btn">Login</Link>
              <Link to="/signup" className="nav-btn primary">Sign Up</Link>
            </>
          ) : (
            <>
              {userProfile && (
                <div className="level-badge">
                  LVL {userProfile.level || 1} - GOLD
                </div>
              )}
              <Link to="/dashboard" className="nav-btn">Dashboard</Link>
              <Link to="/courses" className="nav-btn">📚 Learn</Link>
              <Link to="/cv-builder" className="nav-btn">💼 Career</Link>
              <Link to="/finance" className="nav-btn">💰 Finance</Link>
              {isAdmin && (
                <Link to="/admin" className="nav-btn">👨‍💼 Admin</Link>
              )}
              <Link to="/profile" className="nav-btn">Profile</Link>
              <button onClick={handleLogout} className="nav-btn">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
EOF

# Particle Background Component
cat > /home/claude/pulse-learn-full/frontend/src/components/ParticleBackground.js << 'EOF'
// frontend/src/components/ParticleBackground.js
import React, { useEffect, useRef } from 'react';

function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 80;
    const colors = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981'];

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function init() {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.update();
        particle.draw();

        // Draw connections
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = 1 - distance / 150;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });

      requestAnimationFrame(animate);
    }

    function handleResize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', handleResize);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 0.6,
        pointerEvents: 'none'
      }}
    />
  );
}

export default ParticleBackground;
EOF

echo "✅ All UI components created!"
