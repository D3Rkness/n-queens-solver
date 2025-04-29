# N-Queens GA Solver

### by Jonathan for Artificial Intelligence

A browser-based interactive demo that uses a Genetic Algorithm to solve the N-Queens puzzle. Pick board size, population size, selection strategy, crossover/mutation rates, and watch the population evolve generation by generation.

Link: https://d3rkness.github.io/n-queens-solver/

## Features

- **Dynamic Parameters**: Adjust N (4–50), population size, selection (roulette/tournament), crossover & mutation rates, and max generations
- **Real-Time Visualization**:
  - Chessboard view of the current best candidate, with attacking queens highlighted
  - Fitness Curve (best/average/worst) updating live
- **Controls**: Start, Pause, Reset
- **Exports**: Copy or download the final solution as JSON or coordinate list

## Prerequisites

- Node.js ≥ 16
- npm or yarn

## To run Locally:

```
pnpm i
pnpm dev
```

## Usage

1. **Set Parameters**
   - Board Size (N): number of queens/rows
   - Population Size: number of candidate solutions per generation
   - Selection Strategy:
     - Roulette Wheel (fitness-proportional)
     - Tournament (set tournament size K)
   - Crossover Rate: probability [0.00–1.00] of recombining parents
   - Mutation Rate: probability [0.00–1.00] of swapping two genes
   - Max Generations: stop if no solution by this limit
2. **Controls**
   - Start: begin evolving
   - Pause: halt evolution
   - Reset: re-initialize population (with current parameters)
3. **Visualization**
   - Chessboard: shows the best genome each generation; attacking queens turn red
   - Fitness Chart: real-time line plot of best, average, and worst fitness
   - Solution Info: once solved (fitness = N·(N–1)/2), copy or download results

## Implementation Details

This app directly implements and visualizes the concepts from "Genetic Algorithms" lecture:

- **Genetic Encoding & Initialization**

  - Uses a permutation genome [g0…gN–1] to enforce one queen per row/column

- **Fitness Assignment**

  - Computes fitness as maxPairs – conflicts (pair-wise diagonal and column attacks) mirroring the lecture's evaluation function

- **Selection Strategies**

  - Implements both Roulette Wheel (fitness-proportional) and Tournament selection

- **Crossover & Mutation**

  - Uses Partially Mapped Crossover (PMX) to maintain valid permutations and swap-based mutation

- **Elitism & Diversity Controls**

  - Retains top 10% (elitism) and introduces random individuals if diversity drops—an extension of "reproduce" pseudocode to avoid premature convergence

- **Loop & Termination**
  - Matches the lecture's "while generation count is within limit" pseudocode, stopping on perfect fitness or max iterations
