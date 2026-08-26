export type MatchStatus = 'LIVE' | 'IN PROGRESS' | 'COMPLETED';

export interface Match {
  matchId: string;
  team1Name: string;
  team2Name: string;
  runs: number;
  wickets: number;
  overs: number;
  status: MatchStatus;
  summary?: string;
  currentInning?: string;
  target?: number;
  recentBalls?: string[];
  lastUpdated?: string;
}

export type PlayerRole = 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper';

export interface Player {
  id: string;
  name: string;
  jerseyNumber?: number;
  role?: PlayerRole;
  runsScored?: number;
  wicketsTaken?: number;
}

export interface Team {
  id: string;
  name: string;
  captainName: string;
  logoUrl?: string;
  city?: string;
  players: Player[];
}

export interface AuthUser {
  userId: number;
  name: string;
  mobileNumber: string;
  token?: string;
  isGuest?: boolean;
}

export type TabType = 'matches' | 'teams' | 'academy' | 'profile';

export type OnboardingStep =
  | 'PROMO'
  | 'TRUECALLER'
  | 'LOGIN_OPTIONS'
  | 'OTP_INPUT'
  | 'WAITING'
  | 'SURVEY'
  | 'COMPLETED';
