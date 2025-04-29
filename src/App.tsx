import { useEffect, useState } from "react";
import "./App.css";
import useNQueensWorker from "./hooks/useNQueensWorker";
import Chessboard from "./components/Chessboard";
import ParameterControls from "./components/ParameterControls";
import FitnessChart from "./components/FitnessChart";
import SolutionInfo from "./components/SolutionInfo";
import { GenerationStats } from "./types";

function App() {
  const {
    isRunning,
    params,
    stats,
    solution,
    error,
    updateParams,
    start,
    pause,
    reset,
  } = useNQueensWorker();

  // Keep track of all stats for charting
  const [allStats, setAllStats] = useState<GenerationStats[]>([]);

  // Update stats history when new stats arrive
  useEffect(() => {
    if (stats) {
      setAllStats((prevStats) => [...prevStats, stats]);
    }
  }, [stats]);

  // Reset stats history when algorithm is reset
  useEffect(() => {
    if (stats && stats.generation === 0) {
      setAllStats([stats]);
    }
  }, [stats]);

  // Calculate maximum possible fitness (number of non-attacking pairs)
  const maxPairs = (params.boardSize * (params.boardSize - 1)) / 2;

  // Get the current best genome to display
  const currentGenome =
    stats?.bestGenome || solution?.genome || Array(params.boardSize).fill(0);

  return (
    <div className="App">
      <header style={{ textAlign: "center", padding: "20px 0" }}>
        <h1>N-Queens Genetic Algorithm Solver</h1>
        <p>Solve the N-Queens problem using a genetic algorithm approach.</p>
      </header>

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 600px), 1fr))",
          gap: "24px",
        }}
      >
        <div>
          <ParameterControls
            params={params}
            isRunning={isRunning}
            onUpdateParams={updateParams}
            onStart={start}
            onPause={pause}
            onReset={reset}
          />

          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                backgroundColor: "#ffebee",
                color: "#c62828",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
            >
              Error: {error}
            </div>
          )}

          {stats && (
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h2 style={{ margin: "0 0 16px 0" }}>Current Stats</h2>
              <div>
                <strong>Generation:</strong> {stats.generation}
              </div>
              <div>
                <strong>Best Fitness:</strong> {stats.bestFitness} / {maxPairs}
              </div>
              <div>
                <strong>Average Fitness:</strong>{" "}
                {stats.averageFitness.toFixed(2)}
              </div>
              <div>
                <strong>Worst Fitness:</strong> {stats.worstFitness}
              </div>
            </div>
          )}

          {solution && (
            <SolutionInfo solution={solution} boardSize={params.boardSize} />
          )}
        </div>

        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              alignItems: "center",
            }}
          >
            <div style={{ width: "100%", maxWidth: "500px" }}>
              <h2 style={{ textAlign: "center", margin: "0 0 16px 0" }}>
                Current Best Board
              </h2>
              <Chessboard size={params.boardSize} queens={currentGenome} />
            </div>

            {allStats.length > 0 && (
              <div style={{ width: "100%" }}>
                <h2 style={{ textAlign: "center", margin: "0 0 16px 0" }}>
                  Fitness Progress
                </h2>
                <FitnessChart stats={allStats} maxPairs={maxPairs} />
              </div>
            )}
          </div>
        </div>
      </main>

      <footer
        style={{
          textAlign: "center",
          marginTop: "40px",
          padding: "20px",
          borderTop: "1px solid #eee",
        }}
      >
        <p>N-Queens Genetic Algorithm Solver</p>
      </footer>
    </div>
  );
}

export default App;
