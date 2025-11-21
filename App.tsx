import React, { useState, useEffect, useRef } from 'react';
import SkyCanvas from './components/SkyCanvas';
import Controls from './components/Controls';
import InfoPanel from './components/InfoPanel';
import { SimulationState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState>({
    timeValue: 50, // Start at noon
    isPlaying: false
  });

  // Animation loop for the slider when "Playing"
  useEffect(() => {
    let intervalId: number;
    if (state.isPlaying) {
      intervalId = window.setInterval(() => {
        setState(prev => {
          const nextValue = prev.timeValue + 0.2;
          if (nextValue >= 100) {
            return { ...prev, timeValue: 0 }; // Loop
          }
          return { ...prev, timeValue: nextValue };
        });
      }, 30); // ~30fps update for slider
    }
    return () => clearInterval(intervalId);
  }, [state.isPlaying]);

  const updateState = (newState: Partial<SimulationState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white p-4 md:p-8 lg:p-12 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-5xl mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            Rayleigh Scattering
          </h1>
          <p className="text-slate-400 mt-2 max-w-xl">
            Why is the sky blue? Explore how sunlight interacts with the Earth's atmosphere 
            depending on the time of day and the angle of the sun.
          </p>
        </div>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Simulation Viewport */}
        {/* Added style={{ minHeight: '400px' }} to ensure canvas has size even if Tailwind is slow */}
        <div 
            className="lg:col-span-2 h-[400px] md:h-[500px] lg:h-[600px] bg-black rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl relative"
            style={{ minHeight: '400px' }}
        >
          <SkyCanvas simulationState={state} />
          
          {/* Overlay Badge */}
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs text-white/70 pointer-events-none">
            Simulation View
          </div>
        </div>

        {/* Right Column: Controls & Info */}
        <div className="flex flex-col gap-6">
          <Controls state={state} onChange={updateState} />
          <InfoPanel timeValue={state.timeValue} />
          
          {/* Footer Note */}
          <div className="mt-auto text-xs text-slate-600 text-center">
            Interactive Physics Demo • Built with React & Canvas
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;