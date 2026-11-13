import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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

const MovementTrendsChart = ({ trends = [] }) => {
  // Aggregate daily quantities by date and movement type
  const dates = [...new Set(trends.map((t) => t.date))].sort();

  const stockInData = dates.map((d) => {
    const entry = trends.find((t) => t.date === d && t.transactionType === 'STOCK_IN');
    return entry ? entry.totalQuantity : 0;
  });

  const stockOutData = dates.map((d) => {
    const entry = trends.find((t) => t.date === d && t.transactionType === 'STOCK_OUT');
    return entry ? entry.totalQuantity : 0;
  });

  // Provide fallback sample timeline if fresh database has few records
  const displayLabels = dates.length > 0 ? dates : ['2 Weeks Ago', 'Last Week', '3 Days Ago', 'Yesterday', 'Today'];
  const displayStockIn = dates.length > 0 ? stockInData : [150, 20, 45, 10, 30];
  const displayStockOut = dates.length > 0 ? stockOutData : [8, 12, 6, 15, 22];

  const data = {
    labels: displayLabels,
    datasets: [
      {
        label: 'Stock-In (Replenishments)',
        data: displayStockIn,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
      },
      {
        label: 'Stock-Out (Dispatches / Sales)',
        data: displayStockOut,
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#f43f5e',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          font: { size: 11, family: 'Inter' },
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 } },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
};

export default MovementTrendsChart;
