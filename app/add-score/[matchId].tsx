import { useLocalSearchParams } from 'expo-router';
import AddScoreScreen from '../../screens/AddScoreScreen';

export default function AddScoreRoute() {
  const params = useLocalSearchParams<{
    matchId?: string;
    team1Name?: string;
    team2Name?: string;
    runs?: string;
    wickets?: string;
    overs?: string;
    status?: string;
    totalOvers?: string;
    oversPerBowler?: string;
    ballsPerOver?: string;
    team1Id?: string;
    team2Id?: string;
    battingTeamId?: string;
    fieldingTeamId?: string;
    battingTeamName?: string;
    fieldingTeamName?: string;
    strikerName?: string;
    nonStrikerName?: string;
    bowlerName?: string;
    targetRuns?: string;
  }>();

  return (
    <AddScoreScreen
      matchId={params.matchId ?? ''}
      team1Name={params.team1Name ?? ''}
      team2Name={params.team2Name ?? ''}
      runs={params.runs ?? ''}
      wickets={params.wickets ?? ''}
      overs={params.overs ?? ''}
      status={params.status ?? ''}
      totalOvers={params.totalOvers}
      oversPerBowler={params.oversPerBowler}
      ballsPerOver={params.ballsPerOver}
      team1Id={params.team1Id}
      team2Id={params.team2Id}
      battingTeamId={params.battingTeamId}
      fieldingTeamId={params.fieldingTeamId}
      battingTeamName={params.battingTeamName}
      fieldingTeamName={params.fieldingTeamName}
      strikerName={params.strikerName}
      nonStrikerName={params.nonStrikerName}
      bowlerName={params.bowlerName}
      targetRuns={params.targetRuns}
    />
  );
}