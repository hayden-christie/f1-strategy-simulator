/**
 * F1 Strategy Simulator - Type Definitions
 */

export type TireCompound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';

export type WeatherCondition = 'DRY' | 'LIGHT_RAIN' | 'HEAVY_RAIN' | 'MIXED';

export interface TireState {
  compound: TireCompound;
  age: number; // in laps
  degradation: number; // 0-1, where 1 is completely worn
}

export interface TireCompoundData {
  name: TireCompound;
  baseGripLevel: number; // relative grip (1.0 = baseline)
  degradationRate: number; // deg per lap (0-1 scale)
  optimalLapRange: [number, number]; // optimal performance window in laps
  color: string; // for UI
}

export interface LapData {
  lapNumber: number;
  lapTime: number; // in seconds
  tireCompound: TireCompound;
  tireAge: number;
  fuelLoad: number; // kg
  isPitLap: boolean;
  pitStopDuration?: number; // only if isPitLap is true
  cumulativeTime: number; // total race time so far
  weather?: WeatherCondition;
  underSafetyCar?: boolean;
  trafficDelay?: number; // seconds lost to traffic
}

export interface PitStop {
  lap: number;
  fromCompound: TireCompound;
  toCompound: TireCompound;
  duration: number; // total time lost including pit lane
}

export interface Strategy {
  name: string;
  pitStops: Array<{
    lap: number;
    tireCompound: TireCompound;
  }>;
  startingCompound: TireCompound;
}

export interface SafetyCarPeriod {
  startLap: number;
  endLap: number;
  lapTimeDelta: number; // how much slower than normal (e.g., +30s)
}

export interface WeatherChange {
  lap: number;
  condition: WeatherCondition;
}

export interface TireAllocation {
  soft: number;
  medium: number;
  hard: number;
  intermediate: number;
  wet: number;
}

export interface AdvancedRaceConfig {
  // Weather
  enableWeather: boolean;
  initialWeather: WeatherCondition;
  weatherChanges: WeatherChange[];

  // Safety Car
  enableSafetyCar: boolean;
  safetyCarPeriods: SafetyCarPeriod[];
  safetyCarPitTimeLoss: number; // reduced time loss during SC (e.g., 10s vs 20s)

  // Tire Allocation
  enableTireAllocation: boolean;
  tireAllocation: TireAllocation;

  // Traffic
  enableTraffic: boolean;
  overtakingDifficulty: number; // 0-10 scale
  trafficTimeLossPerLap: number; // base seconds lost per lap in traffic

  // Enhanced Fuel Effect
  enhancedFuelEffect: boolean;
  fuelEffectPerKg: number; // seconds per kg (default 0.03-0.05)
}

export interface RaceConfiguration {
  trackName: string;
  baseLapTime: number; // seconds - clean air, new tires, light fuel
  totalLaps: number;
  pitLaneTimeLoss: number; // seconds lost entering/exiting pit lane
  pitStopStationary: number; // seconds stationary for tire change
  startingFuelLoad: number; // kg
  fuelPerLap: number; // kg consumed per lap
  fuelEffect: number; // seconds per kg of fuel

  // Driver/Team modifiers (optional)
  driverId?: string;
  teamId?: string;

  // Advanced configuration (optional)
  advanced?: AdvancedRaceConfig;
}

export interface SimulationResult {
  strategy: Strategy;
  totalRaceTime: number; // seconds
  laps: LapData[];
  pitStops: PitStop[];
  averageLapTime: number;
  fastestLap: number;
  slowestLap: number;
}

export interface ComparisonResult {
  strategies: SimulationResult[];
  winner: SimulationResult;
  timeDifferences: Map<string, number>; // strategy name -> time delta to winner
}

// Live Race Tracking Types

export type RaceMode = 'PRE_RACE' | 'LIVE' | 'POST_RACE';

export interface LiveRaceState {
  currentLap: number;
  totalLaps: number;
  isActive: boolean;
  lastUpdate: Date;
}

export interface DriverLiveData {
  driverId: string;
  position: number;
  currentLap: number;
  currentTire: TireCompound;
  tireAge: number;
  lastLapTime?: number;
  pitStopCount: number;
  pitStopLaps: number[];
  status: 'RUNNING' | 'PIT' | 'OUT' | 'FINISHED';
}

export interface RacePrediction {
  id: string;
  raceName: string;
  raceDate: string;
  savedAt: Date;
  strategy: Strategy;
  simulationResult: SimulationResult;
  driverId?: string;
  teamId?: string;
  raceConfig: RaceConfiguration;
}

export interface LiveComparison {
  prediction: RacePrediction;
  liveData: DriverLiveData;
  deviations: {
    pitStopTiming: number[]; // Difference in pit stop laps (predicted - actual)
    tireChoice: { lap: number; predicted: TireCompound; actual: TireCompound }[];
    lapTimeDelta: number; // Average difference (predicted - actual)
  };
  accuracy: {
    pitStopAccuracy: number; // 0-100%
    tireChoiceAccuracy: number; // 0-100%
    timeAccuracy: number; // 0-100%
  };
}
