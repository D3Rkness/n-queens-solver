import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { GenerationStats } from "../types";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface FitnessChartProps {
  stats: GenerationStats[];
  maxPairs: number;
}

export default function FitnessChart({ stats, maxPairs }: FitnessChartProps) {
  const chartData = useMemo(() => {
    // Get the latest 50 generations for better visualization
    const recentStats = stats.slice(-50);

    return {
      labels: recentStats.map((stat) => stat.generation.toString()),
      datasets: [
        {
          label: "Best Fitness",
          data: recentStats.map((stat) => stat.bestFitness),
          borderColor: "rgb(66, 133, 244)",
          backgroundColor: "rgba(66, 133, 244, 0.5)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Average Fitness",
          data: recentStats.map((stat) => stat.averageFitness),
          borderColor: "rgb(52, 168, 83)",
          backgroundColor: "rgba(52, 168, 83, 0.5)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Worst Fitness",
          data: recentStats.map((stat) => stat.worstFitness),
          borderColor: "rgb(234, 67, 53)",
          backgroundColor: "rgba(234, 67, 53, 0.5)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Maximum Possible",
          data: recentStats.map(() => maxPairs),
          borderColor: "rgba(0, 0, 0, 0.3)",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
        },
      ],
    };
  }, [stats, maxPairs]);

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Fitness Evolution",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: maxPairs + 1,
        title: {
          display: true,
          text: "Fitness (non-attacking pairs)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Generation",
        },
      },
    },
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}
