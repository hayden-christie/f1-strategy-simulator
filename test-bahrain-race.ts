/**
 * Bahrain Grand Prix Strategy Comparison
 *
 * Comparing two specific strategies:
 * Strategy A: Soft → Medium → Medium (2 stops)
 * Strategy B: Medium → Hard (1 stop)
 */

import {
  createDefaultRaceConfig,
  compareStrategies,
  formatRaceTime,
  formatTimeDelta,
  type Strategy,
} from './src/lib/index.js';

console.log('🏎️  Bahrain Grand Prix - Strategy Comparison\n');
console.log('='.repeat(70));

// Create Bahrain GP configuration
const bahrainConfig = createDefaultRaceConfig('Bahrain', 57);

console.log('\n📍 Race Configuration:');
console.log(`   Track: ${bahrainConfig.trackName}`);
console.log(`   Total Laps: ${bahrainConfig.totalLaps}`);
console.log(`   Base Lap Time: ${bahrainConfig.baseLapTime}s (1:30.000)`);
console.log(`   Pit Lane Time Loss: ${bahrainConfig.pitLaneTimeLoss}s`);
console.log(`   Pit Stop Stationary: ${bahrainConfig.pitStopStationary}s`);
console.log(`   Total Pit Stop Cost: ${bahrainConfig.pitLaneTimeLoss + bahrainConfig.pitStopStationary}s`);

// Define the two strategies
const strategies: Strategy[] = [
  {
    name: 'Strategy A: Soft → Medium → Medium',
    startingCompound: 'SOFT',
    pitStops: [
      { lap: 15, tireCompound: 'MEDIUM' },
      { lap: 35, tireCompound: 'MEDIUM' },
    ],
  },
  {
    name: 'Strategy B: Medium → Hard',
    startingCompound: 'MEDIUM',
    pitStops: [
      { lap: 20, tireCompound: 'HARD' },
    ],
  },
];

console.log('\n📋 Strategies:');
strategies.forEach((strategy, index) => {
  console.log(`\n   ${String.fromCharCode(65 + index)}. ${strategy.name}`);
  console.log(`      Starting Compound: ${strategy.startingCompound}`);
  console.log(`      Pit Stops: ${strategy.pitStops.length}`);
  strategy.pitStops.forEach((stop, stopIndex) => {
    console.log(`        ${stopIndex + 1}. Lap ${stop.lap} → ${stop.tireCompound}`);
  });
});

console.log('\n' + '='.repeat(70));
console.log('\n🏁 Running Race Simulation...\n');

// Compare strategies
const comparison = compareStrategies(strategies, bahrainConfig);

console.log('='.repeat(70));
console.log('\n📊 RESULTS:\n');

// Display results
comparison.strategies.forEach((result, index) => {
  const delta = comparison.timeDifferences.get(result.strategy.name) || 0;
  const isWinner = result === comparison.winner;
  const marker = isWinner ? '🏆 WINNER' : '   SLOWER';

  console.log(`${marker} - ${result.strategy.name}`);
  console.log(`${'─'.repeat(70)}`);
  console.log(`   Total Race Time:     ${formatRaceTime(result.totalRaceTime)}`);

  if (!isWinner) {
    console.log(`   Time Difference:     ${formatTimeDelta(delta)}`);
  }

  console.log(`   Number of Pit Stops: ${result.pitStops.length}`);
  console.log(`   Average Lap Time:    ${result.averageLapTime.toFixed(3)}s`);
  console.log(`   Fastest Lap:         ${result.fastestLap.toFixed(3)}s`);
  console.log(`   Slowest Lap:         ${result.slowestLap.toFixed(3)}s`);

  // Show pit stop details
  console.log(`\n   Pit Stop Details:`);
  result.pitStops.forEach((stop, stopIndex) => {
    console.log(`      Stop ${stopIndex + 1}: Lap ${stop.lap} (${stop.fromCompound} → ${stop.toCompound})`);
    console.log(`              Time Lost: ${stop.duration.toFixed(3)}s`);
  });

  // Calculate stint averages
  console.log(`\n   Stint Performance:`);
  let stintStart = 0;
  let stintNumber = 1;

  result.pitStops.forEach((stop) => {
    const stintLaps = result.laps.slice(stintStart, stop.lap);
    const nonPitLaps = stintLaps.filter(lap => !lap.isPitLap);
    const avgStintTime = nonPitLaps.reduce((sum, lap) => sum + lap.lapTime, 0) / nonPitLaps.length;
    const stintLength = nonPitLaps.length;

    console.log(`      Stint ${stintNumber}: Laps ${stintStart + 1}-${stop.lap} (${stintLength} laps)`);
    console.log(`                Compound: ${stintLaps[0]?.tireCompound || 'N/A'}`);
    console.log(`                Average: ${avgStintTime.toFixed(3)}s/lap`);

    stintNumber++;
    stintStart = stop.lap;
  });

  // Final stint
  const finalStintLaps = result.laps.slice(stintStart);
  const finalNonPitLaps = finalStintLaps.filter(lap => !lap.isPitLap);
  const avgFinalStint = finalNonPitLaps.reduce((sum, lap) => sum + lap.lapTime, 0) / finalNonPitLaps.length;
  const finalStintLength = finalNonPitLaps.length;

  console.log(`      Stint ${stintNumber}: Laps ${stintStart + 1}-${bahrainConfig.totalLaps} (${finalStintLength} laps)`);
  console.log(`                Compound: ${finalStintLaps[0]?.tireCompound || 'N/A'}`);
  console.log(`                Average: ${avgFinalStint.toFixed(3)}s/lap`);

  console.log('');
});

console.log('='.repeat(70));
console.log('\n💡 ANALYSIS:\n');

const winnerResult = comparison.winner;
const loserResult = comparison.strategies.find(r => r !== winnerResult)!;
const timeDiff = comparison.timeDifferences.get(loserResult.strategy.name) || 0;

console.log(`   The winning strategy is: ${winnerResult.strategy.name}`);
console.log(`   Time advantage: ${Math.abs(timeDiff).toFixed(3)} seconds`);
console.log(`\n   Key Factors:`);

// Analyze pit stop impact
const winnerPitTime = winnerResult.pitStops.reduce((sum, stop) => sum + stop.duration, 0);
const loserPitTime = loserResult.pitStops.reduce((sum, stop) => sum + stop.duration, 0);
const pitTimeDiff = loserPitTime - winnerPitTime;

console.log(`   - Pit Stop Time: Winner lost ${winnerPitTime.toFixed(1)}s, Loser lost ${loserPitTime.toFixed(1)}s`);
console.log(`     Difference: ${Math.abs(pitTimeDiff).toFixed(1)}s advantage to ${pitTimeDiff > 0 ? 'winner' : 'loser'}`);

// Analyze pace
const paceAdvantage = loserResult.averageLapTime - winnerResult.averageLapTime;
console.log(`   - Average Pace: Winner was ${Math.abs(paceAdvantage).toFixed(3)}s/lap ${paceAdvantage > 0 ? 'faster' : 'slower'}`);
console.log(`     Over ${bahrainConfig.totalLaps} laps: ${(paceAdvantage * bahrainConfig.totalLaps).toFixed(1)}s difference`);

console.log('\n' + '='.repeat(70));
console.log('\n✅ Simulation Complete!\n');
