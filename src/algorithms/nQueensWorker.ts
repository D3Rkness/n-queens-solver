import {
  GenerationStats,
  Individual,
  NQueensParams,
  WorkerMessage,
} from "../types";

// Define the worker context
const ctx: Worker = self as unknown as Worker;

let running = false;
let params: NQueensParams = {
  boardSize: 8,
  populationSize: 100,
  selectionStrategy: "rouletteWheel",
  tournamentSize: 5,
  crossoverRate: 0.8,
  mutationRate: 0.2,
  maxGenerations: 1000,
};

let population: Individual[] = [];
let generation = 0;
let bestSolution: Individual | null = null;

// Initialize the population with random individuals
function initializePopulation(): void {
  population = [];
  for (let i = 0; i < params.populationSize; i++) {
    population.push(createRandomIndividual());
  }
  evaluatePopulation();
}

// Create a random individual
function createRandomIndividual(): Individual {
  const n = params.boardSize;
  const genome = [];

  // Generate a random permutation to ensure one queen per row
  const available = Array.from({ length: n }, (_, i) => i);

  for (let i = 0; i < n; i++) {
    // Select a random column from the available ones
    const randomIndex = Math.floor(Math.random() * available.length);
    genome.push(available[randomIndex]);
    available.splice(randomIndex, 1);
  }

  return { genome, fitness: 0 };
}

// Calculate fitness for each individual
function evaluatePopulation(): void {
  for (let i = 0; i < population.length; i++) {
    population[i].fitness = calculateFitness(population[i].genome);
  }
}

// Calculate fitness for a specific genome
// Fitness is based on non-attacking pairs of queens
function calculateFitness(genome: number[]): number {
  const n = genome.length;

  // Maximum possible number of queen pairs
  // For n queens, we have n(n-1)/2 possible pairs
  const maxPairs = (n * (n - 1)) / 2;

  // Count conflicts (attacking pairs)
  let conflicts = 0;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      // Queens attack each other if:
      // 1. They are in the same column (genome[i] === genome[j])
      // 2. They are on the same diagonal:
      //    - Queens are on the same diagonal if the difference in rows equals
      //      the difference in columns
      //    - Row difference: j - i
      //    - Column difference: |genome[j] - genome[i]|
      if (
        genome[i] === genome[j] || // Same column conflict
        Math.abs(i - j) === Math.abs(genome[i] - genome[j]) // Diagonal conflict
      ) {
        conflicts++;
      }
    }
  }

  // Higher fitness means better solution
  // A perfect solution has maxPairs fitness (no conflicts)
  return maxPairs - conflicts;
}

// Select parents based on the specified selection strategy
function selectParents(): [Individual, Individual] {
  if (params.selectionStrategy === "rouletteWheel") {
    return [rouletteWheelSelection(), rouletteWheelSelection()];
  } else {
    return [tournamentSelection(), tournamentSelection()];
  }
}

// Roulette wheel selection
function rouletteWheelSelection(): Individual {
  const totalFitness = population.reduce((sum, ind) => sum + ind.fitness, 0);
  if (totalFitness === 0) {
    // If all individuals have zero fitness, select randomly
    return population[Math.floor(Math.random() * population.length)];
  }

  let value = Math.random() * totalFitness;
  for (let i = 0; i < population.length; i++) {
    value -= population[i].fitness;
    if (value <= 0) {
      return population[i];
    }
  }
  return population[population.length - 1];
}

// Tournament selection
function tournamentSelection(): Individual {
  let best: Individual | null = null;
  const tournamentSize = Math.min(params.tournamentSize, population.length);

  // Select random contestants for the tournament
  const contestants = [];
  const indices = new Set<number>();

  // Ensure we select unique contestants
  while (indices.size < tournamentSize) {
    const idx = Math.floor(Math.random() * population.length);
    if (!indices.has(idx)) {
      indices.add(idx);
      contestants.push(population[idx]);
    }
  }

  // Find the best contestant
  for (const contestant of contestants) {
    if (best === null || contestant.fitness > best.fitness) {
      best = contestant;
    }
  }

  return best!;
}

// Perform mutation on an individual
function mutate(individual: Individual): void {
  const n = params.boardSize;

  // Apply mutation based on mutation rate
  if (Math.random() <= params.mutationRate) {
    // For permutation-based representation, we swap positions
    // This preserves the one-queen-per-column property
    const pos1 = Math.floor(Math.random() * n);
    const pos2 = Math.floor(Math.random() * n);

    // Swap two positions
    const temp = individual.genome[pos1];
    individual.genome[pos1] = individual.genome[pos2];
    individual.genome[pos2] = temp;
  }
}

// Perform crossover between two parents using Partially Mapped Crossover (PMX)
function crossover(parent1: Individual, parent2: Individual): Individual {
  if (Math.random() > params.crossoverRate) {
    // No crossover, return a copy of parent1
    return { genome: [...parent1.genome], fitness: 0 };
  }

  const n = params.boardSize;

  // Create arrays to track the mapping between parent genomes
  const childGenome = Array(n).fill(-1);

  // Select two random crossover points
  const point1 = Math.floor(Math.random() * (n - 1));
  const point2 = Math.floor(Math.random() * (n - point1 - 1)) + point1 + 1;

  // Step 1: Copy the segment between crossover points from parent1 to child
  for (let i = point1; i <= point2; i++) {
    childGenome[i] = parent1.genome[i];
  }

  // Step 2: Create mapping between segments
  const mapping = new Map();
  for (let i = point1; i <= point2; i++) {
    mapping.set(parent1.genome[i], parent2.genome[i]);
  }

  // Step 3: Fill the remaining positions from parent2 using the mapping
  for (let i = 0; i < n; i++) {
    // Skip the positions already filled from parent1
    if (i >= point1 && i <= point2) continue;

    // Get the value from parent2
    let valueToMap = parent2.genome[i];

    // If the value is already in the child from the parent1 segment,
    // follow the mapping until we find an unused value
    while (childGenome.includes(valueToMap)) {
      valueToMap = mapping.get(valueToMap) || valueToMap;
    }

    childGenome[i] = valueToMap;
  }

  return { genome: childGenome, fitness: 0 };
}

// Validate a genome to ensure it's a valid permutation
function validateGenome(genome: number[]): boolean {
  const n = genome.length;
  const seen = new Set<number>();

  // Check if all values are valid (0 to n-1) and unique
  for (let i = 0; i < n; i++) {
    const val = genome[i];
    if (val < 0 || val >= n || seen.has(val)) {
      return false;
    }
    seen.add(val);
  }

  return seen.size === n;
}

// Create new generation
function createNewGeneration(): void {
  const newPopulation: Individual[] = [];
  const sortedPopulation = [...population].sort(
    (a, b) => b.fitness - a.fitness
  );

  // Elitism: keep the top individuals (10% of population)
  const eliteCount = Math.max(1, Math.floor(params.populationSize * 0.1));
  for (let i = 0; i < eliteCount && i < sortedPopulation.length; i++) {
    newPopulation.push({ ...sortedPopulation[i] });
  }

  // Create the rest of the population using crossover and mutation
  while (newPopulation.length < params.populationSize) {
    const [parent1, parent2] = selectParents();
    const child = crossover(parent1, parent2);

    // Apply mutation
    mutate(child);

    // Validate the child's genome before adding to population
    if (!validateGenome(child.genome)) {
      // If invalid, create a completely new random individual instead
      newPopulation.push(createRandomIndividual());
    } else {
      newPopulation.push(child);
    }
  }

  // Replace previous population
  population = newPopulation;
  evaluatePopulation();

  // Check for diversity - if population is too similar, introduce new random individuals
  checkAndMaintainDiversity();
}

// Check population diversity and introduce new individuals if needed
function checkAndMaintainDiversity(): void {
  // Calculate average fitness
  const totalFitness = population.reduce((sum, ind) => sum + ind.fitness, 0);
  const avgFitness = totalFitness / population.length;

  // Count how many individuals have exactly the same fitness as average
  let sameCount = 0;
  for (const ind of population) {
    if (Math.abs(ind.fitness - avgFitness) < 0.001) {
      sameCount++;
    }
  }

  // If more than 70% of population has same fitness, we have low diversity
  if (sameCount > population.length * 0.7) {
    // Replace 30% of population with new random individuals
    const replaceCount = Math.floor(population.length * 0.3);
    for (let i = 0; i < replaceCount; i++) {
      const randomIndividual = createRandomIndividual();
      randomIndividual.fitness = calculateFitness(randomIndividual.genome);
      // Replace a random individual (excluding the very best one)
      const replaceIndex =
        Math.floor(Math.random() * (population.length - 1)) + 1;
      population[replaceIndex] = randomIndividual;
    }
  }
}

// Calculate statistics for current generation
function calculateStatistics(): GenerationStats {
  let bestFitness = -Infinity;
  let worstFitness = Infinity;
  let totalFitness = 0;
  let bestIndex = 0;

  for (let i = 0; i < population.length; i++) {
    const fitness = population[i].fitness;
    totalFitness += fitness;

    if (fitness > bestFitness) {
      bestFitness = fitness;
      bestIndex = i;
    }

    if (fitness < worstFitness) {
      worstFitness = fitness;
    }
  }

  const averageFitness = totalFitness / population.length;
  const maxPairs = (params.boardSize * (params.boardSize - 1)) / 2;
  const solved = bestFitness === maxPairs;

  // Update best solution if we found a better one
  if (bestSolution === null || bestFitness > bestSolution.fitness) {
    bestSolution = { ...population[bestIndex] };
  }

  return {
    generation,
    bestFitness,
    averageFitness,
    worstFitness,
    bestGenome: [...population[bestIndex].genome],
    solved,
  };
}

// Run the genetic algorithm
function runGeneticAlgorithm(): void {
  if (!running) return;

  generation++;
  createNewGeneration();
  const stats = calculateStatistics();

  // Send update to the main thread
  ctx.postMessage({ type: "stats", data: stats });

  // Check if solution found or max generations reached
  if (stats.solved || generation >= params.maxGenerations) {
    running = false;
    ctx.postMessage({
      type: "solution",
      data: bestSolution,
    });
  } else {
    setTimeout(runGeneticAlgorithm, 0);
  }
}

// Handle messages from the main thread
ctx.addEventListener("message", (event: MessageEvent<WorkerMessage>) => {
  const { type, params: newParams } = event.data;

  switch (type) {
    case "init":
      if (newParams) {
        params = newParams;
      }
      generation = 0;
      bestSolution = null;
      initializePopulation();
      ctx.postMessage({
        type: "stats",
        data: calculateStatistics(),
      });
      break;

    case "start":
      running = true;
      if (generation === 0) {
        initializePopulation();
      }
      runGeneticAlgorithm();
      break;

    case "pause":
      running = false;
      break;

    case "reset":
      running = false;
      generation = 0;
      bestSolution = null;
      if (newParams) {
        params = newParams;
      }
      initializePopulation();
      ctx.postMessage({
        type: "stats",
        data: calculateStatistics(),
      });
      break;

    default:
      ctx.postMessage({
        type: "error",
        data: `Unknown message type: ${type}`,
      });
  }
});
