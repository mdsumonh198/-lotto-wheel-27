export interface Ticket {
  id: string;
  numbers: number[]; // sorted numbers in pool
  priorityRank: number; // 1 = highest marginal coverage
}

export interface TicketEvaluation {
  id: string;
  priorityRank: number;
  numbers: number[];
  matches: number;
  matchedDigits: number[];
  unmatchedDigits: number[];
  inBudget: boolean;
}

export interface GameConfig {
  poolSize: number; // v: 20, 27, 36
  pickSize: number; // k: 5, 6
  guarantee: number; // t: 3, 4, 5
  drawnNumbers: number; // m: 6
}

export interface MatchCounts {
  6: number;
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
  0: number;
}
