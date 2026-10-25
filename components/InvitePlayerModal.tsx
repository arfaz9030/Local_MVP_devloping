import * as Contacts from 'expo-contacts';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addPlayer, AddPlayerPayload } from '../src/api/matchApi';
import { COLORS } from '../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../src/theme/typography';
import { TeamQRModal } from './TeamQRModal';

interface InvitePlayerModalProps {
  visible: boolean;
  teamId: string | number;
  teamName: string;
  captainName?: string;
  city?: string;
  onClose: () => void;
  onPlayerAdded: (newPlayer: any) => void;
}

const PLAYER_ROLES = [
  'Batsman',
  'Bowler',
  'All-Rounder',
  'Wicketkeeper',
];

const BATTING_STYLES = ['Right-hand bat', 'Left-hand bat'];
const BOWLING_STYLES = [
  'Right-arm fast',
  'Right-arm medium',
  'Right-arm spin',
  'Left-arm fast',
  'Left-arm spin',
  'None',
];

export const InvitePlayerModal: React.FC<InvitePlayerModalProps> = ({
  visible,
  teamId,
  teamName,
  captainName,
  city,
  onClose,
  onPlayerAdded,
}) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  const topInset = Math.max(insets.top, statusBarHeight);
  const bottomInset = insets.bottom;

  const [playerName, setPlayerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState('All-Rounder');
  const [battingStyle, setBattingStyle] = useState('Right-hand bat');
  const [bowlingStyle, setBowlingStyle] = useState('Right-arm medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const handleShareTeamLink = async () => {
    try {
      await Share.share({
        title: `Invite to ${teamName}`,
        message: `Join our cricket team "${teamName}" on Match Day! (Team invitation demo share)`,
      });
    } catch (err: any) {
      console.error('Error sharing team link:', err);
    }
  };

  const handlePickContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Access to contacts was not granted. Please allow contact permissions in device settings or enter player details manually.'
        );
        return;
      }

      if (typeof Contacts.presentContactPickerAsync === 'function') {
        const contact = await Contacts.presentContactPickerAsync();
        if (contact) {
          const fullName =
            contact.name ||
            [contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
            '';
          if (fullName) {
            setPlayerName(fullName);
            if (error) setError('');
          }
          if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
            const rawNum = contact.phoneNumbers[0].number?.replace(/[^0-9]/g, '') || '';
            const cleanNum = rawNum.length > 10 ? rawNum.slice(-10) : rawNum;
            setMobileNumber(cleanNum);
          }
        }
      } else {
        Alert.alert('Contacts', 'Native contact picker is not supported on this platform.');
      }
    } catch (err: any) {
      if (err?.message && !err.message.toLowerCase().includes('cancel')) {
        Alert.alert('Contacts Error', 'Could not open device contact picker.');
      }
    }
  };

  const handleAddPlayer = async () => {
    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setError('Please enter player name');
      return;
    }

    const numericTeamId = Number(teamId);
    if (!numericTeamId || Number.isNaN(numericTeamId)) {
      setError('Valid team ID is required to add player.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload: AddPlayerPayload = {
        name: trimmedName,
        teamId: numericTeamId,
        mobileNumber: mobileNumber.trim() || undefined,
        jerseyNumber: jerseyNumber ? Number(jerseyNumber) : undefined,
        role: selectedRole,
        battingStyle,
        bowlingStyle: bowlingStyle === 'None' ? undefined : bowlingStyle,
      };

      try {
        const savedPlayer = await addPlayer(numericTeamId, payload);
        console.log('SAVED PLAYER FROM API:', savedPlayer);
        onPlayerAdded(savedPlayer);
      } catch (apiErr: any) {
        setError(apiErr?.message || 'Unable to add player. Please try again.');
        return;
      }

      // Reset form on success
      setPlayerName('');
      setMobileNumber('');
      setJerseyNumber('');
      setSelectedRole('All-Rounder');
      setBattingStyle('Right-hand bat');
      setBowlingStyle('Right-arm medium');
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to add player.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setPlayerName('');
    setMobileNumber('');
    setJerseyNumber('');
    setError('');
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleResetAndClose}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={handleResetAndClose} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}
          >
            <View
              style={[
                styles.modalContent,
                {
                  marginTop: topInset + 10,
                  paddingBottom: Math.max(bottomInset, 16) + 8,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                  <Icon source="account-plus" size={24} color={COLORS.brandTeal} />
                  <Text style={styles.headerTitle}>Add Player to Roster</Text>
                </View>
                <TouchableOpacity onPress={handleResetAndClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Icon source="close" size={24} color={COLORS.textDarkSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.subTitle}>Adding player to {teamName}</Text>

              {/* Quick Action Buttons Row: Share Link, From Contacts, Team QR */}
              <View style={styles.quickActionsContainer}>
                <TouchableOpacity
                  style={styles.shareLinkButton}
                  onPress={handleShareTeamLink}
                  activeOpacity={0.7}
                >
                  <View style={styles.shareLinkIconWrapper}>
                    <Icon source="share-variant" size={16} color={COLORS.brandTeal} />
                  </View>
                  <View style={styles.shareLinkTextWrapper}>
                    <Text style={styles.shareLinkTitle}>Share Link</Text>
                    <Text style={styles.shareLinkSubtitle}>Share sheet</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.contactsButton}
                  onPress={handlePickContact}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactsIconWrapper}>
                    <Icon source="contacts" size={16} color="#2563EB" />
                  </View>
                  <View style={styles.shareLinkTextWrapper}>
                    <Text style={styles.shareLinkTitle}>Contacts</Text>
                    <Text style={styles.shareLinkSubtitle}>Import</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.qrButton}
                  onPress={() => setQrModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.qrIconWrapper}>
                    <Icon source="qrcode-scan" size={16} color="#7C3AED" />
                  </View>
                  <View style={styles.shareLinkTextWrapper}>
                    <Text style={styles.shareLinkTitle}>Team QR</Text>
                    <Text style={styles.shareLinkSubtitle}>View QR</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR ADD MANUALLY</Text>
                <View style={styles.dividerLine} />
              </View>

              <ScrollView
                style={styles.formScroll}
                contentContainerStyle={{ paddingBottom: 12 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
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

                {/* Batting Style */}
                <Text style={styles.inputLabel}>Batting Style</Text>
                <View style={styles.rolesRow}>
                  {BATTING_STYLES.map((style) => {
                    const isSelected = battingStyle === style;
                    return (
                      <Pressable
                        key={style}
                        style={[
                          styles.roleChip,
                          isSelected ? styles.roleChipSelected : null,
                        ]}
                        onPress={() => setBattingStyle(style)}
                      >
                        <Text
                          style={[
                            styles.roleChipText,
                            isSelected ? styles.roleChipTextSelected : null,
                          ]}
                        >
                          {style}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Bowling Style */}
                <Text style={styles.inputLabel}>Bowling Style</Text>
                <View style={styles.rolesRow}>
                  {BOWLING_STYLES.map((style) => {
                    const isSelected = bowlingStyle === style;
                    return (
                      <Pressable
                        key={style}
                        style={[
                          styles.roleChip,
                          isSelected ? styles.roleChipSelected : null,
                        ]}
                        onPress={() => setBowlingStyle(style)}
                      >
                        <Text
                          style={[
                            styles.roleChipText,
                            isSelected ? styles.roleChipTextSelected : null,
                          ]}
                        >
                          {style}
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
                  onPress={handleResetAndClose}
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
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Team QR Modal */}
      {qrModalVisible ? (
        <TeamQRModal
          visible={qrModalVisible}
          team={{
            id: String(teamId),
            name: teamName,
            captainName: captainName || 'Team Captain',
            city: city || 'Hyderabad (Telangana)',
            players: [],
          }}
          onClose={() => setQrModalVisible(false)}
        />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill as any,
  },
  keyboardAvoid: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surfaceWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    maxHeight: '90%',
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
    marginBottom: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  shareLinkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 10,
    padding: 8,
  },
  contactsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 10,
    padding: 8,
  },
  qrButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#F3E8FF',
    borderRadius: 10,
    padding: 8,
  },
  shareLinkIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  contactsIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  qrIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  shareLinkTextWrapper: {
    flex: 1,
  },
  shareLinkTitle: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
  },
  shareLinkSubtitle: {
    fontSize: 9,
    color: COLORS.textDarkSecondary,
    marginTop: 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textDarkSecondary,
    letterSpacing: 0.5,
  },
  formScroll: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
    marginTop: 10,
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
