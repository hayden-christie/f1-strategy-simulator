/**
 * Test script to verify demo data generation
 */

import { getDemoComparison } from './lib/demoData';

console.log('Testing demo data generation...\n');

const comparison = getDemoComparison('Bahrain Grand Prix');

if (!comparison) {
  console.error('❌ No comparison data returned!');
  process.exit(1);
}

console.log('✅ Comparison data exists');
console.log('Prediction:', comparison.prediction.raceName);
console.log('Strategy:', comparison.prediction.strategy.name);
console.log('\n📊 Simulation Result:');
console.log('Total Race Time:', comparison.prediction.simulationResult.totalRaceTime);
console.log('Laps count:', comparison.prediction.simulationResult.laps?.length || 0);

if (comparison.prediction.simulationResult.laps?.length > 0) {
  console.log('\n✅ LAPS DATA EXISTS!');
  console.log('\nFirst 5 laps:');
  comparison.prediction.simulationResult.laps.slice(0, 5).forEach(lap => {
    console.log(`  Lap ${lap.lapNumber}: ${lap.lapTime.toFixed(3)}s - ${lap.tireCompound} (age ${lap.tireAge})${lap.isPitLap ? ' [PIT]' : ''}`);
  });

  console.log('\nPit stop laps (18, 38):');
  [17, 18, 19, 37, 38, 39].forEach(idx => {
    const lap = comparison.prediction.simulationResult.laps[idx];
    if (lap) {
      console.log(`  Lap ${lap.lapNumber}: ${lap.lapTime.toFixed(3)}s - ${lap.tireCompound} (age ${lap.tireAge})${lap.isPitLap ? ' [PIT]' : ''}`);
    }
  });

  console.log('\nLast 3 laps:');
  comparison.prediction.simulationResult.laps.slice(-3).forEach(lap => {
    console.log(`  Lap ${lap.lapNumber}: ${lap.lapTime.toFixed(3)}s - ${lap.tireCompound} (age ${lap.tireAge})${lap.isPitLap ? ' [PIT]' : ''}`);
  });

  console.log('\n🎉 Demo data is properly generated!');
  console.log(`Total laps: ${comparison.prediction.simulationResult.laps.length}`);
} else {
  console.error('\n❌ NO LAPS DATA! Array is empty or undefined');
  console.log('Laps value:', comparison.prediction.simulationResult.laps);
}

console.log('\n📈 Deviations:');
console.log('Lap time delta:', comparison.deviations.lapTimeDelta);
console.log('Pit stop timing:', comparison.deviations.pitStopTiming);

console.log('\n📊 Accuracy:');
console.log('Pit stop accuracy:', comparison.accuracy.pitStopAccuracy);
console.log('Tire choice accuracy:', comparison.accuracy.tireChoiceAccuracy);
console.log('Time accuracy:', comparison.accuracy.timeAccuracy);
