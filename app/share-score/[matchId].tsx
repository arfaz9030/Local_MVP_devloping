import { useLocalSearchParams } from 'expo-router';
import ShareScoreScreen from '../../screens/ShareScoreScreen';

export default function ShareScoreRoute() {
  const params = useLocalSearchParams<{
    matchId?: string;
    team1Name?: string;
    team2Name?: string;
    runs?: string;
    wickets?: string;
    overs?: string;
    status?: string;
  }>();

  return (
    <ShareScoreScreen
      matchId={params.matchId ?? ''}
      team1Name={params.team1Name ?? ''}
      team2Name={params.team2Name ?? ''}
      runs={params.runs ?? ''}
      wickets={params.wickets ?? ''}
      overs={params.overs ?? ''}
      status={params.status ?? ''}
    />
  );
}