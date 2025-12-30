'use client';

import { F1Race } from '@/types/f1-data';
import { getTotalLaps } from '@/lib/raceData';

interface RaceSelectorProps {
  races: F1Race[];
  selectedRace: F1Race | null;
  onRaceSelect: (race: F1Race) => void;
}

export default function RaceSelector({
  races,
  selectedRace,
  onRaceSelect,
}: RaceSelectorProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="race-select" className="block text-xs font-semibold text-gray-200">
        Select Race
      </label>
      <select
        id="race-select"
        value={selectedRace?.round || ''}
        onChange={(e) => {
          const race = races.find((r) => r.round === Number(e.target.value));
          if (race) onRaceSelect(race);
        }}
        className="w-full px-2 py-1.5 text-sm bg-gray-700 border border-gray-600 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="" className="bg-gray-700">Choose a race...</option>
        {races
          .filter((race) => race.format !== 'testing')
          .map((race) => (
            <option key={race.round} value={race.round} className="bg-gray-700">
              Round {race.round}: {race.name} ({race.location})
            </option>
          ))}
      </select>
      {selectedRace && (
        <div className="mt-2 p-2 bg-gray-700 rounded border border-gray-600">
          <h3 className="font-semibold text-sm mb-1 text-white">{selectedRace.name}</h3>
          <div className="space-y-0.5 text-xs text-gray-300">
            <p>
              <span className="font-medium">Location:</span> {selectedRace.location}, {selectedRace.country}
            </p>
            <p>
              <span className="font-medium">Date:</span> {selectedRace.date}
            </p>
            <p className="pt-1 border-t border-gray-600 mt-1">
              <span className="font-medium">Distance:</span>{' '}
              <span className="font-bold text-blue-400">{getTotalLaps(selectedRace.name)} laps</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
