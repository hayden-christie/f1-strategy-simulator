/**
 * Types for F1 Season Data (from f1_season_data.json)
 */

export interface F1Race {
  round: number;
  name: string;
  country: string;
  location: string;
  circuit: string;
  date: string;
  format: string;
  sessions: {
    practice1?: string;
    practice2?: string;
    practice3?: string;
    qualifying?: string;
    race?: string;
  };
}

export interface F1Driver {
  number: number;
  code: string;
  firstName: string;
  lastName: string;
  fullName: string;
  team: string;
  teamColor: string;
}

export interface F1Team {
  name: string;
  color: string;
  drivers: string[];
}

export interface F1Circuit {
  name: string;
  location: string;
  country: string;
}

export interface F1SeasonData {
  year: number;
  races: F1Race[];
  drivers: Record<string, F1Driver>;
  teams: Record<string, F1Team>;
  circuits: Record<string, F1Circuit>;
}
