import React, { useRef, useEffect } from 'react';
import { useDesktopStore } from '@/stores/useDesktopStore';
import WindowManager from './WindowManager';
import { useShallow } from 'zustand/react/shallow';
const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let particles: Particle[] = [];
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = Math.random() * 0.4 - 0.2;
        this.vy = Math.random() * 0.4 - 0.2;
        this.radius = Math.random() * 1.5 + 0.5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx!.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx!.fill();
      }
    }
    const init = () => {
      particles = [];
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
      }
    };
    const animate = () => {
      ctx!.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 100) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(255, 255, 255, ${1 - dist / 100})`;
            ctx!.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      init();
    };
    init();
    animate();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />;
};
const Desktop: React.FC = () => {
  const { wallpaper, windows, currentDesktopId } = useDesktopStore(
    useShallow((state) => ({
      wallpaper: state.wallpaper,
      windows: state.windows,
      currentDesktopId: state.currentDesktopId,
    }))
  );
  const visibleWindows = windows.filter((w) => w.desktopId === currentDesktopId);
  return (
    <main
      className="flex-1 h-full w-full relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <AnimatedBackground />
      <div className="absolute inset-0 bg-black/30 z-0" />
      <div className="relative z-10 h-full w-full">
        <WindowManager windows={visibleWindows} />
      </div>
    </main>
  );
};
export default Desktop;