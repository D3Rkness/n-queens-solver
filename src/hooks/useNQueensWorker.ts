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
    // Ensure numeric values are actually numbers
    const sanitizedParams = sanitizeParams(newParams);
    const updatedParams = { ...params, ...sanitizedParams };
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

  // Save current configuration to localStorage
  const saveConfig = (name: string) => {
    try {
      const savedConfigs = JSON.parse(
        localStorage.getItem("nQueensConfigs") || "{}"
      );
      savedConfigs[name] = params;
      localStorage.setItem("nQueensConfigs", JSON.stringify(savedConfigs));
      return true;
    } catch (err) {
      setError(
        `Failed to save configuration: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      return false;
    }
  };

  // Load configuration from localStorage
  const loadConfig = (name: string) => {
    try {
      const savedConfigs = JSON.parse(
        localStorage.getItem("nQueensConfigs") || "{}"
      );
      const config = savedConfigs[name];
      if (config) {
        // Ensure numeric values are actually numbers after loading from localStorage
        updateParams(sanitizeParams(config));
        return true;
      }
      return false;
    } catch (err) {
      setError(
        `Failed to load configuration: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      return false;
    }
  };

  // Get all saved configurations
  const getSavedConfigs = () => {
    try {
      return JSON.parse(localStorage.getItem("nQueensConfigs") || "{}");
    } catch (err) {
      setError(
        `Failed to retrieve saved configurations: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      return {};
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
    saveConfig,
    loadConfig,
    getSavedConfigs,
  };
}
