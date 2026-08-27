import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { addPlayer, AddPlayerPayload } from '../src/api/matchApi';
import { COLORS } from '../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../src/theme/typography';

interface InvitePlayerModalProps {
  visible: boolean;
  teamId: string | number;
  teamName: string;
  onClose: () => void;
  onPlayerAdded: (newPlayer: any) => void;
}

const PLAYER_ROLES = [
  'Batsman',
  'Bowler',
  'All-Rounder',
  'Wicketkeeper',
];

export const InvitePlayerModal: React.FC<InvitePlayerModalProps> = ({
  visible,
  teamId,
  teamName,
  onClose,
  onPlayerAdded,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState('All-Rounder');
  const [battingStyle, setBattingStyle] = useState('Right-hand bat');
  const [bowlingStyle, setBowlingStyle] = useState('Right-arm medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddPlayer = async () => {
    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setError('Please enter player name');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload: AddPlayerPayload = {
        name: trimmedName,
        teamId: Number(teamId),
        mobileNumber: mobileNumber.trim() || undefined,
        jerseyNumber: jerseyNumber ? Number(jerseyNumber) : undefined,
        role: selectedRole,
        battingStyle,
        bowlingStyle,
      };

      try {
        const savedPlayer = await addPlayer(Number(teamId), payload);
        console.log('SAVED PLAYER FROM API:', savedPlayer);
        onPlayerAdded(savedPlayer);
      } catch (apiErr: any) {
        setError(apiErr?.message || 'Unable to add player. Please try again.');
        return;
      }

      // Reset form
      setPlayerName('');
      setMobileNumber('');
      setJerseyNumber('');
      setSelectedRole('All-Rounder');
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to add player.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Icon source="account-plus" size={24} color={COLORS.brandTeal} />
              <Text style={styles.headerTitle}>Invite Player</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon source="close" size={24} color={COLORS.textDarkSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subTitle}>Adding player to {teamName}</Text>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Player Name */}
            <Text style={styles.inputLabel}>Player Name *</Text>
            <TextInput
              style={[styles.input, error && !playerName.trim() ? styles.inputError : null]}
              placeholder="e.g. Virat Kohli"
              placeholderTextColor={COLORS.placeholder}
              value={playerName}
              onChangeText={(text) => {
                setPlayerName(text);
                if (error) setError('');
              }}
              autoCapitalize="words"
            />
            {error && !playerName.trim() ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {/* Mobile Number */}
            <Text style={styles.inputLabel}>Mobile Number (optional)</Text>
            <View style={styles.phoneInputRow}>
              <Text style={styles.phonePrefix}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="10 digit mobile number"
                placeholderTextColor={COLORS.placeholder}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {/* Jersey Number */}
            <Text style={styles.inputLabel}>Jersey Number (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 18"
              placeholderTextColor={COLORS.placeholder}
              value={jerseyNumber}
              onChangeText={setJerseyNumber}
              keyboardType="number-pad"
              maxLength={3}
            />

            {/* Role Selection */}
            <Text style={styles.inputLabel}>Playing Role</Text>
            <View style={styles.rolesRow}>
              {PLAYER_ROLES.map((role) => {
                const isSelected = selectedRole === role;
                return (
                  <Pressable
                    key={role}
                    style={[
                      styles.roleChip,
                      isSelected ? styles.roleChipSelected : null,
                    ]}
                    onPress={() => setSelectedRole(role)}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        isSelected ? styles.roleChipTextSelected : null,
                      ]}
                    >
                      {role}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, loading ? styles.buttonDisabled : null]}
              onPress={handleAddPlayer}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Adding...' : 'Add Player'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surfaceWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
  },
  subTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textDarkSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  formScroll: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FONT_SIZE.md,
    color: COLORS.textDark,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginTop: 4,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  phonePrefix: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: FONT_SIZE.md,
    color: COLORS.textDark,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  roleChipSelected: {
    backgroundColor: COLORS.brandTeal,
    borderColor: COLORS.brandTeal,
  },
  roleChipText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
  },
  roleChipTextSelected: {
    color: COLORS.surfaceWhite,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDarkSecondary,
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: COLORS.brandTeal,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surfaceWhite,
  },
});
