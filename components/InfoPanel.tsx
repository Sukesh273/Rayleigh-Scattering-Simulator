import React from 'react';
import { SimulationState } from '../types.ts';

interface InfoPanelProps {
  timeValue: number;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ timeValue }) => {
  let title = "";
  let description = "";
  let physicsNote = "";
  let scatteringColor = "";

  if (timeValue < 33) {
    title = "Morning / Sunrise";
    description = "The sun is low on the horizon.";
    physicsNote = "Sunlight travels through a thicker layer of atmosphere. Much of the blue light is scattered away before reaching your eyes, allowing longer wavelengths (yellows, oranges, reds) to dominate the sky color near the sun.";
    scatteringColor = "text-orange-300";
  } else if (timeValue >= 33 && timeValue <= 66) {
    title = "Midday / Noon";
    description = "The sun is high overhead.";
    physicsNote = "Sunlight takes a shorter, more direct path through the atmosphere. Rayleigh scattering is strongest for short wavelengths (blue/violet). We see this scattered blue light coming from all directions, creating a blue sky.";
    scatteringColor = "text-blue-300";
  } else {
    title = "Evening / Sunset";
    description = "The sun dips towards the horizon again.";
    physicsNote = "The path of light through the atmosphere is at its longest. Almost all blue light is scattered out of the direct beam. Only the longest wavelengths (reds and oranges) penetrate through to the observer, painting the horizon red.";
    scatteringColor = "text-red-300";
  }

  return (
    <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 shadow-lg mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-xl font-bold ${scatteringColor}`}>{title}</h3>
        <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400">Rayleigh Scattering</span>
      </div>
      <p className="text-slate-300 mb-4 text-sm leading-relaxed">
        {description}
      </p>
      
      <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-blue-500">
        <h4 className="text-blue-400 font-semibold text-sm mb-1">Physics Insight</h4>
        <p className="text-slate-400 text-sm italic">
          {physicsNote}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-500">
        <div className="flex flex-col">
           <span className="uppercase tracking-wider font-bold mb-1">Path Length</span>
           <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
             <div 
               className="h-full bg-gradient-to-r from-green-400 to-yellow-400" 
               style={{ width: `${Math.abs(timeValue - 50) * 2}%`, minWidth: '10%' }}
             ></div>
           </div>
           <span>{Math.abs(timeValue - 50) < 20 ? 'Short (Direct)' : 'Long (Atmospheric)'}</span>
        </div>
        <div className="flex flex-col">
           <span className="uppercase tracking-wider font-bold mb-1">Scattered Light</span>
           <span className={`${scatteringColor} font-medium`}>
             {timeValue > 33 && timeValue < 66 ? 'Blue Dominant' : 'Red/Orange Dominant'}
           </span>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;