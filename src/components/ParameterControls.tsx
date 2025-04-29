import { useState } from "react";
import { NQueensParams, SelectionStrategy } from "../types";

interface ParameterControlsProps {
  params: NQueensParams;
  isRunning: boolean;
  onUpdateParams: (params: Partial<NQueensParams>) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSaveConfig: (name: string) => boolean;
  onLoadConfig: (name: string) => boolean;
  savedConfigs: Record<string, NQueensParams>;
}

export default function ParameterControls({
  params,
  isRunning,
  onUpdateParams,
  onStart,
  onPause,
  onReset,
  onSaveConfig,
  onLoadConfig,
  savedConfigs,
}: ParameterControlsProps) {
  const [configName, setConfigName] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    key: keyof NQueensParams
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;

    if (key === "selectionStrategy") {
      onUpdateParams({ [key]: value as SelectionStrategy });
    } else {
      // Convert numerical inputs to numbers
      const numValue = e.target.type === "number" ? Number(value) : value;
      onUpdateParams({ [key]: numValue });
    }
  };

  const handleSaveConfig = () => {
    if (configName.trim()) {
      const success = onSaveConfig(configName.trim());
      if (success) {
        setConfigName("");
      }
    }
  };

  return (
    <div
      className="parameter-controls"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px",
        borderRadius: "8px",
        backgroundColor: "#f5f5f5",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ margin: "0 0 8px 0" }}>Algorithm Parameters</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Board Size */}
        <div>
          <label
            htmlFor="boardSize"
            style={{ display: "block", marginBottom: "4px" }}
          >
            Board Size (N):
          </label>
          <input
            id="boardSize"
            type="number"
            min="4"
            max="20"
            value={params.boardSize}
            onChange={(e) => handleInputChange(e, "boardSize")}
            disabled={isRunning}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        {/* Population Size */}
        <div>
          <label
            htmlFor="populationSize"
            style={{ display: "block", marginBottom: "4px" }}
          >
            Population Size:
          </label>
          <input
            id="populationSize"
            type="number"
            min="10"
            max="500"
            value={params.populationSize}
            onChange={(e) => handleInputChange(e, "populationSize")}
            disabled={isRunning}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        {/* Selection Strategy */}
        <div>
          <label
            htmlFor="selectionStrategy"
            style={{ display: "block", marginBottom: "4px" }}
          >
            Selection Strategy:
          </label>
          <select
            id="selectionStrategy"
            value={params.selectionStrategy}
            onChange={(e) => handleInputChange(e, "selectionStrategy")}
            disabled={isRunning}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="rouletteWheel">Roulette Wheel</option>
            <option value="tournament">Tournament</option>
          </select>
        </div>

        {/* Tournament Size (only visible when tournament selection is chosen) */}
        {params.selectionStrategy === "tournament" && (
          <div>
            <label
              htmlFor="tournamentSize"
              style={{ display: "block", marginBottom: "4px" }}
            >
              Tournament Size (K):
            </label>
            <input
              id="tournamentSize"
              type="number"
              min="2"
              max="10"
              value={params.tournamentSize}
              onChange={(e) => handleInputChange(e, "tournamentSize")}
              disabled={isRunning}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
        )}

        {/* Crossover Rate */}
        <div>
          <label
            htmlFor="crossoverRate"
            style={{ display: "block", marginBottom: "4px" }}
          >
            Crossover Rate: {params.crossoverRate.toFixed(2)}
          </label>
          <input
            id="crossoverRate"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={params.crossoverRate}
            onChange={(e) => handleInputChange(e, "crossoverRate")}
            disabled={isRunning}
            style={{ width: "100%" }}
          />
        </div>

        {/* Mutation Rate */}
        <div>
          <label
            htmlFor="mutationRate"
            style={{ display: "block", marginBottom: "4px" }}
          >
            Mutation Rate: {params.mutationRate.toFixed(2)}
          </label>
          <input
            id="mutationRate"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={params.mutationRate}
            onChange={(e) => handleInputChange(e, "mutationRate")}
            disabled={isRunning}
            style={{ width: "100%" }}
          />
        </div>

        {/* Max Generations */}
        <div>
          <label
            htmlFor="maxGenerations"
            style={{ display: "block", marginBottom: "4px" }}
          >
            Max Generations:
          </label>
          <input
            id="maxGenerations"
            type="number"
            min="10"
            max="10000"
            value={params.maxGenerations}
            onChange={(e) => handleInputChange(e, "maxGenerations")}
            disabled={isRunning}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        {isRunning ? (
          <button
            onClick={onPause}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f57c00",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Pause
          </button>
        ) : (
          <button
            onClick={onStart}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Start
          </button>
        )}
        <button
          onClick={onReset}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {/* Configuration Management */}
      <div
        style={{
          marginTop: "16px",
          borderTop: "1px solid #ddd",
          paddingTop: "16px",
        }}
      >
        <h3 style={{ margin: "0 0 8px 0" }}>Configuration</h3>

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Configuration name"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            style={{ flex: 1, padding: "8px" }}
          />
          <button
            onClick={handleSaveConfig}
            disabled={!configName.trim()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: configName.trim() ? "pointer" : "not-allowed",
              opacity: configName.trim() ? 1 : 0.7,
            }}
          >
            Save
          </button>
        </div>

        {Object.keys(savedConfigs).length > 0 && (
          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>Saved Configurations</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {Object.keys(savedConfigs).map((name) => (
                <button
                  key={name}
                  onClick={() => onLoadConfig(name)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#e0e0e0",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
