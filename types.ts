export enum TimeOfDay {
  Morning = 'Morning',
  Noon = 'Noon',
  Afternoon = 'Afternoon',
  Evening = 'Evening',
}

export interface SimulationState {
  timeValue: number; // 0 to 100
  isPlaying: boolean;
}

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}