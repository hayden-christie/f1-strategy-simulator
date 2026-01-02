/**
 * Multi-Circuit Strategy Test
 * Verify tire degradation fix works across different track types
 */

import { simulateRace, createDefaultRaceConfig } from './lib/raceSimulator';
import { Strategy } from './lib/types';

console.log('═══════════════════════════════════════════════════════════');
console.log('  MULTI-CIRCUIT STRATEGY TEST');
console.log('  Verifying realistic 1-stop vs 3-stop gaps');
console.log('═══════════════════════════════════════════════════════════\n');

// Test circuits with different characteristics
const circuits = [
  { name: 'Monaco Grand Prix', laps: 78, baseLapTime: 72.0, type: 'Slow street circuit' },
  { name: 'Spa-Francorchamps', laps: 44, baseLapTime: 105.0, type: 'Fast circuit' },
  { name: 'Bahrain Grand Prix', laps: 57, baseLapTime: 90.0, type: 'Medium-speed circuit' },
];

circuits.forEach((circuit) => {
  console.log(`\n${'═'.repeat(63)}`);
  console.log(`  ${circuit.name.toUpperCase()}`);
  console.log(`  ${circuit.type} - ${circuit.laps} laps`);
  console.log(`${'═'.repeat(63)}\n`);

  const config = createDefaultRaceConfig(circuit.name, circuit.laps);
  config.baseLapTime = circuit.baseLapTime;
  config.fuelEffect = 0.025;

  // 1-stop strategy
  const oneStopLap = Math.floor(circuit.laps / 2);
  const oneStop: Strategy = {
    name: '1-Stop: Medium → Hard',
    startingCompound: 'MEDIUM',
    pitStops: [{ lap: oneStopLap, tireCompound: 'HARD' }],
  };

  // 3-stop strategy
  const threeStopLap1 = Math.floor(circuit.laps / 4);
  const threeStopLap2 = Math.floor(circuit.laps / 2);
  const threeStopLap3 = Math.floor((circuit.laps * 3) / 4);
  const threeStop: Strategy = {
    name: '3-Stop: Soft → Soft → Soft → Soft',
    startingCompound: 'SOFT',
    pitStops: [
      { lap: threeStopLap1, tireCompound: 'SOFT' },
      { lap: threeStopLap2, tireCompound: 'SOFT' },
      { lap: threeStopLap3, tireCompound: 'SOFT' },
    ],
  };

  const oneStopResult = simulateRace(oneStop, config);
  const threeStopResult = simulateRace(threeStop, config);

  const gap = threeStopResult.totalRaceTime - oneStopResult.totalRaceTime;
  const pitTimeDiff = 44.4; // 2 extra stops × 22.2s

  console.log('⏱️  RESULTS:\n');
  console.log(`  1-Stop (M→H):`);
  console.log(`    Total Time: ${oneStopResult.totalRaceTime.toFixed(3)}s`);
  console.log(`    Avg Lap: ${oneStopResult.averageLapTime.toFixed(3)}s`);
  console.log(`    Pit Stops: ${oneStopResult.pitStops.length} (${(oneStopResult.pitStops.length * 22.2).toFixed(1)}s)`);

  console.log(`\n  3-Stop (S→S→S→S):`);
  console.log(`    Total Time: ${threeStopResult.totalRaceTime.toFixed(3)}s`);
  console.log(`    Avg Lap: ${threeStopResult.averageLapTime.toFixed(3)}s`);
  console.log(`    Pit Stops: ${threeStopResult.pitStops.length} (${(threeStopResult.pitStops.length * 22.2).toFixed(1)}s)`);

  console.log(`\n  📊 GAP ANALYSIS:`);
  console.log(`    Time difference: ${gap >= 0 ? '+' : ''}${gap.toFixed(1)}s`);
  console.log(`    Pit time penalty: +${pitTimeDiff.toFixed(1)}s (3-stop has 2 extra stops)`);

  // Realistic range is 25-50s for most tracks
  const isRealistic = gap >= 20 && gap <= 60;
  const status = isRealistic ? '✅ REALISTIC' : '⚠️  NEEDS TUNING';

  console.log(`\n  ${status}`);
  if (isRealistic) {
    console.log(`    Gap of ${gap.toFixed(1)}s is within realistic range (20-60s)`);
  } else if (gap < 20) {
    console.log(`    Gap of ${gap.toFixed(1)}s is too small (3-stop too competitive)`);
  } else {
    console.log(`    Gap of ${gap.toFixed(1)}s is too large (1-stop too dominant)`);
  }
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  SUMMARY');
console.log('═══════════════════════════════════════════════════════════\n');
console.log('Expected behavior:');
console.log('  • 1-stop should win by 20-50s on most tracks');
console.log('  • 3-stop loses ~44s in pits, gains ~20-30s from fresh tires');
console.log('  • Monaco (many corners): Slightly closer gaps');
console.log('  • Spa (fast straights): Slightly larger gaps');
console.log('\nTire degradation model applies to ALL circuits automatically.');
console.log('Fix is in core tire physics (lib/tireModel.ts).\n');
