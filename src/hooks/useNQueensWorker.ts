import { useEffect, useRef, useState } from "react";
import {
  GenerationStats,
  Individual,
  NQueensParams,
  WorkerResponse,
} from "../types";

// Initialize with default parameters
const defaultParams: NQueensParams = {
  boardSize: 8,
  populationSize: 100,
  selectionStrategy: "rouletteWheel",
  tournamentSize: 5,
  crossoverRate: 0.8,
  mutationRate: 0.2,
  maxGenerations: 1000,
};

// Ensure numeric parameters are actually numbers
function sanitizeParams(
  params: Partial<NQueensParams>
): Partial<NQueensParams> {
  const result = { ...params };

  if (result.boardSize !== undefined)
    result.boardSize = Number(result.boardSize);
  if (result.populationSize !== undefined)
    result.populationSize = Number(result.populationSize);
  if (result.tournamentSize !== undefined)
    result.tournamentSize = Number(result.tournamentSize);
  if (result.crossoverRate !== undefined)
    result.crossoverRate = Number(result.crossoverRate);
  if (result.mutationRate !== undefined)
    result.mutationRate = Number(result.mutationRate);
  if (result.maxGenerations !== undefined)
    result.maxGenerations = Number(result.maxGenerations);

  return result;
}

// Validate and constrain parameter values to reasonable limits
function validateParams(
  params: Partial<NQueensParams>
): Partial<NQueensParams> {
  const validated = { ...params };

  // Board size: min 4, max 50 (larger boards become computationally expensive)
  if (validated.boardSize !== undefined) {
    validated.boardSize = Math.max(4, Math.min(50, validated.boardSize));
  }

  // Population size: min 10, max 1000
  if (validated.populationSize !== undefined) {
    validated.populationSize = Math.max(
      10,
      Math.min(1000, validated.populationSize)
    );
  }

  // Tournament size: min 2, max 20
  if (validated.tournamentSize !== undefined) {
    validated.tournamentSize = Math.max(
      2,
      Math.min(20, validated.tournamentSize)
    );
  }

  // Crossover rate: must be between 0 and 1
  if (validated.crossoverRate !== undefined) {
    validated.crossoverRate = Math.max(0, Math.min(1, validated.crossoverRate));
  }

  // Mutation rate: must be between 0 and 1
  if (validated.mutationRate !== undefined) {
    validated.mutationRate = Math.max(0, Math.min(1, validated.mutationRate));
  }

  // Max generations: min 10, max 100000
  if (validated.maxGenerations !== undefined) {
    validated.maxGenerations = Math.max(
      10,
      Math.min(100000, validated.maxGenerations)
    );
  }

  return validated;
}

export default function useNQueensWorker() {
  // Worker and state
  const workerRef = useRef<Worker | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [params, setParams] = useState<NQueensParams>(defaultParams);
  const [stats, setStats] = useState<GenerationStats | null>(null);
  const [solution, setSolution] = useState<Individual | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize the worker
  useEffect(() => {
    // Create the worker
    workerRef.current = new Worker(
      new URL("../algorithms/nQueensWorker.ts", import.meta.url),
      { type: "module" }
    );

    // Set up message handler
    workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, data } = event.data;

      switch (type) {
        case "stats":
          setStats(data as GenerationStats);
          break;
        case "solution":
          setSolution(data as Individual);
          setIsRunning(false);
          break;
        case "error":
          setError(data as string);
          setIsRunning(false);
          break;
        default:
          setError(`Unknown response type: ${type}`);
          setIsRunning(false);
      }
    };

    // Initialize the worker with default params
    workerRef.current.postMessage({
      type: "init",
      params: defaultParams,
    });

    // Clean up
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Update parameters and reset
  const updateParams = (newParams: Partial<NQueensParams>) => {
    // Ensure numeric values are actually numbers and within valid ranges
    const sanitizedParams = sanitizeParams(newParams);
    const validatedParams = validateParams(sanitizedParams);
    const updatedParams = { ...params, ...validatedParams };
    setParams(updatedParams);

    if (workerRef.current) {
      setIsRunning(false);
      workerRef.current.postMessage({
        type: "reset",
        params: updatedParams,
      });
    }
  };

  // Start the algorithm
  const start = () => {
    if (workerRef.current) {
      setIsRunning(true);
      workerRef.current.postMessage({ type: "start" });
    }
  };

  // Pause the algorithm
  const pause = () => {
    if (workerRef.current) {
      setIsRunning(false);
      workerRef.current.postMessage({ type: "pause" });
    }
  };

  // Reset the algorithm
  const reset = () => {
    if (workerRef.current) {
      setIsRunning(false);
      setSolution(null);
      workerRef.current.postMessage({
        type: "reset",
        params,
      });
    }
  };

  return {
    isRunning,
    params,
    stats,
    solution,
    error,
    updateParams,
    start,
    pause,
    reset,
  };
}
