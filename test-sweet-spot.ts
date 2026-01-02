/**
 * Test to verify U-shaped stint pattern with sweet spot
 */

import { simulateRace } from './lib/raceSimulator';
import { formatLapTime } from './lib/lapTimeCalculator';
import { getPitLaneTimeLoss } from './lib/pitStopModel';
import type { Strategy, RaceConfiguration } from './lib/types';

// Test ideal 20-lap Medium tire stint
const mediumTwoStop: Strategy = {
  name: 'Two-Stop: Medium → Medium → Soft',
  pitStops: [
    { lap: 20, tireCompound: 'MEDIUM' },
    { lap: 40, tireCompound: 'SOFT' },
  ],
  startingCompound: 'MEDIUM',
};

const bahrainConfig: RaceConfiguration = {
  trackName: 'Bahrain Grand Prix',
  baseLapTime: 90.0,
  totalLaps: 57,
  pitLaneTimeLoss: getPitLaneTimeLoss('Bahrain Grand Prix'),
  pitStopStationary: 2.2,
  startingFuelLoad: 110,
  fuelPerLap: 1.9,
  fuelEffect: 0.025,
};

console.log('🎯 Testing U-Shaped Stint Pattern (Sweet Spot)');
console.log('===============================================\n');

const result = simulateRace(mediumTwoStop, bahrainConfig);

console.log('📈 FIRST STINT (Medium Tires - Laps 1-19):');
console.log('Expected Pattern: Laps 1-3 slower → Laps 4-12 fastest → Laps 13+ slower\n');

const stint1 = result.laps.slice(0, 19);
let fastestLap = { lapNumber: 0, lapTime: 999 };

stint1.forEach(lap => {
  if (!lap.isPitLap && lap.lapTime < fastestLap.lapTime) {
    fastestLap = { lapNumber: lap.lapNumber, lapTime: lap.lapTime };
  }
});

console.log('Lap | Time      | Δ from Fastest | Phase');
console.log('----------------------------------------------');

[1, 2, 3, 5, 8, 10, 12, 15, 17, 19].forEach(lapNum => {
  const lap = result.laps[lapNum - 1];
  if (lap && !lap.isPitLap) {
    const delta = lap.lapTime - fastestLap.lapTime;
    const isFastest = lap.lapNumber === fastestLap.lapNumber;
    const marker = isFastest ? '⭐' : '  ';
    const deltaStr = isFastest ? '  FASTEST' : `  +${delta.toFixed(3)}s`;

    let phase = '';
    if (lap.lapNumber <= 3) phase = 'Warm-up';
    else if (lap.lapNumber <= 12) phase = 'Sweet spot';
    else phase = 'Degradation';

    console.log(`${marker}${lap.lapNumber.toString().padStart(2)} | ${formatLapTime(lap.lapTime)} | ${deltaStr.padEnd(13)} | ${phase}`);
  }
});

console.log(`\n🎯 Fastest lap: Lap ${fastestLap.lapNumber} (${formatLapTime(fastestLap.lapTime)})`);

// Calculate phases
const warmUp = stint1.slice(0, 3).map(l => l.lapTime);
const sweetSpot = stint1.slice(3, 12).map(l => l.lapTime);
const degrading = stint1.slice(12).filter(l => !l.isPitLap).map(l => l.lapTime);

const warmUpAvg = warmUp.reduce((a, b) => a + b, 0) / warmUp.length;
const sweetSpotAvg = sweetSpot.reduce((a, b) => a + b, 0) / sweetSpot.length;
const degradingAvg = degrading.reduce((a, b) => a + b, 0) / degrading.length;

console.log('\n📊 Phase Analysis:');
console.log(`Laps 1-3 (warm-up):    Avg ${formatLapTime(warmUpAvg)}`);
console.log(`Laps 4-12 (sweet spot): Avg ${formatLapTime(sweetSpotAvg)} ← Should be fastest`);
console.log(`Laps 13-19 (degrading): Avg ${formatLapTime(degradingAvg)}`);

// Check if pattern is correct
const hasWarmUp = warmUpAvg > sweetSpotAvg;
const hasDegradation = degradingAvg > sweetSpotAvg;
const isUShaped = hasWarmUp && hasDegradation;

console.log('\n✅ Pattern Check:');
console.log(`${hasWarmUp ? '✓' : '✗'} Warm-up phase slower than sweet spot`);
console.log(`${hasDegradation ? '✓' : '✗'} Degradation phase slower than sweet spot`);
console.log(`${isUShaped ? '✓' : '✗'} U-shaped pattern achieved`);

if (!isUShaped) {
  console.log('\n⚠️  Pattern is NOT U-shaped - tire degradation needs adjustment!');
}
