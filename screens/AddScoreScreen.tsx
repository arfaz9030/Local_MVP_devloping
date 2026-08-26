import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { addScore } from '../src/api/matchApi'; // <-- adjust path if needed

type AddScoreProps = {
  matchId: string;
  team1Name: string;
  team2Name: string;
  runs: string;
  wickets: string;
  overs: string;
  status: string;
};

export default function AddScoreScreen({
  matchId,
  team1Name,
  team2Name,
  runs,
  wickets,
  overs,
}: AddScoreProps) {
  const router = useRouter();

  const [newRuns, setNewRuns] = useState(runs);
  const [newWickets, setNewWickets] = useState(wickets);
  const [newOvers, setNewOvers] = useState(overs);
  const [loading, setLoading] = useState(false);

 const handleSave = async () => {
    if (loading) return; // extra safety

    const runsTrimmed = newRuns.trim();
    const wicketsTrimmed = newWickets.trim();
    const oversTrimmed = newOvers.trim();

    if (!runsTrimmed || !oversTrimmed) {
      Alert.alert('Validation', 'Please enter at least runs and overs.');
      return;
    }

    const runsNumber = parseInt(runsTrimmed, 10);
    const wicketsNumber = wicketsTrimmed ? parseInt(wicketsTrimmed, 10) : 0;
    const oversNumber = parseFloat(oversTrimmed);

    if (Number.isNaN(runsNumber) || Number.isNaN(oversNumber)) {
      Alert.alert('Validation', 'Runs and overs must be valid numbers.');
      return;
    }

    if (runsNumber < 0 || wicketsNumber < 0 || oversNumber < 0) {
      Alert.alert('Validation', 'Score values cannot be negative.');
      return;
    }

    try {
      setLoading(true);

      await addScore(matchId, {
        runs: runsNumber,
        overs: oversNumber,
        wickets: wicketsNumber,
      });

      // Optional success message
      // Alert.alert('Success', 'Score updated.');

      router.back();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update score.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Update Score</Text>
        <Text style={styles.subtitle}>
          {team1Name} vs {team2Name}
        </Text>
        <Text style={styles.matchId}>Match ID: {matchId}</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Runs</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={newRuns}
          onChangeText={setNewRuns}
          placeholder="e.g. 120"
          placeholderTextColor="#64748B"
        />

        <Text style={styles.label}>Wickets</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={newWickets}
          onChangeText={setNewWickets}
          placeholder="e.g. 3"
          placeholderTextColor="#64748B"
        />

        <Text style={styles.label}>Overs</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={newOvers}
          onChangeText={setNewOvers}
          placeholder="e.g. 12.4"
          placeholderTextColor="#64748B"
        />
      </View>

      <Pressable
        style={[
          styles.primaryButton,
          loading && { opacity: 0.6 },
        ]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'Saving…' : 'Save Score'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>Cancel</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
  },
  headerBlock: {
    marginBottom: 18,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#38BDF8',
    fontSize: 14,
    marginTop: 4,
  },
  matchId: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 6,
  },
  formCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginBottom: 20,
  },
  label: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#16A34A',
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
  },
  secondaryButtonText: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '700',
  },
});