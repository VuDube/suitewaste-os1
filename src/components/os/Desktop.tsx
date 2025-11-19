import React, { useRef, useEffect } from 'react';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useAuthStore } from '@/stores/useAuthStore';
import WindowManager from './WindowManager';
import LoginApp from '@/components/apps/LoginApp';
const SuiteWasteWallpaper: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    const draw = () => {
      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 1.5);
      gradient.addColorStop(0, '#4CAF50');
      gradient.addColorStop(1, '#2E7D32');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      const scale = Math.min(width, height) * 0.2;
      const centerX = width / 2;
      const centerY = height / 2 - scale * 0.2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - scale * 0.6);
      ctx.quadraticCurveTo(centerX - scale * 0.8, centerY, centerX, centerY + scale * 0.8);
      ctx.quadraticCurveTo(centerX + scale * 0.8, centerY, centerX, centerY - scale * 0.6);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      const fontSize = Math.max(24, Math.min(width, height) * 0.05);
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('SuiteWaste OS', centerX, centerY + scale);
    };
    const handleResize = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(draw);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />;
};
const Desktop: React.FC = () => {
  const wallpaper = useDesktopStore(s => s.wallpaper);
  const windows = useDesktopStore(s => s.windows);
  const currentDesktopId = useDesktopStore(s => s.currentDesktopId);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const checkAuth = useAuthStore(s => s.checkAuth);
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  const visibleWindows = windows.filter((w) => w.desktopId === currentDesktopId);
  // Strength the guard: Render nothing but the LoginApp if not authenticated
  if (!isAuthenticated) {
    return (
      <main className="flex-1 h-full w-full relative overflow-hidden bg-cover bg-center">
        {!wallpaper && <SuiteWasteWallpaper />}
        {wallpaper && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${wallpaper})` }} />}
        <div className="absolute inset-0 bg-black/40 z-0" />
        <LoginApp />
      </main>
    );
  }
  return (
    <main
      className="flex-1 h-full w-full relative overflow-hidden bg-cover bg-center"
      style={wallpaper ? { backgroundImage: `url(${wallpaper})` } : {}}
    >
      {!wallpaper && <SuiteWasteWallpaper />}
      <div className="absolute inset-0 bg-black/30 z-0" />
      <div className="relative z-10 h-full w-full">
        <WindowManager windows={visibleWindows} />
      </div>
      <div className="absolute bottom-16 right-4 z-20 pointer-events-none opacity-50 text-[10px] text-white/50 text-right">
        <p>SuiteWaste OS • Industrial Suite</p>
        <p>POPIA compliant persistence v2.1</p>
      </div>
    </main>
  );
};
export default Desktop;