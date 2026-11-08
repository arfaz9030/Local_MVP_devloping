import React, { useState } from 'react';
import {
  Alert,
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
import { COLORS } from '../../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../../src/theme/typography';
import { BowlerRecord } from './types';

export interface SquadPlayerItem {
  id: string;
  name: string;
  role?: string;
}

interface SelectBowlerModalProps {
  visible: boolean;
  overNumber: number;
  fieldingTeamName: string;
  precedingBowlerName: string | null;
  maxOversPerBowler: number;
  bowlerRecords: Record<string, BowlerRecord>;
  fieldingSquad: SquadPlayerItem[];
  battingPlayerNames?: string[];
  onSelectBowler: (bowlerName: string) => void;
  onClose: () => void;
  canCancel?: boolean;
}

export const SelectBowlerModal: React.FC<SelectBowlerModalProps> = ({
  visible,
  overNumber,
  fieldingTeamName,
  precedingBowlerName,
  maxOversPerBowler,
  bowlerRecords,
  fieldingSquad,
  battingPlayerNames = [],
  onSelectBowler,
  onClose,
  canCancel = true,
}) => {
  const [customName, setCustomName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const normalize = (name: string) => name.trim().toLowerCase();

  // Validate and handle bowler pick
  const handlePickBowler = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a valid bowler name.');
      return;
    }

    const norm = normalize(trimmed);

    // 1. Validate: Cannot be a player from the batting team
    const isBattingPlayer = battingPlayerNames.some(
      (batName) => normalize(batName) === norm
    );
    if (isBattingPlayer) {
      const msg = `${trimmed} belongs to the batting team. Only players from ${fieldingTeamName} can bowl.`;
      setErrorMsg(msg);
      Alert.alert('Batting Team Player', msg);
      return;
    }

    // 2. Validate: Cannot bowl consecutive overs
    if (precedingBowlerName && normalize(precedingBowlerName) === norm) {
      const msg = `${trimmed} bowled the immediately preceding over (Over ${overNumber - 1}). Cricket rules require alternating bowlers from opposite ends.`;
      setErrorMsg(msg);
      Alert.alert('Consecutive Over Restricted', msg);
      return;
    }

    // 3. Validate: Cannot exceed bowling quota
    const record = bowlerRecords[trimmed] || bowlerRecords[Object.keys(bowlerRecords).find(k => normalize(k) === norm) || ''];
    const oversBowled = record ? record.oversCompleted : 0;
    if (oversBowled >= maxOversPerBowler) {
      const msg = `${trimmed} has completed their maximum quota of ${maxOversPerBowler} ${maxOversPerBowler === 1 ? 'over' : 'overs'} for this match.`;
      setErrorMsg(msg);
      Alert.alert('Bowling Quota Exceeded', msg);
      return;
    }

    setErrorMsg('');
    setCustomName('');
    onSelectBowler(trimmed);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (canCancel) onClose();
      }}
    >
      <Pressable
        style={styles.overlay}
        onPress={() => {
          if (canCancel) onClose();
        }}
      >
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Grab Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.titleText}>Select Bowler • Over {overNumber}</Text>
              <Text style={styles.subTitleText}>
                Fielding Team: {fieldingTeamName} • Quota: {maxOversPerBowler} {maxOversPerBowler === 1 ? 'over' : 'overs'} max
              </Text>
            </View>

            {canCancel ? (
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.closeBtn}
              >
                <Icon source="close" size={24} color={COLORS.textDarkSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Consecutive Bowler Notice Banner */}
          {precedingBowlerName ? (
            <View style={styles.noticeBanner}>
              <Icon source="alert-circle-outline" size={18} color={COLORS.boundaryFour} />
              <Text style={styles.noticeText}>
                <Text style={{ fontWeight: FONT_WEIGHT.bold }}>{precedingBowlerName}</Text> bowled Over {overNumber - 1} and cannot bowl consecutive overs.
              </Text>
            </View>
          ) : null}

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Icon source="close-circle-outline" size={18} color={COLORS.error} />
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Bowler Candidates List */}
          <Text style={styles.sectionLabel}>Available Bowlers ({fieldingTeamName})</Text>

          <ScrollView
            style={styles.bowlerList}
            contentContainerStyle={styles.bowlerListContent}
            showsVerticalScrollIndicator={false}
          >
            {fieldingSquad.map((player) => {
              const normPlayer = normalize(player.name);
              const isConsecutive =
                precedingBowlerName && normalize(precedingBowlerName) === normPlayer;
              const record = bowlerRecords[player.name] || bowlerRecords[Object.keys(bowlerRecords).find(k => normalize(k) === normPlayer) || ''];
              const oversBowled = record ? record.oversCompleted : 0;
              const isQuotaExceeded = oversBowled >= maxOversPerBowler;
              const isEligible = !isConsecutive && !isQuotaExceeded;

              return (
                <TouchableOpacity
                  key={player.id}
                  style={[
                    styles.bowlerCard,
                    !isEligible && styles.bowlerCardDisabled,
                    isEligible && styles.bowlerCardEligible,
                  ]}
                  activeOpacity={isEligible ? 0.7 : 0.9}
                  onPress={() => handlePickBowler(player.name)}
                >
                  <View style={styles.bowlerCardLeft}>
                    <View
                      style={[
                        styles.avatarCircle,
                        isEligible
                          ? { backgroundColor: COLORS.brandTeal }
                          : { backgroundColor: COLORS.borderLight },
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarText,
                          isEligible ? { color: COLORS.surfaceWhite } : { color: COLORS.textDarkSecondary },
                        ]}
                      >
                        {player.name.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text
                        style={[
                          styles.bowlerName,
                          !isEligible && styles.bowlerNameMuted,
                        ]}
                        numberOfLines={1}
                      >
                        {player.name}
                      </Text>
                      <Text style={styles.bowlerSub}>
                        {player.role || 'Bowler'} • Bowled: {oversBowled}/{maxOversPerBowler} ov
                        {record && record.runsConceded > 0 ? ` (${record.runsConceded}R, ${record.wickets}W)` : ''}
                      </Text>
                    </View>
                  </View>

                  {/* Status Badge */}
                  {isConsecutive ? (
                    <View style={[styles.statusBadge, styles.badgeConsecutive]}>
                      <Text style={styles.badgeConsecutiveText}>Consecutive</Text>
                    </View>
                  ) : isQuotaExceeded ? (
                    <View style={[styles.statusBadge, styles.badgeQuota]}>
                      <Text style={styles.badgeQuotaText}>Quota Full</Text>
                    </View>
                  ) : (
                    <View style={styles.selectPill}>
                      <Text style={styles.selectPillText}>Select</Text>
                      <Icon source="chevron-right" size={16} color={COLORS.surfaceWhite} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Custom Bowler Fallback */}
          <View style={styles.customSection}>
            <Text style={styles.customLabel}>Or Enter Another Bowler from {fieldingTeamName}</Text>
            <View style={styles.customInputRow}>
              <TextInput
                style={styles.customInput}
                placeholder="e.g. Jasprit Patel"
                placeholderTextColor={COLORS.placeholder}
                value={customName}
                onChangeText={(txt) => {
                  setCustomName(txt);
                  if (errorMsg) setErrorMsg('');
                }}
              />
              <TouchableOpacity
                style={[
                  styles.customSubmitBtn,
                  !customName.trim() && styles.customSubmitBtnDisabled,
                ]}
                disabled={!customName.trim()}
                onPress={() => handlePickBowler(customName)}
              >
                <Text style={styles.customSubmitBtnText}>Assign</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlayDark,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surfaceWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '85%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12,
  },
  titleText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
  },
  subTitleText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDarkSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noticeText: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    color: '#92400E',
    lineHeight: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorBannerText: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    lineHeight: 16,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDarkSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  bowlerList: {
    maxHeight: 250,
  },
  bowlerListContent: {
    gap: 8,
    paddingBottom: 6,
  },
  bowlerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  bowlerCardEligible: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.borderLight,
  },
  bowlerCardDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.75,
  },
  bowlerCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  bowlerName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
  },
  bowlerNameMuted: {
    color: COLORS.textDarkSecondary,
  },
  bowlerSub: {
    fontSize: 11,
    color: COLORS.textDarkSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeConsecutive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  badgeConsecutiveText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: '#92400E',
  },
  badgeQuota: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  badgeQuotaText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: '#991B1B',
  },
  selectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandTeal,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 2,
  },
  selectPillText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surfaceWhite,
  },
  customSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  customLabel: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDarkSecondary,
    marginBottom: 6,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  customInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textDark,
  },
  customSubmitBtn: {
    backgroundColor: COLORS.brandTeal,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customSubmitBtnDisabled: {
    backgroundColor: COLORS.textDarkSecondary,
    opacity: 0.5,
  },
  customSubmitBtnText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
});
