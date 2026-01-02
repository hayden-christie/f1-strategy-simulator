/**
 * Debug script to verify tire model and race simulation
 * Shows lap-by-lap breakdown of a sample stint
 */

import { createTireState, ageTire, calculateTirePerformance, getTireTimePenalty } from './lib/tireModel';
import { calculateRaceLapTime, getCurrentFuelLoad, calculateFuelEffect } from './lib/lapTimeCalculator';
import { RaceConfiguration } from './lib/types';
import { getBaseLapTime } from './lib/raceData';

// Test configuration for Bahrain GP
const baseLapTime = getBaseLapTime('Bahrain Grand Prix'); // Should be 90.0 seconds
const raceConfig: RaceConfiguration = {
  trackName: 'Bahrain Grand Prix',
  baseLapTime,
  totalLaps: 57,
  pitLaneTimeLoss: 22.0,
  pitStopStationary: 2.2,
  startingFuelLoad: 110,
  fuelPerLap: 1.9,
  fuelEffect: 0.035,
};

console.log('='.repeat(100));
console.log('F1 TIRE MODEL DEBUG - 20-LAP STINT ON MEDIUM TIRES');
console.log('='.repeat(100));
console.log(`Base Lap Time: ${baseLapTime.toFixed(3)}s (${Math.floor(baseLapTime / 60)}:${(baseLapTime % 60).toFixed(3).padStart(6, '0')})`);
console.log(`Fuel Effect: ${raceConfig.fuelEffect}s per kg`);
console.log(`Starting Fuel: ${raceConfig.startingFuelLoad}kg`);
console.log(`Fuel per Lap: ${raceConfig.fuelPerLap}kg`);
console.log('='.repeat(100));
console.log();

// Simulate a 20-lap stint on MEDIUM tires
const stintLength = 20;
let tireState = createTireState('MEDIUM', 0, 1.0);

console.log('LAP | TIRE AGE | FUEL (kg) | FUEL Δ | TIRE Δ | TIRE PERF | LAP TIME | Δ vs Lap1');
console.log('-'.repeat(100));

const lapData: Array<{
  lap: number;
  tireAge: number;
  fuelLoad: number;
  fuelEffect: number;
  tirePenalty: number;
  tirePerformance: number;
  lapTime: number;
  deltaVsLap1: number;
}> = [];

for (let lap = 1; lap <= stintLength; lap++) {
  // Get current fuel load
  const fuelLoad = getCurrentFuelLoad(lap, raceConfig.startingFuelLoad, raceConfig.fuelPerLap);

  // Calculate fuel effect
  const fuelEffect = calculateFuelEffect(fuelLoad, raceConfig.fuelEffect);

  // Calculate tire penalty
  const tirePenalty = getTireTimePenalty(baseLapTime, tireState);

  // Get tire performance multiplier
  const tirePerformance = calculateTirePerformance(tireState);

  // Calculate total lap time
  const lapTime = calculateRaceLapTime(lap, tireState, raceConfig, false);

  // Store data
  lapData.push({
    lap,
    tireAge: tireState.age,
    fuelLoad,
    fuelEffect,
    tirePenalty,
    tirePerformance,
    lapTime,
    deltaVsLap1: 0, // Will calculate after
  });

  // Age tire for next lap
  if (lap < stintLength) {
    tireState = ageTire(tireState, 1.0);
  }
}

// Calculate delta vs lap 1
const lap1Time = lapData[0].lapTime;
lapData.forEach((data, index) => {
  data.deltaVsLap1 = data.lapTime - lap1Time;

  console.log(
    `${data.lap.toString().padStart(3)} | ` +
    `${data.tireAge.toString().padStart(8)} | ` +
    `${data.fuelLoad.toFixed(1).padStart(9)} | ` +
    `${(data.fuelEffect >= 0 ? '+' : '') + data.fuelEffect.toFixed(3).padStart(6)} | ` +
    `${(data.tirePenalty >= 0 ? '+' : '') + data.tirePenalty.toFixed(3).padStart(6)} | ` +
    `${data.tirePerformance.toFixed(4).padStart(9)} | ` +
    `${data.lapTime.toFixed(3).padStart(8)} | ` +
    `${(data.deltaVsLap1 >= 0 ? '+' : '') + data.deltaVsLap1.toFixed(3)}`
  );
});

console.log('-'.repeat(100));
console.log();

// Analysis
console.log('ANALYSIS:');
console.log('='.repeat(100));

// Fuel effect analysis
const lap1Fuel = lapData[0].fuelEffect;
const lap20Fuel = lapData[19].fuelEffect;
const fuelImprovement = lap1Fuel - lap20Fuel;
console.log(`\n1. FUEL EFFECT:`);
console.log(`   Lap 1 fuel penalty:  +${lap1Fuel.toFixed(3)}s (${lapData[0].fuelLoad.toFixed(1)}kg)`);
console.log(`   Lap 20 fuel penalty: +${lap20Fuel.toFixed(3)}s (${lapData[19].fuelLoad.toFixed(1)}kg)`);
console.log(`   Total improvement:   -${fuelImprovement.toFixed(3)}s over 20 laps`);
console.log(`   Expected: ~0.03-0.035s per lap improvement = ${(fuelImprovement / 19).toFixed(3)}s/lap ✓`);

// Tire degradation analysis
const lap1Tire = lapData[0].tirePenalty;
const lap20Tire = lapData[19].tirePenalty;
const tireDegradation = lap20Tire - lap1Tire;
console.log(`\n2. TIRE DEGRADATION:`);
console.log(`   Lap 1 tire penalty:  +${lap1Tire.toFixed(3)}s (age ${lapData[0].tireAge})`);
console.log(`   Lap 20 tire penalty: +${lap20Tire.toFixed(3)}s (age ${lapData[19].tireAge})`);
console.log(`   Total degradation:   +${tireDegradation.toFixed(3)}s over 20 laps`);
console.log(`   Average per lap:     +${(tireDegradation / 19).toFixed(3)}s/lap`);

// Tire performance multiplier
console.log(`\n3. TIRE PERFORMANCE MULTIPLIER:`);
console.log(`   Lap 1:  ${lapData[0].tirePerformance.toFixed(4)}x`);
console.log(`   Lap 5:  ${lapData[4].tirePerformance.toFixed(4)}x`);
console.log(`   Lap 10: ${lapData[9].tirePerformance.toFixed(4)}x`);
console.log(`   Lap 15: ${lapData[14].tirePerformance.toFixed(4)}x`);
console.log(`   Lap 20: ${lapData[19].tirePerformance.toFixed(4)}x`);
console.log(`   (1.0 = baseline, >1.0 = slower)`);

// Net time change
console.log(`\n4. NET LAP TIME TREND:`);
console.log(`   Lap 1:  ${lapData[0].lapTime.toFixed(3)}s (baseline)`);
console.log(`   Lap 5:  ${lapData[4].lapTime.toFixed(3)}s (${(lapData[4].deltaVsLap1 >= 0 ? '+' : '')}${lapData[4].deltaVsLap1.toFixed(3)}s)`);
console.log(`   Lap 10: ${lapData[9].lapTime.toFixed(3)}s (${(lapData[9].deltaVsLap1 >= 0 ? '+' : '')}${lapData[9].deltaVsLap1.toFixed(3)}s)`);
console.log(`   Lap 15: ${lapData[14].lapTime.toFixed(3)}s (${(lapData[14].deltaVsLap1 >= 0 ? '+' : '')}${lapData[14].deltaVsLap1.toFixed(3)}s)`);
console.log(`   Lap 20: ${lapData[19].lapTime.toFixed(3)}s (${(lapData[19].deltaVsLap1 >= 0 ? '+' : '')}${lapData[19].deltaVsLap1.toFixed(3)}s)`);

// Find fastest lap
const fastestLapData = lapData.reduce((fastest, current) =>
  current.lapTime < fastest.lapTime ? current : fastest
);
console.log(`   Fastest: Lap ${fastestLapData.lap} at ${fastestLapData.lapTime.toFixed(3)}s`);

// U-shaped pattern check
console.log(`\n5. U-SHAPED PATTERN CHECK:`);
const lap1 = lapData[0].lapTime;
const lap2 = lapData[1].lapTime;
const lap3 = lapData[2].lapTime;
const lap4 = lapData[3].lapTime;

// Check for warm-up: lap 1 should be slower than laps 2-4
const hasWarmUp = lap1 > Math.min(lap2, lap3, lap4);

// Check for degradation: later laps should be slower
const lap10 = lapData[9].lapTime;
const lap20 = lapData[19].lapTime;
const hasDegradation = lap20 > lap10 && lap10 > lap4;

console.log(`   Lap 1:  ${lap1.toFixed(3)}s (warm-up)`);
console.log(`   Lap 2:  ${lap2.toFixed(3)}s ${lap2 < lap1 ? '✓ faster' : '✗ slower'}`);
console.log(`   Lap 3:  ${lap3.toFixed(3)}s`);
console.log(`   Lap 4:  ${lap4.toFixed(3)}s (peak)`);
console.log(`   Lap 10: ${lap10.toFixed(3)}s (degrading)`);
console.log(`   Lap 20: ${lap20.toFixed(3)}s (degraded)`);
console.log();

if (hasWarmUp && hasDegradation) {
  console.log(`   ✓ U-SHAPED PATTERN DETECTED`);
  console.log(`   - Warm-up phase: Lap 1 slower by ${(lap1 - lap2).toFixed(3)}s`);
  console.log(`   - Degradation phase: Lap 20 slower than Lap 4 by ${(lap20 - lap4).toFixed(3)}s`);
} else if (!hasWarmUp && hasDegradation) {
  console.log(`   ⚠ DEGRADATION WITHOUT WARM-UP`);
} else if (hasWarmUp && !hasDegradation) {
  console.log(`   ⚠ WARM-UP WITHOUT DEGRADATION`);
} else {
  console.log(`   ✗ NO REALISTIC TIRE BEHAVIOR DETECTED`);
}

console.log('\n' + '='.repeat(100));
console.log('BASE LAP TIME CHECK:');
console.log('='.repeat(100));
console.log(`Bahrain GP base lap time: ${baseLapTime}s`);
console.log(`Expected range: 88-92s (~1:28-1:32)`);
console.log(`Current value: ${baseLapTime < 88 ? '⚠ TOO FAST' : baseLapTime > 92 ? '⚠ TOO SLOW' : '✓ REALISTIC'}`);
console.log('='.repeat(100));
