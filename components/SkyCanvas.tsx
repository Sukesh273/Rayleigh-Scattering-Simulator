import React, { useRef, useEffect } from 'react';
import { ColorRGB, SimulationState } from '../types';
import { interpolateColor, SKY_TOP_COLORS, SKY_BOTTOM_COLORS, SUN_COLORS, SCATTER_COLORS, PARTICLES_COUNT } from '../constants';

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
  const requestRef = useRef<number>();

  // Initialize particles once
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

  const render = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Calculate Physics/Color State based on Slider Value (0-100)
    // 0 = Sunrise, 50 = Noon, 100 = Sunset
    const progress = simulationState.timeValue;
    let factor = 0;
    let topStart: ColorRGB, topEnd: ColorRGB;
    let botStart: ColorRGB, botEnd: ColorRGB;
    let sunStart: ColorRGB, sunEnd: ColorRGB;
    let scatterStart: ColorRGB, scatterEnd: ColorRGB;

    if (progress <= 50) {
      // Sunrise to Noon
      factor = progress / 50; // 0 to 1
      topStart = SKY_TOP_COLORS.sunrise;
      topEnd = SKY_TOP_COLORS.noon;
      botStart = SKY_BOTTOM_COLORS.sunrise;
      botEnd = SKY_BOTTOM_COLORS.noon;
      sunStart = SUN_COLORS.sunrise;
      sunEnd = SUN_COLORS.noon;
      scatterStart = SCATTER_COLORS.sunrise;
      scatterEnd = SCATTER_COLORS.noon;
    } else {
      // Noon to Sunset
      factor = (progress - 50) / 50; // 0 to 1
      topStart = SKY_TOP_COLORS.noon;
      topEnd = SKY_TOP_COLORS.sunset;
      botStart = SKY_BOTTOM_COLORS.noon;
      botEnd = SKY_BOTTOM_COLORS.sunset;
      sunStart = SUN_COLORS.noon;
      sunEnd = SUN_COLORS.sunset;
      scatterStart = SCATTER_COLORS.noon;
      scatterEnd = SCATTER_COLORS.sunset;
    }

    const topColor = interpolateColor(topStart, topEnd, factor);
    const bottomColor = interpolateColor(botStart, botEnd, factor);
    const sunColor = interpolateColor(sunStart, sunEnd, factor);
    const scatterColorStr = interpolateColor(scatterStart, scatterEnd, factor);

    // 2. Draw Sky Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 3. Calculate Sun Position
    // Arc movement: Starts left-bottom, peaks center-top, ends right-bottom
    const sunX = (progress / 100) * width;
    // Parabolic Y: y = 4h(x/w - (x/w)^2) ... inverted for canvas
    // Normalized X (0 to 1)
    const normX = progress / 100;
    // Peak height at 0.2 * height (near top), lowest at 0.8 * height
    const sunY = height * 0.9 - (height * 0.7) * Math.sin(normX * Math.PI);

    // 4. Draw Atmosphere/Particles (Rayleigh Scattering visualization)
    // We want to visualize blue scattering more when sun is high, and red passing through when low.
    // Actually, to visualize the effect:
    // - Particles glow based on incoming light.
    // - At noon, they glow blue/white.
    // - At sunset, the path is longer.
    
    particlesRef.current.forEach((p) => {
      // Move particles slightly for life
      p.x += p.speed;
      if (p.x > 1) p.x = 0;

      const px = p.x * width;
      const py = p.y * height;
      
      const distToSun = Math.sqrt(Math.pow(px - sunX, 2) + Math.pow(py - sunY, 2));
      const maxDist = Math.sqrt(width * width + height * height);
      
      // Intensity drops with distance
      const intensity = Math.max(0, 1 - distToSun / (maxDist * 0.6));
      
      // Twinkle
      const pulse = 0.8 + 0.2 * Math.sin(time * 0.005 + p.phase);

      ctx.beginPath();
      ctx.arc(px, py, p.radius * pulse, 0, Math.PI * 2);
      
      // Determine scattering color behavior
      // Real physics: Particles scatter BLUE efficiently.
      // If sun is high (white light), particles scatter Blue.
      // If sun is low (red light reaches them), they reflect Red.
      
      ctx.fillStyle = scatterColorStr;
      ctx.globalAlpha = intensity * 0.6; // More transparent further away
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    // 5. Draw Sun Rays (Subtle)
    ctx.save();
    ctx.translate(sunX, sunY);
    const rayCount = 12;
    ctx.strokeStyle = sunColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.1;
    
    // Rotate rays slowly
    const rotation = time * 0.0005;
    
    for(let i=0; i<rayCount; i++) {
        ctx.rotate((Math.PI * 2) / rayCount + rotation);
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(width, 0); // Long rays
        ctx.stroke();
    }
    ctx.restore();

    // 6. Draw Sun Halo (Glow)
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
    // Sun border for contrast
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    requestRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(render);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [simulationState]); // Re-bind when state changes, though ref ensures smooth animation loop

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
        if (canvasRef.current && canvasRef.current.parentElement) {
            canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
            canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        className="w-full h-full rounded-lg shadow-inner"
    />
  );
};

export default SkyCanvas;