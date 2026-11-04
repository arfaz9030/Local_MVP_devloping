import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { COLORS } from '../../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../../src/theme/typography';
import { Delivery } from './types';

interface OverCompleteSheetProps {
  visible: boolean;
  overNumber: number;
  bowlerName: string;
  runsInOver: number;
  wicketsInOver: number;
  extrasInOver: number;
  deliveries: Delivery[];
  onStartNextOver: () => void;
  onContinueThisOver: () => void;
  onOpenSettings?: () => void;
}

export const OverCompleteSheet: React.FC<OverCompleteSheetProps> = ({
  visible,
  overNumber,
  bowlerName,
  runsInOver,
  wicketsInOver,
  extrasInOver,
  deliveries,
  onStartNextOver,
  onContinueThisOver,
  onOpenSettings,
}) => {
  const getBallBadgeStyle = (d: Delivery) => {
    if (d.type === 'BOUNDARY_SIX') {
      return { backgroundColor: COLORS.boundarySix, borderColor: COLORS.boundarySix, textColor: COLORS.surfaceWhite };
    }
    if (d.type === 'BOUNDARY_FOUR') {
      return { backgroundColor: COLORS.boundaryFour, borderColor: COLORS.boundaryFour, textColor: COLORS.surfaceWhite };
    }
    if (d.type === 'WICKET') {
      return { backgroundColor: COLORS.ballWicket, borderColor: COLORS.ballWicket, textColor: COLORS.surfaceWhite };
    }
    if (d.type === 'WIDE' || d.type === 'NO_BALL') {
      return { backgroundColor: COLORS.ballWide, borderColor: COLORS.ballWide, textColor: COLORS.surfaceWhite };
    }
    return { backgroundColor: COLORS.surfaceWhite, borderColor: COLORS.borderLight, textColor: COLORS.textDark };
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onContinueThisOver}
    >
      <Pressable style={styles.overlay} onPress={onContinueThisOver}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          {/* Top Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Over complete</Text>
            {onOpenSettings ? (
              <TouchableOpacity
                style={styles.settingsBtn}
                onPress={onOpenSettings}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon source="cog-outline" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 24 }} />
            )}
          </View>

          {/* 4 Stat Boxes Card Row */}
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{runsInOver}</Text>
              <Text style={styles.statLabel}>Runs</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{overNumber}</Text>
              <Text style={styles.statLabel}>Overs</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{wicketsInOver}</Text>
              <Text style={styles.statLabel}>Wickets</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{extrasInOver}</Text>
              <Text style={styles.statLabel}>Extras</Text>
            </View>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtext}>
            End of over {overNumber} by {bowlerName || 'Bowler'}
          </Text>

          {/* Ball-by-ball Sequence */}
          <View style={styles.sequenceRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sequenceScroll}
            >
              {deliveries.map((d, index) => {
                const badge = getBallBadgeStyle(d);
                return (
                  <View
                    key={d.id || index}
                    style={[styles.ballBadge, { backgroundColor: badge.backgroundColor, borderColor: badge.borderColor }]}
                  >
                    <Text style={[styles.ballBadgeText, { color: badge.textColor }]}>
                      {d.display}
                    </Text>
                  </View>
                );
              })}
              <Text style={styles.sequenceSumText}>= {runsInOver}</Text>
            </ScrollView>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.startNextBtn}
              activeOpacity={0.8}
              onPress={onStartNextOver}
            >
              <Text style={styles.startNextBtnText}>Start next over</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueBtn}
              activeOpacity={0.7}
              onPress={onContinueThisOver}
            >
              <Text style={styles.continueBtnText}>Continue this over</Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.error,
    letterSpacing: 0.2,
  },
  settingsBtn: {
    padding: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extraBold,
    color: COLORS.textDark,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDarkSecondary,
    fontWeight: FONT_WEIGHT.regular,
    marginTop: 2,
  },
  subtext: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.regular,
    color: COLORS.textDarkSecondary,
    marginBottom: 14,
  },
  sequenceRow: {
    marginBottom: 20,
  },
  sequenceScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  ballBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  ballBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  sequenceSumText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
    marginLeft: 4,
  },
  actionsContainer: {
    gap: 10,
  },
  startNextBtn: {
    backgroundColor: COLORS.brandTeal,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startNextBtnText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  continueBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    color: COLORS.brandTeal,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
});
