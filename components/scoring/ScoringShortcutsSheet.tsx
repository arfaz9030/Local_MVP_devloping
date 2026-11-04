import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { COLORS } from '../../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../../src/theme/typography';

export type ShortcutAction =
  | 'help'
  | 'rules'
  | 'scorer'
  | 'squad'
  | 'scorecard'
  | 'overs'
  | 'batters'
  | 'bonus'
  | 'more';

interface ScoringShortcutsSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectAction: (action: ShortcutAction) => void;
}

interface ShortcutItem {
  id: ShortcutAction;
  title: string;
  icon: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { id: 'help', title: 'Need Help', icon: 'help-circle-outline' },
  { id: 'rules', title: 'Match Rules', icon: 'file-document-outline' },
  { id: 'scorer', title: 'Change Scorer', icon: 'account-switch-outline' },
  { id: 'squad', title: 'Change Squad', icon: 'account-group-outline' },
  { id: 'scorecard', title: 'Full Scorecard', icon: 'clipboard-text-outline' },
  { id: 'overs', title: 'Match Overs', icon: 'clock-edit-outline' },
  { id: 'batters', title: 'Replace Batters', icon: 'swap-horizontal-bold' },
  { id: 'bonus', title: 'Bonus Runs', icon: 'plus-circle-outline' },
];

export const ScoringShortcutsSheet: React.FC<ScoringShortcutsSheetProps> = ({
  visible,
  onClose,
  onSelectAction,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          {/* Top Grab Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Heading with Decorative Side Lines */}
          <View style={styles.headerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.headingText}>Select a shortcut</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 4-column Grid */}
          <View style={styles.grid}>
            {SHORTCUTS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.gridItem}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  onSelectAction(item.id);
                }}
              >
                <View style={styles.iconCircle}>
                  <Icon source={item.icon} size={26} color={COLORS.textDark} />
                </View>
                <Text style={styles.itemLabel} numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom Action */}
          <TouchableOpacity
            style={styles.moreBtn}
            activeOpacity={0.7}
            onPress={() => {
              onClose();
              onSelectAction('more');
            }}
          >
            <Text style={styles.moreBtnText}>More shortcuts</Text>
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
  sheetContainer: {
    backgroundColor: COLORS.surfaceWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
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
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  headingText: {
    marginHorizontal: 14,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDarkSecondary,
    letterSpacing: 0.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  gridItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.regular,
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 16,
  },
  moreBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  moreBtnText: {
    color: COLORS.brandTeal,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
});
