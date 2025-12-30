/**
 * 2025 F1 Race Data
 * Lap counts and base lap times for each circuit
 */

export interface RaceData {
  lapCount: number;
  baseLapTime: number; // seconds
}

/**
 * Official 2025 F1 Race Lap Counts and Base Lap Times
 * Based on FIA race distance regulations (305km except Monaco at 260km)
 */
export const RACE_DATA: Record<string, RaceData> = {
  // Round 1
  'Australian Grand Prix': {
    lapCount: 58,
    baseLapTime: 80.0, // ~1:20.000
  },

  // Round 2
  'Chinese Grand Prix': {
    lapCount: 56,
    baseLapTime: 93.0, // ~1:33.000
  },

  // Round 3
  'Japanese Grand Prix': {
    lapCount: 53,
    baseLapTime: 88.0, // ~1:28.000
  },

  // Round 4
  'Bahrain Grand Prix': {
    lapCount: 57,
    baseLapTime: 90.0, // ~1:30.000
  },

  // Round 5
  'Saudi Arabian Grand Prix': {
    lapCount: 50,
    baseLapTime: 90.0, // ~1:30.000
  },

  // Round 6
  'Miami Grand Prix': {
    lapCount: 57,
    baseLapTime: 89.0, // ~1:29.000
  },

  // Round 7
  'Emilia Romagna Grand Prix': {
    lapCount: 63,
    baseLapTime: 77.0, // ~1:17.000
  },

  // Round 8
  'Monaco Grand Prix': {
    lapCount: 78,
    baseLapTime: 72.5, // ~1:12.500
  },

  // Round 9
  'Spanish Grand Prix': {
    lapCount: 66,
    baseLapTime: 78.0, // ~1:18.000
  },

  // Round 10
  'Canadian Grand Prix': {
    lapCount: 70,
    baseLapTime: 73.0, // ~1:13.000
  },

  // Round 11
  'Austrian Grand Prix': {
    lapCount: 71,
    baseLapTime: 66.0, // ~1:06.000
  },

  // Round 12
  'British Grand Prix': {
    lapCount: 52,
    baseLapTime: 87.0, // ~1:27.000
  },

  // Round 13
  'Belgian Grand Prix': {
    lapCount: 44,
    baseLapTime: 106.0, // ~1:46.000
  },

  // Round 14
  'Hungarian Grand Prix': {
    lapCount: 70,
    baseLapTime: 77.0, // ~1:17.000
  },

  // Round 15
  'Dutch Grand Prix': {
    lapCount: 72,
    baseLapTime: 71.0, // ~1:11.000
  },

  // Round 16
  'Italian Grand Prix': {
    lapCount: 53,
    baseLapTime: 81.0, // ~1:21.000
  },

  // Round 17
  'Azerbaijan Grand Prix': {
    lapCount: 51,
    baseLapTime: 103.0, // ~1:43.000
  },

  // Round 18
  'Singapore Grand Prix': {
    lapCount: 62,
    baseLapTime: 97.0, // ~1:37.000
  },

  // Round 19
  'United States Grand Prix': {
    lapCount: 56,
    baseLapTime: 95.0, // ~1:35.000
  },

  // Round 20
  'Mexico City Grand Prix': {
    lapCount: 71,
    baseLapTime: 77.0, // ~1:17.000
  },

  // Round 21
  'São Paulo Grand Prix': {
    lapCount: 71,
    baseLapTime: 70.0, // ~1:10.000
  },

  // Round 22
  'Las Vegas Grand Prix': {
    lapCount: 50,
    baseLapTime: 96.0, // ~1:36.000
  },

  // Round 23
  'Qatar Grand Prix': {
    lapCount: 57,
    baseLapTime: 82.0, // ~1:22.000
  },

  // Round 24
  'Abu Dhabi Grand Prix': {
    lapCount: 58,
    baseLapTime: 87.0, // ~1:27.000
  },
};

/**
 * Get race data for a specific race
 */
export function getRaceData(raceName: string): RaceData {
  return RACE_DATA[raceName] || {
    lapCount: 55,
    baseLapTime: 85.0,
  };
}

/**
 * Get total laps for a race
 */
export function getTotalLaps(raceName: string): number {
  return getRaceData(raceName).lapCount;
}

/**
 * Get base lap time for a race
 */
export function getBaseLapTime(raceName: string): number {
  return getRaceData(raceName).baseLapTime;
}
