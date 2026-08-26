import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ShareScoreProps = {
  matchId: string;
  team1Name: string;
  team2Name: string;
  runs: string;
  wickets: string;
  overs: string;
  status: string;
};

export default function ShareScoreScreen({
  matchId,
  team1Name,
  team2Name,
  runs,
  wickets,
  overs,
  status,
}: ShareScoreProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.poster}>
        <Text style={styles.academyName}>CrickHero Elite Academy</Text>
        <Text style={styles.tagline}>Official Match Scorecard</Text>

        <Text style={styles.vsText}>
          {team1Name} vs {team2Name}
        </Text>

        <View style={styles.scoreBlock}>
          <Text style={styles.score}>
            {runs}/{wickets}
          </Text>
          <Text style={styles.overs}>Overs: {overs}</Text>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{status}</Text>
        </View>

        <Text style={styles.footerLine}>
          Join our academy to play competitive matches with live scoring every weekend.
        </Text>
        <Text style={styles.footerSubLine}>Hyderabad • Gachibowli • Limited seats</Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={handleBack}>
        <Text style={styles.primaryButtonText}>Back to Match</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
    alignItems: 'center',
  },
  poster: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
    alignItems: 'center',
  },
  academyName: {
    color: '#FACC15',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tagline: {
    color: '#E5E7EB',
    fontSize: 13,
    marginBottom: 16,
  },
  vsText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 18,
    textAlign: 'center',
  },
  scoreBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  score: {
    color: '#22C55E',
    fontSize: 40,
    fontWeight: '900',
  },
  overs: {
    color: '#E5E7EB',
    fontSize: 16,
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  footerLine: {
    color: '#BFDBFE',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },
  footerSubLine: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '700',
  },
});