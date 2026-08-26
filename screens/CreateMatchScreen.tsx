  import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { createMatch } from '../src/api/matchApi'; // adjust path if needed

  export default function CreateMatchScreen() {
    const router = useRouter();
    const [team1Name, setTeam1Name] = useState('');
    const [team2Name, setTeam2Name] = useState('');
    const [loading, setLoading] = useState(false);
    const [team1Error, setTeam1Error] = useState('');
    const [team2Error, setTeam2Error] = useState('');

    // const validateForm = () => {
    //   const trimmedTeam1 = team1Name.trim();
    //   const trimmedTeam2 = team2Name.trim();

    //   let isValid = true;

    //   setTeam1Error('');
    //   setTeam2Error('');

    //   if (!trimmedTeam1) {
    //     setTeam1Error('Please enter Team 1 name');
    //     isValid = false;
    //   }

    //   if (!trimmedTeam2) {
    //     setTeam2Error('Please enter Team 2 name');
    //     isValid = false;
    //   }

    //   if (!isValid) {
    //     Alert.alert('Validation', 'Please enter both team names.');
    //   }

    //   return isValid;
    // };
    const validateForm = () => {
      const trimmedTeam1 = team1Name.trim();
      const trimmedTeam2 = team2Name.trim();

      const validNameRegex = /^[A-Za-z0-9 ]+$/;
      const maxLength = 4;

      let isValid = true;

      setTeam1Error('');
      setTeam2Error('');

      if (!trimmedTeam1) {
        setTeam1Error('Please enter Team 1 name');
        isValid = false;
      } else if (trimmedTeam1.length > maxLength) {
        setTeam1Error(`Team 1 name must be at most ${maxLength} characters`);
        isValid = false;
      } else if (!validNameRegex.test(trimmedTeam1)) {
        setTeam1Error('Team 1 name contains invalid characters');
        isValid = false;
      }

      if (!trimmedTeam2) {
        setTeam2Error('Please enter Team 2 name');
        isValid = false;
      } else if (trimmedTeam2.length > maxLength) {
        setTeam2Error(`Team 2 name must be at most ${maxLength} characters`);
        isValid = false;
      } else if (!validNameRegex.test(trimmedTeam2)) {
        setTeam2Error('Team 2 name contains invalid characters');
        isValid = false;
      }

      if (
        trimmedTeam1 &&
        trimmedTeam2 &&
        trimmedTeam1.toLowerCase() === trimmedTeam2.toLowerCase()
      ) {
        setTeam1Error('Team names must be different');
        setTeam2Error('Team names must be different');
        isValid = false;
      }

      if (!isValid) {
        Alert.alert('Validation', 'Please fix the highlighted fields.');
      }

      return isValid;
    };
    const handleSaveMatch = async () => {
      const trimmedTeam1 = team1Name.trim();
      const trimmedTeam2 = team2Name.trim();

      if (!validateForm()) {
        return;
      }

      try {
        setLoading(true);

        await createMatch({
          team1Name: trimmedTeam1,
          team2Name: trimmedTeam2,
        });

        router.back();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create match.';
        Alert.alert('Error', message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Create Match</Text>
        <Text style={styles.subtitle}>Milestone 3 demo form</Text>

        <Text style={styles.label}>Enter 1st Team Name</Text>
        <TextInput
          style={[styles.input, team1Error ? styles.inputError : null]}
          placeholder="Enter 1st Team Name"
          placeholderTextColor="#64748B"
          value={team1Name}
          onChangeText={(text) => {
            setTeam1Name(text);
            if (team1Error && text.trim()) {
              setTeam1Error('');
            }
          }}
          autoCapitalize="words"
        />
        {team1Error ? <Text style={styles.errorText}>{team1Error}</Text> : null}

        <Text style={styles.label}>Enter 2nd Team Name</Text>
        <TextInput
          style={[styles.input, team2Error ? styles.inputError : null]}
          placeholder="Enter 2nd Team Name"
          placeholderTextColor="#64748B"
          value={team2Name}
          onChangeText={(text) => {
            setTeam2Name(text);
            if (team2Error && text.trim()) {
              setTeam2Error('');
            }
          }}
          autoCapitalize="words"
        />
        {team2Error ? <Text style={styles.errorText}>{team2Error}</Text> : null}

        <Pressable
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleSaveMatch}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Saving...' : 'Save Match'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
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
    title: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: '800',
      marginTop: 20,
    },
    subtitle: {
      color: '#94A3B8',
      fontSize: 14,
      marginTop: 4,
      marginBottom: 24,
    },
    label: {
      color: '#E2E8F0',
      fontSize: 14,
      marginBottom: 8,
      marginTop: 8,
    },
    input: {
      backgroundColor: '#111C34',
      borderWidth: 1,
      borderColor: '#1E293B',
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 14,
      color: '#FFFFFF',
      marginBottom: 6,
    },
    inputError: {
      borderColor: '#EF4444',
    },
    errorText: {
      color: '#F87171',
      fontSize: 12,
      marginBottom: 10,
      marginTop: 2,
    },
    primaryButton: {
      backgroundColor: '#2563EB',
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 12,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
    secondaryButton: {
      backgroundColor: '#1E293B',
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: '#E2E8F0',
      fontSize: 16,
      fontWeight: '700',
    },
  });