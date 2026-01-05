/**
 * Circuit-specific data for F1 2025 season
 * Provides detailed information for each circuit
 */

export interface CircuitInfo {
  fullName: string;
  location: string;
  country: string;
  lapCount: number;
  baseLapTime: number; // seconds
  pitLaneTimeLoss: number; // seconds
  weather: string;
  temperature: string;
  circuitType: string;
  characteristics: string[];
  tireWear: 'Low' | 'Medium' | 'High';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
}

export const CIRCUIT_DATA: Record<string, CircuitInfo> = {
  'Australian Grand Prix': {
    fullName: 'Albert Park Circuit',
    location: 'Melbourne',
    country: 'Australia',
    lapCount: 58,
    baseLapTime: 80.0,
    pitLaneTimeLoss: 19.0,
    weather: 'Variable',
    temperature: 'Mild',
    circuitType: 'Street-Circuit',
    characteristics: ['Medium-Speed', 'Stop-Start', 'Bumpy Surface'],
    tireWear: 'Medium',
    difficulty: 'Medium',
  },

  'Chinese Grand Prix': {
    fullName: 'Shanghai International Circuit',
    location: 'Shanghai',
    country: 'China',
    lapCount: 56,
    baseLapTime: 93.0,
    pitLaneTimeLoss: 22.5,
    weather: 'Variable',
    temperature: 'Cool to Warm',
    circuitType: 'Permanent',
    characteristics: ['Long Straights', 'Technical Sectors', 'Mixed Speed'],
    tireWear: 'Medium',
    difficulty: 'Medium',
  },

  'Japanese Grand Prix': {
    fullName: 'Suzuka International Racing Course',
    location: 'Suzuka',
    country: 'Japan',
    lapCount: 53,
    baseLapTime: 88.0,
    pitLaneTimeLoss: 20.5,
    weather: 'Often Wet',
    temperature: 'Cool',
    circuitType: 'Permanent',
    characteristics: ['Figure-8 Layout', 'High-Speed Corners', 'Technical'],
    tireWear: 'High',
    difficulty: 'Very Hard',
  },

  'Bahrain Grand Prix': {
    fullName: 'Bahrain International Circuit',
    location: 'Sakhir',
    country: 'Bahrain',
    lapCount: 57,
    baseLapTime: 90.0,
    pitLaneTimeLoss: 22.0,
    weather: 'Clear & Dry',
    temperature: 'Hot',
    circuitType: 'Permanent',
    characteristics: ['Desert Circuit', 'High-Speed Layout', 'Abrasive Surface'],
    tireWear: 'High',
    difficulty: 'Medium',
  },

  'Saudi Arabian Grand Prix': {
    fullName: 'Jeddah Corniche Circuit',
    location: 'Jeddah',
    country: 'Saudi Arabia',
    lapCount: 50,
    baseLapTime: 90.0,
    pitLaneTimeLoss: 24.0,
    weather: 'Clear & Dry',
    temperature: 'Hot',
    circuitType: 'Street-Circuit',
    characteristics: ['Ultra High-Speed', 'Narrow Walls', 'Night Race'],
    tireWear: 'Low',
    difficulty: 'Hard',
  },

  'Miami Grand Prix': {
    fullName: 'Miami International Autodrome',
    location: 'Miami',
    country: 'USA',
    lapCount: 57,
    baseLapTime: 89.0,
    pitLaneTimeLoss: 21.0,
    weather: 'Hot & Humid',
    temperature: 'Very Hot',
    circuitType: 'Street-Circuit',
    characteristics: ['Stadium Section', 'High-Speed', 'Bumpy'],
    tireWear: 'High',
    difficulty: 'Medium',
  },

  'Emilia Romagna Grand Prix': {
    fullName: 'Autodromo Enzo e Dino Ferrari',
    location: 'Imola',
    country: 'Italy',
    lapCount: 63,
    baseLapTime: 77.0,
    pitLaneTimeLoss: 18.5,
    weather: 'Variable',
    temperature: 'Mild',
    circuitType: 'Permanent',
    characteristics: ['Old-School', 'Flowing', 'Technical'],
    tireWear: 'Medium',
    difficulty: 'Hard',
  },

  'Monaco Grand Prix': {
    fullName: 'Circuit de Monaco',
    location: 'Monte Carlo',
    country: 'Monaco',
    lapCount: 78,
    baseLapTime: 72.5,
    pitLaneTimeLoss: 15.0,
    weather: 'Usually Dry',
    temperature: 'Warm',
    circuitType: 'Street-Circuit',
    characteristics: ['Narrow & Twisty', 'Barriers Everywhere', 'Slow Speed'],
    tireWear: 'Low',
    difficulty: 'Very Hard',
  },

  'Spanish Grand Prix': {
    fullName: 'Circuit de Barcelona-Catalunya',
    location: 'Barcelona',
    country: 'Spain',
    lapCount: 66,
    baseLapTime: 78.0,
    pitLaneTimeLoss: 19.5,
    weather: 'Usually Dry',
    temperature: 'Hot',
    circuitType: 'Permanent',
    characteristics: ['Comprehensive Test', 'Mixed Speed', 'Technical'],
    tireWear: 'High',
    difficulty: 'Medium',
  },

  'Canadian Grand Prix': {
    fullName: 'Circuit Gilles Villeneuve',
    location: 'Montreal',
    country: 'Canada',
    lapCount: 70,
    baseLapTime: 73.0,
    pitLaneTimeLoss: 18.0,
    weather: 'Variable',
    temperature: 'Cool to Warm',
    circuitType: 'Semi-Street',
    characteristics: ['High-Speed', 'Heavy Braking', 'Wall of Champions'],
    tireWear: 'Medium',
    difficulty: 'Medium',
  },

  'Austrian Grand Prix': {
    fullName: 'Red Bull Ring',
    location: 'Spielberg',
    country: 'Austria',
    lapCount: 71,
    baseLapTime: 66.0,
    pitLaneTimeLoss: 17.5,
    weather: 'Variable',
    temperature: 'Cool to Warm',
    circuitType: 'Permanent',
    characteristics: ['Short & Fast', 'Elevation Changes', 'High-Speed'],
    tireWear: 'Medium',
    difficulty: 'Easy',
  },

  'British Grand Prix': {
    fullName: 'Silverstone Circuit',
    location: 'Silverstone',
    country: 'United Kingdom',
    lapCount: 52,
    baseLapTime: 87.0,
    pitLaneTimeLoss: 20.0,
    weather: 'Often Wet',
    temperature: 'Cool',
    circuitType: 'Permanent',
    characteristics: ['High-Speed Corners', 'Flowing', 'Historic'],
    tireWear: 'High',
    difficulty: 'Hard',
  },

  'Belgian Grand Prix': {
    fullName: 'Circuit de Spa-Francorchamps',
    location: 'Spa',
    country: 'Belgium',
    lapCount: 44,
    baseLapTime: 106.0,
    pitLaneTimeLoss: 21.0,
    weather: 'Very Variable',
    temperature: 'Cool',
    circuitType: 'Permanent',
    characteristics: ['Longest Track', 'Elevation Changes', 'High-Speed'],
    tireWear: 'Medium',
    difficulty: 'Hard',
  },

  'Hungarian Grand Prix': {
    fullName: 'Hungaroring',
    location: 'Budapest',
    country: 'Hungary',
    lapCount: 70,
    baseLapTime: 77.0,
    pitLaneTimeLoss: 17.0,
    weather: 'Hot & Dry',
    temperature: 'Very Hot',
    circuitType: 'Permanent',
    characteristics: ['Twisty', 'Low-Speed', 'Hard to Overtake'],
    tireWear: 'High',
    difficulty: 'Medium',
  },

  'Dutch Grand Prix': {
    fullName: 'Circuit Zandvoort',
    location: 'Zandvoort',
    country: 'Netherlands',
    lapCount: 72,
    baseLapTime: 71.0,
    pitLaneTimeLoss: 16.5,
    weather: 'Variable',
    temperature: 'Cool to Mild',
    circuitType: 'Permanent',
    characteristics: ['Banked Corners', 'Coastal', 'Technical'],
    tireWear: 'Medium',
    difficulty: 'Hard',
  },

  'Italian Grand Prix': {
    fullName: 'Autodromo Nazionale di Monza',
    location: 'Monza',
    country: 'Italy',
    lapCount: 53,
    baseLapTime: 81.0,
    pitLaneTimeLoss: 21.5,
    weather: 'Usually Dry',
    temperature: 'Warm',
    circuitType: 'Permanent',
    characteristics: ['Fastest Track', 'Low Downforce', 'Temple of Speed'],
    tireWear: 'Low',
    difficulty: 'Medium',
  },

  'Azerbaijan Grand Prix': {
    fullName: 'Baku City Circuit',
    location: 'Baku',
    country: 'Azerbaijan',
    lapCount: 51,
    baseLapTime: 103.0,
    pitLaneTimeLoss: 23.5,
    weather: 'Windy',
    temperature: 'Warm',
    circuitType: 'Street-Circuit',
    characteristics: ['Long Straight', 'Tight Castle Section', 'High-Speed'],
    tireWear: 'Medium',
    difficulty: 'Hard',
  },

  'Singapore Grand Prix': {
    fullName: 'Marina Bay Street Circuit',
    location: 'Singapore',
    country: 'Singapore',
    lapCount: 62,
    baseLapTime: 97.0,
    pitLaneTimeLoss: 22.0,
    weather: 'Hot & Humid',
    temperature: 'Very Hot',
    circuitType: 'Street-Circuit',
    characteristics: ['Night Race', 'Bumpy', 'Physical Demands'],
    tireWear: 'Medium',
    difficulty: 'Very Hard',
  },

  'United States Grand Prix': {
    fullName: 'Circuit of The Americas',
    location: 'Austin',
    country: 'USA',
    lapCount: 56,
    baseLapTime: 95.0,
    pitLaneTimeLoss: 23.0,
    weather: 'Variable',
    temperature: 'Warm',
    circuitType: 'Permanent',
    characteristics: ['Inspired by Best Corners', 'Elevation Changes', 'Mixed'],
    tireWear: 'High',
    difficulty: 'Medium',
  },

  'Mexico City Grand Prix': {
    fullName: 'Autódromo Hermanos Rodríguez',
    location: 'Mexico City',
    country: 'Mexico',
    lapCount: 71,
    baseLapTime: 77.0,
    pitLaneTimeLoss: 19.5,
    weather: 'Usually Dry',
    temperature: 'Mild',
    circuitType: 'Permanent',
    characteristics: ['High Altitude', 'Stadium Section', 'Low Grip'],
    tireWear: 'Medium',
    difficulty: 'Medium',
  },

  'São Paulo Grand Prix': {
    fullName: 'Autódromo José Carlos Pace',
    location: 'São Paulo',
    country: 'Brazil',
    lapCount: 71,
    baseLapTime: 70.0,
    pitLaneTimeLoss: 18.5,
    weather: 'Very Variable',
    temperature: 'Warm',
    circuitType: 'Permanent',
    characteristics: ['Counter-Clockwise', 'Elevation Changes', 'Unpredictable'],
    tireWear: 'Medium',
    difficulty: 'Hard',
  },

  'Las Vegas Grand Prix': {
    fullName: 'Las Vegas Street Circuit',
    location: 'Las Vegas',
    country: 'USA',
    lapCount: 50,
    baseLapTime: 96.0,
    pitLaneTimeLoss: 22.5,
    weather: 'Clear & Cold',
    temperature: 'Cold at Night',
    circuitType: 'Street-Circuit',
    characteristics: ['Night Race', 'Long Straights', 'Very Fast'],
    tireWear: 'Low',
    difficulty: 'Medium',
  },

  'Qatar Grand Prix': {
    fullName: 'Lusail International Circuit',
    location: 'Lusail',
    country: 'Qatar',
    lapCount: 57,
    baseLapTime: 82.0,
    pitLaneTimeLoss: 21.5,
    weather: 'Clear & Dry',
    temperature: 'Hot',
    circuitType: 'Permanent',
    characteristics: ['Fast Corners', 'Demanding', 'Night Race'],
    tireWear: 'High',
    difficulty: 'Hard',
  },

  'Abu Dhabi Grand Prix': {
    fullName: 'Yas Marina Circuit',
    location: 'Abu Dhabi',
    country: 'UAE',
    lapCount: 58,
    baseLapTime: 87.0,
    pitLaneTimeLoss: 25.0,
    weather: 'Clear & Dry',
    temperature: 'Hot',
    circuitType: 'Permanent',
    characteristics: ['Twilight Race', 'Marina Setting', 'Mixed Speed'],
    tireWear: 'Medium',
    difficulty: 'Medium',
  },
};

/**
 * Get circuit information for a specific race
 */
export function getCircuitInfo(raceName: string): CircuitInfo | null {
  return CIRCUIT_DATA[raceName] || null;
}

/**
 * Format lap time from seconds to MM:SS.SSS
 */
export function formatLapTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toFixed(3).padStart(6, '0')}`;
}

/**
 * Get weather emoji based on weather description
 */
export function getWeatherEmoji(weather: string): string {
  if (weather.includes('Wet') || weather.includes('Rain')) return '🌧️';
  if (weather.includes('Variable')) return '🌤️';
  if (weather.includes('Clear')) return '☀️';
  if (weather.includes('Humid')) return '💧';
  if (weather.includes('Windy')) return '💨';
  return '🌡️';
}

/**
 * Get circuit type emoji
 */
export function getCircuitTypeEmoji(circuitType: string): string {
  if (circuitType.includes('Street')) return '🏙️';
  if (circuitType.includes('Permanent')) return '🏁';
  return '🛣️';
}
