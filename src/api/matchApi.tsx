import {
  getToken,
  handleUnauthorized
} from "../auth/tokenService";

export type Match = {
  matchId: string;
  team1Name: string;
  team2Name: string;
  runs: number;
  wickets: number;
  overs: number;
  status: string;
};

const BASE_URL = 'http://192.168.29.120:2020';

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    await handleUnauthorized();
    throw new Error('Authentication expired');
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}
export async function fetchMatches(): Promise<Match[]> {
  // const response = await fetch(`${BASE_URL}/api/matches`);
  const response = await fetch(`${BASE_URL}/api/matches`, {
    headers: await getAuthHeaders(),
  });
  return parseJsonResponse<Match[]>(response);
}

export async function fetchMatchById(matchId: string): Promise<Match> {
  // const response = await fetch(`${BASE_URL}/api/matches/${matchId}`);
  const response = await fetch(`${BASE_URL}/api/matches/${matchId}`, {
    headers: await getAuthHeaders(),
  });
  return parseJsonResponse<Match>(response);
}

export async function createMatch(payload: {
  team1Name: string;
  team2Name: string;
}): Promise<Match> {
  // const res = await fetch(`${BASE_URL}/api/matches`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  const res = await fetch(`${BASE_URL}/api/matches`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<Match>(res);
}

export async function addScore(
  matchId: string,
  payload: { runs: number; overs: number; wickets: number }
): Promise<Match> {
  // const res = await fetch(`${BASE_URL}/api/matches/${matchId}/score`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  const res = await fetch(`${BASE_URL}/api/matches/${matchId}/score`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<Match>(res);
}

export type Player = {
  id: number;
  name: string;
  jerseyNumber?: number;
  role?: string;
  battingStyle?: string;
  bowlingStyle?: string;
};

export interface AddPlayerPayload {
  name: string;
  teamId: number;
  mobileNumber?: string;
  jerseyNumber?: number;
  role?: string;
  battingStyle?: string;
  bowlingStyle?: string;
}

export async function addPlayer(
  teamId: number,
  player: AddPlayerPayload
) {
  const token = await getToken();
  const response = await fetch(
    `${BASE_URL}/api/teams/${teamId}/players`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(player),
    }
  );

  return parseJsonResponse(response);
}

export type TeamResponse = {
  id: number;
  name: string;
  captainName: string;
  logoUrl?: string;
  players: Player[];
};

export async function getTeams(): Promise<TeamResponse[]> {
  const token = await getToken();
  // console.log("Token Before API:", token);
  console.log('Authentication token available:', Boolean(token));
  // const res = await fetch(`${BASE_URL}/api/teams`);
  const res = await fetch(`${BASE_URL}/api/teams`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    await handleUnauthorized();
    throw new Error('Authentication expired');
  }

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}
export interface CreateTeamPayload {
  name: string;
  captainName: string;
  city?: string;
  captainNumber?: string;
  allowCaptainAddPlayers?: boolean;
  addSelf?: boolean;
  logoUrl?: string;
}

export async function createTeam(payload: CreateTeamPayload): Promise<TeamResponse> {
  // Only send fields confirmed by the backend Team model (name, captainName)
  const requestBody: { name: string; captainName: string } = {
    name: payload.name,
    captainName: payload.captainName,
  };

  const res = await fetch(`${BASE_URL}/api/teams`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(requestBody),
  });

  return parseJsonResponse<TeamResponse>(res);
}
async function getAuthHeaders() {
  const token = await getToken();
  console.log('Token:', Boolean(token));

  // console.log("Stored Token:", token);

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}