import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Clipboard,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExtraRunsModal } from '../components/scoring/ExtraRunsModal';
import { FullScorecardModal } from '../components/scoring/FullScorecardModal';
import { OverCompleteSheet } from '../components/scoring/OverCompleteSheet';
import { ScoringShortcutsSheet, ShortcutAction } from '../components/scoring/ScoringShortcutsSheet';
import { SelectBowlerModal, SquadPlayerItem } from '../components/scoring/SelectBowlerModal';
import {
  BatterStats,
  BowlerRecord,
  BowlerStats,
  Delivery,
  DismissalType,
  OverSummary,
  ScoringStateSnapshot,
} from '../components/scoring/types';
import { WicketModal } from '../components/scoring/WicketModal';
import { addScore } from '../src/api/matchApi';
import { COLORS } from '../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../src/theme/typography';

const { width } = Dimensions.get('window');

type AddScoreProps = {
  matchId: string;
  team1Name: string;
  team2Name: string;
  runs?: string;
  wickets?: string;
  overs?: string;
  status?: string;
  totalOvers?: string;
  oversPerBowler?: string;
  ballsPerOver?: string;
};

export default function AddScoreScreen({
  matchId,
  team1Name,
  team2Name,
  runs = '0',
  wickets = '0',
  overs = '0.0',
  status = 'LIVE',
  totalOvers = '5',
  oversPerBowler,
  ballsPerOver: initialBallsPerOver = '6',
}: AddScoreProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const topInset = Math.max(insets.top, statusBarHeight);
  const bottomInset = insets.bottom;

  // Active teams display
  const effectiveMatchId = matchId || '28064593';
  const battingTeamName = team1Name || 'Hero';
  const bowlingTeamName = team2Name || 'Opponents';
  const matchMaxOvers = parseInt(totalOvers, 10) || 5;
  const configuredBallsPerOver = parseInt(initialBallsPerOver, 10) || 6;
  const configuredOversPerBowler =
    parseInt(oversPerBowler || '', 10) || Math.max(1, Math.ceil(matchMaxOvers / 5));

  // Initial runs and overs calculation
  const parsedRuns = parseInt(runs, 10) || 0;
  const parsedWickets = parseInt(wickets, 10) || 0;
  const parsedOversFloat = parseFloat(overs) || 0.0;
  const initialCompletedOvers = Math.floor(parsedOversFloat);
  const initialCurrentBalls = Math.round((parsedOversFloat - initialCompletedOvers) * 10);

  // 1. Scoring State
  const [totalRuns, setTotalRuns] = useState<number>(parsedRuns);
  const [totalWickets, setTotalWickets] = useState<number>(parsedWickets);
  const [completedOvers, setCompletedOvers] = useState<number>(initialCompletedOvers);
  const [currentOverBalls, setCurrentOverBalls] = useState<number>(initialCurrentBalls);
  const [totalMatchOvers, setTotalMatchOvers] = useState<number>(matchMaxOvers);
  const [ballsPerOver, setBallsPerOver] = useState<number>(configuredBallsPerOver);
  const [maxOversPerBowler, setMaxOversPerBowler] = useState<number>(configuredOversPerBowler);

  // Cumulative bowler stats across match
  const [bowlerRecords, setBowlerRecords] = useState<Record<string, BowlerRecord>>({
    Rafah: {
      name: 'Rafah',
      oversCompleted: 0,
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
    },
  });
  const [selectBowlerModalVisible, setSelectBowlerModalVisible] = useState(false);
  const [isChangingCurrentBowler, setIsChangingCurrentBowler] = useState(false);

  // 2. Batters & Bowler State
  const [striker, setStriker] = useState<BatterStats>({
    name: 'A-1 Children Sweets',
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
  });

  const [nonStriker, setNonStriker] = useState<BatterStats>({
    name: 'Mohammad Arfaz',
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
  });

  const [bowler, setBowler] = useState<BowlerStats>({
    name: 'Rafah',
    oversCompleted: 0,
    currentOverBalls: 0,
    maidens: 0,
    runsConceded: 0,
    wickets: 0,
  });

  const [dismissedBatters, setDismissedBatters] = useState<BatterStats[]>([]);

  // 3. Over Deliveries & History
  const [currentOverDeliveries, setCurrentOverDeliveries] = useState<Delivery[]>([]);
  const [allCompletedOvers, setAllCompletedOvers] = useState<OverSummary[]>([]);
  const [extrasBreakdown, setExtrasBreakdown] = useState({
    wides: 0,
    noBalls: 0,
    byes: 0,
    legByes: 0,
  });

  // History stack for UNDO functionality
  const [historyStack, setHistoryStack] = useState<ScoringStateSnapshot[]>([]);

  // 4. Modals State
  const [shortcutsVisible, setShortcutsVisible] = useState(false);
  const [overCompleteVisible, setOverCompleteVisible] = useState(false);
  const [wicketModalVisible, setWicketModalVisible] = useState(false);
  const [extraRunsModalVisible, setExtraRunsModalVisible] = useState(false);
  const [extraRunsTarget, setExtraRunsTarget] = useState<'RUNS' | 'BYE' | 'LEG_BYE'>('RUNS');
  const [scorecardVisible, setScorecardVisible] = useState(false);

  // 5. Toast / Synced indicator
  const [showSyncedToast, setShowSyncedToast] = useState(false);
  const toastTimeoutRef = useRef<any>(null);

  // Trigger floating sync badge
  const triggerSyncedToast = () => {
    setShowSyncedToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setShowSyncedToast(false);
    }, 1800);
  };

  // Sync with backend API in the background
  const syncScoreToBackend = useCallback(
    async (newRuns: number, newOversFloat: number, newWickets: number) => {
      if (!matchId) return;
      try {
        await addScore(matchId, {
          runs: newRuns,
          overs: newOversFloat,
          wickets: newWickets,
        });
      } catch (e) {
        // Log gracefully; scoring continues smoothly offline or in demo
        console.log('Background score sync noted:', e);
      }
    },
    [matchId]
  );

  // Fielding squad for bowling team
  const fieldingSquad: SquadPlayerItem[] = useMemo(() => {
    const defaultList: SquadPlayerItem[] = [
      { id: 'b1', name: 'Rafah', role: 'Fast Bowler' },
      { id: 'b2', name: 'Tanveer Ali', role: 'Fast-Medium' },
      { id: 'b3', name: 'Zeeshan Khan', role: 'Spin Bowler' },
      { id: 'b4', name: 'Imran Malik', role: 'Off-Spinner' },
      { id: 'b5', name: 'Shahid Afridi Jr', role: 'All-Rounder' },
      { id: 'b6', name: 'Bilal Ahmed', role: 'Medium Pacer' },
      { id: 'b7', name: 'Farhan Qureshi', role: 'Leg-Spinner' },
      { id: 'b8', name: 'Danish Ali', role: 'Wicket Keeper' },
    ];
    const existingNames = new Set(defaultList.map((p) => p.name.toLowerCase()));
    Object.keys(bowlerRecords).forEach((name) => {
      if (!existingNames.has(name.toLowerCase())) {
        defaultList.push({
          id: `custom-${name}`,
          name,
          role: 'Bowler',
        });
        existingNames.add(name.toLowerCase());
      }
    });
    return defaultList;
  }, [bowlerRecords]);

  // Batting players (cannot be selected as bowler)
  const battingPlayerNames = useMemo(
    () => [striker.name, nonStriker.name, ...dismissedBatters.map((b) => b.name)],
    [striker.name, nonStriker.name, dismissedBatters]
  );

  // Preceding bowler restriction: strictly identifies the bowler who bowled the immediately preceding completed over
  const precedingBowlerName = useMemo(() => {
    if (allCompletedOvers.length === 0) return null;
    return allCompletedOvers[allCompletedOvers.length - 1]?.bowlerName || null;
  }, [allCompletedOvers]);

  // Take snapshot before modifying state for full reversible UNDO
  const pushSnapshot = () => {
    const snapshot: ScoringStateSnapshot = {
      totalRuns,
      totalWickets,
      completedOvers,
      currentOverBalls,
      striker: { ...striker },
      nonStriker: { ...nonStriker },
      bowler: { ...bowler },
      currentOverDeliveries: [...currentOverDeliveries],
      allCompletedOvers: [...allCompletedOvers],
      bowlerRecords: { ...bowlerRecords },
      maxOversPerBowler,
      ballsPerOver,
      extrasBreakdown: { ...extrasBreakdown },
    };
    setHistoryStack((prev) => [...prev, snapshot]);
  };

  // UNDO Action
  const handleUndo = () => {
    if (historyStack.length === 0) {
      Alert.alert('Undo', 'No previous deliveries to undo.');
      return;
    }

    const previousSnapshot = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));

    setTotalRuns(previousSnapshot.totalRuns);
    setTotalWickets(previousSnapshot.totalWickets);
    setCompletedOvers(previousSnapshot.completedOvers);
    setCurrentOverBalls(previousSnapshot.currentOverBalls);
    setStriker(previousSnapshot.striker);
    setNonStriker(previousSnapshot.nonStriker);
    setBowler(previousSnapshot.bowler);
    setCurrentOverDeliveries(previousSnapshot.currentOverDeliveries);
    setAllCompletedOvers(previousSnapshot.allCompletedOvers);
    if (previousSnapshot.bowlerRecords) {
      setBowlerRecords(previousSnapshot.bowlerRecords);
    }
    if (previousSnapshot.maxOversPerBowler) {
      setMaxOversPerBowler(previousSnapshot.maxOversPerBowler);
    }
    if (previousSnapshot.ballsPerOver) {
      setBallsPerOver(previousSnapshot.ballsPerOver);
    }
    setExtrasBreakdown(previousSnapshot.extrasBreakdown);

    if (overCompleteVisible) {
      setOverCompleteVisible(false);
    }
    if (selectBowlerModalVisible) {
      setSelectBowlerModalVisible(false);
    }

    const newOversFloat = parseFloat(
      `${previousSnapshot.completedOvers}.${previousSnapshot.currentOverBalls}`
    );
    syncScoreToBackend(previousSnapshot.totalRuns, newOversFloat, previousSnapshot.totalWickets);
    triggerSyncedToast();
  };

  // -------------------------------------------------------------
  // CORE SCORING LOGIC
  // -------------------------------------------------------------

  const recordDelivery = (
    type: Delivery['type'],
    runs: number,
    isLegal: boolean,
    display: string,
    extraRuns = 0
  ) => {
    pushSnapshot();

    const runsToAdd = runs + extraRuns;
    const newTotalRuns = totalRuns + runsToAdd;
    let newTotalWickets = totalWickets;
    let newCurrentBalls = currentOverBalls;
    let newCompletedOvers = completedOvers;

    // Advance legal balls if delivery is legal
    if (isLegal) {
      newCurrentBalls += 1;
    }

    // Update Striker figures
    const updatedStriker = { ...striker };
    if (type !== 'WIDE') {
      updatedStriker.balls += 1;
    }
    if (type === 'RUN' || type === 'BOUNDARY_FOUR' || type === 'BOUNDARY_SIX') {
      updatedStriker.runs += runs;
      if (type === 'BOUNDARY_FOUR') updatedStriker.fours += 1;
      if (type === 'BOUNDARY_SIX') updatedStriker.sixes += 1;
    }

    // Update Bowler figures
    const updatedBowler = { ...bowler };
    updatedBowler.runsConceded += runsToAdd;
    if (isLegal) {
      updatedBowler.currentOverBalls += 1;
      if (updatedBowler.currentOverBalls === ballsPerOver) {
        updatedBowler.oversCompleted += 1;
        updatedBowler.currentOverBalls = 0;
      }
    }

    // Update extras
    const updatedExtras = { ...extrasBreakdown };
    if (type === 'WIDE') updatedExtras.wides += extraRuns || 1;
    if (type === 'NO_BALL') updatedExtras.noBalls += extraRuns || 1;
    if (type === 'BYE') updatedExtras.byes += extraRuns || runs;
    if (type === 'LEG_BYE') updatedExtras.legByes += extraRuns || runs;

    // Delivery record
    const newDelivery: Delivery = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      runs,
      extras: extraRuns,
      isLegal,
      display,
      strikerName: striker.name,
      bowlerName: bowler.name,
      timestamp: Date.now(),
    };

    const nextOverDeliveries = [...currentOverDeliveries, newDelivery];

    // Determine strike rotation
    // Odd runs on bat or bye/leg-bye rotate strike
    let finalStriker = updatedStriker;
    let finalNonStriker = { ...nonStriker };

    if (runsToAdd % 2 === 1) {
      // Swap strike
      const temp = finalStriker;
      finalStriker = finalNonStriker;
      finalNonStriker = temp;
    }

    // Commit state updates
    setTotalRuns(newTotalRuns);
    setTotalWickets(newTotalWickets);
    setCurrentOverBalls(newCurrentBalls);
    setStriker(finalStriker);
    setNonStriker(finalNonStriker);
    setBowler(updatedBowler);
    setExtrasBreakdown(updatedExtras);
    setCurrentOverDeliveries(nextOverDeliveries);

    // Sync to backend
    const newOversFloat = parseFloat(`${newCompletedOvers}.${newCurrentBalls}`);
    syncScoreToBackend(newTotalRuns, newOversFloat, newTotalWickets);
    triggerSyncedToast();

    // Check if legal deliveries have completed the over
    if (newCurrentBalls === ballsPerOver) {
      // Automatically show Over Complete sheet
      setOverCompleteVisible(true);
    }
  };

  // Wicket dismissal handler
  const handleConfirmWicket = (payload: {
    type: DismissalType;
    outPlayerName: string;
    newPlayerName: string;
    isStrikerOut: boolean;
  }) => {
    pushSnapshot();

    const newTotalWickets = totalWickets + 1;
    const newCurrentBalls = currentOverBalls + 1; // standard dismissal counts as legal delivery

    // Delivery record
    const newDelivery: Delivery = {
      id: `${Date.now()}-${Math.random()}`,
      type: 'WICKET',
      runs: 0,
      extras: 0,
      isLegal: true,
      display: 'W',
      strikerName: striker.name,
      bowlerName: bowler.name,
      dismissal: {
        type: payload.type,
        outPlayerName: payload.outPlayerName,
        newPlayerName: payload.newPlayerName,
      },
      timestamp: Date.now(),
    };

    // Update bowler wickets (except run-outs)
    const updatedBowler = { ...bowler };
    if (payload.type !== 'Run Out') {
      updatedBowler.wickets += 1;
    }
    updatedBowler.currentOverBalls += 1;
    if (updatedBowler.currentOverBalls === ballsPerOver) {
      updatedBowler.oversCompleted += 1;
      updatedBowler.currentOverBalls = 0;
    }

    // Save dismissed batter and introduce new batter
    if (payload.isStrikerOut) {
      const dismissed: BatterStats = {
        ...striker,
        balls: striker.balls + 1,
        isOut: true,
        dismissalInfo: `${payload.type} b ${bowler.name}`,
      };
      setDismissedBatters((prev) => [...prev, dismissed]);
      setStriker({
        name: payload.newPlayerName,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
      });
    } else {
      const dismissed: BatterStats = {
        ...nonStriker,
        isOut: true,
        dismissalInfo: `run out (${payload.type})`,
      };
      setDismissedBatters((prev) => [...prev, dismissed]);
      setNonStriker({
        name: payload.newPlayerName,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
      });
    }

    setTotalWickets(newTotalWickets);
    setCurrentOverBalls(newCurrentBalls);
    setBowler(updatedBowler);
    setCurrentOverDeliveries((prev) => [...prev, newDelivery]);

    const newOversFloat = parseFloat(`${completedOvers}.${newCurrentBalls}`);
    syncScoreToBackend(totalRuns, newOversFloat, newTotalWickets);
    triggerSyncedToast();

    if (newCurrentBalls === ballsPerOver) {
      setOverCompleteVisible(true);
    }
  };

  // Over complete sheet actions: Archives over, updates bowler figures, and triggers next bowler selection
  const handleStartNextOver = () => {
    // 1. Calculate figures for completed over
    const runsInThisOver = currentOverDeliveries.reduce((acc, d) => acc + d.runs + d.extras, 0);
    const wicketsInThisOver = currentOverDeliveries.filter((d) => d.type === 'WICKET').length;
    const extrasInThisOver = currentOverDeliveries.reduce((acc, d) => acc + d.extras, 0);
    const isMaiden = runsInThisOver === 0;

    // 2. Update cumulative record for the bowler who just finished this over
    const prevRecord = bowlerRecords[bowler.name] || {
      name: bowler.name,
      oversCompleted: 0,
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
    };
    const updatedRecord: BowlerRecord = {
      ...prevRecord,
      oversCompleted: prevRecord.oversCompleted + 1,
      maidens: prevRecord.maidens + (isMaiden ? 1 : 0),
      runsConceded: bowler.runsConceded,
      wickets: bowler.wickets,
    };
    setBowlerRecords((prev) => ({
      ...prev,
      [bowler.name]: updatedRecord,
    }));

    // 3. Save to allCompletedOvers
    const overSummary: OverSummary = {
      overNumber: completedOvers + 1,
      bowlerName: bowler.name,
      deliveries: [...currentOverDeliveries],
      runs: runsInThisOver,
      wickets: wicketsInThisOver,
      extras: extrasInThisOver,
    };
    setAllCompletedOvers((prev) => [...prev, overSummary]);

    // 4. Close over complete sheet and open Select Bowler modal for the next over
    setOverCompleteVisible(false);
    setIsChangingCurrentBowler(false);
    setSelectBowlerModalVisible(true);
  };

  // Confirm Bowler selection from SelectBowlerModal
  const handleConfirmNextBowler = (newBowlerName: string) => {
    if (isChangingCurrentBowler) {
      // Scorer tapped "Change" at ball 0 of current over
      const record = bowlerRecords[newBowlerName] || {
        name: newBowlerName,
        oversCompleted: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
      };
      setBowler({
        name: newBowlerName,
        oversCompleted: record.oversCompleted,
        currentOverBalls: 0,
        maidens: record.maidens,
        runsConceded: record.runsConceded,
        wickets: record.wickets,
      });
      setSelectBowlerModalVisible(false);
      setIsChangingCurrentBowler(false);
      Alert.alert('Bowler Changed', `${newBowlerName} is ready to bowl this over.`);
      return;
    }

    // Starting next over
    // 1. Advance completed overs count
    const nextCompletedOvers = completedOvers + 1;
    setCompletedOvers(nextCompletedOvers);
    setCurrentOverBalls(0);
    setCurrentOverDeliveries([]);

    // 2. Rotate strike between batsmen at the end of an over
    const temp = striker;
    setStriker(nonStriker);
    setNonStriker(temp);

    // 3. Load figures of the newly selected bowler
    const record = bowlerRecords[newBowlerName] || {
      name: newBowlerName,
      oversCompleted: 0,
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
    };
    setBowler({
      name: newBowlerName,
      oversCompleted: record.oversCompleted,
      currentOverBalls: 0,
      maidens: record.maidens,
      runsConceded: record.runsConceded,
      wickets: record.wickets,
    });

    // 4. Close modal and sync
    setSelectBowlerModalVisible(false);

    const nextOversFloat = parseFloat(`${nextCompletedOvers}.0`);
    syncScoreToBackend(totalRuns, nextOversFloat, totalWickets);
    triggerSyncedToast();
  };

  const handleContinueThisOver = () => {
    setOverCompleteVisible(false);
  };

  // Shortcut sheet router
  const handleSelectShortcut = (action: ShortcutAction) => {
    switch (action) {
      case 'help':
        Alert.alert(
          'Match Day Live Scoring Help',
          '• Tap 0-6 to log delivery runs.\n• WD and NB record extras without advancing the legal ball count.\n• BYE & LB count as legal deliveries with runs assigned to team extras.\n• OUT prompts dismissal method and incoming batter.\n• 6 legal deliveries automatically triggers Over Complete.'
        );
        break;
      case 'rules':
        Alert.alert(
          'Match Rules & Conditions',
          `• Total Match Overs: ${totalMatchOvers}\n• Balls Per Over: ${ballsPerOver}\n• Max Overs Per Bowler: ${maxOversPerBowler} ov\n• Ball Type: Leather\n• Pitch: Turf\n• Alternating bowlers enforced per over.\n• Preceding over's bowler cannot bowl consecutive overs.`
        );
        break;
      case 'scorer':
        Alert.alert('Change Scorer', 'Official Scorer: Arfaz Mohammad (Verified Official)');
        break;
      case 'squad':
        Alert.alert(
          'Team Squads',
          `${battingTeamName}: ${striker.name}, ${nonStriker.name}, +9 players\n\n${bowlingTeamName}: ${bowler.name}, +10 fielders`
        );
        break;
      case 'scorecard':
        setScorecardVisible(true);
        break;
      case 'overs':
        Alert.alert('Match Overs', `Current match format: ${totalMatchOvers} overs per innings.`, [
          {
            text: '5 Overs',
            onPress: () => {
              const newOvers = 5;
              const newQuota = Math.max(1, Math.ceil(newOvers / 5));
              setTotalMatchOvers(newOvers);
              setMaxOversPerBowler(newQuota);
              Alert.alert('Overs Updated', `Match overs set to 5. Bowler quota updated to ${newQuota} ${newQuota === 1 ? 'over' : 'overs'} per bowler.`);
            },
          },
          {
            text: '10 Overs',
            onPress: () => {
              const newOvers = 10;
              const newQuota = Math.max(1, Math.ceil(newOvers / 5));
              setTotalMatchOvers(newOvers);
              setMaxOversPerBowler(newQuota);
              Alert.alert('Overs Updated', `Match overs set to 10. Bowler quota updated to ${newQuota} overs per bowler.`);
            },
          },
          {
            text: '20 Overs (T20)',
            onPress: () => {
              const newOvers = 20;
              const newQuota = Math.max(1, Math.ceil(newOvers / 5));
              setTotalMatchOvers(newOvers);
              setMaxOversPerBowler(newQuota);
              Alert.alert('Overs Updated', `Match overs set to 20. Bowler quota updated to ${newQuota} overs per bowler.`);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]);
        break;
      case 'batters':
        // Swap active striker and non-striker
        pushSnapshot();
        const temp = striker;
        setStriker(nonStriker);
        setNonStriker(temp);
        Alert.alert('Strike Changed', `${nonStriker.name} is now on strike.`);
        break;
      case 'bonus':
        setExtraRunsTarget('RUNS');
        setExtraRunsModalVisible(true);
        break;
      case 'more':
        Alert.alert('More Shortcuts', 'DRS Reviews, DLS Target Calculator, and Match Abandon options are ready for league mode.');
        break;
    }
  };

  // Copy Match ID
  const handleCopyMatchId = () => {
    Clipboard.setString(effectiveMatchId);
    Alert.alert('Copied', `Match ID ${effectiveMatchId} copied to clipboard.`);
  };

  // Share score
  const handleShareMatch = async () => {
    try {
      await Share.share({
        message: `🏏 *Match Day Live Scorecard*\n🔥 ${battingTeamName} vs ${bowlingTeamName}\n📊 Score: ${totalRuns}/${totalWickets} (${completedOvers}.${currentOverBalls}/${totalMatchOvers} ov)\n⚡ Status: ${status}\n📍 Match ID: ${effectiveMatchId}`,
      });
    } catch (e) {
      // Ignore cancel
    }
  };

  // Delivery badge visual styling
  const getBallBadgeBg = (d: Delivery) => {
    if (d.type === 'BOUNDARY_SIX') return COLORS.boundarySix;
    if (d.type === 'BOUNDARY_FOUR') return COLORS.boundaryFour;
    if (d.type === 'WICKET') return COLORS.ballWicket;
    if (d.type === 'WIDE' || d.type === 'NO_BALL') return COLORS.ballWide;
    return COLORS.surfaceWhite;
  };

  const getBallBadgeTextColor = (d: Delivery) => {
    if (
      d.type === 'BOUNDARY_SIX' ||
      d.type === 'BOUNDARY_FOUR' ||
      d.type === 'WICKET' ||
      d.type === 'WIDE' ||
      d.type === 'NO_BALL'
    ) {
      return COLORS.surfaceWhite;
    }
    return COLORS.textDark;
  };

  // Current over runs sum
  const runsInCurrentOver = currentOverDeliveries.reduce(
    (acc, d) => acc + d.runs + d.extras,
    0
  );
  const wicketsInCurrentOver = currentOverDeliveries.filter(
    (d) => d.type === 'WICKET'
  ).length;
  const extrasInCurrentOver = currentOverDeliveries.reduce(
    (acc, d) => acc + d.extras,
    0
  );

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <StatusBar barStyle="light-content" {...(Platform.OS === 'android' ? { translucent: true } : {})} />

      {/* ================================================================= */}
      {/* 1. MATCH HEADER                                                   */}
      {/* ================================================================= */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon source="arrow-left" size={24} color={COLORS.surfaceWhite} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {battingTeamName}
        </Text>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={handleShareMatch}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon source="share-variant-outline" size={22} color={COLORS.surfaceWhite} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => handleSelectShortcut('rules')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon source="cog-outline" size={22} color={COLORS.surfaceWhite} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Upper Section (Match Score, Players, Bowler, Ball-by-ball) */}
      <ScrollView
        style={styles.upperScroll}
        contentContainerStyle={styles.upperScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================================= */}
        {/* 2. MATCH SCORE SUMMARY                                            */}
        {/* ================================================================= */}
        <View style={styles.scoreSummaryContainer}>
          <View style={styles.scoreRow}>
            <Text style={styles.mainScoreText}>
              {totalRuns}/{totalWickets}
            </Text>
            <Text style={styles.oversText}>
              ({completedOvers}.{currentOverBalls}/{totalMatchOvers})
            </Text>
          </View>

          <Text style={styles.tossSubtitle}>
            {battingTeamName} won the toss and elected to bat
          </Text>

          <TouchableOpacity
            style={styles.matchIdRow}
            onPress={handleCopyMatchId}
            activeOpacity={0.7}
          >
            <Text style={styles.matchIdText}>Match ID: {effectiveMatchId}</Text>
            <Icon source="content-copy" size={14} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ================================================================= */}
        {/* 3. CURRENT BATTERS (Horizontal 2-column card)                     */}
        {/* ================================================================= */}
        <View style={styles.battersCard}>
          {/* Striker (Left Column) */}
          <View style={[styles.batterCol, styles.batterColStriker]}>
            <View style={styles.batterHeaderRow}>
              <View style={[styles.batIconCircle, { backgroundColor: COLORS.brandTeal }]}>
                <Icon source="cricket" size={16} color={COLORS.surfaceWhite} />
              </View>
              <Text style={styles.batterNameText} numberOfLines={1}>
                {striker.name}
              </Text>
            </View>

            <View style={styles.batterStatsRow}>
              {striker.balls === 0 ? (
                <TouchableOpacity
                  onPress={() => {
                    Alert.prompt
                      ? Alert.prompt(
                          'Replace Striker',
                          'Enter replacement batsman name:',
                          (newName) => {
                            if (newName?.trim()) {
                              setStriker((prev) => ({ ...prev, name: newName.trim() }));
                            }
                          }
                        )
                      : Alert.alert('Replace Striker', 'Use Replace Batters shortcut to adjust.');
                  }}
                >
                  <Text style={styles.replaceLinkText}>Replace</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.batterScoreDigits}>
                  {striker.runs}({striker.balls})
                </Text>
              )}
            </View>
          </View>

          {/* Divider between striker and non-striker */}
          <View style={styles.batterDivider} />

          {/* Non-Striker (Right Column) */}
          <View style={styles.batterCol}>
            <View style={styles.batterHeaderRow}>
              <View style={[styles.batIconCircle, { backgroundColor: COLORS.border }]}>
                <Icon source="cricket" size={16} color={COLORS.textMuted} />
              </View>
              <Text style={styles.batterNameText} numberOfLines={1}>
                {nonStriker.name}
              </Text>
            </View>

            <View style={styles.batterStatsRow}>
              {nonStriker.balls === 0 ? (
                <TouchableOpacity
                  onPress={() => {
                    Alert.prompt
                      ? Alert.prompt(
                          'Replace Non-Striker',
                          'Enter replacement batsman name:',
                          (newName) => {
                            if (newName?.trim()) {
                              setNonStriker((prev) => ({ ...prev, name: newName.trim() }));
                            }
                          }
                        )
                      : Alert.alert('Replace Non-Striker', 'Use Replace Batters shortcut to adjust.');
                  }}
                >
                  <Text style={styles.replaceLinkText}>Replace</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.batterScoreDigits}>
                  {nonStriker.runs}({nonStriker.balls})
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ================================================================= */}
        {/* 4. CURRENT BOWLER BAR                                             */}
        {/* ================================================================= */}
        <View style={styles.bowlerBar}>
          <TouchableOpacity
            style={styles.bowlerInfoLeft}
            activeOpacity={currentOverBalls === 0 ? 0.7 : 1}
            onPress={() => {
              if (currentOverBalls === 0) {
                setIsChangingCurrentBowler(true);
                setSelectBowlerModalVisible(true);
              }
            }}
          >
            <Icon source="cricket" size={20} color={COLORS.textSecondary} />
            <Text style={styles.bowlerNameText} numberOfLines={1}>
              {bowler.name}
            </Text>
            {/* 3 Stumps Wicket Graphic */}
            <View style={styles.stumpsIcon}>
              <View style={styles.stumpBar} />
              <View style={styles.stumpBar} />
              <View style={styles.stumpBar} />
            </View>
            {currentOverBalls === 0 ? (
              <View style={styles.changeBowlerPill}>
                <Text style={styles.changeBowlerText}>Change</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          {/* Bowler Figures (O.B-M-R-W) and Quota */}
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.bowlerFiguresText}>
              {bowler.oversCompleted}.{bowler.currentOverBalls}-{bowler.maidens}-
              {bowler.runsConceded}-{bowler.wickets}
            </Text>
            <Text style={styles.bowlerQuotaSubtitle}>
              Quota: {bowler.oversCompleted}/{maxOversPerBowler} ov
            </Text>
          </View>
        </View>

        {/* ================================================================= */}
        {/* 5. CURRENT OVER BALL-BY-BALL SEQUENCE                             */}
        {/* ================================================================= */}
        <View style={styles.overSequenceContainer}>
          {currentOverDeliveries.length === 0 ? (
            <View style={styles.emptyOverIndicator}>
              <View style={styles.emptyBallDot} />
              <Text style={styles.emptyOverText}>Over {completedOvers + 1} starting...</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ballsRow}
            >
              {currentOverDeliveries.map((d, index) => {
                const bg = getBallBadgeBg(d);
                const textColor = getBallBadgeTextColor(d);
                return (
                  <View
                    key={d.id || index}
                    style={[styles.ballBadgeCircle, { backgroundColor: bg }]}
                  >
                    <Text style={[styles.ballBadgeText, { color: textColor }]}>
                      {d.display}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* ================================================================= */}
      {/* 6. FLOATING SYNCED BADGE TOAST (Screenshot 4)                     */}
      {/* ================================================================= */}
      {showSyncedToast ? (
        <View style={styles.syncedToast}>
          <Icon source="check" size={16} color={COLORS.surfaceWhite} />
          <Text style={styles.syncedToastText}>Synced</Text>
        </View>
      ) : null}

      {/* ================================================================= */}
      {/* 7. SCORING KEYPAD (Table Grid - Section G)                         */}
      {/* ================================================================= */}
      <View style={styles.keypadContainer}>
        {/* Row 1: 0 | 1 | 2 | UNDO */}
        <View style={styles.keypadRow}>
          <TouchableOpacity
            style={styles.keypadCell}
            activeOpacity={0.6}
            onPress={() => recordDelivery('DOT', 0, true, '0')}
          >
            <Text style={styles.keyDigit}>0</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.keypadCell}
            activeOpacity={0.6}
            onPress={() => recordDelivery('RUN', 1, true, '1')}
          >
            <Text style={styles.keyDigit}>1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.keypadCell}
            activeOpacity={0.6}
            onPress={() => recordDelivery('RUN', 2, true, '2')}
          >
            <Text style={styles.keyDigit}>2</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.keypadCell, styles.keyActionCell]}
            activeOpacity={0.6}
            onPress={handleUndo}
          >
            <Text style={styles.keyUndoText}>UNDO</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: 3 | 4 (Four) | 6 (Six) | 5, 7 */}
        <View style={styles.keypadRow}>
          <TouchableOpacity
            style={styles.keypadCell}
            activeOpacity={0.6}
            onPress={() => recordDelivery('RUN', 3, true, '3')}
          >
            <Text style={styles.keyDigit}>3</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.keypadCell}
            activeOpacity={0.6}
            onPress={() => recordDelivery('BOUNDARY_FOUR', 4, true, '4')}
          >
            <Text style={styles.keyDigit}>4</Text>
            <Text style={styles.keySubLabel}>Four</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.keypadCell}
            activeOpacity={0.6}
            onPress={() => recordDelivery('BOUNDARY_SIX', 6, true, '6')}
          >
            <Text style={styles.keyDigit}>6</Text>
            <Text style={styles.keySubLabel}>Six</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.keypadCell, styles.keyActionCell]}
            activeOpacity={0.6}
            onPress={() => {
              setExtraRunsTarget('RUNS');
              setExtraRunsModalVisible(true);
            }}
          >
            <Text style={styles.keyRunAltText}>5, 7</Text>
          </TouchableOpacity>
        </View>

        {/* Row 3: WD | NB | BYE | LB */}
        <View style={styles.keypadRow}>
          <TouchableOpacity
            style={styles.keypadCell}
            activeOpacity={0.6}
            onPress={() => recordDelivery('WIDE', 0, false, 'WD', 1)}
          >
            <Text style={styles.keySpecialText}>WD</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.keypadCell}
            activeOpacity={0.6}
            onPress={() => recordDelivery('NO_BALL', 0, false, 'NB', 1)}
          >
            <Text style={styles.keySpecialText}>NB</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.keypadCell}
            activeOpacity={0.6}
            onPress={() => recordDelivery('BYE', 1, true, 'B1')}
          >
            <Text style={styles.keySpecialText}>BYE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.keypadCell}
            activeOpacity={0.6}
            onPress={() => recordDelivery('LEG_BYE', 1, true, 'LB')}
          >
            <Text style={styles.keySpecialText}>LB</Text>
          </TouchableOpacity>
        </View>

        {/* Row 4: OUT (Prominent full-height or side action) */}
        <View style={styles.keypadBottomRow}>
          <TouchableOpacity
            style={styles.keyOutButton}
            activeOpacity={0.7}
            onPress={() => setWicketModalVisible(true)}
          >
            <Text style={styles.keyOutText}>OUT</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Bar: Scoring Shortcuts Trigger */}
        <TouchableOpacity
          style={[styles.shortcutsBar, { paddingBottom: Math.max(bottomInset, 10) }]}
          activeOpacity={0.8}
          onPress={() => setShortcutsVisible(true)}
        >
          <Text style={styles.shortcutsBarText}>Scoring shortcuts</Text>
          <Icon source="chevron-up" size={20} color={COLORS.surfaceWhite} />
        </TouchableOpacity>
      </View>

      {/* ================================================================= */}
      {/* 8. MODALS & BOTTOM SHEETS                                         */}
      {/* ================================================================= */}

      {/* Screen 2: Scoring Shortcuts Sheet */}
      <ScoringShortcutsSheet
        visible={shortcutsVisible}
        onClose={() => setShortcutsVisible(false)}
        onSelectAction={handleSelectShortcut}
      />

      {/* Screen 4: Over Complete Sheet */}
      <OverCompleteSheet
        visible={overCompleteVisible}
        overNumber={completedOvers + 1}
        bowlerName={bowler.name}
        runsInOver={runsInCurrentOver}
        wicketsInOver={wicketsInCurrentOver}
        extrasInOver={extrasInCurrentOver}
        deliveries={currentOverDeliveries}
        onStartNextOver={handleStartNextOver}
        onContinueThisOver={handleContinueThisOver}
        onOpenSettings={() => handleSelectShortcut('rules')}
      />

      {/* Wicket Dismissal Modal */}
      <WicketModal
        visible={wicketModalVisible}
        strikerName={striker.name}
        nonStrikerName={nonStriker.name}
        onConfirmWicket={handleConfirmWicket}
        onClose={() => setWicketModalVisible(false)}
      />

      {/* 5, 7 / Extra Runs Modal */}
      <ExtraRunsModal
        visible={extraRunsModalVisible}
        onSelectRuns={(runsVal) => {
          if (extraRunsTarget === 'RUNS') {
            recordDelivery('RUN', runsVal, true, `${runsVal}`);
          } else if (extraRunsTarget === 'BYE') {
            recordDelivery('BYE', runsVal, true, `B${runsVal}`);
          } else {
            recordDelivery('LEG_BYE', runsVal, true, `LB${runsVal}`);
          }
        }}
        onClose={() => setExtraRunsModalVisible(false)}
      />

      {/* Full Scorecard Modal */}
      <FullScorecardModal
        visible={scorecardVisible}
        matchId={effectiveMatchId}
        battingTeamName={battingTeamName}
        bowlingTeamName={bowlingTeamName}
        totalRuns={totalRuns}
        totalWickets={totalWickets}
        completedOvers={completedOvers}
        currentOverBalls={currentOverBalls}
        totalOvers={totalMatchOvers}
        striker={striker}
        nonStriker={nonStriker}
        bowler={bowler}
        dismissedBatters={dismissedBatters}
        allCompletedOvers={allCompletedOvers}
        extrasBreakdown={extrasBreakdown}
        onClose={() => setScorecardVisible(false)}
      />

      {/* Screen: Select Bowler Modal (Consecutive over validation & quota enforcement) */}
      <SelectBowlerModal
        visible={selectBowlerModalVisible}
        overNumber={allCompletedOvers.length + 1}
        fieldingTeamName={bowlingTeamName}
        precedingBowlerName={precedingBowlerName}
        maxOversPerBowler={maxOversPerBowler}
        bowlerRecords={bowlerRecords}
        fieldingSquad={fieldingSquad}
        battingPlayerNames={battingPlayerNames}
        onSelectBowler={handleConfirmNextBowler}
        onClose={() => setSelectBowlerModalVisible(false)}
        canCancel={isChangingCurrentBowler}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBackBtn: {
    padding: 6,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 8,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surfaceWhite,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    padding: 6,
  },
  upperScroll: {
    flex: 1,
  },
  upperScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  scoreSummaryContainer: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  mainScoreText: {
    fontSize: FONT_SIZE.hero,
    fontWeight: FONT_WEIGHT.extraBold,
    color: COLORS.surfaceWhite,
    letterSpacing: -1,
  },
  oversText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  tossSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  matchIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  matchIdText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  battersCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  batterCol: {
    flex: 1,
    paddingHorizontal: 6,
  },
  batterColStriker: {},
  batterDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  batterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  batIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  batterNameText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surfaceWhite,
  },
  batterStatsRow: {
    marginTop: 6,
    marginLeft: 36,
  },
  replaceLinkText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.brandTeal,
    textDecorationLine: 'underline',
  },
  batterScoreDigits: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  bowlerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  bowlerInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  bowlerNameText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surfaceWhite,
  },
  stumpsIcon: {
    flexDirection: 'row',
    gap: 2,
    marginLeft: 4,
  },
  stumpBar: {
    width: 2.5,
    height: 14,
    backgroundColor: COLORS.brandTeal,
    borderRadius: 1,
  },
  bowlerFiguresText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  bowlerQuotaSubtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  changeBowlerPill: {
    backgroundColor: 'rgba(0, 168, 132, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  changeBowlerText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.brandTeal,
  },
  overSequenceContainer: {
    marginTop: 14,
    minHeight: 46,
    justifyContent: 'center',
  },
  emptyOverIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  emptyBallDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.textMuted,
  },
  emptyOverText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  ballsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },
  ballBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  ballBadgeText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.extraBold,
  },
  syncedToast: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  syncedToastText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  keypadContainer: {
    backgroundColor: COLORS.keypadBg,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
  },
  keypadRow: {
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.keypadBorder,
  },
  keypadCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.keypadBorder,
  },
  keyActionCell: {
    borderRightWidth: 0,
  },
  keyDigit: {
    fontSize: 22,
    fontWeight: FONT_WEIGHT.regular,
    color: COLORS.keypadText,
  },
  keySubLabel: {
    fontSize: 10,
    color: COLORS.textDarkSecondary,
    marginTop: -2,
  },
  keyUndoText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.brandTeal,
    letterSpacing: 0.5,
  },
  keyRunAltText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.keypadText,
  },
  keySpecialText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.keypadText,
    letterSpacing: 0.5,
  },
  keypadBottomRow: {
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.keypadBorder,
  },
  keyOutButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
  },
  keyOutText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.extraBold,
    color: COLORS.ballWicket,
    letterSpacing: 1,
  },
  shortcutsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#64748B',
    paddingVertical: 10,
  },
  shortcutsBarText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
});