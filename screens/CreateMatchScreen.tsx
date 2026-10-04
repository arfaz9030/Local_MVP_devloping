import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
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
import { AddOfficialModal, OfficialMember, OfficialRole } from '../components/AddOfficialModal';
import { AddSquadPlayerModal } from '../components/AddSquadPlayerModal';
import { GroundPickerModal } from '../components/GroundPickerModal';
import { TeamItem } from '../components/TeamCard';
import { TeamPickerModal } from '../components/TeamPickerModal';
import { createMatch, getTeams } from '../src/api/matchApi';
import { COLORS } from '../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../src/theme/typography';

// Stages in the Start Match flow (guided by the 18 screenshots)
type MatchSetupStage =
  | 'SETTINGS' // Screen 1, 3: Match settings, overs, ground
  | 'OFFICIALS' // Screen 2, 4-11: Umpires, scorers, commentators
  | 'SQUADS' // Screen 11-post, 12, 13, 14: Playing XI selection
  | 'CAPTAIN_WK' // Screen 16: Choose Captain and Wicket Keeper
  | 'TOSS' // Screen 17: Who won toss, elected to bat/bowl
  | 'OPENERS'; // Screen 18: Select striker, non-striker & opening bowler

interface SquadPlayer {
  id: string;
  name: string;
  jerseyNumber?: number;
  role: string;
  battingStyle?: string;
  bowlingStyle?: string;
}

const DEFAULT_TEAM_1_PLAYERS: SquadPlayer[] = [
  { id: 't1_p1', name: 'MohammadArfaz Shaik', jerseyNumber: 7, role: 'All-Rounder', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right-arm Medium' },
  { id: 't1_p2', name: 'Rahul Sharma', jerseyNumber: 18, role: 'Batsman', battingStyle: 'Right Hand Bat' },
  { id: 't1_p3', name: 'Sai Teja', jerseyNumber: 12, role: 'Batsman', battingStyle: 'Left Hand Bat' },
  { id: 't1_p4', name: 'Vikram Reddy', jerseyNumber: 99, role: 'WK-Batsman', battingStyle: 'Right Hand Bat' },
  { id: 't1_p5', name: 'Suresh Raina', jerseyNumber: 3, role: 'All-Rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Right-arm Spin' },
  { id: 't1_p6', name: 'Abdul Raheem', jerseyNumber: 11, role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right-arm Fast' },
  { id: 't1_p7', name: 'Pranav Rao', jerseyNumber: 24, role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right-arm Spin' },
  { id: 't1_p8', name: 'Nikhil Varma', jerseyNumber: 8, role: 'Bowler', battingStyle: 'Left Hand Bat', bowlingStyle: 'Left-arm Fast' },
  { id: 't1_p9', name: 'Dinesh Karthik', jerseyNumber: 21, role: 'Batsman', battingStyle: 'Right Hand Bat' },
  { id: 't1_p10', name: 'Sameer Khan', jerseyNumber: 45, role: 'All-Rounder', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right-arm Fast' },
  { id: 't1_p11', name: 'Harish Kumar', jerseyNumber: 15, role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right-arm Medium' },
];

const DEFAULT_TEAM_2_PLAYERS: SquadPlayer[] = [
  { id: 't2_p1', name: 'Ahmed Khan', jerseyNumber: 10, role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right-arm Fast' },
  { id: 't2_p2', name: 'Zubair Mohammed', jerseyNumber: 17, role: 'Batsman', battingStyle: 'Right Hand Bat' },
  { id: 't2_p3', name: 'Farhan Ali', jerseyNumber: 9, role: 'Batsman', battingStyle: 'Left Hand Bat' },
  { id: 't2_p4', name: 'Shoaib Akhtar', jerseyNumber: 14, role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right-arm Fast' },
  { id: 't2_p5', name: 'Tariq Aziz', jerseyNumber: 33, role: 'WK-Batsman', battingStyle: 'Right Hand Bat' },
  { id: 't2_p6', name: 'Rizwan Sheikh', jerseyNumber: 77, role: 'All-Rounder', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right-arm Medium' },
  { id: 't2_p7', name: 'Bilal Hassan', jerseyNumber: 5, role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right-arm Spin' },
  { id: 't2_p8', name: 'Imran Siddiqui', jerseyNumber: 22, role: 'Batsman', battingStyle: 'Right Hand Bat' },
  { id: 't2_p9', name: 'Asif Nawaz', jerseyNumber: 16, role: 'All-Rounder', battingStyle: 'Left Hand Bat', bowlingStyle: 'Left-arm Spin' },
  { id: 't2_p10', name: 'Danish Qureshi', jerseyNumber: 19, role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right-arm Medium' },
  { id: 't2_p11', name: 'Yasir Shah', jerseyNumber: 88, role: 'Bowler', battingStyle: 'Right Hand Bat', bowlingStyle: 'Right-arm Spin' },
];

const OVERS_OPTIONS = [5, 8, 10, 12, 15, 20];
const BALL_TYPES = ['Tennis', 'Leather', 'Rubber / Tape'];
const PITCH_TYPES = ['Turf', 'Matting', 'Cement', 'Rough'];
const MATCH_TYPES = ['Limited Overs', 'Box Cricket', 'Test Match'];

export default function CreateMatchScreen() {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  const topInset = Math.max(insets.top, statusBarHeight);
  const bottomInset = insets.bottom;
  const router = useRouter();

  // Current stage in the flow
  const [currentStage, setCurrentStage] = useState<MatchSetupStage>('SETTINGS');

  // Loaded teams for picking
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [, setLoadingTeams] = useState(true);

  // STAGE 1: Selected Teams & Match Settings
  const [team1, setTeam1] = useState<{ id?: string; name: string; captainName?: string; city?: string } | null>({
    id: '1',
    name: 'Hyderabad Nizampet Boys',
    captainName: 'MohammadArfaz Shaik',
    city: 'Hyderabad (Telangana)',
  });
  const [team2, setTeam2] = useState<{ id?: string; name: string; captainName?: string; city?: string } | null>({
    id: '2',
    name: 'Hyderabad Tolichowki Boys',
    captainName: 'Ahmed Khan',
    city: 'Hyderabad (Telangana)',
  });

  const [selectedOvers, setSelectedOvers] = useState<number>(10);
  const [selectedBall, setSelectedBall] = useState<string>('Tennis');
  const [selectedPitch, setSelectedPitch] = useState<string>('Turf');
  const [selectedMatchType, setSelectedMatchType] = useState<string>('Limited Overs');
  const [selectedGround, setSelectedGround] = useState<string>('Gymkhana Cricket Ground, Secunderabad');
  const [cityLocation, setCityLocation] = useState<string>('Hyderabad (Telangana)');
  const [matchDateTime, setMatchDateTime] = useState<string>('Today, 04:00 PM');
  const [oversPerBowler, setOversPerBowler] = useState<number>(2);

  // Modal pickers for Stage 1
  const [teamPickerMode, setTeamPickerMode] = useState<'team1' | 'team2' | null>(null);
  const [groundPickerVisible, setGroundPickerVisible] = useState(false);

  // STAGE 2: Match Officials
  const [officials, setOfficials] = useState<{
    umpire1: OfficialMember | null;
    umpire2: OfficialMember | null;
    thirdUmpire: OfficialMember | null;
    scorer1: OfficialMember | null;
    scorer2: OfficialMember | null;
    commentator: OfficialMember | null;
  }>({
    umpire1: null,
    umpire2: null,
    thirdUmpire: null,
    scorer1: {
      id: 'self_1',
      name: 'MohammadArfaz Shaik',
      phone: '9876543210',
      city: 'Hyderabad (Telangana)',
      role: 'scorer1',
      isSelf: true,
    },
    scorer2: null,
    commentator: null,
  });

  // Modal state for adding official
  const [activeOfficialModalRole, setActiveOfficialModalRole] = useState<OfficialRole | null>(null);

  // STAGE 3: Squad Selection (Playing XI)
  const [team1Players, setTeam1Players] = useState<SquadPlayer[]>(DEFAULT_TEAM_1_PLAYERS);
  const [team2Players, setTeam2Players] = useState<SquadPlayer[]>(DEFAULT_TEAM_2_PLAYERS);
  const [team1SelectedPlayerIds, setTeam1SelectedPlayerIds] = useState<string[]>(
    DEFAULT_TEAM_1_PLAYERS.map((p) => p.id)
  );
  const [team2SelectedPlayerIds, setTeam2SelectedPlayerIds] = useState<string[]>(
    DEFAULT_TEAM_2_PLAYERS.map((p) => p.id)
  );
  const [activeSquadTab, setActiveSquadTab] = useState<'team1' | 'team2'>('team1');
  const [squadSearchQuery, setSquadSearchQuery] = useState('');
  const [addPlayerModalTeam, setAddPlayerModalTeam] = useState<'team1' | 'team2' | null>(null);

  // STAGE 4: Captain & Wicket Keeper
  const [activeCapWkTab, setActiveCapWkTab] = useState<'team1' | 'team2'>('team1');
  const [team1CaptainId, setTeam1CaptainId] = useState<string>('t1_p1');
  const [team1WkId, setTeam1WkId] = useState<string>('t1_p4');
  const [team2CaptainId, setTeam2CaptainId] = useState<string>('t2_p1');
  const [team2WkId, setTeam2WkId] = useState<string>('t2_p5');

  // STAGE 5: Toss
  const [tossWinnerTeam, setTossWinnerTeam] = useState<'team1' | 'team2' | null>('team1');
  const [tossDecision, setTossDecision] = useState<'BAT' | 'BOWL'>('BAT');
  const [isFlippingCoin, setIsFlippingCoin] = useState(false);
  const [coinTossResult, setCoinTossResult] = useState<string>('');

  // STAGE 6: Openers & Opening Bowler
  const [strikerId, setStrikerId] = useState<string>('');
  const [nonStrikerId, setNonStrikerId] = useState<string>('');
  const [openingBowlerId, setOpeningBowlerId] = useState<string>('');
  const [openerPickerModal, setOpenerPickerModal] = useState<'striker' | 'nonStriker' | 'bowler' | null>(null);

  // Submission / Loading
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-recalculate overs per bowler when overs change
  useEffect(() => {
    setOversPerBowler(Math.max(1, Math.ceil(selectedOvers / 5)));
  }, [selectedOvers]);

  // Load backend teams
  useEffect(() => {
    const fetchTeamsList = async () => {
      try {
        setLoadingTeams(true);
        const data = await getTeams();
        if (Array.isArray(data) && data.length > 0) {
          setTeams(
            data.map((t: any) => ({
              id: String(t.id),
              name: t.name,
              captainName: t.captainName,
              city: t.city || 'Hyderabad (Telangana)',
              players: t.players || [],
            }))
          );
        }
      } catch (err) {
        console.log('Using default mock teams for match setup', err);
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeamsList();
  }, []);

  // Compute batting and bowling teams based on toss
  const battingTeam = useMemo(() => {
    if (!tossWinnerTeam) return 'team1';
    if (tossDecision === 'BAT') {
      return tossWinnerTeam;
    }
    return tossWinnerTeam === 'team1' ? 'team2' : 'team1';
  }, [tossWinnerTeam, tossDecision]);

  const bowlingTeam = useMemo(() => {
    return battingTeam === 'team1' ? 'team2' : 'team1';
  }, [battingTeam]);

  // Batting players available for openers
  const battingPlayers = useMemo(() => {
    const sourceList = battingTeam === 'team1' ? team1Players : team2Players;
    const selectedIds = battingTeam === 'team1' ? team1SelectedPlayerIds : team2SelectedPlayerIds;
    return sourceList.filter((p) => selectedIds.includes(p.id));
  }, [battingTeam, team1Players, team2Players, team1SelectedPlayerIds, team2SelectedPlayerIds]);

  // Bowling players available for opening bowler
  const bowlingPlayers = useMemo(() => {
    const sourceList = bowlingTeam === 'team1' ? team1Players : team2Players;
    const selectedIds = bowlingTeam === 'team1' ? team1SelectedPlayerIds : team2SelectedPlayerIds;
    return sourceList.filter((p) => selectedIds.includes(p.id));
  }, [bowlingTeam, team1Players, team2Players, team1SelectedPlayerIds, team2SelectedPlayerIds]);

  // Set default openers when reaching OPENERS stage
  useEffect(() => {
    if (currentStage === 'OPENERS') {
      if (battingPlayers.length >= 2) {
        if (!strikerId) setStrikerId(battingPlayers[0].id);
        if (!nonStrikerId) setNonStrikerId(battingPlayers[1].id);
      }
      if (bowlingPlayers.length >= 1 && !openingBowlerId) {
        // Prefer bowler
        const bowler = bowlingPlayers.find((p) => p.role === 'Bowler') || bowlingPlayers[0];
        setOpeningBowlerId(bowler.id);
      }
    }
  }, [currentStage, battingPlayers, bowlingPlayers, strikerId, nonStrikerId, openingBowlerId]);

  // Navigation between stages
  const handleBack = () => {
    setErrorMsg('');
    switch (currentStage) {
      case 'SETTINGS':
        router.back();
        break;
      case 'OFFICIALS':
        setCurrentStage('SETTINGS');
        break;
      case 'SQUADS':
        setCurrentStage('OFFICIALS');
        break;
      case 'CAPTAIN_WK':
        setCurrentStage('SQUADS');
        break;
      case 'TOSS':
        setCurrentStage('CAPTAIN_WK');
        break;
      case 'OPENERS':
        setCurrentStage('TOSS');
        break;
    }
  };

  // Stage 1 validation -> next
  const handleProceedFromSettings = () => {
    setErrorMsg('');
    if (!team1 || !team1.name.trim()) {
      setErrorMsg('Please select Team 1 (Your Team)');
      Alert.alert('Validation Error', 'Please select Team 1');
      return;
    }
    if (!team2 || !team2.name.trim()) {
      setErrorMsg('Please select Team 2 (Opponent Team)');
      Alert.alert('Validation Error', 'Please select Team 2');
      return;
    }
    if (team1.name.trim().toLowerCase() === team2.name.trim().toLowerCase()) {
      setErrorMsg('Team 1 and Team 2 must be different teams');
      Alert.alert('Validation Error', 'Team 1 and Team 2 must be different teams');
      return;
    }
    setCurrentStage('OFFICIALS');
  };

  // Stage 2 -> Stage 3
  const handleProceedFromOfficials = () => {
    setCurrentStage('SQUADS');
  };

  // Stage 3 validation -> next
  const handleProceedFromSquads = () => {
    if (team1SelectedPlayerIds.length < 2) {
      Alert.alert('Incomplete Squad', `Please select at least 2 players for ${team1?.name}`);
      return;
    }
    if (team2SelectedPlayerIds.length < 2) {
      Alert.alert('Incomplete Squad', `Please select at least 2 players for ${team2?.name}`);
      return;
    }
    // Make sure captain and WK are selected from current squad
    if (!team1SelectedPlayerIds.includes(team1CaptainId)) {
      setTeam1CaptainId(team1SelectedPlayerIds[0]);
    }
    if (!team1SelectedPlayerIds.includes(team1WkId)) {
      setTeam1WkId(team1SelectedPlayerIds[Math.min(1, team1SelectedPlayerIds.length - 1)]);
    }
    if (!team2SelectedPlayerIds.includes(team2CaptainId)) {
      setTeam2CaptainId(team2SelectedPlayerIds[0]);
    }
    if (!team2SelectedPlayerIds.includes(team2WkId)) {
      setTeam2WkId(team2SelectedPlayerIds[Math.min(1, team2SelectedPlayerIds.length - 1)]);
    }

    setCurrentStage('CAPTAIN_WK');
  };

  // Stage 4 validation -> next
  const handleProceedFromCaptainWk = () => {
    if (!team1CaptainId || !team1WkId) {
      Alert.alert('Selection Required', `Please choose both Captain and Wicket Keeper for ${team1?.name}`);
      return;
    }
    if (!team2CaptainId || !team2WkId) {
      Alert.alert('Selection Required', `Please choose both Captain and Wicket Keeper for ${team2?.name}`);
      return;
    }
    setCurrentStage('TOSS');
  };

  // Stage 5 validation -> next
  const handleProceedFromToss = () => {
    if (!tossWinnerTeam) {
      Alert.alert('Toss Required', 'Please specify who won the toss.');
      return;
    }
    setCurrentStage('OPENERS');
  };

  // Interactive Coin Toss Flip (Screenshot 17)
  const handleFlipCoin = () => {
    setIsFlippingCoin(true);
    setCoinTossResult('Flipping coin...');
    setTimeout(() => {
      const isHeads = Math.random() > 0.5;
      const winner = isHeads ? 'team1' : 'team2';
      setTossWinnerTeam(winner);
      setCoinTossResult(
        `${isHeads ? 'HEADS' : 'TAILS'}! ${winner === 'team1' ? team1?.name : team2?.name} won the toss.`
      );
      setIsFlippingCoin(false);
    }, 900);
  };

  // Final Action: Start Match & Scoring
  const handleStartScoring = async () => {
    if (!strikerId || !nonStrikerId) {
      Alert.alert('Openers Required', 'Please select both striker and non-striker.');
      return;
    }
    if (strikerId === nonStrikerId) {
      Alert.alert('Invalid Selection', 'Striker and Non-Striker cannot be the same batsman.');
      return;
    }
    if (!openingBowlerId) {
      Alert.alert('Bowler Required', 'Please select an opening bowler.');
      return;
    }

    try {
      setSubmitting(true);
      const match = await createMatch({
        team1Name: team1!.name.trim(),
        team2Name: team2!.name.trim(),
      });

      Alert.alert(
        'Match Started!',
        `Match created successfully! ID: ${match.matchId}. You can now score ball-by-ball.`,
        [
          {
            text: 'Go to Scoring',
            onPress: () => {
              router.replace({
                pathname: '/match/[matchId]',
                params: {
                  matchId: match.matchId,
                  team1Name: team1!.name,
                  team2Name: team2!.name,
                  runs: '0',
                  wickets: '0',
                  overs: '0.0',
                  status: 'LIVE',
                },
              });
            },
          },
        ]
      );
    } catch (err: any) {
      // If backend network error, still route smoothly to match details for local offline scoring
      const fallbackId = 'M_' + Date.now().toString().slice(-4);
      Alert.alert(
        'Match Initialized',
        `Match setup completed for ${team1?.name} vs ${team2?.name}. Proceeding to scoring screen.`,
        [
          {
            text: 'Start Scoring',
            onPress: () => {
              router.replace({
                pathname: '/match/[matchId]',
                params: {
                  matchId: fallbackId,
                  team1Name: team1!.name,
                  team2Name: team2!.name,
                  runs: '0',
                  wickets: '0',
                  overs: '0.0',
                  status: 'LIVE',
                },
              });
            },
          },
        ]
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to toggle player in squad
  const handleToggleSquadPlayer = (playerId: string, team: 'team1' | 'team2') => {
    if (team === 'team1') {
      setTeam1SelectedPlayerIds((prev) =>
        prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
      );
    } else {
      setTeam2SelectedPlayerIds((prev) =>
        prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
      );
    }
  };

  // Render Stage Title & Stepper Header
  const getStageTitle = () => {
    switch (currentStage) {
      case 'SETTINGS':
        return 'Match Settings';
      case 'OFFICIALS':
        return 'Match Officials';
      case 'SQUADS':
        return 'Select Playing XI';
      case 'CAPTAIN_WK':
        return 'Choose Captain & WK';
      case 'TOSS':
        return 'The Toss';
      case 'OPENERS':
        return 'Select Openers';
    }
  };

  const getStageStepNumber = () => {
    switch (currentStage) {
      case 'SETTINGS':
        return 1;
      case 'OFFICIALS':
        return 2;
      case 'SQUADS':
        return 3;
      case 'CAPTAIN_WK':
        return 4;
      case 'TOSS':
        return 5;
      case 'OPENERS':
        return 6;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <StatusBar barStyle="light-content" translucent />

      {/* Red App Header (CrickHero brand header) */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={handleBack}>
          <Icon source="arrow-left" size={24} color={COLORS.surfaceWhite} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>{getStageTitle()}</Text>
          <Text style={styles.headerStepText}>Step {getStageStepNumber()} of 6</Text>
        </View>

        <TouchableOpacity
          style={styles.headerHelpBtn}
          onPress={() =>
            Alert.alert(
              'CrickHero Match Setup',
              'Configure your teams, match overs, ground, officials, Playing 11, captain, and toss to begin scoring.'
            )
          }
        >
          <Icon source="help-circle-outline" size={22} color={COLORS.surfaceWhite} />
        </TouchableOpacity>
      </View>

      {/* Stepper Progress Bar */}
      <View style={styles.stepperContainer}>
        {[1, 2, 3, 4, 5, 6].map((step) => {
          const isActive = step === getStageStepNumber();
          const isDone = step < getStageStepNumber();
          return (
            <View
              key={step}
              style={[
                styles.stepperSegment,
                isActive && styles.stepperSegmentActive,
                isDone && styles.stepperSegmentDone,
              ]}
            />
          );
        })}
      </View>

      {/* Error Banner */}
      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Icon source="alert-circle-outline" size={18} color="#F87171" />
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* ========================================================================= */}
      {/* STAGE 1: MATCH SETTINGS & OVERS (Screenshots 1 & 3)                      */}
      {/* ========================================================================= */}
      {currentStage === 'SETTINGS' ? (
        <View style={styles.stageWrapper}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 80 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Matchup Teams Banner */}
            <View style={styles.matchupBox}>
              <View style={styles.matchupRow}>
                {/* Team 1 */}
                <TouchableOpacity
                  style={styles.matchupTeam}
                  onPress={() => setTeamPickerMode('team1')}
                >
                  <View style={[styles.matchupAvatar, { backgroundColor: '#16A34A' }]}>
                    <Text style={styles.matchupAvatarText}>
                      {team1?.name.substring(0, 2).toUpperCase() || 'T1'}
                    </Text>
                  </View>
                  <Text style={styles.matchupTeamName} numberOfLines={1}>
                    {team1?.name || 'Select Team 1'}
                  </Text>
                  <Text style={styles.matchupBadge}>HOST / MY TEAM</Text>
                  <Text style={styles.matchupChangeLink}>Tap to change</Text>
                </TouchableOpacity>

                {/* VS Circle */}
                <View style={styles.vsCircle}>
                  <Text style={styles.vsText}>VS</Text>
                </View>

                {/* Team 2 */}
                <TouchableOpacity
                  style={styles.matchupTeam}
                  onPress={() => setTeamPickerMode('team2')}
                >
                  <View style={[styles.matchupAvatar, { backgroundColor: '#DC2626' }]}>
                    <Text style={styles.matchupAvatarText}>
                      {team2?.name.substring(0, 2).toUpperCase() || 'T2'}
                    </Text>
                  </View>
                  <Text style={styles.matchupTeamName} numberOfLines={1}>
                    {team2?.name || 'Select Team 2'}
                  </Text>
                  <Text style={styles.matchupBadge}>OPPONENT</Text>
                  <Text style={styles.matchupChangeLink}>Tap to change</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Match Type */}
            <View style={styles.formCard}>
              <Text style={styles.cardHeaderTitle}>MATCH CONFIGURATION</Text>

              <Text style={styles.fieldHeading}>Match Type</Text>
              <View style={styles.pillsRow}>
                {MATCH_TYPES.map((type) => {
                  const isSelected = selectedMatchType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.pill, isSelected && styles.pillActive]}
                      onPress={() => setSelectedMatchType(type)}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Number of Overs */}
              <View style={styles.oversHeaderRow}>
                <Text style={styles.fieldHeading}>No. of Overs</Text>
                <Text style={styles.oversSubText}>Overs per Bowler: {oversPerBowler}</Text>
              </View>

              <View style={styles.pillsRow}>
                {OVERS_OPTIONS.map((overs) => {
                  const isSelected = selectedOvers === overs;
                  return (
                    <TouchableOpacity
                      key={overs}
                      style={[styles.pill, isSelected && styles.pillActive]}
                      onPress={() => setSelectedOvers(overs)}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                        {overs} Overs
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Overs Stepper */}
              <View style={styles.stepperRow}>
                <Text style={styles.stepperLabel}>Custom Overs:</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setSelectedOvers((prev) => Math.max(1, prev - 1))}
                  >
                    <Icon source="minus" size={18} color={COLORS.surfaceWhite} />
                  </TouchableOpacity>
                  <Text style={styles.stepperVal}>{selectedOvers}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setSelectedOvers((prev) => Math.min(100, prev + 1))}
                  >
                    <Icon source="plus" size={18} color={COLORS.surfaceWhite} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Overs Per Bowler Max Input */}
              <View style={styles.stepperRow}>
                <Text style={styles.stepperLabel}>Max Overs per Bowler:</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setOversPerBowler((prev) => Math.max(1, prev - 1))}
                  >
                    <Icon source="minus" size={18} color={COLORS.surfaceWhite} />
                  </TouchableOpacity>
                  <Text style={styles.stepperVal}>{oversPerBowler}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setOversPerBowler((prev) => prev + 1)}
                  >
                    <Icon source="plus" size={18} color={COLORS.surfaceWhite} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Ground & Venue Card (Screenshot 3 trigger) */}
            <View style={styles.formCard}>
              <Text style={styles.cardHeaderTitle}>VENUE & SCHEDULE</Text>

              {/* Ground Selector */}
              <Text style={styles.fieldHeading}>Ground / Stadium</Text>
              <TouchableOpacity
                style={styles.groundSelectBox}
                onPress={() => setGroundPickerVisible(true)}
              >
                <View style={styles.groundSelectIcon}>
                  <Icon source="stadium" size={22} color={COLORS.brandTeal} />
                </View>
                <View style={styles.groundSelectInfo}>
                  <Text style={styles.groundSelectName} numberOfLines={1}>
                    {selectedGround || 'Tap to choose ground...'}
                  </Text>
                  <Text style={styles.groundSelectCity}>{cityLocation}</Text>
                </View>
                <Icon source="chevron-right" size={22} color={COLORS.placeholder} />
              </TouchableOpacity>

              {/* City / Location */}
              <Text style={styles.fieldHeading}>City / Town</Text>
              <View style={styles.inputBox}>
                <Icon source="map-marker-outline" size={20} color={COLORS.placeholder} />
                <TextInput
                  style={styles.textInput}
                  value={cityLocation}
                  onChangeText={setCityLocation}
                  placeholder="Enter city..."
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>

              {/* Match Date & Time */}
              <Text style={styles.fieldHeading}>Match Date & Time</Text>
              <View style={styles.inputBox}>
                <Icon source="calendar-clock" size={20} color={COLORS.placeholder} />
                <TextInput
                  style={styles.textInput}
                  value={matchDateTime}
                  onChangeText={setMatchDateTime}
                  placeholder="Date and time..."
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>
            </View>

            {/* Ball & Pitch Settings */}
            <View style={styles.formCard}>
              <Text style={styles.cardHeaderTitle}>CONDITIONS & GEAR</Text>

              {/* Ball Type */}
              <Text style={styles.fieldHeading}>Ball Type</Text>
              <View style={styles.pillsRow}>
                {BALL_TYPES.map((ball) => {
                  const isSelected = selectedBall === ball;
                  return (
                    <TouchableOpacity
                      key={ball}
                      style={[styles.pill, isSelected && styles.pillActive]}
                      onPress={() => setSelectedBall(ball)}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                        {ball}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Pitch Type */}
              <Text style={styles.fieldHeading}>Pitch Type</Text>
              <View style={styles.pillsRow}>
                {PITCH_TYPES.map((pitch) => {
                  const isSelected = selectedPitch === pitch;
                  return (
                    <TouchableOpacity
                      key={pitch}
                      style={[styles.pill, isSelected && styles.pillActive]}
                      onPress={() => setSelectedPitch(pitch)}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                        {pitch}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom Next Button */}
          <View style={[styles.bottomBar, { paddingBottom: Math.max(bottomInset, 14) }]}>
            <TouchableOpacity style={styles.nextCtaBtn} onPress={handleProceedFromSettings}>
              <Text style={styles.nextCtaBtnText}>Next: Select Officials</Text>
              <Icon source="arrow-right" size={20} color={COLORS.surfaceWhite} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* ========================================================================= */}
      {/* STAGE 2: MATCH OFFICIALS (Screenshots 2, 4-11)                             */}
      {/* ========================================================================= */}
      {currentStage === 'OFFICIALS' ? (
        <View style={styles.stageWrapper}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 80 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.infoBanner}>
              <Icon source="information-outline" size={20} color={COLORS.brandTeal} />
              <Text style={styles.infoBannerText}>
                Match officials can manage the score, make umpiring decisions, and track verified match records. (Optional)
              </Text>
            </View>

            {/* UMPIRES SECTION */}
            <View style={styles.formCard}>
              <View style={styles.sectionHeaderBetween}>
                <Text style={styles.cardHeaderTitle}>UMPIRES</Text>
                <Icon source="whistle" size={20} color={COLORS.brandTeal} />
              </View>

              {/* Umpire 1 */}
              <Text style={styles.officialSlotLabel}>Umpire 1 (Main Umpire)</Text>
              {officials.umpire1 ? (
                <View style={styles.officialPopulatedCard}>
                  <View style={styles.officialAvatar}>
                    <Text style={styles.officialAvatarText}>
                      {officials.umpire1.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.officialInfo}>
                    <Text style={styles.officialName}>{officials.umpire1.name}</Text>
                    <Text style={styles.officialContact}>
                      +91 {officials.umpire1.phone} • {officials.umpire1.city}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setOfficials((prev) => ({ ...prev, umpire1: null }))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon source="close-circle" size={22} color="#F87171" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addSlotBtn}
                  onPress={() => setActiveOfficialModalRole('umpire1')}
                >
                  <Icon source="plus-circle-outline" size={20} color={COLORS.brandTeal} />
                  <Text style={styles.addSlotBtnText}>+ Add Umpire 1</Text>
                </TouchableOpacity>
              )}

              {/* Umpire 2 */}
              <Text style={styles.officialSlotLabel}>Umpire 2 (Leg Umpire)</Text>
              {officials.umpire2 ? (
                <View style={styles.officialPopulatedCard}>
                  <View style={styles.officialAvatar}>
                    <Text style={styles.officialAvatarText}>
                      {officials.umpire2.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.officialInfo}>
                    <Text style={styles.officialName}>{officials.umpire2.name}</Text>
                    <Text style={styles.officialContact}>
                      +91 {officials.umpire2.phone} • {officials.umpire2.city}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setOfficials((prev) => ({ ...prev, umpire2: null }))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon source="close-circle" size={22} color="#F87171" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addSlotBtn}
                  onPress={() => setActiveOfficialModalRole('umpire2')}
                >
                  <Icon source="plus-circle-outline" size={20} color={COLORS.brandTeal} />
                  <Text style={styles.addSlotBtnText}>+ Add Umpire 2</Text>
                </TouchableOpacity>
              )}

              {/* Third Umpire */}
              <Text style={styles.officialSlotLabel}>Third Umpire (Optional)</Text>
              {officials.thirdUmpire ? (
                <View style={styles.officialPopulatedCard}>
                  <View style={styles.officialAvatar}>
                    <Text style={styles.officialAvatarText}>
                      {officials.thirdUmpire.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.officialInfo}>
                    <Text style={styles.officialName}>{officials.thirdUmpire.name}</Text>
                    <Text style={styles.officialContact}>
                      +91 {officials.thirdUmpire.phone} • {officials.thirdUmpire.city}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setOfficials((prev) => ({ ...prev, thirdUmpire: null }))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon source="close-circle" size={22} color="#F87171" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addSlotBtn}
                  onPress={() => setActiveOfficialModalRole('third_umpire')}
                >
                  <Icon source="plus-circle-outline" size={20} color={COLORS.brandTeal} />
                  <Text style={styles.addSlotBtnText}>+ Add Third Umpire</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* SCORERS SECTION */}
            <View style={styles.formCard}>
              <View style={styles.sectionHeaderBetween}>
                <Text style={styles.cardHeaderTitle}>SCORERS</Text>
                <Icon source="scoreboard" size={20} color={COLORS.brandTeal} />
              </View>

              {/* Scorer 1 */}
              <Text style={styles.officialSlotLabel}>Scorer 1</Text>
              {officials.scorer1 ? (
                <View style={styles.officialPopulatedCard}>
                  <View style={[styles.officialAvatar, { backgroundColor: COLORS.brandTeal }]}>
                    <Text style={styles.officialAvatarText}>
                      {officials.scorer1.isSelf ? 'ME' : officials.scorer1.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.officialInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.officialName}>{officials.scorer1.name}</Text>
                      {officials.scorer1.isSelf ? (
                        <View style={styles.selfBadge}>
                          <Text style={styles.selfBadgeText}>YOU</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.officialContact}>
                      +91 {officials.scorer1.phone} • Match Scorer
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setOfficials((prev) => ({ ...prev, scorer1: null }))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon source="close-circle" size={22} color="#F87171" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addSlotBtn}
                  onPress={() => setActiveOfficialModalRole('scorer1')}
                >
                  <Icon source="plus-circle-outline" size={20} color={COLORS.brandTeal} />
                  <Text style={styles.addSlotBtnText}>+ Add Scorer 1</Text>
                </TouchableOpacity>
              )}

              {/* Scorer 2 */}
              <Text style={styles.officialSlotLabel}>Scorer 2 (Optional)</Text>
              {officials.scorer2 ? (
                <View style={styles.officialPopulatedCard}>
                  <View style={styles.officialAvatar}>
                    <Text style={styles.officialAvatarText}>
                      {officials.scorer2.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.officialInfo}>
                    <Text style={styles.officialName}>{officials.scorer2.name}</Text>
                    <Text style={styles.officialContact}>
                      +91 {officials.scorer2.phone}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setOfficials((prev) => ({ ...prev, scorer2: null }))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon source="close-circle" size={22} color="#F87171" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addSlotBtn}
                  onPress={() => setActiveOfficialModalRole('scorer2')}
                >
                  <Icon source="plus-circle-outline" size={20} color={COLORS.brandTeal} />
                  <Text style={styles.addSlotBtnText}>+ Add Scorer 2</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* COMMENTATORS SECTION */}
            <View style={styles.formCard}>
              <View style={styles.sectionHeaderBetween}>
                <Text style={styles.cardHeaderTitle}>COMMENTATORS</Text>
                <Icon source="microphone" size={20} color={COLORS.brandTeal} />
              </View>

              <Text style={styles.officialSlotLabel}>Commentator (Optional)</Text>
              {officials.commentator ? (
                <View style={styles.officialPopulatedCard}>
                  <View style={styles.officialAvatar}>
                    <Text style={styles.officialAvatarText}>
                      {officials.commentator.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.officialInfo}>
                    <Text style={styles.officialName}>{officials.commentator.name}</Text>
                    <Text style={styles.officialContact}>
                      +91 {officials.commentator.phone}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setOfficials((prev) => ({ ...prev, commentator: null }))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon source="close-circle" size={22} color="#F87171" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addSlotBtn}
                  onPress={() => setActiveOfficialModalRole('commentator')}
                >
                  <Icon source="plus-circle-outline" size={20} color={COLORS.brandTeal} />
                  <Text style={styles.addSlotBtnText}>+ Add Commentator</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          {/* Sticky Bottom Next Button */}
          <View style={[styles.bottomBar, { paddingBottom: Math.max(bottomInset, 14) }]}>
            <TouchableOpacity style={styles.nextCtaBtn} onPress={handleProceedFromOfficials}>
              <Text style={styles.nextCtaBtnText}>Next: Select Squads (Playing XI)</Text>
              <Icon source="arrow-right" size={20} color={COLORS.surfaceWhite} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* ========================================================================= */}
      {/* STAGE 3: SQUAD SELECTION / PLAYING XI (Screenshots 11-post, 12, 13, 14)    */}
      {/* ========================================================================= */}
      {currentStage === 'SQUADS' ? (
        <View style={styles.stageWrapper}>
          {/* Team Switcher Tabs (Screenshot 12) */}
          <View style={styles.teamTabsHeader}>
            <TouchableOpacity
              style={[styles.teamTabBtn, activeSquadTab === 'team1' && styles.teamTabBtnActive]}
              onPress={() => {
                setActiveSquadTab('team1');
                setSquadSearchQuery('');
              }}
            >
              <Text
                style={[
                  styles.teamTabBtnText,
                  activeSquadTab === 'team1' && styles.teamTabBtnTextActive,
                ]}
                numberOfLines={1}
              >
                {team1?.name}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {team1SelectedPlayerIds.length} / {team1Players.length}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.teamTabBtn, activeSquadTab === 'team2' && styles.teamTabBtnActive]}
              onPress={() => {
                setActiveSquadTab('team2');
                setSquadSearchQuery('');
              }}
            >
              <Text
                style={[
                  styles.teamTabBtnText,
                  activeSquadTab === 'team2' && styles.teamTabBtnTextActive,
                ]}
                numberOfLines={1}
              >
                {team2?.name}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {team2SelectedPlayerIds.length} / {team2Players.length}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Squad Status Notification Banner (Screenshot 11-post) */}
          <View style={styles.squadAlertNotice}>
            <Icon source="account-check-outline" size={20} color={COLORS.brandTeal} />
            <Text style={styles.squadAlertText}>
              Select at least 2 to 11 players for each team&apos;s Playing XI.
            </Text>
          </View>

          {/* Search & Quick Add Row */}
          <View style={styles.squadToolsRow}>
            <View style={styles.squadSearchBar}>
              <Icon source="magnify" size={18} color={COLORS.placeholder} />
              <TextInput
                style={styles.squadSearchInput}
                placeholder="Search players..."
                placeholderTextColor={COLORS.placeholder}
                value={squadSearchQuery}
                onChangeText={setSquadSearchQuery}
              />
            </View>

            <TouchableOpacity
              style={styles.quickAddPlayerBtn}
              onPress={() => setAddPlayerModalTeam(activeSquadTab)}
            >
              <Icon source="account-plus" size={18} color={COLORS.surfaceWhite} />
              <Text style={styles.quickAddPlayerText}>+ Add Player</Text>
            </TouchableOpacity>
          </View>

          {/* Select All / Deselect All quick buttons */}
          <View style={styles.selectAllRow}>
            <Text style={styles.selectCountInfo}>
              Playing XI Selected:{' '}
              <Text style={{ color: COLORS.brandTeal, fontWeight: '700' }}>
                {activeSquadTab === 'team1'
                  ? team1SelectedPlayerIds.length
                  : team2SelectedPlayerIds.length}{' '}
                Players
              </Text>
            </Text>

            <TouchableOpacity
              onPress={() => {
                if (activeSquadTab === 'team1') {
                  if (team1SelectedPlayerIds.length === team1Players.length) {
                    setTeam1SelectedPlayerIds([]);
                  } else {
                    setTeam1SelectedPlayerIds(team1Players.map((p) => p.id));
                  }
                } else {
                  if (team2SelectedPlayerIds.length === team2Players.length) {
                    setTeam2SelectedPlayerIds([]);
                  } else {
                    setTeam2SelectedPlayerIds(team2Players.map((p) => p.id));
                  }
                }
              }}
            >
              <Text style={styles.toggleAllText}>
                {(activeSquadTab === 'team1' ? team1SelectedPlayerIds.length : team2SelectedPlayerIds.length) ===
                (activeSquadTab === 'team1' ? team1Players.length : team2Players.length)
                  ? 'Deselect All'
                  : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Players List with Checkboxes (Screenshots 12 & 13) */}
          <FlatList
            data={(activeSquadTab === 'team1' ? team1Players : team2Players).filter((p) =>
              p.name.toLowerCase().includes(squadSearchQuery.toLowerCase())
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.squadListContent, { paddingBottom: bottomInset + 80 }]}
            renderItem={({ item, index }) => {
              const isSelected = (
                activeSquadTab === 'team1' ? team1SelectedPlayerIds : team2SelectedPlayerIds
              ).includes(item.id);

              return (
                <TouchableOpacity
                  style={[styles.playerSelectCard, isSelected && styles.playerSelectCardActive]}
                  onPress={() => handleToggleSquadPlayer(item.id, activeSquadTab)}
                  activeOpacity={0.7}
                >
                  {/* Checkbox */}
                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                    {isSelected ? (
                      <Icon source="check" size={16} color={COLORS.surfaceWhite} />
                    ) : null}
                  </View>

                  {/* Player Index / Number */}
                  <Text style={styles.playerNum}>{index + 1}</Text>

                  {/* Player Avatar */}
                  <View style={styles.playerAvatarBox}>
                    <Text style={styles.playerAvatarText}>
                      {item.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>

                  {/* Name and Meta */}
                  <View style={styles.playerCardInfo}>
                    <Text style={styles.playerCardName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.playerCardRole}>
                      {item.role || 'Player'}{' '}
                      {item.jerseyNumber ? `• #${item.jerseyNumber}` : ''}{' '}
                      {item.battingStyle ? `• ${item.battingStyle}` : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          {/* Sticky Bottom Next Button (Screenshot 14) */}
          <View style={[styles.bottomBar, { paddingBottom: Math.max(bottomInset, 14) }]}>
            <TouchableOpacity style={styles.nextCtaBtn} onPress={handleProceedFromSquads}>
              <Text style={styles.nextCtaBtnText}>Next: Choose Captain & WK</Text>
              <Icon source="arrow-right" size={20} color={COLORS.surfaceWhite} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* ========================================================================= */}
      {/* STAGE 4: CHOOSE CAPTAIN & WICKET KEEPER (Screenshot 16)                   */}
      {/* ========================================================================= */}
      {currentStage === 'CAPTAIN_WK' ? (
        <View style={styles.stageWrapper}>
          {/* Team Switcher Tabs */}
          <View style={styles.teamTabsHeader}>
            <TouchableOpacity
              style={[styles.teamTabBtn, activeCapWkTab === 'team1' && styles.teamTabBtnActive]}
              onPress={() => setActiveCapWkTab('team1')}
            >
              <Text
                style={[
                  styles.teamTabBtnText,
                  activeCapWkTab === 'team1' && styles.teamTabBtnTextActive,
                ]}
                numberOfLines={1}
              >
                {team1?.name}
              </Text>
              {team1CaptainId && team1WkId ? (
                <Icon source="check-circle" size={16} color="#22C55E" />
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.teamTabBtn, activeCapWkTab === 'team2' && styles.teamTabBtnActive]}
              onPress={() => setActiveCapWkTab('team2')}
            >
              <Text
                style={[
                  styles.teamTabBtnText,
                  activeCapWkTab === 'team2' && styles.teamTabBtnTextActive,
                ]}
                numberOfLines={1}
              >
                {team2?.name}
              </Text>
              {team2CaptainId && team2WkId ? (
                <Icon source="check-circle" size={16} color="#22C55E" />
              ) : null}
            </TouchableOpacity>
          </View>

          {/* Instructions banner */}
          <View style={styles.capWkNotice}>
            <Icon source="crown" size={20} color="#F59E0B" />
            <Text style={styles.capWkNoticeText}>
              Select Captain [ C ] and Wicket Keeper [ WK ] for{' '}
              <Text style={{ fontWeight: '700', color: COLORS.surfaceWhite }}>
                {activeCapWkTab === 'team1' ? team1?.name : team2?.name}
              </Text>
            </Text>
          </View>

          {/* List of Playing XI players with [C] and [WK] buttons */}
          <FlatList
            data={(activeCapWkTab === 'team1' ? team1Players : team2Players).filter((p) =>
              (activeCapWkTab === 'team1' ? team1SelectedPlayerIds : team2SelectedPlayerIds).includes(
                p.id
              )
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.squadListContent, { paddingBottom: bottomInset + 80 }]}
            renderItem={({ item }) => {
              const isCaptain =
                (activeCapWkTab === 'team1' ? team1CaptainId : team2CaptainId) === item.id;
              const isWk =
                (activeCapWkTab === 'team1' ? team1WkId : team2WkId) === item.id;

              return (
                <View style={styles.capWkPlayerCard}>
                  <View style={styles.playerAvatarBox}>
                    <Text style={styles.playerAvatarText}>
                      {item.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.playerCardInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.playerCardName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      {isCaptain ? (
                        <View style={styles.goldBadge}>
                          <Text style={styles.goldBadgeText}>C</Text>
                        </View>
                      ) : null}
                      {isWk ? (
                        <View style={styles.tealBadge}>
                          <Text style={styles.tealBadgeText}>WK</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.playerCardRole}>{item.role || 'Player'}</Text>
                  </View>

                  {/* C and WK Action Badges */}
                  <View style={styles.capWkToggleGroup}>
                    {/* Captain Toggle */}
                    <TouchableOpacity
                      style={[styles.capToggleBtn, isCaptain && styles.capToggleBtnActive]}
                      onPress={() => {
                        if (activeCapWkTab === 'team1') {
                          setTeam1CaptainId(item.id);
                        } else {
                          setTeam2CaptainId(item.id);
                        }
                      }}
                    >
                      <Text style={[styles.capToggleText, isCaptain && styles.capToggleTextActive]}>
                        C
                      </Text>
                    </TouchableOpacity>

                    {/* Wicket Keeper Toggle */}
                    <TouchableOpacity
                      style={[styles.wkToggleBtn, isWk && styles.wkToggleBtnActive]}
                      onPress={() => {
                        if (activeCapWkTab === 'team1') {
                          setTeam1WkId(item.id);
                        } else {
                          setTeam2WkId(item.id);
                        }
                      }}
                    >
                      <Text style={[styles.wkToggleText, isWk && styles.wkToggleTextActive]}>
                        WK
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />

          {/* Sticky Bottom Next Button */}
          <View style={[styles.bottomBar, { paddingBottom: Math.max(bottomInset, 14) }]}>
            <TouchableOpacity style={styles.nextCtaBtn} onPress={handleProceedFromCaptainWk}>
              <Text style={styles.nextCtaBtnText}>Next: Proceed to Toss</Text>
              <Icon source="arrow-right" size={20} color={COLORS.surfaceWhite} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* ========================================================================= */}
      {/* STAGE 5: THE TOSS (Screenshot 17)                                         */}
      {/* ========================================================================= */}
      {currentStage === 'TOSS' ? (
        <View style={styles.stageWrapper}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 80 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Header / Intro */}
            <View style={styles.tossHeaderBox}>
              <Text style={styles.tossSectionQuestion}>Who won the toss?</Text>
              <Text style={styles.tossSectionSubtitle}>
                Select the team that called or won the coin toss
              </Text>
            </View>

            {/* Team Selection Cards */}
            <View style={styles.tossTeamsRow}>
              {/* Team 1 Card */}
              <TouchableOpacity
                style={[
                  styles.tossTeamCard,
                  tossWinnerTeam === 'team1' && styles.tossTeamCardSelected,
                ]}
                onPress={() => setTossWinnerTeam('team1')}
                activeOpacity={0.7}
              >
                <View style={[styles.tossAvatar, { backgroundColor: '#16A34A' }]}>
                  <Text style={styles.tossAvatarText}>
                    {team1?.name.substring(0, 2).toUpperCase() || 'T1'}
                  </Text>
                </View>
                <Text style={styles.tossTeamName} numberOfLines={2}>
                  {team1?.name}
                </Text>
                <Text style={styles.tossCaptainText}>
                  Cap: {team1Players.find((p) => p.id === team1CaptainId)?.name || team1?.captainName}
                </Text>

                {tossWinnerTeam === 'team1' ? (
                  <View style={styles.tossWinnerPill}>
                    <Icon source="check" size={14} color={COLORS.surfaceWhite} />
                    <Text style={styles.tossWinnerPillText}>TOSS WINNER</Text>
                  </View>
                ) : (
                  <View style={styles.tossTapSelectBox}>
                    <Text style={styles.tossTapSelectText}>Tap to select</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Team 2 Card */}
              <TouchableOpacity
                style={[
                  styles.tossTeamCard,
                  tossWinnerTeam === 'team2' && styles.tossTeamCardSelected,
                ]}
                onPress={() => setTossWinnerTeam('team2')}
                activeOpacity={0.7}
              >
                <View style={[styles.tossAvatar, { backgroundColor: '#DC2626' }]}>
                  <Text style={styles.tossAvatarText}>
                    {team2?.name.substring(0, 2).toUpperCase() || 'T2'}
                  </Text>
                </View>
                <Text style={styles.tossTeamName} numberOfLines={2}>
                  {team2?.name}
                </Text>
                <Text style={styles.tossCaptainText}>
                  Cap: {team2Players.find((p) => p.id === team2CaptainId)?.name || team2?.captainName}
                </Text>

                {tossWinnerTeam === 'team2' ? (
                  <View style={styles.tossWinnerPill}>
                    <Icon source="check" size={14} color={COLORS.surfaceWhite} />
                    <Text style={styles.tossWinnerPillText}>TOSS WINNER</Text>
                  </View>
                ) : (
                  <View style={styles.tossTapSelectBox}>
                    <Text style={styles.tossTapSelectText}>Tap to select</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Optional Flip Coin button (Screenshot 17 feature) */}
            <View style={styles.coinFlipContainer}>
              <TouchableOpacity
                style={styles.coinFlipBtn}
                onPress={handleFlipCoin}
                disabled={isFlippingCoin}
              >
                <Icon source="circle-multiple-outline" size={22} color={COLORS.surfaceWhite} />
                <Text style={styles.coinFlipBtnText}>
                  {isFlippingCoin ? 'Flipping Coin...' : 'Flip Toss Coin'}
                </Text>
              </TouchableOpacity>
              {coinTossResult ? (
                <Text style={styles.coinTossResultText}>{coinTossResult}</Text>
              ) : null}
            </View>

            {/* Decision Section: Elected to Bat or Bowl */}
            {tossWinnerTeam ? (
              <View style={styles.decisionContainer}>
                <Text style={styles.tossSectionQuestion}>Elected to?</Text>
                <Text style={styles.tossSectionSubtitle}>
                  {tossWinnerTeam === 'team1' ? team1?.name : team2?.name} won the toss and decided to:
                </Text>

                <View style={styles.decisionButtonsRow}>
                  {/* BAT */}
                  <TouchableOpacity
                    style={[
                      styles.decisionBtn,
                      tossDecision === 'BAT' && styles.decisionBtnActive,
                    ]}
                    onPress={() => setTossDecision('BAT')}
                  >
                    <Icon
                      source="cricket"
                      size={32}
                      color={tossDecision === 'BAT' ? COLORS.brandTeal : COLORS.placeholder}
                    />
                    <Text
                      style={[
                        styles.decisionBtnTitle,
                        tossDecision === 'BAT' && styles.decisionBtnTitleActive,
                      ]}
                    >
                      BAT
                    </Text>
                    <Text style={styles.decisionBtnSub}>Batting First</Text>
                  </TouchableOpacity>

                  {/* BOWL */}
                  <TouchableOpacity
                    style={[
                      styles.decisionBtn,
                      tossDecision === 'BOWL' && styles.decisionBtnActive,
                    ]}
                    onPress={() => setTossDecision('BOWL')}
                  >
                    <Icon
                      source="baseball"
                      size={32}
                      color={tossDecision === 'BOWL' ? COLORS.brandTeal : COLORS.placeholder}
                    />
                    <Text
                      style={[
                        styles.decisionBtnTitle,
                        tossDecision === 'BOWL' && styles.decisionBtnTitleActive,
                      ]}
                    >
                      BOWL
                    </Text>
                    <Text style={styles.decisionBtnSub}>Bowling First</Text>
                  </TouchableOpacity>
                </View>

                {/* Toss Outcome Summary Banner */}
                <View style={styles.tossOutcomeBanner}>
                  <Icon source="party-popper" size={22} color={COLORS.brandTeal} />
                  <Text style={styles.tossOutcomeText}>
                    🎉{' '}
                    <Text style={{ fontWeight: '700', color: COLORS.surfaceWhite }}>
                      {tossWinnerTeam === 'team1' ? team1?.name : team2?.name}
                    </Text>{' '}
                    won the toss and elected to{' '}
                    <Text style={{ fontWeight: '800', color: COLORS.brandTeal }}>
                      {tossDecision}
                    </Text>{' '}
                    first.
                  </Text>
                </View>
              </View>
            ) : null}
          </ScrollView>

          {/* Sticky Bottom Next Button */}
          <View style={[styles.bottomBar, { paddingBottom: Math.max(bottomInset, 14) }]}>
            <TouchableOpacity style={styles.nextCtaBtn} onPress={handleProceedFromToss}>
              <Text style={styles.nextCtaBtnText}>Next: Select Openers</Text>
              <Icon source="arrow-right" size={20} color={COLORS.surfaceWhite} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* ========================================================================= */}
      {/* STAGE 6: SELECT OPENERS & OPENING BOWLER (Screenshot 18)                  */}
      {/* ========================================================================= */}
      {currentStage === 'OPENERS' ? (
        <View style={styles.stageWrapper}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 80 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Match Overview Banner */}
            <View style={styles.matchupSummaryCard}>
              <Text style={styles.summaryTitle}>
                {team1?.name} vs {team2?.name}
              </Text>
              <Text style={styles.summaryDetails}>
                {selectedOvers} Overs • {selectedGround.split(',')[0]} • {selectedBall} Ball
              </Text>
              <View style={styles.summaryTossRow}>
                <Icon source="check-decagram" size={16} color={COLORS.brandTeal} />
                <Text style={styles.summaryTossText}>
                  {tossWinnerTeam === 'team1' ? team1?.name : team2?.name} won the toss & chosen to{' '}
                  {tossDecision}
                </Text>
              </View>
            </View>

            {/* SECTION 1: BATTING TEAM OPENERS */}
            <View style={styles.formCard}>
              <View style={styles.sectionHeaderBetween}>
                <View>
                  <Text style={styles.cardHeaderTitle}>
                    BATTING TEAM: {battingTeam === 'team1' ? team1?.name : team2?.name}
                  </Text>
                  <Text style={styles.cardHeaderSubtitle}>Select two opening batsmen</Text>
                </View>
                <Icon source="cricket" size={22} color={COLORS.brandTeal} />
              </View>

              {/* Striker (Batsman 1) */}
              <Text style={styles.openerLabel}>STRIKER (BATSMAN 1) *</Text>
              <TouchableOpacity
                style={styles.openerSelectBox}
                onPress={() => setOpenerPickerModal('striker')}
              >
                <View style={[styles.playerAvatarBox, { backgroundColor: '#16A34A' }]}>
                  <Text style={styles.playerAvatarText}>
                    {battingPlayers
                      .find((p) => p.id === strikerId)
                      ?.name.substring(0, 2)
                      .toUpperCase() || 'ST'}
                  </Text>
                </View>
                <View style={styles.openerInfo}>
                  <Text style={styles.openerName}>
                    {battingPlayers.find((p) => p.id === strikerId)?.name || 'Select Striker'}
                  </Text>
                  <Text style={styles.openerStyle}>
                    {battingPlayers.find((p) => p.id === strikerId)?.battingStyle ||
                      'Right Hand Bat'}{' '}
                    • Striker
                  </Text>
                </View>
                <Icon source="chevron-down" size={22} color={COLORS.placeholder} />
              </TouchableOpacity>

              {/* Non-Striker (Batsman 2) */}
              <Text style={styles.openerLabel}>NON-STRIKER (BATSMAN 2) *</Text>
              <TouchableOpacity
                style={styles.openerSelectBox}
                onPress={() => setOpenerPickerModal('nonStriker')}
              >
                <View style={[styles.playerAvatarBox, { backgroundColor: '#2563EB' }]}>
                  <Text style={styles.playerAvatarText}>
                    {battingPlayers
                      .find((p) => p.id === nonStrikerId)
                      ?.name.substring(0, 2)
                      .toUpperCase() || 'NS'}
                  </Text>
                </View>
                <View style={styles.openerInfo}>
                  <Text style={styles.openerName}>
                    {battingPlayers.find((p) => p.id === nonStrikerId)?.name ||
                      'Select Non-Striker'}
                  </Text>
                  <Text style={styles.openerStyle}>
                    {battingPlayers.find((p) => p.id === nonStrikerId)?.battingStyle ||
                      'Right Hand Bat'}{' '}
                    • Non-Striker
                  </Text>
                </View>
                <Icon source="chevron-down" size={22} color={COLORS.placeholder} />
              </TouchableOpacity>
            </View>

            {/* SECTION 2: BOWLING TEAM OPENING BOWLER */}
            <View style={styles.formCard}>
              <View style={styles.sectionHeaderBetween}>
                <View>
                  <Text style={styles.cardHeaderTitle}>
                    BOWLING TEAM: {bowlingTeam === 'team1' ? team1?.name : team2?.name}
                  </Text>
                  <Text style={styles.cardHeaderSubtitle}>Select opening bowler for Over 1</Text>
                </View>
                <Icon source="baseball" size={22} color={COLORS.brandTeal} />
              </View>

              {/* Opening Bowler */}
              <Text style={styles.openerLabel}>OPENING BOWLER *</Text>
              <TouchableOpacity
                style={styles.openerSelectBox}
                onPress={() => setOpenerPickerModal('bowler')}
              >
                <View style={[styles.playerAvatarBox, { backgroundColor: '#DC2626' }]}>
                  <Text style={styles.playerAvatarText}>
                    {bowlingPlayers
                      .find((p) => p.id === openingBowlerId)
                      ?.name.substring(0, 2)
                      .toUpperCase() || 'BW'}
                  </Text>
                </View>
                <View style={styles.openerInfo}>
                  <Text style={styles.openerName}>
                    {bowlingPlayers.find((p) => p.id === openingBowlerId)?.name ||
                      'Select Opening Bowler'}
                  </Text>
                  <Text style={styles.openerStyle}>
                    {bowlingPlayers.find((p) => p.id === openingBowlerId)?.bowlingStyle ||
                      'Right-arm Medium'}{' '}
                    • Bowler
                  </Text>
                </View>
                <Icon source="chevron-down" size={22} color={COLORS.placeholder} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Sticky Bottom Action Button -> START SCORING */}
          <View style={[styles.bottomBar, { paddingBottom: Math.max(bottomInset, 14) }]}>
            <TouchableOpacity
              style={[styles.startScoringBtn, submitting && styles.btnDisabled]}
              onPress={handleStartScoring}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.surfaceWhite} />
              ) : (
                <>
                  <Icon source="cricket" size={22} color={COLORS.surfaceWhite} />
                  <Text style={styles.startScoringBtnText}>START SCORING</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}

      {/* 1. Team Picker Modal */}
      {teamPickerMode ? (
        <TeamPickerModal
          visible={Boolean(teamPickerMode)}
          title={teamPickerMode === 'team1' ? 'Select Team 1 (Your Team)' : 'Select Team 2 (Opponent)'}
          teams={teams}
          selectedTeamId={teamPickerMode === 'team1' ? team1?.id : team2?.id}
          disabledTeamId={teamPickerMode === 'team1' ? team2?.id : team1?.id}
          onSelectTeam={(selected) => {
            if (teamPickerMode === 'team1') {
              setTeam1(selected);
            } else {
              setTeam2(selected);
            }
          }}
          onClose={() => setTeamPickerMode(null)}
        />
      ) : null}

      {/* 2. Ground Picker Modal (Screenshot 3) */}
      <GroundPickerModal
        visible={groundPickerVisible}
        selectedGround={selectedGround}
        onSelectGround={(ground) => {
          setSelectedGround(ground);
        }}
        onClose={() => setGroundPickerVisible(false)}
      />

      {/* 3. Add Official Modal (Screenshots 4-11) */}
      {activeOfficialModalRole ? (
        <AddOfficialModal
          visible={Boolean(activeOfficialModalRole)}
          role={activeOfficialModalRole}
          onSaveOfficial={(newOfficial) => {
            setOfficials((prev) => {
              switch (newOfficial.role) {
                case 'umpire1':
                  return { ...prev, umpire1: newOfficial };
                case 'umpire2':
                  return { ...prev, umpire2: newOfficial };
                case 'third_umpire':
                  return { ...prev, thirdUmpire: newOfficial };
                case 'scorer1':
                  return { ...prev, scorer1: newOfficial };
                case 'scorer2':
                  return { ...prev, scorer2: newOfficial };
                case 'commentator':
                  return { ...prev, commentator: newOfficial };
                default:
                  return prev;
              }
            });
            setActiveOfficialModalRole(null);
          }}
          onClose={() => setActiveOfficialModalRole(null)}
        />
      ) : null}

      {/* 4. Add Squad Player Modal (Screenshot 12) */}
      {addPlayerModalTeam ? (
        <AddSquadPlayerModal
          visible={Boolean(addPlayerModalTeam)}
          teamName={addPlayerModalTeam === 'team1' ? team1?.name || 'Team 1' : team2?.name || 'Team 2'}
          onAddPlayer={(newPlayer) => {
            if (addPlayerModalTeam === 'team1') {
              setTeam1Players((prev) => [newPlayer, ...prev]);
              setTeam1SelectedPlayerIds((prev) => [newPlayer.id, ...prev]);
            } else {
              setTeam2Players((prev) => [newPlayer, ...prev]);
              setTeam2SelectedPlayerIds((prev) => [newPlayer.id, ...prev]);
            }
            setAddPlayerModalTeam(null);
          }}
          onClose={() => setAddPlayerModalTeam(null)}
        />
      ) : null}

      {/* 5. Opener Picker Modal (for Stage 6) */}
      {openerPickerModal ? (
        <Modal
          visible={Boolean(openerPickerModal)}
          transparent
          animationType="fade"
          onRequestClose={() => setOpenerPickerModal(null)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setOpenerPickerModal(null)}>
            <View style={styles.openerPickerContainer}>
              <View style={styles.openerPickerHeader}>
                <Text style={styles.openerPickerTitle}>
                  {openerPickerModal === 'striker'
                    ? 'Select Striker'
                    : openerPickerModal === 'nonStriker'
                    ? 'Select Non-Striker'
                    : 'Select Opening Bowler'}
                </Text>
                <TouchableOpacity onPress={() => setOpenerPickerModal(null)}>
                  <Icon source="close" size={20} color={COLORS.surfaceWhite} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={openerPickerModal === 'bowler' ? bowlingPlayers : battingPlayers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isDisabled =
                    (openerPickerModal === 'striker' && item.id === nonStrikerId) ||
                    (openerPickerModal === 'nonStriker' && item.id === strikerId);

                  return (
                    <TouchableOpacity
                      style={[
                        styles.openerPickerItem,
                        isDisabled && { opacity: 0.4 },
                      ]}
                      disabled={isDisabled}
                      onPress={() => {
                        if (openerPickerModal === 'striker') {
                          setStrikerId(item.id);
                        } else if (openerPickerModal === 'nonStriker') {
                          setNonStrikerId(item.id);
                        } else {
                          setOpeningBowlerId(item.id);
                        }
                        setOpenerPickerModal(null);
                      }}
                    >
                      <View style={styles.playerAvatarBox}>
                        <Text style={styles.playerAvatarText}>
                          {item.name.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.openerPickerItemName}>{item.name}</Text>
                        <Text style={styles.openerPickerItemRole}>
                          {item.role || 'Player'}{' '}
                          {item.battingStyle ? `• ${item.battingStyle}` : ''}
                        </Text>
                      </View>
                      {isDisabled ? (
                        <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>Already chosen</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    backgroundColor: COLORS.brandRed,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBackBtn: {
    padding: 6,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitleText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  headerStepText: {
    color: '#FECACA',
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
    fontWeight: '600',
  },
  headerHelpBtn: {
    padding: 6,
  },
  stepperContainer: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: '#374151',
  },
  stepperSegment: {
    flex: 1,
    backgroundColor: '#374151',
    marginHorizontal: 1,
  },
  stepperSegmentActive: {
    backgroundColor: '#F59E0B',
  },
  stepperSegmentDone: {
    backgroundColor: COLORS.brandTeal,
  },
  stageWrapper: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#451A1A',
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
    gap: 8,
  },
  errorBannerText: {
    color: COLORS.errorText,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    flex: 1,
  },
  matchupBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },
  matchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchupTeam: {
    flex: 1,
    alignItems: 'center',
  },
  matchupAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchupAvatarText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  matchupTeamName: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
  },
  matchupBadge: {
    color: COLORS.brandTeal,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  matchupChangeLink: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  vsCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  vsText: {
    color: '#F59E0B',
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },
  cardHeaderTitle: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  cardHeaderSubtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: -8,
    marginBottom: 10,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldHeading: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pillActive: {
    backgroundColor: '#0F766E',
    borderColor: COLORS.brandTeal,
  },
  pillText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  pillTextActive: {
    color: COLORS.surfaceWhite,
    fontWeight: FONT_WEIGHT.bold,
  },
  oversHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  oversSubText: {
    color: COLORS.brandTeal,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  stepperLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepperVal: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    minWidth: 24,
    textAlign: 'center',
  },
  groundSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
    marginBottom: 12,
  },
  groundSelectIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#0F2F38',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groundSelectInfo: {
    flex: 1,
  },
  groundSelectName: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  groundSelectCity: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B1220',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextCtaBtn: {
    backgroundColor: COLORS.brandTeal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  nextCtaBtnText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2F38',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.brandTeal,
    gap: 10,
    marginBottom: 14,
  },
  infoBannerText: {
    color: COLORS.surfaceLight,
    fontSize: FONT_SIZE.xs,
    flex: 1,
    lineHeight: 18,
  },
  officialSlotLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#162344',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 12,
  },
  addSlotBtnText: {
    color: COLORS.brandTeal,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  officialPopulatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.brandTeal,
    gap: 12,
  },
  officialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  officialAvatarText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  officialInfo: {
    flex: 1,
  },
  officialName: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  officialContact: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  selfBadge: {
    backgroundColor: '#0F766E',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  selfBadgeText: {
    color: COLORS.surfaceWhite,
    fontSize: 9,
    fontWeight: '800',
  },
  teamTabsHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  teamTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  teamTabBtnActive: {
    borderBottomColor: COLORS.brandTeal,
    backgroundColor: '#13283E',
  },
  teamTabBtnText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    maxWidth: '70%',
  },
  teamTabBtnTextActive: {
    color: COLORS.surfaceWhite,
    fontWeight: FONT_WEIGHT.bold,
  },
  countBadge: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countBadgeText: {
    color: COLORS.brandTeal,
    fontSize: 10,
    fontWeight: '700',
  },
  squadAlertNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2F38',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  squadAlertText: {
    color: COLORS.surfaceLight,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    flex: 1,
  },
  squadToolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  squadSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  squadSearchInput: {
    flex: 1,
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.xs,
  },
  quickAddPlayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandTeal,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 6,
  },
  quickAddPlayerText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  selectAllRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  selectCountInfo: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
  },
  toggleAllText: {
    color: COLORS.brandTeal,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  squadListContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  playerSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  playerSelectCardActive: {
    borderColor: COLORS.brandTeal,
    backgroundColor: '#13283E',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.brandTeal,
    borderColor: COLORS.brandTeal,
  },
  playerNum: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    width: 18,
    textAlign: 'center',
  },
  playerAvatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerAvatarText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  playerCardInfo: {
    flex: 1,
  },
  playerCardName: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  playerCardRole: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  capWkNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2006',
    borderWidth: 1,
    borderColor: '#78350F',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  capWkNoticeText: {
    color: '#FDE68A',
    fontSize: FONT_SIZE.xs,
    flex: 1,
  },
  capWkPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  goldBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  goldBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  tealBadge: {
    backgroundColor: COLORS.brandTeal,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  tealBadgeText: {
    color: COLORS.surfaceWhite,
    fontSize: 10,
    fontWeight: '900',
  },
  capWkToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  capToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capToggleBtnActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  capToggleText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  capToggleTextActive: {
    color: '#000000',
  },
  wkToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wkToggleBtnActive: {
    backgroundColor: COLORS.brandTeal,
    borderColor: COLORS.brandTeal,
  },
  wkToggleText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  wkToggleTextActive: {
    color: COLORS.surfaceWhite,
  },
  tossHeaderBox: {
    marginBottom: 16,
  },
  tossSectionQuestion: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  tossSectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 4,
  },
  tossTeamsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  tossTeamCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 16,
    alignItems: 'center',
  },
  tossTeamCardSelected: {
    borderColor: COLORS.brandTeal,
    backgroundColor: '#13283E',
  },
  tossAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tossAvatarText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  tossTeamName: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    minHeight: 36,
  },
  tossCaptainText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 4,
    textAlign: 'center',
  },
  tossWinnerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 12,
    gap: 4,
  },
  tossWinnerPillText: {
    color: COLORS.surfaceWhite,
    fontSize: 10,
    fontWeight: '800',
  },
  tossTapSelectBox: {
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tossTapSelectText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
  },
  coinFlipContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  coinFlipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  coinFlipBtnText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  coinTossResultText: {
    color: '#F59E0B',
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  decisionContainer: {
    marginTop: 10,
  },
  decisionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  decisionBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 8,
  },
  decisionBtnActive: {
    borderColor: COLORS.brandTeal,
    backgroundColor: '#13283E',
  },
  decisionBtnTitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  decisionBtnTitleActive: {
    color: COLORS.surfaceWhite,
  },
  decisionBtnSub: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
  },
  tossOutcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2F38',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.brandTeal,
    gap: 12,
  },
  tossOutcomeText: {
    color: COLORS.surfaceLight,
    fontSize: FONT_SIZE.sm,
    flex: 1,
    lineHeight: 20,
  },
  matchupSummaryCard: {
    backgroundColor: '#162344',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  summaryTitle: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  summaryDetails: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 3,
  },
  summaryTossRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  summaryTossText: {
    color: COLORS.brandTeal,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    flex: 1,
  },
  openerLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 6,
  },
  openerSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
    marginBottom: 8,
  },
  openerInfo: {
    flex: 1,
  },
  openerName: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  openerStyle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  startScoringBtn: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  startScoringBtnText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  openerPickerContainer: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    padding: 16,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  openerPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  openerPickerTitle: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  openerPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    gap: 12,
  },
  openerPickerItemName: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  openerPickerItemRole: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
});
