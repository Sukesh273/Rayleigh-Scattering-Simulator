import React from 'react';
import { SimulationState } from '../types';
import { Sun, Sunrise, Sunset, Play, Pause } from 'lucide-react';

interface ControlsProps {
  state: SimulationState;
  onChange: (newState: Partial<SimulationState>) => void;
}

const Controls: React.FC<ControlsProps> = ({ state, onChange }) => {
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ timeValue: parseInt(e.target.value, 10), isPlaying: false });
  };

  const togglePlay = () => {
    onChange({ isPlaying: !state.isPlaying });
  };

  const setTime = (val: number) => {
    onChange({ timeValue: val, isPlaying: false });
  };

  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Time Control</h2>
        <div className="flex gap-2">
             <button 
                onClick={togglePlay}
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors text-white"
                title={state.isPlaying ? "Pause Simulation" : "Play Simulation"}
             >
                {state.isPlaying ? <Pause size={20} /> : <Play size={20} />}
             </button>
        </div>
      </div>

      {/* Slider */}
      <div className="relative mb-8 pt-2">
        <input
          type="range"
          min="0"
          max="100"
          value={state.timeValue}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-300 mt-2 font-medium">
          <span className="cursor-pointer hover:text-white" onClick={() => setTime(0)}>Sunrise</span>
          <span className="cursor-pointer hover:text-white" onClick={() => setTime(25)}>Morning</span>
          <span className="cursor-pointer hover:text-white" onClick={() => setTime(50)}>Noon</span>
          <span className="cursor-pointer hover:text-white" onClick={() => setTime(75)}>Afternoon</span>
          <span className="cursor-pointer hover:text-white" onClick={() => setTime(100)}>Sunset</span>
        </div>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setTime(15)}
          className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
            state.timeValue < 33 
              ? 'bg-orange-500/20 border-orange-500 text-orange-200' 
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Sunrise size={24} className="mb-1" />
          <span className="text-sm">Morning</span>
        </button>

        <button
          onClick={() => setTime(50)}
          className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
            state.timeValue >= 33 && state.timeValue <= 66
              ? 'bg-blue-500/20 border-blue-500 text-blue-200' 
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Sun size={24} className="mb-1" />
          <span className="text-sm">Noon</span>
        </button>

        <button
          onClick={() => setTime(85)}
          className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
            state.timeValue > 66
              ? 'bg-red-500/20 border-red-500 text-red-200' 
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Sunset size={24} className="mb-1" />
          <span className="text-sm">Evening</span>
        </button>
      </div>
    </div>
  );
};

export default Controls;