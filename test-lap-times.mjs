/**
 * Quick test to verify lap times are realistic after fixing tire degradation
 */

import { simulateRace } from './lib/raceSimulator.js';
import { formatLapTime, formatRaceTime } from './lib/lapTimeCalculator.js';
import { getPitLaneTimeLoss } from './lib/pitStopModel.js';

// Bahrain Grand Prix - One-stop strategy test
const bahrainOneStop = {
  name: 'One-Stop: Soft → Hard',
  pitStops: [{ lap: 28, tireCompound: 'HARD' }],
  startingCompound: 'SOFT',
};

const bahrainConfig = {
  trackName: 'Bahrain Grand Prix',
  baseLapTime: 90.0, // 1:30.000
  totalLaps: 57,
  pitLaneTimeLoss: getPitLaneTimeLoss('Bahrain Grand Prix'),
  pitStopStationary: 2.2,
  startingFuelLoad: 110,
  fuelPerLap: 1.9,
  fuelEffect: 0.035,
};

console.log('🏎️  Testing Bahrain Grand Prix Simulation');
console.log('==========================================\n');

const result = simulateRace(bahrainOneStop, bahrainConfig);

console.log(`Strategy: ${result.strategy.name}`);
console.log(`Total Laps: ${bahrainConfig.totalLaps}`);
console.log(`Pit Stops: ${result.pitStops.length}\n`);

console.log('📊 Race Results:');
console.log(`Total Race Time: ${formatRaceTime(result.totalRaceTime)}`);
console.log(`Average Lap Time: ${formatLapTime(result.averageLapTime)}`);
console.log(`Fastest Lap: ${formatLapTime(result.fastestLap)}`);
console.log(`Slowest Lap: ${formatLapTime(result.slowestLap)}\n`);

// Show sample laps
console.log('🔍 Sample Laps:');
const sampleLaps = [1, 10, 20, 28, 35, 45, 57];
sampleLaps.forEach(lapNum => {
  const lap = result.laps[lapNum - 1];
  if (lap) {
    const marker = lap.isPitLap ? '🔧' : '  ';
    console.log(`${marker} Lap ${lap.lapNumber.toString().padStart(2)}: ${formatLapTime(lap.lapTime)} - ${lap.tireCompound} (age ${lap.tireAge})`);
  }
});

console.log('\n✅ Expected lap times for Bahrain:');
console.log('   Race pace: 1:32-1:34 (with fuel and tire deg)');
console.log('   Fastest lap: 1:30-1:32 (light fuel, fresh tires)');
console.log('   Total race time: ~1:30:00 - 1:32:00 for 57 laps');
