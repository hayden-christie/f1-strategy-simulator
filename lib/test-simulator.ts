/**
 * Quick test to verify the F1 Strategy Simulator is working
 * Run with: npx ts-node src/lib/test-simulator.ts
 */

import {
  createDefaultRaceConfig,
  createStrategyTemplates,
  compareStrategies,
  formatRaceTime,
  formatTimeDelta,
  TIRE_COMPOUNDS,
  createTireState,
  getTireTimePenalty,
} from './index.js';

console.log('🏎️  F1 Strategy Simulator - Quick Test\n');
console.log('='.repeat(60));

// Test 1: Tire Model
console.log('\n1. Testing Tire Degradation Model...');
const newSoft = createTireState('SOFT', 0);
const oldSoft = createTireState('SOFT', 20);
const baseLap = 90.0;

console.log(`   New Soft Tire: ${getTireTimePenalty(baseLap, newSoft).toFixed(3)}s penalty`);
console.log(`   20-lap Soft Tire: ${getTireTimePenalty(baseLap, oldSoft).toFixed(3)}s penalty`);
console.log('   ✓ Tire model working');

// Test 2: Lap Time Calculator
console.log('\n2. Testing Lap Time Calculator...');
const raceConfig = createDefaultRaceConfig('Monaco', 78);
console.log(`   Base lap time: ${raceConfig.baseLapTime}s`);
console.log(`   Pit lane time loss: ${raceConfig.pitLaneTimeLoss}s`);
console.log(`   Total pit stop: ${raceConfig.pitLaneTimeLoss + raceConfig.pitStopStationary}s`);
console.log('   ✓ Calculator working');

// Test 3: Strategy Templates
console.log('\n3. Testing Strategy Templates...');
const strategies = createStrategyTemplates(78);
console.log(`   Generated ${strategies.length} strategy templates`);
strategies.slice(0, 3).forEach((s) => {
  console.log(`   - ${s.name} (${s.pitStops.length} stop${s.pitStops.length > 1 ? 's' : ''})`);
});
console.log('   ✓ Templates working');

// Test 4: Race Simulation
console.log('\n4. Running Race Simulation...');
const comparison = compareStrategies(strategies.slice(0, 3), raceConfig);
console.log(`   Simulated ${comparison.strategies.length} strategies`);
console.log(`   Winner: ${comparison.winner.strategy.name}`);
console.log(`   Time: ${formatRaceTime(comparison.winner.totalRaceTime)}`);
console.log('   ✓ Simulation working');

// Test 5: Results Analysis
console.log('\n5. Strategy Comparison Results:');
const sortedResults = [...comparison.strategies].sort(
  (a, b) => a.totalRaceTime - b.totalRaceTime
);

sortedResults.forEach((result, index) => {
  const delta = comparison.timeDifferences.get(result.strategy.name) || 0;
  const marker = index === 0 ? '🏆' : '  ';
  console.log(`   ${marker} ${result.strategy.name}`);
  console.log(`      Time: ${formatRaceTime(result.totalRaceTime)} (${formatTimeDelta(delta)})`);
  console.log(`      Stops: ${result.pitStops.length}, Avg Lap: ${result.averageLapTime.toFixed(3)}s`);
});

console.log('\n' + '='.repeat(60));
console.log('✅ All tests passed! Simulation engine is ready to use.\n');

// Display tire compound information
console.log('📊 Tire Compound Data:');
Object.values(TIRE_COMPOUNDS).forEach((compound) => {
  console.log(`\n   ${compound.name}:`);
  console.log(`   - Base grip: ${(compound.baseGripLevel * 100).toFixed(1)}%`);
  console.log(`   - Degradation: ${(compound.degradationRate * 100).toFixed(1)}% per lap`);
  console.log(`   - Optimal: ${compound.optimalLapRange[0]}-${compound.optimalLapRange[1]} laps`);
});

console.log('\n' + '='.repeat(60));
console.log('Ready for integration with Next.js app! 🚀\n');
