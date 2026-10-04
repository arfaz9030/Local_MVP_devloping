import React, { useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../src/theme/typography';

interface AddSquadPlayerModalProps {
  visible: boolean;
  teamName: string;
  onAddPlayer: (player: {
    id: string;
    name: string;
    jerseyNumber?: number;
    role: string;
    battingStyle?: string;
    bowlingStyle?: string;
  }) => void;
  onClose: () => void;
}

const ROLES = ['Batsman', 'Bowler', 'All-Rounder', 'WK-Batsman'];
const BATTING_STYLES = ['Right Hand Bat', 'Left Hand Bat'];
const BOWLING_STYLES = [
  'Right-arm Fast',
  'Right-arm Medium',
  'Right-arm Spin',
  'Left-arm Fast',
  'Left-arm Spin',
  'None',
];

export const AddSquadPlayerModal: React.FC<AddSquadPlayerModalProps> = ({
  visible,
  teamName,
  onAddPlayer,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  const topInset = Math.max(insets.top, statusBarHeight);

  const [name, setName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [role, setRole] = useState('Batsman');
  const [battingStyle, setBattingStyle] = useState('Right Hand Bat');
  const [bowlingStyle, setBowlingStyle] = useState('Right-arm Medium');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter player name');
      return;
    }

    const jNum = jerseyNumber.trim() ? parseInt(jerseyNumber.trim(), 10) : undefined;

    onAddPlayer({
      id: 'quick_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: trimmed,
      jerseyNumber: Number.isNaN(jNum) ? undefined : jNum,
      role,
      battingStyle,
      bowlingStyle: bowlingStyle === 'None' ? undefined : bowlingStyle,
    });

    handleClose();
  };

  const handleClose = () => {
    setName('');
    setJerseyNumber('');
    setRole('Batsman');
    setBattingStyle('Right Hand Bat');
    setBowlingStyle('Right-arm Medium');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.container, { paddingTop: topInset }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Icon source="arrow-left" size={24} color={COLORS.surfaceWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Player to {teamName}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {error ? (
            <View style={styles.errorBox}>
              <Icon source="alert-circle-outline" size={18} color="#F87171" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Player Name */}
          <Text style={styles.fieldLabel}>PLAYER NAME *</Text>
          <View style={styles.inputWrapper}>
            <Icon source="account-outline" size={20} color={COLORS.placeholder} />
            <TextInput
              style={styles.inputField}
              placeholder="e.g. Rohit Sharma"
              placeholderTextColor={COLORS.placeholder}
              value={name}
              onChangeText={(val) => {
                setName(val);
                setError('');
              }}
              autoFocus
            />
          </View>

          {/* Jersey Number */}
          <Text style={styles.fieldLabel}>JERSEY NUMBER (OPTIONAL)</Text>
          <View style={styles.inputWrapper}>
            <Icon source="tshirt-crew-outline" size={20} color={COLORS.placeholder} />
            <TextInput
              style={styles.inputField}
              placeholder="e.g. 45"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="number-pad"
              maxLength={3}
              value={jerseyNumber}
              onChangeText={setJerseyNumber}
            />
          </View>

          {/* Playing Role */}
          <Text style={styles.fieldLabel}>PLAYING ROLE</Text>
          <View style={styles.chipsRow}>
            {ROLES.map((r) => {
              const isSelected = role === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Batting Style */}
          <Text style={styles.fieldLabel}>BATTING STYLE</Text>
          <View style={styles.chipsRow}>
            {BATTING_STYLES.map((b) => {
              const isSelected = battingStyle === b;
              return (
                <TouchableOpacity
                  key={b}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setBattingStyle(b)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {b}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bowling Style */}
          <Text style={styles.fieldLabel}>BOWLING STYLE</Text>
          <View style={styles.chipsRow}>
            {BOWLING_STYLES.map((bs) => {
              const isSelected = bowlingStyle === bs;
              return (
                <TouchableOpacity
                  key={bs}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setBowlingStyle(bs)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {bs}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Add & Select for Playing XI</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.brandRed,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    flex: 1,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#451A1A',
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    color: COLORS.errorText,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    flex: 1,
  },
  fieldLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
    marginBottom: 10,
  },
  inputField: {
    flex: 1,
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: '#0F766E',
    borderColor: COLORS.brandTeal,
  },
  chipText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.surfaceWhite,
    fontWeight: FONT_WEIGHT.bold,
  },
  submitBtn: {
    backgroundColor: COLORS.brandTeal,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
});
