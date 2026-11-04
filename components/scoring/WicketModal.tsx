import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { COLORS } from '../../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../../src/theme/typography';
import { DismissalType } from './types';

interface WicketModalProps {
  visible: boolean;
  strikerName: string;
  nonStrikerName: string;
  availableSquad?: string[];
  onConfirmWicket: (payload: {
    type: DismissalType;
    outPlayerName: string;
    newPlayerName: string;
    isStrikerOut: boolean;
  }) => void;
  onClose: () => void;
}

const DISMISSAL_TYPES: DismissalType[] = [
  'Bowled',
  'Caught',
  'LBW',
  'Run Out',
  'Stumped',
  'Hit Wicket',
];

export const WicketModal: React.FC<WicketModalProps> = ({
  visible,
  strikerName,
  nonStrikerName,
  availableSquad,
  onConfirmWicket,
  onClose,
}) => {
  const [selectedType, setSelectedType] = useState<DismissalType>('Bowled');
  const [outPlayer, setOutPlayer] = useState<'striker' | 'nonStriker'>('striker');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const trimmed = newPlayerName.trim();
    if (!trimmed) {
      setError('Please specify the incoming batsman name.');
      return;
    }
    setError('');
    const outName = outPlayer === 'striker' ? strikerName : nonStrikerName;
    onConfirmWicket({
      type: selectedType,
      outPlayerName: outName,
      newPlayerName: trimmed,
      isStrikerOut: outPlayer === 'striker',
    });
    setNewPlayerName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.wicketBadge}>
                <Text style={styles.wicketBadgeText}>OUT</Text>
              </View>
              <Text style={styles.headerTitle}>Fall of Wicket</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon source="close" size={24} color={COLORS.textDarkSecondary} />
            </TouchableOpacity>
          </View>

          {/* Dismissal Method Picker */}
          <Text style={styles.sectionLabel}>Dismissal Type</Text>
          <View style={styles.typeGrid}>
            {DISMISSAL_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeChip,
                  selectedType === t && styles.typeChipActive,
                ]}
                onPress={() => setSelectedType(t)}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    selectedType === t && styles.typeChipTextActive,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Who is Out Selector */}
          <Text style={styles.sectionLabel}>Batsman Out</Text>
          <View style={styles.playerSelectRow}>
            <TouchableOpacity
              style={[
                styles.playerOption,
                outPlayer === 'striker' && styles.playerOptionActive,
              ]}
              onPress={() => setOutPlayer('striker')}
            >
              <Text style={styles.playerOptionRole}>Striker</Text>
              <Text style={styles.playerOptionName} numberOfLines={1}>
                {strikerName}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.playerOption,
                outPlayer === 'nonStriker' && styles.playerOptionActive,
              ]}
              onPress={() => setOutPlayer('nonStriker')}
            >
              <Text style={styles.playerOptionRole}>Non-Striker</Text>
              <Text style={styles.playerOptionName} numberOfLines={1}>
                {nonStrikerName}
              </Text>
            </TouchableOpacity>
          </View>

          {/* New Batsman Input */}
          <Text style={styles.sectionLabel}>New Batsman</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter next batsman name (e.g. Rahul Varma)"
            placeholderTextColor={COLORS.placeholder}
            value={newPlayerName}
            onChangeText={(txt) => {
              setNewPlayerName(txt);
              if (error) setError('');
            }}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmBtn}
            activeOpacity={0.8}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmBtnText}>Confirm Wicket & Continue</Text>
          </TouchableOpacity>
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
  content: {
    backgroundColor: COLORS.surfaceWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wicketBadge: {
    backgroundColor: COLORS.ballWicket,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  wicketBadgeText: {
    color: COLORS.surfaceWhite,
    fontWeight: FONT_WEIGHT.extraBold,
    fontSize: FONT_SIZE.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
  },
  closeBtn: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDarkSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 10,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  typeChipActive: {
    backgroundColor: COLORS.ballWicket,
    borderColor: COLORS.ballWicket,
  },
  typeChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textDark,
    fontWeight: FONT_WEIGHT.regular,
  },
  typeChipTextActive: {
    color: COLORS.surfaceWhite,
    fontWeight: FONT_WEIGHT.bold,
  },
  playerSelectRow: {
    flexDirection: 'row',
    gap: 10,
  },
  playerOption: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    padding: 12,
  },
  playerOptionActive: {
    borderColor: COLORS.ballWicket,
    backgroundColor: '#FEF2F2',
  },
  playerOptionRole: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDarkSecondary,
    marginBottom: 2,
  },
  playerOptionName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FONT_SIZE.md,
    color: COLORS.textDark,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginTop: 6,
  },
  confirmBtn: {
    backgroundColor: COLORS.ballWicket,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  confirmBtnText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
});
