import { ColorRGB } from './types.ts';

export const PARTICLES_COUNT = 150;

// Helper to interpolate colors
export const interpolateColor = (color1: ColorRGB, color2: ColorRGB, factor: number): string => {
  const result = {
    r: Math.round(color1.r + (color2.r - color1.r) * factor),
    g: Math.round(color1.g + (color2.g - color1.g) * factor),
    b: Math.round(color1.b + (color2.b - color1.b) * factor),
  };
  return `rgb(${result.r}, ${result.g}, ${result.b})`;
};

// Define keyframes for sky colors (Top of sky)
export const SKY_TOP_COLORS: Record<string, ColorRGB> = {
  sunrise: { r: 10, g: 20, b: 60 },
  morning: { r: 70, g: 130, b: 230 },
  noon: { r: 0, g: 100, b: 255 },
  sunset: { r: 20, g: 20, b: 60 },
};

// Define keyframes for sky colors (Horizon)
export const SKY_BOTTOM_COLORS: Record<string, ColorRGB> = {
  sunrise: { r: 255, g: 100, b: 50 }, // Orange/Red
  morning: { r: 180, g: 220, b: 255 }, // White-ish Blue
  noon: { r: 135, g: 206, b: 235 }, // Sky Blue
  sunset: { r: 255, g: 69, b: 0 }, // Red Orange
};

// Sun Colors
export const SUN_COLORS: Record<string, ColorRGB> = {
  sunrise: { r: 255, g: 50, b: 0 },
  morning: { r: 255, g: 220, b: 100 },
  noon: { r: 255, g: 255, b: 220 },
  sunset: { r: 255, g: 0, b: 0 },
};

// Scattering Ray Colors (The color of the light beams)
export const SCATTER_COLORS: Record<string, ColorRGB> = {
  sunrise: { r: 255, g: 100, b: 50 },
  morning: { r: 255, g: 255, b: 255 }, // White light scatters blue
  noon: { r: 255, g: 255, b: 255 },
  sunset: { r: 255, g: 50, b: 0 },
};