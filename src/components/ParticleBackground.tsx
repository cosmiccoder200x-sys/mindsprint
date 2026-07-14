/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface ParticleBackgroundProps {
  glowColor: string;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ glowColor }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const maxParticles = 65;
    const connectionDist = 120;

    // Resize canvas to fill parent container cleanly
    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize particles
    particles = [];
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1,
      });
    }

    // Capture mouse movement for slight magnetic interactive feedback
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    canvas.parentElement?.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement?.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    const draw = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw all connection lines first
      ctx.lineWidth = 0.55;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            // connection opacity decreases as distance increases
            const opacity = (1 - dist / connectionDist) * 0.15;
            ctx.strokeStyle = `${glowColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        // Draw particle node
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Slow drift physics
        p.x += p.vx;
        p.y += p.vy;

        // Interaction with mouse: mild attraction/deflection
        if (mouse.x !== -1000) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            // Nudge away slightly from mouse pointer
            const force = (100 - dist) / 3000;
            p.x -= dx * force;
            p.y -= dy * force;
          }
        }

        // Boundary checks
        if (p.x < 0) {
          p.x = canvas.width;
        } else if (p.x > canvas.width) {
          p.x = 0;
        }

        if (p.y < 0) {
          p.y = canvas.height;
        } else if (p.y > canvas.height) {
          p.y = 0;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.parentElement?.removeEventListener('mousemove', handleMouseMove);
      canvas.parentElement?.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [glowColor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-screen"
      id="synapse_canvas"
    />
  );
};
