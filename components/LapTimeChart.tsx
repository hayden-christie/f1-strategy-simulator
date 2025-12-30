'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { SimulationResult } from '@/lib/types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LapTimeChartProps {
  results: SimulationResult[];
}

export default function LapTimeChart({ results }: LapTimeChartProps) {
  if (results.length === 0) {
    return null;
  }

  const colors = [
    { border: 'rgb(220, 0, 0)', background: 'rgba(220, 0, 0, 0.1)' },      // Racing Red
    { border: 'rgb(20, 184, 166)', background: 'rgba(20, 184, 166, 0.1)' }, // Teal
    { border: 'rgb(34, 211, 238)', background: 'rgba(34, 211, 238, 0.1)' }, // Cyan
  ];

  const chartData = {
    labels: results[0].laps.map((lap) => lap.lapNumber.toString()),
    datasets: results.map((result, index) => {
      const color = colors[index % colors.length];

      // Filter out pit laps for cleaner visualization
      const lapTimes = result.laps.map((lap) =>
        lap.isPitLap ? null : lap.lapTime
      );

      return {
        label: result.strategy.name,
        data: lapTimes,
        borderColor: color.border,
        backgroundColor: color.background,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        fill: false,
        tension: 0.1,
        spanGaps: true, // Connect points across pit laps
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          color: '#ffffff',
          font: {
            family: 'monospace',
            weight: 'bold' as const,
          },
        },
      },
      title: {
        display: true,
        text: 'LAP TIME COMPARISON',
        color: '#14b8a6',
        font: {
          size: 14,
          weight: 'bold' as const,
          family: 'monospace',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (value === null) {
              return `${label}: PIT STOP`;
            }
            return `${label}: ${value.toFixed(3)}s`;
          },
          afterLabel: function(context: any) {
            const lapIndex = context.dataIndex;
            const result = results[context.datasetIndex];
            const lap = result.laps[lapIndex];

            if (lap) {
              return [
                `Tire: ${lap.tireCompound}`,
                `Tire Age: ${lap.tireAge} laps`,
                `Fuel: ${lap.fuelLoad.toFixed(1)}kg`,
              ];
            }
            return [];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'LAP NUMBER',
          color: '#999999',
          font: {
            weight: 'bold' as const,
            family: 'monospace',
            size: 11,
          },
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 20,
          color: '#666666',
          font: {
            family: 'monospace',
          },
        },
        grid: {
          color: '#2a2a2a',
        },
      },
      y: {
        title: {
          display: true,
          text: 'LAP TIME (SECONDS)',
          color: '#999999',
          font: {
            weight: 'bold' as const,
            family: 'monospace',
            size: 11,
          },
        },
        beginAtZero: false,
        ticks: {
          callback: function(value: any) {
            return value.toFixed(1) + 's';
          },
          color: '#666666',
          font: {
            family: 'monospace',
          },
        },
        grid: {
          color: '#2a2a2a',
        },
      },
    },
  };

  return (
    <div className="bg-[#1a1a1a] p-4 rounded border border-[#2a2a2a]">
      <div style={{ height: '300px', backgroundColor: '#0a0a0a', padding: '12px', borderRadius: '4px' }}>
        <Line data={chartData} options={options} />
      </div>

      {/* Tire degradation key */}
      <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
        <p className="text-xs font-bold mb-1 text-[#14b8a6] uppercase tracking-wide">Tire Degradation Visualization</p>
        <p className="text-xs text-[#999999] font-mono">
          Chart shows lap times increasing as tires degrade. Gaps indicate pit stops.
          Hover over data points for tire compound, age, and fuel load details.
        </p>
      </div>
    </div>
  );
}
