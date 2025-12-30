/**
 * 2025 F1 Driver and Team Data
 *
 * This file contains the driver roster and team information for the 2025 F1 season.
 * Performance modifiers are adjustable and reflect general competitive hierarchy.
 * Easy to update for 2026 season changes.
 */

export interface Driver {
  id: string;
  number: number;
  firstName: string;
  lastName: string;
  fullName: string;
  teamId: string;
  // Driver-specific performance factors
  tireManagementSkill: number; // 0-10 scale, affects tire degradation (higher = better)
  consistency: number; // 0-10 scale, affects lap time variance
}

export interface Team {
  id: string;
  name: string;
  fullName: string;
  color: string; // Primary team color (hex)
  colorSecondary?: string; // Secondary team color (hex)
  // Team performance factors
  carPerformance: number; // -1.0 to +1.0 seconds per lap modifier
  reliability: number; // 0-10 scale (not used yet, but available for future)
  pitCrewSpeed: number; // -0.5 to +0.5 seconds modifier on pit stops
}

/**
 * 2025 F1 Teams
 * Performance modifiers based on 2024 season results and 2025 pre-season testing
 */
export const F1_TEAMS_2025: Record<string, Team> = {
  mclaren: {
    id: 'mclaren',
    name: 'McLaren',
    fullName: 'McLaren F1 Team',
    color: '#FF8000',
    colorSecondary: '#47C7FC',
    carPerformance: -0.15, // Fast car
    reliability: 8,
    pitCrewSpeed: -0.1, // Excellent pit crew
  },
  ferrari: {
    id: 'ferrari',
    name: 'Ferrari',
    fullName: 'Scuderia Ferrari',
    color: '#E8002D',
    colorSecondary: '#FFF200',
    carPerformance: -0.12,
    reliability: 7,
    pitCrewSpeed: -0.05,
  },
  redbull: {
    id: 'redbull',
    name: 'Red Bull',
    fullName: 'Oracle Red Bull Racing',
    color: '#3671C6',
    colorSecondary: '#FF0000',
    carPerformance: -0.10,
    reliability: 9,
    pitCrewSpeed: -0.15, // Best pit crew
  },
  mercedes: {
    id: 'mercedes',
    name: 'Mercedes',
    fullName: 'Mercedes-AMG Petronas F1 Team',
    color: '#27F4D2',
    colorSecondary: '#000000',
    carPerformance: -0.08,
    reliability: 8,
    pitCrewSpeed: -0.08,
  },
  astonmartin: {
    id: 'astonmartin',
    name: 'Aston Martin',
    fullName: 'Aston Martin Aramco F1 Team',
    color: '#229971',
    colorSecondary: '#CEDC00',
    carPerformance: 0.0, // Midfield
    reliability: 7,
    pitCrewSpeed: 0.0,
  },
  alpine: {
    id: 'alpine',
    name: 'Alpine',
    fullName: 'BWT Alpine F1 Team',
    color: '#FF87BC',
    colorSecondary: '#0093CC',
    carPerformance: 0.05,
    reliability: 6,
    pitCrewSpeed: 0.05,
  },
  haas: {
    id: 'haas',
    name: 'Haas',
    fullName: 'MoneyGram Haas F1 Team',
    color: '#B6BABD',
    colorSecondary: '#ED1B24',
    carPerformance: 0.15,
    reliability: 6,
    pitCrewSpeed: 0.10,
  },
  rb: {
    id: 'rb',
    name: 'RB',
    fullName: 'Visa Cash App RB F1 Team',
    color: '#6692FF',
    colorSecondary: '#1E3264',
    carPerformance: 0.10,
    reliability: 7,
    pitCrewSpeed: 0.05,
  },
  williams: {
    id: 'williams',
    name: 'Williams',
    fullName: 'Williams Racing',
    color: '#64C4FF',
    colorSecondary: '#041E42',
    carPerformance: 0.20,
    reliability: 7,
    pitCrewSpeed: 0.10,
  },
  sauber: {
    id: 'sauber',
    name: 'Sauber',
    fullName: 'Stake F1 Team Sauber',
    color: '#52E252',
    colorSecondary: '#000000',
    carPerformance: 0.25,
    reliability: 6,
    pitCrewSpeed: 0.15,
  },
};

/**
 * 2025 F1 Drivers
 */
export const F1_DRIVERS_2025: Driver[] = [
  // McLaren
  {
    id: 'nor',
    number: 4,
    firstName: 'Lando',
    lastName: 'Norris',
    fullName: 'Lando Norris',
    teamId: 'mclaren',
    tireManagementSkill: 8,
    consistency: 8,
  },
  {
    id: 'pia',
    number: 81,
    firstName: 'Oscar',
    lastName: 'Piastri',
    fullName: 'Oscar Piastri',
    teamId: 'mclaren',
    tireManagementSkill: 7,
    consistency: 9,
  },
  // Ferrari
  {
    id: 'lec',
    number: 16,
    firstName: 'Charles',
    lastName: 'Leclerc',
    fullName: 'Charles Leclerc',
    teamId: 'ferrari',
    tireManagementSkill: 7,
    consistency: 7,
  },
  {
    id: 'ham',
    number: 44,
    firstName: 'Lewis',
    lastName: 'Hamilton',
    fullName: 'Lewis Hamilton',
    teamId: 'ferrari',
    tireManagementSkill: 9,
    consistency: 8,
  },
  // Red Bull
  {
    id: 'ver',
    number: 1,
    firstName: 'Max',
    lastName: 'Verstappen',
    fullName: 'Max Verstappen',
    teamId: 'redbull',
    tireManagementSkill: 9,
    consistency: 10,
  },
  {
    id: 'law',
    number: 4,
    firstName: 'Liam',
    lastName: 'Lawson',
    fullName: 'Liam Lawson',
    teamId: 'redbull',
    tireManagementSkill: 6,
    consistency: 7,
  },
  // Mercedes
  {
    id: 'rus',
    number: 63,
    firstName: 'George',
    lastName: 'Russell',
    fullName: 'George Russell',
    teamId: 'mercedes',
    tireManagementSkill: 8,
    consistency: 8,
  },
  {
    id: 'ant',
    number: 12,
    firstName: 'Andrea',
    lastName: 'Kimi Antonelli',
    fullName: 'Andrea Kimi Antonelli',
    teamId: 'mercedes',
    tireManagementSkill: 6,
    consistency: 6,
  },
  // Aston Martin
  {
    id: 'alo',
    number: 14,
    firstName: 'Fernando',
    lastName: 'Alonso',
    fullName: 'Fernando Alonso',
    teamId: 'astonmartin',
    tireManagementSkill: 10,
    consistency: 8,
  },
  {
    id: 'str',
    number: 18,
    firstName: 'Lance',
    lastName: 'Stroll',
    fullName: 'Lance Stroll',
    teamId: 'astonmartin',
    tireManagementSkill: 6,
    consistency: 6,
  },
  // Alpine
  {
    id: 'gas',
    number: 10,
    firstName: 'Pierre',
    lastName: 'Gasly',
    fullName: 'Pierre Gasly',
    teamId: 'alpine',
    tireManagementSkill: 7,
    consistency: 7,
  },
  {
    id: 'doo',
    number: 61,
    firstName: 'Jack',
    lastName: 'Doohan',
    fullName: 'Jack Doohan',
    teamId: 'alpine',
    tireManagementSkill: 6,
    consistency: 6,
  },
  // Haas
  {
    id: 'oco',
    number: 31,
    firstName: 'Esteban',
    lastName: 'Ocon',
    fullName: 'Esteban Ocon',
    teamId: 'haas',
    tireManagementSkill: 7,
    consistency: 7,
  },
  {
    id: 'bea',
    number: 87,
    firstName: 'Oliver',
    lastName: 'Bearman',
    fullName: 'Oliver Bearman',
    teamId: 'haas',
    tireManagementSkill: 6,
    consistency: 6,
  },
  // RB
  {
    id: 'tsu',
    number: 22,
    firstName: 'Yuki',
    lastName: 'Tsunoda',
    fullName: 'Yuki Tsunoda',
    teamId: 'rb',
    tireManagementSkill: 7,
    consistency: 7,
  },
  {
    id: 'had',
    number: 50,
    firstName: 'Isack',
    lastName: 'Hadjar',
    fullName: 'Isack Hadjar',
    teamId: 'rb',
    tireManagementSkill: 6,
    consistency: 6,
  },
  // Williams
  {
    id: 'alb',
    number: 23,
    firstName: 'Alex',
    lastName: 'Albon',
    fullName: 'Alex Albon',
    teamId: 'williams',
    tireManagementSkill: 8,
    consistency: 8,
  },
  {
    id: 'sai',
    number: 55,
    firstName: 'Carlos',
    lastName: 'Sainz',
    fullName: 'Carlos Sainz',
    teamId: 'williams',
    tireManagementSkill: 8,
    consistency: 8,
  },
  // Sauber
  {
    id: 'hul',
    number: 27,
    firstName: 'Nico',
    lastName: 'Hulkenberg',
    fullName: 'Nico Hulkenberg',
    teamId: 'sauber',
    tireManagementSkill: 8,
    consistency: 7,
  },
  {
    id: 'bot',
    number: 77,
    firstName: 'Valtteri',
    lastName: 'Bottas',
    fullName: 'Valtteri Bottas',
    teamId: 'sauber',
    tireManagementSkill: 8,
    consistency: 8,
  },
];

/**
 * Helper function to get driver by ID
 */
export function getDriverById(driverId: string): Driver | undefined {
  return F1_DRIVERS_2025.find(d => d.id === driverId);
}

/**
 * Helper function to get team by ID
 */
export function getTeamById(teamId: string): Team | undefined {
  return F1_TEAMS_2025[teamId];
}

/**
 * Helper function to get drivers by team
 */
export function getDriversByTeam(teamId: string): Driver[] {
  return F1_DRIVERS_2025.filter(d => d.teamId === teamId);
}

/**
 * Helper function to get all teams as array
 */
export function getAllTeams(): Team[] {
  return Object.values(F1_TEAMS_2025);
}

/**
 * Helper function to calculate tire degradation modifier based on driver skill
 * @param tireManagementSkill - Driver's tire management skill (0-10)
 * @returns Multiplier for tire degradation rate (0.9 = 10% slower degradation)
 */
export function getTireDegradationModifier(tireManagementSkill: number): number {
  // Scale: 0 skill = 1.1x degradation, 5 skill = 1.0x, 10 skill = 0.9x
  return 1.1 - (tireManagementSkill * 0.02);
}

/**
 * Helper function to calculate lap time modifier based on team/driver performance
 * @param driver - The driver
 * @param team - The team
 * @returns Lap time modifier in seconds (negative = faster)
 */
export function getPerformanceModifier(driver: Driver, team: Team): number {
  // Team car performance is the main factor
  const teamModifier = team.carPerformance;

  // Driver consistency affects variance, not base speed
  // This is a simple implementation - could be expanded
  return teamModifier;
}
