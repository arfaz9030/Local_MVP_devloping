import { Match, Team, AuthUser } from '../types';
import { INITIAL_MATCHES, INITIAL_TEAMS } from '../data/mockData';

const MATCHES_KEY = 'localcrick_matches';
const TEAMS_KEY = 'localcrick_teams';
const USER_KEY = 'localcrick_auth_user';

export function getStoredMatches(): Match[] {
  try {
    const data = localStorage.getItem(MATCHES_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load matches from localStorage:', e);
  }
  saveStoredMatches(INITIAL_MATCHES);
  return INITIAL_MATCHES;
}

export function saveStoredMatches(matches: Match[]): void {
  try {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  } catch (e) {
    console.error('Failed to save matches to localStorage:', e);
  }
}

export function getStoredTeams(): Team[] {
  try {
    const data = localStorage.getItem(TEAMS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load teams from localStorage:', e);
  }
  saveStoredTeams(INITIAL_TEAMS);
  return INITIAL_TEAMS;
}

export function saveStoredTeams(teams: Team[]): void {
  try {
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  } catch (e) {
    console.error('Failed to save teams to localStorage:', e);
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const data = localStorage.getItem(USER_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load user from localStorage:', e);
  }
  return null;
}

export function saveStoredUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (e) {
    console.error('Failed to save user to localStorage:', e);
  }
}
