/**
 * Race Prediction Management
 *
 * Handles saving and loading race predictions to/from localStorage
 */

import { RacePrediction } from './types';

const STORAGE_KEY = 'f1_simulator_predictions';

/**
 * Save a prediction to localStorage
 */
export function savePrediction(prediction: RacePrediction): void {
  try {
    const predictions = getAllPredictions();

    // Remove existing prediction for same race if it exists
    const filtered = predictions.filter(
      p => !(p.raceName === prediction.raceName && p.driverId === prediction.driverId)
    );

    // Add new prediction
    filtered.push(prediction);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to save prediction:', error);
  }
}

/**
 * Get all saved predictions
 */
export function getAllPredictions(): RacePrediction[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const predictions = JSON.parse(stored);

    // Convert date strings back to Date objects
    return predictions.map((p: any) => ({
      ...p,
      savedAt: new Date(p.savedAt),
    }));
  } catch (error) {
    console.error('Failed to load predictions:', error);
    return [];
  }
}

/**
 * Get prediction for a specific race and driver
 */
export function getPrediction(raceName: string, driverId?: string): RacePrediction | null {
  const predictions = getAllPredictions();

  const found = predictions.find(
    p => p.raceName === raceName && p.driverId === driverId
  );

  return found || null;
}

/**
 * Delete a prediction
 */
export function deletePrediction(predictionId: string): void {
  try {
    const predictions = getAllPredictions();
    const filtered = predictions.filter(p => p.id !== predictionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete prediction:', error);
  }
}

/**
 * Clear all predictions
 */
export function clearAllPredictions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear predictions:', error);
  }
}

/**
 * Generate unique prediction ID
 */
export function generatePredictionId(raceName: string, driverId?: string): string {
  const timestamp = Date.now();
  const driverPart = driverId || 'neutral';
  return `${raceName}_${driverPart}_${timestamp}`;
}
