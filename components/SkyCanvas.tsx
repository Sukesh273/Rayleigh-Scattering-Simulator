import React, { useRef, useEffect } from 'react';
import { ColorRGB, SimulationState } from '../types.ts';
import { interpolateColor, SKY_TOP_COLORS, SKY_BOTTOM_COLORS, SUN_COLORS, SCATTER_COLORS, PARTICLES_COUNT } from '../constants.ts';

interface SkyCanvasProps {
  simulationState: SimulationState;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  phase: number;
}

const SkyCanvas: React.FC<SkyCanvasProps> = ({ simulationState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>(0);
  const stateRef = useRef<SimulationState>(simulationState);

  // Update the ref whenever props change
  useEffect(() => {
    stateRef.current = simulationState;
  }, [simulationState]);

  // Initialize particles
  useEffect(() => {
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < PARTICLES_COUNT; i++) {
        particlesRef.current.push({
          x: Math.random(),
          y: Math.random(),
          radius: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.0005 + 0.0001,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
  }, []);

  // Main Animation Loop and Resize Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;

    const drawFrame = (time: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx || canvas.width === 0 || canvas.height === 0) {
        // If dimensions are invalid, keep trying next frame
        requestRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const currentState = stateRef.current;

      const progress = currentState.timeValue;
      
      let startStage = 'sunrise';
      let endStage = 'morning';
      let factor = 0;

      if (progress <= 25) {
        startStage = 'sunrise';
        endStage = 'morning';
        factor = progress / 25;
      } else if (progress <= 50) {
        startStage = 'morning';
        endStage = 'noon';
        factor = (progress - 25) / 25;
      } else {
        startStage = 'noon';
        endStage = 'sunset';
        factor = (progress - 50) / 50;
      }

      const safeGet = (obj: Record<string, ColorRGB>, key: string) => obj[key] || {r:0, g:0, b:0};

      const topColor = interpolateColor(safeGet(SKY_TOP_COLORS, startStage), safeGet(SKY_TOP_COLORS, endStage), factor);
      const bottomColor = interpolateColor(safeGet(SKY_BOTTOM_COLORS, startStage), safeGet(SKY_BOTTOM_COLORS, endStage), factor);
      const sunColor = interpolateColor(safeGet(SUN_COLORS, startStage), safeGet(SUN_COLORS, endStage), factor);
      const scatterColorStr = interpolateColor(safeGet(SCATTER_COLORS, startStage), safeGet(SCATTER_COLORS, endStage), factor);

      // 2. Draw Sky Gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, topColor);
      gradient.addColorStop(1, bottomColor);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 3. Calculate Sun Position
      const normX = progress / 100;
      const sunX = normX * width;
      const sunY = height * 0.9 - (height * 0.7) * Math.sin(normX * Math.PI);

      // 4. Draw Atmosphere/Particles
      particlesRef.current.forEach((p) => {
        p.x += p.speed;
        if (p.x > 1) p.x = 0;

        const px = p.x * width;
        const py = p.y * height;
        
        const distToSun = Math.sqrt(Math.pow(px - sunX, 2) + Math.pow(py - sunY, 2));
        const maxDist = Math.sqrt(width * width + height * height);
        
        const intensity = Math.max(0, 1 - distToSun / (maxDist * 0.6));
        const pulse = 0.8 + 0.2 * Math.sin(time * 0.005 + p.phase);

        ctx.beginPath();
        ctx.arc(px, py, p.radius * pulse, 0, Math.PI * 2);
        
        ctx.fillStyle = scatterColorStr;
        ctx.globalAlpha = intensity * 0.6; 
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 5. Draw Sun Rays
      ctx.save();
      ctx.translate(sunX, sunY);
      const rayCount = 12;
      ctx.strokeStyle = sunColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.1;
      const rotation = time * 0.0005;
      for(let i=0; i<rayCount; i++) {
          ctx.rotate((Math.PI * 2) / rayCount + rotation);
          ctx.beginPath();
          ctx.moveTo(20, 0);
          ctx.lineTo(width, 0);
          ctx.stroke();
      }
      ctx.restore();

      // 6. Draw Sun Halo
      const haloGradient = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 120);
      haloGradient.addColorStop(0, sunColor);
      haloGradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = haloGradient;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // 7. Draw Sun Body
      ctx.fillStyle = sunColor;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      requestRef.current = requestAnimationFrame(drawFrame);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === parent) {
          // Explicitly set canvas buffer size to match display size
          canvas.width = entry.contentRect.width;
          canvas.height = entry.contentRect.height;
        }
      }
    });

    if (parent) {
      resizeObserver.observe(parent);
      // Fallback initial size
      canvas.width = parent.clientWidth || 300;
      canvas.height = parent.clientHeight || 150;
    }

    requestRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block"
    />
  );
};

export default SkyCanvas;