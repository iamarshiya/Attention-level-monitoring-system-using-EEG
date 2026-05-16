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
import { Line } from 'react-chartjs-2';

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

export default function RealTimeGraph({ data }) {
  const chartData = {
    labels: data.map(d => d.time),
    datasets: [
      {
        fill: true,
        label: 'Attention Score',
        data: data.map(d => d.attention),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: { count: 5, font: { family: 'monospace', size: 10 } }
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(15,23,42,0.05)' },
        ticks: { stepSize: 20, font: { family: 'monospace', size: 10 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#64748b',
        bodyColor: '#0f172a',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
      }
    }
  };

  return (
    <div className="h-full w-full pb-8">
      <Line data={chartData} options={options} />
    </div>
  );
}
