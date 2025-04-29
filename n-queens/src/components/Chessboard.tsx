import { useMemo } from "react";

interface ChessboardProps {
  size: number;
  queens: number[];
}

export default function Chessboard({ size, queens }: ChessboardProps) {
  // Calculate conflicts for highlighting
  const conflicts = useMemo(() => {
    const conflictMap: boolean[] = Array(size).fill(false);

    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        // Check for same column or diagonal conflicts
        if (
          queens[i] === queens[j] || // Same column
          Math.abs(i - j) === Math.abs(queens[i] - queens[j]) // Diagonal
        ) {
          conflictMap[i] = true;
          conflictMap[j] = true;
        }
      }
    }

    return conflictMap;
  }, [queens, size]);

  return (
    <div
      className="chessboard"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gridTemplateRows: `repeat(${size}, 1fr)`,
        gap: 1,
        width: "100%",
        maxWidth: "500px",
        aspectRatio: "1 / 1",
        border: "2px solid #000",
      }}
    >
      {Array.from({ length: size })
        .map((_, row) =>
          Array.from({ length: size }).map((_, col) => {
            const isQueen = queens[row] === col;
            const hasConflict = isQueen && conflicts[row];
            const cellColor = (row + col) % 2 === 0 ? "#f0d9b5" : "#b58863";

            return (
              <div
                key={`${row}-${col}`}
                style={{
                  backgroundColor: cellColor,
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isQueen && (
                  <div
                    style={{
                      width: "80%",
                      height: "80%",
                      borderRadius: "50%",
                      backgroundColor: hasConflict ? "#ff6b6b" : "#66bb6a",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                    }}
                  >
                    Q
                  </div>
                )}
              </div>
            );
          })
        )
        .flat()}
    </div>
  );
}
