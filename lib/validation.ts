/**
 * Strategy validation utilities
 */

import { Strategy } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate a strategy before simulation
 */
export function validateStrategy(strategy: Strategy, totalLaps: number): ValidationResult {
  const errors: string[] = [];

  // Check if strategy has a name
  if (!strategy.name || strategy.name.trim() === '') {
    errors.push('Strategy must have a name');
  }

  // Check pit stops
  strategy.pitStops.forEach((pitStop, index) => {
    // Pit stop lap validation
    if (pitStop.lap < 2) {
      errors.push(`Pit stop ${index + 1}: Cannot pit on lap ${pitStop.lap}. Must pit on lap 2 or later.`);
    }

    if (pitStop.lap >= totalLaps) {
      errors.push(`Pit stop ${index + 1}: Cannot pit on lap ${pitStop.lap}. Race only has ${totalLaps} laps.`);
    }

    // Check for duplicate pit stop laps
    const duplicates = strategy.pitStops.filter(ps => ps.lap === pitStop.lap);
    if (duplicates.length > 1) {
      errors.push(`Pit stop ${index + 1}: Cannot have multiple pit stops on lap ${pitStop.lap}.`);
    }

    // Check tire compound
    if (!pitStop.tireCompound) {
      errors.push(`Pit stop ${index + 1}: Must select a tire compound.`);
    }
  });

  // Check pit stop order
  const sortedPitStops = [...strategy.pitStops].sort((a, b) => a.lap - b.lap);
  const isOrdered = strategy.pitStops.every((ps, i) => ps.lap === sortedPitStops[i].lap);
  if (!isOrdered) {
    errors.push('Pit stops must be in chronological order.');
  }

  // Warn if no pit stops (allowed but unusual)
  if (strategy.pitStops.length === 0) {
    // This is technically valid for a "no-stop" strategy, but we'll allow it
  }

  // Check starting compound
  if (!strategy.startingCompound) {
    errors.push('Must select a starting tire compound.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate multiple strategies
 */
export function validateStrategies(strategies: Strategy[], totalLaps: number): ValidationResult {
  const allErrors: string[] = [];

  if (strategies.length === 0) {
    allErrors.push('Please create at least one strategy to simulate.');
  }

  strategies.forEach((strategy, index) => {
    const result = validateStrategy(strategy, totalLaps);
    if (!result.isValid) {
      allErrors.push(`${strategy.name}:`);
      allErrors.push(...result.errors.map(e => `  • ${e}`));
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Get user-friendly error message
 */
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) return '';

  if (errors.length === 1) {
    return errors[0];
  }

  return errors.join('\n');
}
