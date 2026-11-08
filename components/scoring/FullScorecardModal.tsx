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
import { BatterStats, BowlerStats, OverSummary } from './types';

interface FullScorecardModalProps {
  visible: boolean;
  matchId: string;
  battingTeamName: string;
  bowlingTeamName: string;
  totalRuns: number;
  totalWickets: number;
  completedOvers: number;
  currentOverBalls: number;
  totalOvers: number;
  striker: BatterStats;
  nonStriker: BatterStats;
  bowler: BowlerStats;
  dismissedBatters: BatterStats[];
  allCompletedOvers: OverSummary[];
  extrasBreakdown: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
  };
  ballsPerOver?: number;
  onClose: () => void;
}

export const FullScorecardModal: React.FC<FullScorecardModalProps> = ({
  visible,
  matchId,
  battingTeamName,
  bowlingTeamName,
  totalRuns,
  totalWickets,
  completedOvers,
  currentOverBalls,
  totalOvers,
  striker,
  nonStriker,
  bowler,
  dismissedBatters,
  allCompletedOvers,
  extrasBreakdown,
  ballsPerOver = 6,
  onClose,
}) => {
  const currentOverString = `${completedOvers}.${currentOverBalls}`;
  const totalBalls = completedOvers * ballsPerOver + currentOverBalls;
  const currentRunRate = totalBalls > 0 ? ((totalRuns / totalBalls) * ballsPerOver).toFixed(2) : '0.00';
  const totalExtras =
    extrasBreakdown.wides +
    extrasBreakdown.noBalls +
    extrasBreakdown.byes +
    extrasBreakdown.legByes;

  const allBatters = [
    ...dismissedBatters,
    { ...striker, name: `${striker.name} *` },
    nonStriker,
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Icon source="arrow-left" size={24} color={COLORS.surfaceWhite} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Full Scorecard</Text>
            <Text style={styles.headerSub}>
              {battingTeamName} vs {bowlingTeamName}
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Innings Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <Text style={styles.teamInningsTitle}>{battingTeamName} Innings</Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            </View>

            <View style={styles.scoreRow}>
              <Text style={styles.bigScore}>
                {totalRuns}/{totalWickets}
              </Text>
              <Text style={styles.oversText}>
                ({currentOverString}/{totalOvers} ov)
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <Text style={styles.metricText}>CRR: {currentRunRate}</Text>
              <Text style={styles.metricText}>Match ID: {matchId || '28064593'}</Text>
            </View>
          </View>

          {/* Batting Table */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>BATTING</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.colHeader, { flex: 2 }]}>Batter</Text>
              <Text style={[styles.colHeader, styles.colRight]}>R</Text>
              <Text style={[styles.colHeader, styles.colRight]}>B</Text>
              <Text style={[styles.colHeader, styles.colRight]}>4s</Text>
              <Text style={[styles.colHeader, styles.colRight]}>6s</Text>
              <Text style={[styles.colHeader, styles.colRight]}>SR</Text>
            </View>

            {allBatters.map((b, idx) => {
              const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
              return (
                <View key={idx} style={styles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.batterName}>{b.name}</Text>
                    <Text style={styles.dismissalText}>
                      {b.isOut ? (b.dismissalInfo || 'out') : 'not out'}
                    </Text>
                  </View>
                  <Text style={[styles.colValue, styles.colRight, { fontWeight: FONT_WEIGHT.bold }]}>
                    {b.runs}
                  </Text>
                  <Text style={[styles.colValue, styles.colRight]}>{b.balls}</Text>
                  <Text style={[styles.colValue, styles.colRight]}>{b.fours}</Text>
                  <Text style={[styles.colValue, styles.colRight]}>{b.sixes}</Text>
                  <Text style={[styles.colValue, styles.colRight]}>{sr}</Text>
                </View>
              );
            })}

            {/* Extras line */}
            <View style={styles.extrasRow}>
              <Text style={styles.extrasLabel}>
                Extras: (w {extrasBreakdown.wides}, nb {extrasBreakdown.noBalls}, b {extrasBreakdown.byes}, lb {extrasBreakdown.legByes})
              </Text>
              <Text style={styles.extrasValue}>{totalExtras}</Text>
            </View>
          </View>

          {/* Bowling Table */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>BOWLING</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.colHeader, { flex: 2 }]}>Bowler</Text>
              <Text style={[styles.colHeader, styles.colRight]}>O</Text>
              <Text style={[styles.colHeader, styles.colRight]}>M</Text>
              <Text style={[styles.colHeader, styles.colRight]}>R</Text>
              <Text style={[styles.colHeader, styles.colRight]}>W</Text>
              <Text style={[styles.colHeader, styles.colRight]}>ECON</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.batterName, { flex: 2 }]}>{bowler.name}</Text>
              <Text style={[styles.colValue, styles.colRight]}>
                {bowler.oversCompleted}.{bowler.currentOverBalls}
              </Text>
              <Text style={[styles.colValue, styles.colRight]}>{bowler.maidens}</Text>
              <Text style={[styles.colValue, styles.colRight]}>{bowler.runsConceded}</Text>
              <Text style={[styles.colValue, styles.colRight, { fontWeight: FONT_WEIGHT.bold, color: COLORS.scoreGreen }]}>
                {bowler.wickets}
              </Text>
              <Text style={[styles.colValue, styles.colRight]}>
                {bowler.oversCompleted * ballsPerOver + bowler.currentOverBalls > 0
                  ? (
                      (bowler.runsConceded /
                        (bowler.oversCompleted * ballsPerOver + bowler.currentOverBalls)) *
                      ballsPerOver
                    ).toFixed(2)
                  : '0.00'}
              </Text>
            </View>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 6,
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamInningsTitle: {
    color: COLORS.mint,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liveBadge: {
    backgroundColor: COLORS.ballWicket,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: COLORS.surfaceWhite,
    fontSize: 10,
    fontWeight: FONT_WEIGHT.extraBold,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  bigScore: {
    fontSize: FONT_SIZE.hero,
    fontWeight: FONT_WEIGHT.extraBold,
    color: COLORS.surfaceWhite,
  },
  oversText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.regular,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metricText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.regular,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardSectionTitle: {
    color: COLORS.brandTeal,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.extraBold,
    letterSpacing: 1,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  colHeader: {
    color: COLORS.textDarkSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  colRight: {
    width: 38,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 41, 59, 0.5)',
  },
  batterName: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.regular,
  },
  dismissalText: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  colValue: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
  },
  extrasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 4,
  },
  extrasLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
  },
  extrasValue: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
});
