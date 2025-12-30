/**
 * Bahrain Grand Prix Strategy Comparison
 * Run with: node test-bahrain-race.mjs
 */

// Manual inline implementation for testing
const TIRE_COMPOUNDS = {
  SOFT: {
    name: 'SOFT',
    baseGripLevel: 1.0,
    degradationRate: 0.045,
    optimalLapRange: [0, 20],
  },
  MEDIUM: {
    name: 'MEDIUM',
    baseGripLevel: 0.97,
    degradationRate: 0.025,
    optimalLapRange: [0, 30],
  },
  HARD: {
    name: 'HARD',
    baseGripLevel: 0.94,
    degradationRate: 0.015,
    optimalLapRange: [0, 45],
  },
};

function calculateTirePerformance(compound, age) {
  const compoundData = TIRE_COMPOUNDS[compound];
  const basePerformance = compoundData.baseGripLevel;
  const degradationFactor = Math.pow(1 + compoundData.degradationRate, age);

  let cliffMultiplier = 1.0;
  if (age > compoundData.optimalLapRange[1]) {
    const lapsOverLimit = age - compoundData.optimalLapRange[1];
    cliffMultiplier = 1 + (lapsOverLimit * 0.02);
  }

  return (1 / basePerformance) * degradationFactor * cliffMultiplier;
}

function calculateLapTime(baseLapTime, compound, tireAge, fuelLoad, fuelEffect) {
  let lapTime = baseLapTime;

  // Tire degradation penalty
  const performanceMultiplier = calculateTirePerformance(compound, tireAge);
  const tirePenalty = baseLapTime * (performanceMultiplier - 1);
  lapTime += tirePenalty;

  // Fuel load effect
  const fuelPenalty = fuelLoad * fuelEffect;
  lapTime += fuelPenalty;

  return lapTime;
}

function simulateRace(strategy, config) {
  const laps = [];
  const pitStops = [];
  let currentCompound = strategy.startingCompound;
  let tireAge = 0;
  let cumulativeTime = 0;

  for (let lapNumber = 1; lapNumber <= config.totalLaps; lapNumber++) {
    const pitStopThisLap = strategy.pitStops.find(ps => ps.lap === lapNumber);
    const isPitLap = !!pitStopThisLap;

    // Calculate fuel load
    const fuelUsed = (lapNumber - 1) * config.fuelPerLap;
    const fuelLoad = Math.max(0, config.startingFuelLoad - fuelUsed);

    // Calculate lap time
    let lapTime = calculateLapTime(
      config.baseLapTime,
      currentCompound,
      tireAge,
      fuelLoad,
      config.fuelEffect
    );

    // Add pit stop time if needed
    if (isPitLap) {
      lapTime += config.pitLaneTimeLoss + config.pitStopStationary;
    }

    cumulativeTime += lapTime;

    laps.push({
      lapNumber,
      lapTime,
      tireCompound: currentCompound,
      tireAge,
      fuelLoad,
      isPitLap,
      cumulativeTime,
    });

    // Handle pit stop
    if (pitStopThisLap) {
      pitStops.push({
        lap: lapNumber,
        fromCompound: currentCompound,
        toCompound: pitStopThisLap.tireCompound,
        duration: config.pitLaneTimeLoss + config.pitStopStationary,
      });
      currentCompound = pitStopThisLap.tireCompound;
      tireAge = 0;
    } else {
      tireAge++;
    }
  }

  // Calculate statistics
  const lapTimes = laps.filter(lap => !lap.isPitLap).map(lap => lap.lapTime);
  const averageLapTime = lapTimes.reduce((sum, time) => sum + time, 0) / lapTimes.length;
  const fastestLap = Math.min(...lapTimes);
  const slowestLap = Math.max(...lapTimes);

  return {
    strategy,
    totalRaceTime: cumulativeTime,
    laps,
    pitStops,
    averageLapTime,
    fastestLap,
    slowestLap,
  };
}

function formatRaceTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`;
  }
  return `${minutes}:${secs.toFixed(3).padStart(6, '0')}`;
}

function formatTimeDelta(seconds) {
  const sign = seconds >= 0 ? '+' : '';
  return `${sign}${seconds.toFixed(3)}`;
}

// ============================================================================
// MAIN SIMULATION
// ============================================================================

console.log('🏎️  Bahrain Grand Prix - Strategy Comparison\n');
console.log('='.repeat(70));

// Bahrain GP configuration
const bahrainConfig = {
  trackName: 'Bahrain',
  baseLapTime: 90.0,
  totalLaps: 57,
  pitLaneTimeLoss: 22.0,
  pitStopStationary: 2.2,
  startingFuelLoad: 110,
  fuelPerLap: 1.9,
  fuelEffect: 0.035,
};

console.log('\n📍 Race Configuration:');
console.log(`   Track: ${bahrainConfig.trackName}`);
console.log(`   Total Laps: ${bahrainConfig.totalLaps}`);
console.log(`   Base Lap Time: ${bahrainConfig.baseLapTime}s (1:30.000)`);
console.log(`   Pit Lane Time Loss: ${bahrainConfig.pitLaneTimeLoss}s`);
console.log(`   Pit Stop Stationary: ${bahrainConfig.pitStopStationary}s`);
console.log(`   Total Pit Stop Cost: ${bahrainConfig.pitLaneTimeLoss + bahrainConfig.pitStopStationary}s`);

// Define strategies
const strategies = [
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

// Simulate both strategies
const results = strategies.map(strategy => simulateRace(strategy, bahrainConfig));
const winner = results.reduce((fastest, current) =>
  current.totalRaceTime < fastest.totalRaceTime ? current : fastest
);

console.log('='.repeat(70));
console.log('\n📊 RESULTS:\n');

results.forEach((result) => {
  const delta = result.totalRaceTime - winner.totalRaceTime;
  const isWinner = result === winner;
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

const loserResult = results.find(r => r !== winner);
const timeDiff = loserResult.totalRaceTime - winner.totalRaceTime;

console.log(`   The winning strategy is: ${winner.strategy.name}`);
console.log(`   Time advantage: ${Math.abs(timeDiff).toFixed(3)} seconds`);
console.log(`\n   Key Factors:`);

// Analyze pit stop impact
const winnerPitTime = winner.pitStops.reduce((sum, stop) => sum + stop.duration, 0);
const loserPitTime = loserResult.pitStops.reduce((sum, stop) => sum + stop.duration, 0);
const pitTimeDiff = loserPitTime - winnerPitTime;

console.log(`   - Pit Stop Time: Winner lost ${winnerPitTime.toFixed(1)}s, Loser lost ${loserPitTime.toFixed(1)}s`);
console.log(`     Difference: ${Math.abs(pitTimeDiff).toFixed(1)}s advantage to ${pitTimeDiff > 0 ? 'winner' : 'loser'}`);

// Analyze pace
const paceAdvantage = loserResult.averageLapTime - winner.averageLapTime;
console.log(`   - Average Pace: Winner was ${Math.abs(paceAdvantage).toFixed(3)}s/lap ${paceAdvantage > 0 ? 'faster' : 'slower'}`);
console.log(`     Over ${bahrainConfig.totalLaps} laps: ${(paceAdvantage * bahrainConfig.totalLaps).toFixed(1)}s difference`);

console.log('\n' + '='.repeat(70));
console.log('\n✅ Simulation Complete!\n');
