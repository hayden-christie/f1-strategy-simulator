/**
 * F1 Strategy Simulator - Main Export
 *
 * A comprehensive F1 race strategy simulation engine featuring:
 * - Realistic tire degradation models (Soft, Medium, Hard compounds)
 * - Lap time calculations with tire age and fuel load effects
 * - Pit stop timing and strategy optimization
 * - Full race simulation with multiple strategy comparisons
 */

// Type definitions
export * from './types';

// Tire degradation model
export {
  TIRE_COMPOUNDS,
  calculateTirePerformance,
  calculateTireDegradation,
  getTireTimePenalty,
  createTireState,
  ageTire,
  getRecommendedStintLength,
  compareTireCompounds,
  getWeatherTireMultiplier,
  isTireSuitableForWeather,
} from './tireModel';

// Lap time calculator
export {
  calculateFuelEffect,
  getCurrentFuelLoad,
  calculateLapTime,
  calculateRaceLapTime,
  estimateTireCompoundDelta,
  calculatePitStopTimeLoss,
  formatLapTime,
  formatRaceTime,
  formatTimeDelta,
  getTimeDeltaColor,
  calculateAverageLapTime,
  findFastestLap,
  findSlowestLap,
} from './lapTimeCalculator';

// Pit stop model
export {
  DEFAULT_PIT_STOP_CONFIG,
  TRACK_PIT_LANE_TIME_LOSS,
  calculatePitStopTime,
  getPitLaneTimeLoss,
  generateStationaryTime,
  simulatePitStop,
  createPitStop,
  calculatePitWindow,
  isPitStopRequired,
  calculatePitStopCostBenefit,
  getRecommendedStrategies,
} from './pitStopModel';

// Race simulator
export {
  simulateRace,
  compareStrategies,
  createDefaultRaceConfig,
  createStrategyTemplates,
  optimizeStrategy,
  getSimulationSummary,
  exportSimulationResults,
} from './raceSimulator';

// Advanced race simulator
export {
  simulateAdvancedRace,
  createDefaultAdvancedConfig,
  generateRandomSafetyCarPeriod,
  generateRandomWeatherChanges,
} from './advancedSimulator';

// Driver and team data
export {
  F1_DRIVERS_2025,
  F1_TEAMS_2025,
  getDriverById,
  getTeamById,
  getDriversByTeam,
  getAllTeams,
  getTireDegradationModifier,
  getPerformanceModifier,
} from './driverTeamData';
export type { Driver, Team } from './driverTeamData';

// Prediction management
export {
  savePrediction,
  getAllPredictions,
  getPrediction,
  deletePrediction,
  clearAllPredictions,
  generatePredictionId,
} from './predictionManager';

// Live timing API
export {
  fetchLiveRaceState,
  fetchDriverLiveData,
  subscribeLiveRaceUpdates,
  generateMockLiveData,
  isLiveTimingAvailable,
} from './liveTimingApi';

// Live race tracking types
export type {
  RaceMode,
  LiveRaceState,
  DriverLiveData,
  RacePrediction,
  LiveComparison,
} from './types';

// Demo data for testing
export {
  DEMO_BAHRAIN_PREDICTION,
  DEMO_BAHRAIN_ACTUAL,
  generateDemoComparison,
  hasDemoData,
  getDemoComparison,
} from './demoData';
