/**
 * Debug Race Simulation - Verify Tire Model Application
 *
 * This script checks:
 * 1. Tire degradation factor is applied correctly
 * 2. Fuel effect is ~0.03s per lap improvement
 * 3. Warm-up penalties (laps 1-3) are showing
 * 4. Quadratic degradation kicks in after lap 13
 * 5. U-shaped pattern appears (not continuously faster)
 */

import { TIRE_COMPOUNDS, calculateTirePerformance, getTireTimePenalty, createTireState, ageTire } from './lib/tireModel';
import { calculateFuelEffect, getCurrentFuelLoad } from './lib/lapTimeCalculator';
import { TireState } from './lib/types';

// Configuration matching Bahrain GP
const BASE_LAP_TIME = 90.0; // seconds (1:30.000)
const FUEL_EFFECT_PER_KG = 0.025; // seconds per kg
const STARTING_FUEL = 110; // kg
const FUEL_PER_LAP = 1.9; // kg per lap
const STINT_LENGTH = 20; // laps

console.log('🔍 RACE SIMULATION DEBUG - MEDIUM TIRE STINT');
console.log('='.repeat(80));
console.log('');

console.log('📋 Configuration:');
console.log(`   Base Lap Time: ${BASE_LAP_TIME}s (1:30.000)`);
console.log(`   Fuel Effect: ${FUEL_EFFECT_PER_KG}s per kg`);
console.log(`   Starting Fuel: ${STARTING_FUEL}kg`);
console.log(`   Fuel Per Lap: ${FUEL_PER_LAP}kg`);
console.log(`   Stint Length: ${STINT_LENGTH} laps`);
console.log(`   Tire Compound: MEDIUM`);
console.log('');

// Get MEDIUM tire compound data
const mediumCompound = TIRE_COMPOUNDS.MEDIUM;
console.log('🛞 MEDIUM Tire Specifications:');
console.log(`   Base Grip Level: ${mediumCompound.baseGripLevel}`);
console.log(`   Degradation Rate: ${mediumCompound.degradationRate} (${(mediumCompound.degradationRate * 100).toFixed(3)}% per lap)`);
console.log(`   Optimal Lap Range: ${mediumCompound.optimalLapRange[0]}-${mediumCompound.optimalLapRange[1]} laps`);
console.log('');

console.log('📊 LAP-BY-LAP BREAKDOWN:');
console.log('='.repeat(80));
console.log('');

// Header
console.log('Lap | Age | Fuel   | Base  | Tire Pen | Fuel Pen | Total  | Δ Fast | Phase');
console.log('-'.repeat(80));

let tireState: TireState = createTireState('MEDIUM', 0);
const lapTimes: number[] = [];
let fastestLapTime = Infinity;
let fastestLapNumber = 0;

// Simulate each lap
for (let lap = 1; lap <= STINT_LENGTH; lap++) {
  const tireAge = lap - 1; // Age at start of lap

  // Calculate fuel load at this lap
  const fuelLoad = getCurrentFuelLoad(lap, STARTING_FUEL, FUEL_PER_LAP);

  // Calculate tire penalty (includes warm-up, linear, and quadratic degradation)
  const tirePenalty = getTireTimePenalty(BASE_LAP_TIME, tireState);

  // Calculate fuel penalty
  const fuelPenalty = calculateFuelEffect(fuelLoad, FUEL_EFFECT_PER_KG);

  // Calculate total lap time
  const totalLapTime = BASE_LAP_TIME + tirePenalty + fuelPenalty;
  lapTimes.push(totalLapTime);

  // Track fastest lap
  if (totalLapTime < fastestLapTime) {
    fastestLapTime = totalLapTime;
    fastestLapNumber = lap;
  }

  // Determine phase
  let phase = '';
  if (lap <= 3) {
    phase = 'Warm-up';
  } else if (lap <= 12) {
    phase = 'Sweet spot';
  } else {
    phase = 'Degrading';
  }

  // Format time as M:SS.sss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toFixed(3).padStart(6, '0')}`;
  };

  // Calculate delta from fastest
  const deltaFromFastest = totalLapTime - fastestLapTime;
  const deltaStr = lap === fastestLapNumber ? 'FASTEST' : `+${deltaFromFastest.toFixed(3)}s`;

  // Print lap data
  console.log(
    `${lap.toString().padStart(3)} | ` +
    `${tireAge.toString().padStart(3)} | ` +
    `${fuelLoad.toFixed(1).padStart(6)} | ` +
    `${BASE_LAP_TIME.toFixed(3)} | ` +
    `${tirePenalty.toFixed(3).padStart(8)} | ` +
    `${fuelPenalty.toFixed(3).padStart(8)} | ` +
    `${formatTime(totalLapTime)} | ` +
    `${deltaStr.padStart(10)} | ` +
    `${phase}`
  );

  // Age tire for next lap
  tireState = ageTire(tireState);
}

console.log('');
console.log('='.repeat(80));
console.log('');

// Calculate detailed degradation components for analysis
console.log('🔬 DEGRADATION COMPONENT ANALYSIS:');
console.log('='.repeat(80));
console.log('');

const analyzeLaps = [0, 3, 9, 14, 19]; // Lap 1, 4, 10, 15, 20

console.log('Lap | Linear Deg | Quadratic Deg | Warm-up Pen | Total Deg Factor');
console.log('-'.repeat(80));

for (const age of analyzeLaps) {
  const lapNumber = age + 1;
  const compound = TIRE_COMPOUNDS.MEDIUM;

  // Calculate each component
  const linearDeg = compound.degradationRate * age;
  const quadraticDeg = compound.degradationRate * 0.4 * Math.pow(age / 15, 2) * age;
  const warmUpPenalty = age < 3 ? (3 - age) * 0.0005 : 0;
  const totalDegFactor = 1 + linearDeg + quadraticDeg + warmUpPenalty;

  console.log(
    `${lapNumber.toString().padStart(3)} | ` +
    `${(linearDeg * 100).toFixed(4)}%    | ` +
    `${(quadraticDeg * 100).toFixed(4)}%      | ` +
    `${(warmUpPenalty * 100).toFixed(4)}%   | ` +
    `${totalDegFactor.toFixed(6)}`
  );
}

console.log('');
console.log('='.repeat(80));
console.log('');

// Phase analysis
console.log('📈 PHASE ANALYSIS:');
console.log('='.repeat(80));
console.log('');

const warmUpLaps = lapTimes.slice(0, 3);
const sweetSpotLaps = lapTimes.slice(3, 12);
const degradingLaps = lapTimes.slice(12, 20);

const avgWarmUp = warmUpLaps.reduce((a, b) => a + b, 0) / warmUpLaps.length;
const avgSweetSpot = sweetSpotLaps.reduce((a, b) => a + b, 0) / sweetSpotLaps.length;
const avgDegrading = degradingLaps.reduce((a, b) => a + b, 0) / degradingLaps.length;

console.log(`Laps 1-3 (Warm-up):     ${avgWarmUp.toFixed(3)}s avg`);
console.log(`Laps 4-12 (Sweet spot): ${avgSweetSpot.toFixed(3)}s avg ← Should be FASTEST`);
console.log(`Laps 13-20 (Degrading): ${avgDegrading.toFixed(3)}s avg`);
console.log('');

console.log(`Fastest Lap: Lap ${fastestLapNumber} (${fastestLapTime.toFixed(3)}s)`);
console.log(`Slowest Lap: Lap ${STINT_LENGTH} (${lapTimes[lapTimes.length - 1].toFixed(3)}s)`);
console.log(`Stint Spread: ${(lapTimes[lapTimes.length - 1] - fastestLapTime).toFixed(3)}s`);
console.log('');

// Fuel effect analysis
console.log('⛽ FUEL EFFECT ANALYSIS:');
console.log('='.repeat(80));
console.log('');

const fuelLap1 = getCurrentFuelLoad(1, STARTING_FUEL, FUEL_PER_LAP);
const fuelLap10 = getCurrentFuelLoad(10, STARTING_FUEL, FUEL_PER_LAP);
const fuelLap20 = getCurrentFuelLoad(20, STARTING_FUEL, FUEL_PER_LAP);

const fuelPenLap1 = calculateFuelEffect(fuelLap1, FUEL_EFFECT_PER_KG);
const fuelPenLap10 = calculateFuelEffect(fuelLap10, FUEL_EFFECT_PER_KG);
const fuelPenLap20 = calculateFuelEffect(fuelLap20, FUEL_EFFECT_PER_KG);

console.log(`Lap 1:  ${fuelLap1.toFixed(1)}kg fuel → ${fuelPenLap1.toFixed(3)}s penalty`);
console.log(`Lap 10: ${fuelLap10.toFixed(1)}kg fuel → ${fuelPenLap10.toFixed(3)}s penalty`);
console.log(`Lap 20: ${fuelLap20.toFixed(1)}kg fuel → ${fuelPenLap20.toFixed(3)}s penalty`);
console.log('');

const fuelBenefit1to10 = fuelPenLap1 - fuelPenLap10;
const fuelBenefit1to20 = fuelPenLap1 - fuelPenLap20;
const fuelBenefitPerLap = fuelBenefit1to20 / 19;

console.log(`Fuel benefit (Lap 1 → 10): ${fuelBenefit1to10.toFixed(3)}s (${(fuelBenefit1to10 / 9).toFixed(3)}s/lap)`);
console.log(`Fuel benefit (Lap 1 → 20): ${fuelBenefit1to20.toFixed(3)}s (${fuelBenefitPerLap.toFixed(3)}s/lap)`);
console.log(`Expected: ~0.047s per lap (1.9kg × 0.025s/kg)`);
console.log('');

// U-shaped pattern check
console.log('✅ U-SHAPED PATTERN VERIFICATION:');
console.log('='.repeat(80));
console.log('');

const lap1Time = lapTimes[0];
const lap4Time = lapTimes[3];
const lap10Time = lapTimes[9];
const lap20Time = lapTimes[19];

const pattern = {
  warmUpSlower: avgWarmUp > avgSweetSpot,
  sweetSpotFastest: avgSweetSpot < avgDegrading,
  degradingSlower: avgDegrading > avgSweetSpot,
  notContinuouslyImproving: lap20Time > lap10Time && lap10Time > lap4Time,
};

console.log(`✓ Warm-up phase slower than sweet spot: ${pattern.warmUpSlower ? '✅ YES' : '❌ NO'}`);
console.log(`✓ Sweet spot fastest phase: ${pattern.sweetSpotFastest ? '✅ YES' : '❌ NO'}`);
console.log(`✓ Degrading phase slower than sweet spot: ${pattern.degradingSlower ? '✅ YES' : '❌ NO'}`);
console.log(`✓ NOT continuously improving: ${pattern.notContinuouslyImproving ? '✅ YES' : '❌ NO'}`);
console.log('');

const uShapeAchieved = Object.values(pattern).every(v => v);
console.log(`🎯 U-SHAPED PATTERN: ${uShapeAchieved ? '✅ ACHIEVED' : '❌ NOT ACHIEVED'}`);
console.log('');

// Base lap time verification
console.log('🏁 BASE LAP TIME VERIFICATION:');
console.log('='.repeat(80));
console.log('');

console.log(`Base lap time used: ${BASE_LAP_TIME}s (1:30.000)`);
console.log(`Expected range: 1:30 - 1:35 (90s - 95s)`);
console.log(`Status: ${BASE_LAP_TIME >= 90 && BASE_LAP_TIME <= 95 ? '✅ REALISTIC' : '❌ UNREALISTIC'}`);
console.log('');

console.log('Note: Base lap times for each circuit are defined in lib/raceData.ts');
