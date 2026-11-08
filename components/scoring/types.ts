export type DeliveryType =
  | 'DOT'
  | 'RUN'
  | 'BOUNDARY_FOUR'
  | 'BOUNDARY_SIX'
  | 'WIDE'
  | 'NO_BALL'
  | 'BYE'
  | 'LEG_BYE'
  | 'WICKET';

export type DismissalType =
  | 'Bowled'
  | 'Caught'
  | 'LBW'
  | 'Run Out'
  | 'Stumped'
  | 'Hit Wicket';

export interface Delivery {
  id: string;
  type: DeliveryType;
  runs: number;
  extras: number;
  isLegal: boolean;
  display: string;
  strikerName: string;
  bowlerName: string;
  dismissal?: {
    type: DismissalType;
    outPlayerName: string;
    newPlayerName: string;
  };
  timestamp: number;
}

export interface BatterStats {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissalInfo?: string;
}

export interface BowlerStats {
  name: string;
  oversCompleted: number;
  currentOverBalls: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
}

export interface OverSummary {
  overNumber: number;
  bowlerName: string;
  deliveries: Delivery[];
  runs: number;
  wickets: number;
  extras: number;
}

export interface BowlerRecord {
  name: string;
  oversCompleted: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
}

export interface ScoringStateSnapshot {
  totalRuns: number;
  totalWickets: number;
  completedOvers: number;
  currentOverBalls: number;
  striker: BatterStats;
  nonStriker: BatterStats;
  bowler: BowlerStats;
  currentOverDeliveries: Delivery[];
  allCompletedOvers: OverSummary[];
  bowlerRecords: Record<string, BowlerRecord>;
  maxOversPerBowler: number;
  ballsPerOver: number;
  extrasBreakdown: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
  };
}
