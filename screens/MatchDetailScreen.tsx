import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { fetchMatchById, Match } from '../src/api/matchApi'; // adjust path if needed

type MatchDetailRouteParams = {
  matchId?: string;
  team1Name?: string;
  team2Name?: string;
  runs?: string;
  wickets?: string;
  overs?: string;
  status?: string;
};

export default function MatchDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<MatchDetailRouteParams>();

  const matchId = params.matchId ?? '';

  const [match, setMatch] = useState<Match | null>(
    matchId
      ? {
          matchId,
          team1Name: params.team1Name ?? '',
          team2Name: params.team2Name ?? '',
          runs: Number(params.runs ?? 0),
          wickets: Number(params.wickets ?? 0),
          overs: Number(params.overs ?? 0),
          status: params.status ?? 'LIVE',
        }
      : null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMatch = useCallback(async () => {
    if (!matchId) {
      setError('Match ID is missing.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await fetchMatchById(matchId);
      setMatch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load match.');
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useFocusEffect(
    useCallback(() => {
      loadMatch();
    }, [loadMatch])
  );

  const handleAddScore = () => {
    if (!match) return;

    router.push({
      pathname: '/add-score/[matchId]',
      params: {
        matchId: match.matchId,
        team1Name: match.team1Name,
        team2Name: match.team2Name,
        runs: String(match.runs),
        wickets: String(match.wickets),
        overs: String(match.overs),
        status: match.status,
      },
    });
  };

  const handleShareScore = () => {
    if (!match) return;

    router.push({
      pathname: '/share-score/[matchId]',
      params: {
        matchId: match.matchId,
        team1Name: match.team1Name,
        team2Name: match.team2Name,
        runs: String(match.runs),
        wickets: String(match.wickets),
        overs: String(match.overs),
        status: match.status,
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading match...</Text>
      </View>
    );
  }

  if (error || !match) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error || 'Match not found.'}</Text>

        <Pressable style={styles.primaryButton} onPress={loadMatch}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </Pressable>

        <Pressable
          style={styles.tertiaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.tertiaryButtonText}>Back to Matches</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{match.status}</Text>
      </View>

      <Text style={styles.title}>
        {match.team1Name} vs {match.team2Name}
      </Text>

      <Text style={styles.matchId}>Match ID: {match.matchId}</Text>

      <View style={styles.scoreCard}>
        <Text style={styles.score}>
          {match.runs}/{match.wickets}
        </Text>
        <Text style={styles.overs}>{match.overs} overs</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Match Summary</Text>
        <Text style={styles.infoText}>Batting side is building pressure nicely.</Text>
        <Text style={styles.infoText}>This screen now fetches the latest score from backend.</Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={handleAddScore}>
        <Text style={styles.primaryButtonText}>Add Score</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={handleShareScore}>
        <Text style={styles.secondaryButtonText}>Share Score Poster</Text>
      </Pressable>

      <Pressable
        style={styles.tertiaryButton}
        onPress={() => router.back()}
      >
        <Text style={styles.tertiaryButtonText}>Back to Matches</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#CBD5E1',
    marginTop: 12,
    fontSize: 15,
  },
  errorText: {
    color: '#F87171',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 10,
    marginBottom: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  matchId: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  scoreCard: {
    backgroundColor: '#111C34',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 18,
  },
  score: {
    color: '#22C55E',
    fontSize: 44,
    fontWeight: '900',
  },
  overs: {
    color: '#E2E8F0',
    fontSize: 18,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 20,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  infoText: {
    color: '#CBD5E1',
    fontSize: 15,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '700',
  },
  tertiaryButton: {
    backgroundColor: '#020617',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tertiaryButtonText: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '700',
  },
});