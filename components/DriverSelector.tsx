'use client';

import { Driver, Team, F1_DRIVERS_2025, getTeamById } from '@/lib/driverTeamData';

interface DriverSelectorProps {
  selectedDriver: Driver | null;
  onDriverSelect: (driver: Driver | null) => void;
}

export default function DriverSelector({
  selectedDriver,
  onDriverSelect,
}: DriverSelectorProps) {
  const selectedTeam = selectedDriver ? getTeamById(selectedDriver.teamId) : null;

  return (
    <div className="space-y-2">
      <label htmlFor="driver-select" className="block text-xs font-semibold text-gray-200">
        Select Driver (Optional)
      </label>
      <select
        id="driver-select"
        value={selectedDriver?.id || ''}
        onChange={(e) => {
          const driver = F1_DRIVERS_2025.find((d) => d.id === e.target.value);
          onDriverSelect(driver || null);
        }}
        className="w-full px-2 py-1.5 text-sm bg-gray-700 border border-gray-600 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        style={{
          borderLeftWidth: selectedTeam ? '4px' : '1px',
          borderLeftColor: selectedTeam?.color || undefined,
        }}
      >
        <option value="" className="bg-gray-700">
          No driver selected (neutral simulation)
        </option>
        {F1_DRIVERS_2025.map((driver) => {
          const team = getTeamById(driver.teamId);
          return (
            <option key={driver.id} value={driver.id} className="bg-gray-700">
              #{driver.number} {driver.fullName} ({team?.name})
            </option>
          );
        })}
      </select>
      {selectedDriver && selectedTeam && (
        <div
          className="mt-2 p-2 rounded border-2"
          style={{
            borderColor: selectedTeam.color,
            backgroundColor: `${selectedTeam.color}15`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedTeam.color }}
            />
            <h3 className="font-semibold text-sm text-white">
              #{selectedDriver.number} {selectedDriver.fullName}
            </h3>
          </div>
          <div className="space-y-0.5 text-xs text-gray-300">
            <p>
              <span className="font-medium">Team:</span>{' '}
              <span style={{ color: selectedTeam.color }} className="font-semibold">
                {selectedTeam.fullName}
              </span>
            </p>
            <p className="pt-1 border-t border-gray-600 mt-1">
              <span className="font-medium">Tire Management:</span>{' '}
              <span className="font-bold text-blue-400">
                {selectedDriver.tireManagementSkill}/10
              </span>
            </p>
            <p>
              <span className="font-medium">Consistency:</span>{' '}
              <span className="font-bold text-blue-400">
                {selectedDriver.consistency}/10
              </span>
            </p>
            <p className="pt-1 border-t border-gray-600 mt-1">
              <span className="font-medium">Car Performance:</span>{' '}
              <span
                className={`font-bold ${
                  selectedTeam.carPerformance < 0 ? 'text-green-400' : 'text-yellow-400'
                }`}
              >
                {selectedTeam.carPerformance > 0 ? '+' : ''}
                {selectedTeam.carPerformance.toFixed(2)}s/lap
              </span>
            </p>
            <p>
              <span className="font-medium">Pit Crew:</span>{' '}
              <span
                className={`font-bold ${
                  selectedTeam.pitCrewSpeed < 0 ? 'text-green-400' : 'text-yellow-400'
                }`}
              >
                {selectedTeam.pitCrewSpeed > 0 ? '+' : ''}
                {selectedTeam.pitCrewSpeed.toFixed(2)}s
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
