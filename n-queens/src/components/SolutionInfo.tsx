import { Individual } from "../types";

interface SolutionInfoProps {
  solution: Individual | null;
  boardSize: number;
}

export default function SolutionInfo({
  solution,
  boardSize,
}: SolutionInfoProps) {
  if (!solution) {
    return null;
  }

  const maxPairs = (boardSize * (boardSize - 1)) / 2;
  const solved = solution.fitness === maxPairs;

  // Format solution as JSON
  const solutionJson = JSON.stringify(solution.genome, null, 2);

  // Format solution as coordinate pairs
  const coordinatePairs = solution.genome
    .map((col, row) => `(${row}, ${col})`)
    .join(", ");

  // Handle copying solution to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .catch((err) => console.error("Failed to copy to clipboard:", err));
  };

  // Handle downloading solution as JSON
  const downloadSolution = () => {
    const blob = new Blob([solutionJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `n-queens-solution-${boardSize}.json`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  return (
    <div
      className="solution-info"
      style={{
        padding: "16px",
        backgroundColor: solved ? "#e8f5e9" : "#fff3e0",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginTop: "16px",
      }}
    >
      <h2
        style={{ margin: "0 0 16px 0", color: solved ? "#2e7d32" : "#ef6c00" }}
      >
        {solved ? "Solution Found!" : "Best Solution So Far"}
      </h2>

      <div style={{ marginBottom: "16px" }}>
        <div>
          <strong>Fitness:</strong> {solution.fitness} / {maxPairs}
        </div>
        <div>
          <strong>Queens Placement:</strong> {coordinatePairs}
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => copyToClipboard(coordinatePairs)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#673ab7",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Copy Coordinates
        </button>

        <button
          onClick={() => copyToClipboard(solutionJson)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2196f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Copy JSON
        </button>

        <button
          onClick={downloadSolution}
          style={{
            padding: "8px 16px",
            backgroundColor: "#009688",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Download JSON
        </button>
      </div>
    </div>
  );
}
