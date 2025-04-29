export type SelectionStrategy = "rouletteWheel" | "tournament";

export interface NQueensParams {
  boardSize: number;
  populationSize: number;
  selectionStrategy: SelectionStrategy;
  tournamentSize: number;
  crossoverRate: number;
  mutationRate: number;
  maxGenerations: number;
}

export interface Individual {
  genome: number[];
  fitness: number;
}

export interface GenerationStats {
  generation: number;
  bestFitness: number;
  averageFitness: number;
  worstFitness: number;
  bestGenome: number[];
  solved: boolean;
}

export interface WorkerMessage {
  type: "init" | "start" | "pause" | "reset" | "update";
  params?: NQueensParams;
  data?: unknown;
}

export interface WorkerResponse {
  type: "stats" | "solution" | "error";
  data: GenerationStats | Individual | string;
}
