import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
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
import { InvitePlayerModal } from '../components/InvitePlayerModal';
import { GroundPickerModal } from '../components/GroundPickerModal';
import { TeamItem } from '../components/TeamCard';
import { TeamPickerModal } from '../components/TeamPickerModal';
import { createMatch, getTeams } from '../src/api/matchApi';
import { COLORS } from '../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../src/theme/typography';

// Stages in the Start Match flow (guided by the 18 screenshots + Team Selection Entry)
export type MatchSetupStage =
  | 'TEAM_SELECT' // Step 1: Select Team 1 & Team 2 from actual CrickHero teams
  | 'SETTINGS' // Step 2 (Screens 1, 3): Match settings, overs, ground
  | 'OFFICIALS' // Step 3 (Screens 2, 4-11): Umpires, scorers, commentators
  | 'SQUADS' // Step 4 (Screens 11-post, 12, 13, 14): Playing XI selection
  | 'CAPTAIN_WK' // Step 5 (Screen 16): Choose Captain and Wicket Keeper
  | 'TOSS' // Step 6 (Screen 17): Who won toss, elected to bat/bowl
  | 'OPENERS'; // Step 7 (Screen 18): Select striker, non-striker & opening bowler

export interface SquadPlayer {
  id: string;
  name: string;
  jerseyNumber?: number;
  role: string;
  battingStyle?: string;
  bowlingStyle?: string;
}

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
  const routeParams = useLocalSearchParams<{
    createdTeamId?: string;
    targetTeam?: string;
    refresh?: string;
  }>();

  // Current stage in the flow: Starts strictly with TEAM_SELECT
  const [currentStage, setCurrentStage] = useState<MatchSetupStage>('TEAM_SELECT');

  // Loaded real teams from backend
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [teamsError, setTeamsError] = useState('');

  // Selected Teams: Start strictly null, populated only from real user selection
  const [team1, setTeam1] = useState<{ id?: string; name: string; captainName?: string; city?: string } | null>(null);
  const [team2, setTeam2] = useState<{ id?: string; name: string; captainName?: string; city?: string } | null>(null);

  // Match Settings state (Stage 2)
  const [selectedOvers, setSelectedOvers] = useState<number>(10);
  const [selectedBall, setSelectedBall] = useState<string>('Tennis');
  const [selectedPitch, setSelectedPitch] = useState<string>('Turf');
  const [selectedMatchType, setSelectedMatchType] = useState<string>('Limited Overs');
  const [selectedGround, setSelectedGround] = useState<string>('Gymkhana Cricket Ground, Secunderabad');
  const [cityLocation, setCityLocation] = useState<string>('Hyderabad (Telangana)');
  const [matchDateTime, setMatchDateTime] = useState<string>('Today, 04:00 PM');
  const [oversPerBowler, setOversPerBowler] = useState<number>(2);

  // Modal pickers
  const [teamPickerMode, setTeamPickerMode] = useState<'team1' | 'team2' | null>(null);
  const [groundPickerVisible, setGroundPickerVisible] = useState(false);

  // Officials State (Stage 3)
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
    scorer1: null,
    scorer2: null,
    commentator: null,
  });

  const [activeOfficialModalRole, setActiveOfficialModalRole] = useState<OfficialRole | null>(null);

  // Squad Selection State (Stage 4)
  const [team1Players, setTeam1Players] = useState<SquadPlayer[]>([]);
  const [team2Players, setTeam2Players] = useState<SquadPlayer[]>([]);
  const [team1SelectedPlayerIds, setTeam1SelectedPlayerIds] = useState<string[]>([]);
  const [team2SelectedPlayerIds, setTeam2SelectedPlayerIds] = useState<string[]>([]);
  const [activeSquadTab, setActiveSquadTab] = useState<'team1' | 'team2'>('team1');
  const [squadSearchQuery, setSquadSearchQuery] = useState('');
  const [addPlayerModalTeam, setAddPlayerModalTeam] = useState<'team1' | 'team2' | null>(null);

  // Captain & Wicket Keeper State (Stage 5)
  const [activeCapWkTab, setActiveCapWkTab] = useState<'team1' | 'team2'>('team1');
  const [team1CaptainId, setTeam1CaptainId] = useState<string>('');
  const [team1WkId, setTeam1WkId] = useState<string>('');
  const [team2CaptainId, setTeam2CaptainId] = useState<string>('');
  const [team2WkId, setTeam2WkId] = useState<string>('');

  // Toss State (Stage 6)
  const [tossWinnerTeam, setTossWinnerTeam] = useState<'team1' | 'team2' | null>(null);
  const [tossDecision, setTossDecision] = useState<'BAT' | 'BOWL'>('BAT');
  const [isFlippingCoin, setIsFlippingCoin] = useState(false);
  const [coinTossResult, setCoinTossResult] = useState<string>('');

  // Openers & Opening Bowler State (Stage 7)
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

  // Load backend teams - strictly real data, no synthetic fallback
  const fetchTeamsList = async (autoSelectId?: string, autoSelectTarget?: 'team1' | 'team2') => {
    try {
      setLoadingTeams(true);
      setTeamsError('');
      const data = await getTeams();
      if (Array.isArray(data)) {
        const formattedTeams: TeamItem[] = data.map((t: any) => ({
          id: String(t.id),
          name: t.name,
          captainName: t.captainName,
          city: t.city || 'Hyderabad (Telangana)',
          logoUrl: t.logoUrl,
          players: Array.isArray(t.players)
            ? t.players.map((p: any) => ({
                id: String(p.id),
                name: p.name,
                jerseyNumber: p.jerseyNumber,
                role: p.role,
                mobileNumber: p.mobileNumber,
              }))
            : [],
        }));
        setTeams(formattedTeams);

        // Auto-select newly created team if provided
        const targetId = autoSelectId || routeParams.createdTeamId;
        const targetSide = autoSelectTarget || (routeParams.targetTeam as 'team1' | 'team2') || (team1 ? 'team2' : 'team1');

        if (targetId) {
          const matched = formattedTeams.find((t) => t.id === targetId);
          if (matched) {
            const teamInfo = {
              id: matched.id,
              name: matched.name,
              captainName: matched.captainName,
              city: matched.city,
            };
            if (targetSide === 'team2') {
              setTeam2(teamInfo);
              updateTeamSquadFromTeamItem(teamInfo, 'team2', formattedTeams);
            } else {
              setTeam1(teamInfo);
              updateTeamSquadFromTeamItem(teamInfo, 'team1', formattedTeams);
            }
          }
        }
      } else {
        setTeams([]);
      }
    } catch (err: any) {
      const msg = err?.message || 'Could not load teams from server.';
      setTeamsError(msg);
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTeamsList(routeParams.createdTeamId, routeParams.targetTeam as 'team1' | 'team2');
    }, [routeParams.createdTeamId, routeParams.targetTeam, routeParams.refresh])
  );

  // Update real squad players when team1 or team2 is selected or changes
  const updateTeamSquadFromTeamItem = (
    selectedTeam: { id?: string; name: string } | null,
    target: 'team1' | 'team2',
    teamsList?: TeamItem[]
  ) => {
    if (!selectedTeam) {
      if (target === 'team1') {
        setTeam1Players([]);
        setTeam1SelectedPlayerIds([]);
        setTeam1CaptainId('');
        setTeam1WkId('');
      } else {
        setTeam2Players([]);
        setTeam2SelectedPlayerIds([]);
        setTeam2CaptainId('');
        setTeam2WkId('');
      }
      return;
    }

    // Find actual team object in loaded teams
    const sourceTeams = teamsList || teams;
    const fullTeam = sourceTeams.find((t) => t.id === selectedTeam.id || t.name === selectedTeam.name);
    const loadedPlayers: SquadPlayer[] = fullTeam?.players
      ? fullTeam.players.map((p) => ({
          id: String(p.id),
          name: p.name,
          jerseyNumber: p.jerseyNumber,
          role: p.role || 'Player',
          battingStyle: 'Right Hand Bat',
          bowlingStyle: 'Right-arm Medium',
        }))
      : [];

    if (target === 'team1') {
      setTeam1Players(loadedPlayers);
      setTeam1SelectedPlayerIds(loadedPlayers.map((p) => p.id));
      if (loadedPlayers.length > 0) {
        setTeam1CaptainId(loadedPlayers[0].id);
        setTeam1WkId(loadedPlayers[Math.min(1, loadedPlayers.length - 1)].id);
      } else {
        setTeam1CaptainId('');
        setTeam1WkId('');
      }
    } else {
      setTeam2Players(loadedPlayers);
      setTeam2SelectedPlayerIds(loadedPlayers.map((p) => p.id));
      if (loadedPlayers.length > 0) {
        setTeam2CaptainId(loadedPlayers[0].id);
        setTeam2WkId(loadedPlayers[Math.min(1, loadedPlayers.length - 1)].id);
      } else {
        setTeam2CaptainId('');
        setTeam2WkId('');
      }
    }
  };

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

  // Real Batting players available for openers
  const battingPlayers = useMemo(() => {
    const sourceList = battingTeam === 'team1' ? team1Players : team2Players;
    const selectedIds = battingTeam === 'team1' ? team1SelectedPlayerIds : team2SelectedPlayerIds;
    return sourceList.filter((p) => selectedIds.includes(p.id));
  }, [battingTeam, team1Players, team2Players, team1SelectedPlayerIds, team2SelectedPlayerIds]);

  // Real Bowling players available for opening bowler
  const bowlingPlayers = useMemo(() => {
    const sourceList = bowlingTeam === 'team1' ? team1Players : team2Players;
    const selectedIds = bowlingTeam === 'team1' ? team1SelectedPlayerIds : team2SelectedPlayerIds;
    return sourceList.filter((p) => selectedIds.includes(p.id));
  }, [bowlingTeam, team1Players, team2Players, team1SelectedPlayerIds, team2SelectedPlayerIds]);

  // Set default openers when reaching OPENERS stage
  useEffect(() => {
    if (currentStage === 'OPENERS') {
      if (battingPlayers.length >= 2) {
        if (!strikerId || !battingPlayers.some((p) => p.id === strikerId)) {
          setStrikerId(battingPlayers[0].id);
        }
        if (!nonStrikerId || !battingPlayers.some((p) => p.id === nonStrikerId)) {
          setNonStrikerId(battingPlayers[1].id);
        }
      } else if (battingPlayers.length === 1) {
        setStrikerId(battingPlayers[0].id);
        setNonStrikerId('');
      } else {
        setStrikerId('');
        setNonStrikerId('');
      }

      if (bowlingPlayers.length >= 1) {
        if (!openingBowlerId || !bowlingPlayers.some((p) => p.id === openingBowlerId)) {
          const bowler = bowlingPlayers.find((p) => p.role === 'Bowler') || bowlingPlayers[0];
          setOpeningBowlerId(bowler.id);
        }
      } else {
        setOpeningBowlerId('');
      }
    }
  }, [currentStage, battingPlayers, bowlingPlayers, strikerId, nonStrikerId, openingBowlerId]);

  // Navigation between stages
  const handleBack = useCallback(() => {
    setErrorMsg('');
    switch (currentStage) {
      case 'TEAM_SELECT':
        // Ensure returning to the intended Matches screen
        router.replace('/(tabs)');
        break;
      case 'SETTINGS':
        setCurrentStage('TEAM_SELECT');
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
  }, [currentStage, router]);

  // Android hardware Back handler: respects open modals, wizard stages, and clean exit to Matches
  useFocusEffect(
    useCallback(() => {
      const onHardwareBack = () => {
        // 1. Dismiss active pickers/modals first
        if (teamPickerMode) {
          setTeamPickerMode(null);
          return true;
        }
        if (groundPickerVisible) {
          setGroundPickerVisible(false);
          return true;
        }
        if (activeOfficialModalRole) {
          setActiveOfficialModalRole(null);
          return true;
        }
        if (addSquadPlayerTeam) {
          setAddSquadPlayerTeam(null);
          return true;
        }

        // 2. Step back through wizard stages, or exit to Matches at TEAM_SELECT
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onHardwareBack
      );

      return () => {
        subscription.remove();
      };
    }, [
      teamPickerMode,
      groundPickerVisible,
      activeOfficialModalRole,
      addSquadPlayerTeam,
      handleBack,
    ])
  );

  // Step 1: Team Selection validation -> Step 2: Settings
  const handleProceedFromTeamSelect = () => {
    setErrorMsg('');
    if (!team1 || !team1.name.trim()) {
      setErrorMsg('Please select Team 1 (Your Team)');
      Alert.alert('Selection Required', 'Please select Team 1 (Your Team) to proceed.');
      return;
    }
    if (!team2 || !team2.name.trim()) {
      setErrorMsg('Please select Team 2 (Opponent)');
      Alert.alert('Selection Required', 'Please select Team 2 (Opponent) to proceed.');
      return;
    }
    if (
      (team1.id && team2.id && team1.id === team2.id) ||
      team1.name.trim().toLowerCase() === team2.name.trim().toLowerCase()
    ) {
      setErrorMsg('Team 1 and Team 2 must be different teams');
      Alert.alert('Invalid Selection', 'Team 1 and Team 2 must be different teams.');
      return;
    }
    setCurrentStage('SETTINGS');
  };

  // Step 2: Settings validation -> Step 3: Officials
  const handleProceedFromSettings = () => {
    setErrorMsg('');
    setCurrentStage('OFFICIALS');
  };

  // Step 3: Officials -> Step 4: Squads
  const handleProceedFromOfficials = () => {
    setCurrentStage('SQUADS');
  };

  // Step 4: Squads validation -> Step 5: Captain & WK
  const handleProceedFromSquads = () => {
    if (team1SelectedPlayerIds.length < 2) {
      Alert.alert(
        'Incomplete Squad',
        `Please select at least 2 players for ${team1?.name}. You can tap "+ Add Player" to add new players directly.`
      );
      return;
    }
    if (team2SelectedPlayerIds.length < 2) {
      Alert.alert(
        'Incomplete Squad',
        `Please select at least 2 players for ${team2?.name}. You can tap "+ Add Player" to add new players directly.`
      );
      return;
    }

    // Ensure Captain and WK are in the selected playing squad
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

  // Step 5: Captain & WK validation -> Step 6: Toss
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

  // Step 6: Toss validation -> Step 7: Openers
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
      setErrorMsg('');

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
      const msg = err?.message || 'Failed to start match on the server. Please check your network and try again.';
      setErrorMsg(msg);
      Alert.alert('Match Creation Failed', msg);
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

  // Stage Title & Stepper Header
  const getStageTitle = () => {
    switch (currentStage) {
      case 'TEAM_SELECT':
        return 'Select Teams';
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
      case 'TEAM_SELECT':
        return 1;
      case 'SETTINGS':
        return 2;
      case 'OFFICIALS':
        return 3;
      case 'SQUADS':
        return 4;
      case 'CAPTAIN_WK':
        return 5;
      case 'TOSS':
        return 6;
      case 'OPENERS':
        return 7;
    }
  };

  const totalSteps = 7;

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
          <Text style={styles.headerStepText}>
            Step {getStageStepNumber()} of {totalSteps}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerHelpBtn}
          onPress={() =>
            Alert.alert(
              'CrickHero Match Setup',
              'Select existing teams, configure overs and conditions, verify officials, pick squads, captain & toss to begin scoring.'
            )
          }
        >
          <Icon source="help-circle-outline" size={22} color={COLORS.surfaceWhite} />
        </TouchableOpacity>
      </View>

      {/* Stepper Progress Bar */}
      <View style={styles.stepperContainer}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
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
      {/* STEP 1: SELECT EXISTING TEAMS (Mandatory Entry Before Settings)           */}
      {/* ========================================================================= */}
      {currentStage === 'TEAM_SELECT' ? (
        <View style={styles.stageWrapper}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 80 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.infoBanner}>
              <Icon source="shield-account" size={22} color={COLORS.brandTeal} />
              <Text style={styles.infoBannerText}>
                Select two existing teams created in CrickHero to begin match setup.
              </Text>
            </View>

            {loadingTeams ? (
              <View style={styles.centerLoadingBox}>
                <ActivityIndicator size="large" color={COLORS.brandTeal} />
                <Text style={styles.centerLoadingText}>Loading your teams...</Text>
              </View>
            ) : teamsError ? (
              <View style={styles.emptyContainer}>
                <Icon source="alert-circle-outline" size={48} color="#F87171" />
                <Text style={styles.emptyTitle}>Could not load teams</Text>
                <Text style={styles.emptySubtitle}>{teamsError}</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => fetchTeamsList()}>
                  <Text style={styles.emptyBtnText}>Retry Loading Teams</Text>
                </TouchableOpacity>
              </View>
            ) : teams.length === 0 ? (
              /* Proper Empty State: No fabricated teams */
              <View style={styles.emptyContainer}>
                <Icon source="account-group-outline" size={54} color={COLORS.textDarkSecondary} />
                <Text style={styles.emptyTitle}>No Teams Available</Text>
                <Text style={styles.emptySubtitle}>
                  You need at least one team created in CrickHero to start a match. Please create your team first.
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/teams',
                      params: { source: 'start_match', targetTeam: 'team1' },
                    })
                  }
                >
                  <Icon source="plus" size={18} color={COLORS.surfaceWhite} />
                  <Text style={styles.emptyBtnText}>Create Team</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {/* Team 1 / My Team Card */}
                <View style={styles.formCard}>
                  <View style={styles.sectionHeaderBetween}>
                    <Text style={styles.cardHeaderTitle}>TEAM 1 (MY TEAM / HOST)</Text>
                    <View style={[styles.teamBadgePill, { backgroundColor: COLORS.brandTeal }]}>
                      <Text style={styles.teamBadgePillText}>TEAM A</Text>
                    </View>
                  </View>

                  {team1 ? (
                    <View style={styles.selectedTeamBox}>
                      <View style={[styles.matchupAvatar, { backgroundColor: COLORS.brandTeal }]}>
                        <Text style={styles.matchupAvatarText}>
                          {team1.name.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectedTeamName}>{team1.name}</Text>
                        <Text style={styles.selectedTeamSub}>
                          Captain: {team1.captainName || 'Not specified'} • {team1.city || 'City'}
                        </Text>
                        <Text style={styles.selectedTeamPlayerCount}>
                          {team1Players.length} players registered in squad
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.changeTeamBtn}
                        onPress={() => setTeamPickerMode('team1')}
                      >
                        <Text style={styles.changeTeamBtnText}>Change</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.selectTeamPlaceholder}
                      onPress={() => setTeamPickerMode('team1')}
                    >
                      <Icon source="plus-circle-outline" size={24} color={COLORS.brandTeal} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.placeholderTitle}>Select Team 1</Text>
                        <Text style={styles.placeholderSub}>Tap to pick from existing teams</Text>
                      </View>
                      <Icon source="chevron-right" size={22} color={COLORS.placeholder} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Team 2 / Opponent Card */}
                <View style={styles.formCard}>
                  <View style={styles.sectionHeaderBetween}>
                    <Text style={styles.cardHeaderTitle}>TEAM 2 (OPPONENT)</Text>
                    <View style={[styles.teamBadgePill, { backgroundColor: '#0284C7' }]}>
                      <Text style={styles.teamBadgePillText}>TEAM B</Text>
                    </View>
                  </View>

                  {team2 ? (
                    <View style={styles.selectedTeamBox}>
                      <View style={[styles.matchupAvatar, { backgroundColor: '#0284C7' }]}>
                        <Text style={styles.matchupAvatarText}>
                          {team2.name.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectedTeamName}>{team2.name}</Text>
                        <Text style={styles.selectedTeamSub}>
                          Captain: {team2.captainName || 'Not specified'} • {team2.city || 'City'}
                        </Text>
                        <Text style={styles.selectedTeamPlayerCount}>
                          {team2Players.length} players registered in squad
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.changeTeamBtn}
                        onPress={() => setTeamPickerMode('team2')}
                      >
                        <Text style={styles.changeTeamBtnText}>Change</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.selectTeamPlaceholder}
                      onPress={() => setTeamPickerMode('team2')}
                    >
                      <Icon source="plus-circle-outline" size={24} color={COLORS.brandTeal} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.placeholderTitle}>Select Team 2</Text>
                        <Text style={styles.placeholderSub}>Tap to pick opponent or enter custom team</Text>
                      </View>
                      <Icon source="chevron-right" size={22} color={COLORS.placeholder} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Matchup Preview Banner */}
                {team1 && team2 ? (
                  <View style={styles.matchupBox}>
                    <View style={styles.matchupRow}>
                      <View style={styles.matchupTeam}>
                        <View style={[styles.matchupAvatar, { backgroundColor: COLORS.brandTeal }]}>
                          <Text style={styles.matchupAvatarText}>
                            {team1.name.substring(0, 2).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.matchupTeamName} numberOfLines={1}>
                          {team1.name}
                        </Text>
                        <Text style={styles.matchupBadge}>HOST</Text>
                      </View>

                      <View style={styles.vsCircle}>
                        <Text style={styles.vsText}>VS</Text>
                      </View>

                      <View style={styles.matchupTeam}>
                        <View style={[styles.matchupAvatar, { backgroundColor: '#0284C7' }]}>
                          <Text style={styles.matchupAvatarText}>
                            {team2.name.substring(0, 2).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.matchupTeamName} numberOfLines={1}>
                          {team2.name}
                        </Text>
                        <Text style={styles.matchupBadge}>OPPONENT</Text>
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            )}
          </ScrollView>

          {/* Sticky Bottom Next Button */}
          {teams.length > 0 ? (
            <View style={[styles.bottomBar, { paddingBottom: Math.max(bottomInset, 14) }]}>
              <TouchableOpacity
                style={[styles.nextCtaBtn, (!team1 || !team2) && styles.btnDisabled]}
                onPress={handleProceedFromTeamSelect}
                disabled={!team1 || !team2}
              >
                <Text style={styles.nextCtaBtnText}>Next: Match Settings</Text>
                <Icon source="arrow-right" size={20} color={COLORS.surfaceWhite} />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* ========================================================================= */}
      {/* STEP 2: MATCH SETTINGS & OVERS (Screenshots 1 & 3)                        */}
      {/* ========================================================================= */}
      {currentStage === 'SETTINGS' ? (
        <View style={styles.stageWrapper}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 80 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Matchup Teams Banner with Real Selected Teams */}
            <View style={styles.matchupBox}>
              <View style={styles.matchupRow}>
                {/* Team 1 */}
                <TouchableOpacity
                  style={styles.matchupTeam}
                  onPress={() => setTeamPickerMode('team1')}
                >
                  <View style={[styles.matchupAvatar, { backgroundColor: COLORS.brandTeal }]}>
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
                  <View style={[styles.matchupAvatar, { backgroundColor: '#0284C7' }]}>
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
      {/* STEP 3: MATCH OFFICIALS (Screenshots 2, 4-11)                             */}
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
                      +91 {officials.umpire1.phone} • {officials.umpire1.city || 'City'}
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
                      +91 {officials.umpire2.phone} • {officials.umpire2.city || 'City'}
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
                      +91 {officials.thirdUmpire.phone} • {officials.thirdUmpire.city || 'City'}
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
      {/* STEP 4: SQUAD SELECTION / PLAYING XI (Screenshots 11-post, 12, 13, 14)    */}
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

            {(activeSquadTab === 'team1' ? team1Players.length : team2Players.length) > 0 ? (
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
            ) : null}
          </View>

          {/* Players List with Checkboxes (Screenshots 12 & 13) */}
          <FlatList
            data={(activeSquadTab === 'team1' ? team1Players : team2Players).filter((p) =>
              p.name.toLowerCase().includes(squadSearchQuery.toLowerCase())
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.squadListContent, { paddingBottom: bottomInset + 80 }]}
            ListEmptyComponent={
              <View style={styles.emptySquadContainer}>
                <Icon source="account-off-outline" size={42} color={COLORS.textDarkSecondary} />
                <Text style={styles.emptySquadTitle}>No players in squad yet</Text>
                <Text style={styles.emptySquadSub}>
                  {activeSquadTab === 'team1' ? team1?.name : team2?.name} has no players registered.
                  Tap &ldquo;+ Add Player&rdquo; above to add players to this squad.
                </Text>
                <TouchableOpacity
                  style={styles.emptySquadAddBtn}
                  onPress={() => setAddPlayerModalTeam(activeSquadTab)}
                >
                  <Icon source="account-plus" size={18} color={COLORS.surfaceWhite} />
                  <Text style={styles.emptySquadAddBtnText}>Add First Player</Text>
                </TouchableOpacity>
              </View>
            }
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
      {/* STEP 5: CHOOSE CAPTAIN & WICKET KEEPER (Screenshot 16)                   */}
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
      {/* STEP 6: THE TOSS (Screenshot 17)                                         */}
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
                <View style={[styles.tossAvatar, { backgroundColor: COLORS.brandTeal }]}>
                  <Text style={styles.tossAvatarText}>
                    {team1?.name.substring(0, 2).toUpperCase() || 'T1'}
                  </Text>
                </View>
                <Text style={styles.tossTeamName} numberOfLines={2}>
                  {team1?.name}
                </Text>
                <Text style={styles.tossCaptainText}>
                  Cap: {team1Players.find((p) => p.id === team1CaptainId)?.name || team1?.captainName || 'Captain'}
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
                <View style={[styles.tossAvatar, { backgroundColor: '#0284C7' }]}>
                  <Text style={styles.tossAvatarText}>
                    {team2?.name.substring(0, 2).toUpperCase() || 'T2'}
                  </Text>
                </View>
                <Text style={styles.tossTeamName} numberOfLines={2}>
                  {team2?.name}
                </Text>
                <Text style={styles.tossCaptainText}>
                  Cap: {team2Players.find((p) => p.id === team2CaptainId)?.name || team2?.captainName || 'Captain'}
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
      {/* STEP 7: SELECT OPENERS & OPENING BOWLER (Screenshot 18)                  */}
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
                <View style={[styles.playerAvatarBox, { backgroundColor: COLORS.brandTeal }]}>
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
                <View style={[styles.playerAvatarBox, { backgroundColor: '#0284C7' }]}>
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
                <View style={[styles.playerAvatarBox, { backgroundColor: '#334155' }]}>
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
              updateTeamSquadFromTeamItem(selected, 'team1');
            } else {
              setTeam2(selected);
              updateTeamSquadFromTeamItem(selected, 'team2');
            }
          }}
          onClose={() => setTeamPickerMode(null)}
          onCreateNewTeam={() => {
            const currentMode = teamPickerMode;
            setTeamPickerMode(null);
            router.push({
              pathname: '/(tabs)/teams',
              params: {
                source: 'start_match',
                targetTeam: currentMode || (team1 ? 'team2' : 'team1'),
              },
            });
          }}
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

      {/* 4. Unified Add Roster / Invite Player Modal (Reused from Create Team / Team Management) */}
      {addPlayerModalTeam ? (
        <InvitePlayerModal
          visible={Boolean(addPlayerModalTeam)}
          teamId={addPlayerModalTeam === 'team1' ? team1?.id || '' : team2?.id || ''}
          teamName={addPlayerModalTeam === 'team1' ? team1?.name || 'Team 1' : team2?.name || 'Team 2'}
          captainName={addPlayerModalTeam === 'team1' ? team1?.captainName : team2?.captainName}
          city={addPlayerModalTeam === 'team1' ? team1?.city : team2?.city}
          onClose={() => setAddPlayerModalTeam(null)}
          onPlayerAdded={(savedPlayer) => {
            const formattedPlayer: SquadPlayer = {
              id: String(savedPlayer.id),
              name: savedPlayer.name,
              jerseyNumber: savedPlayer.jerseyNumber,
              role: savedPlayer.role || 'All-Rounder',
              battingStyle: savedPlayer.battingStyle || 'Right Hand Bat',
              bowlingStyle: savedPlayer.bowlingStyle || 'Right-arm Medium',
            };

            if (addPlayerModalTeam === 'team1') {
              setTeam1Players((prev) => {
                if (prev.some((p) => p.id === formattedPlayer.id)) return prev;
                return [...prev, formattedPlayer];
              });
              // Do NOT automatically select the player for Playing XI.
              // Preserves all existing Playing XI selections for both teams.
            } else {
              setTeam2Players((prev) => {
                if (prev.some((p) => p.id === formattedPlayer.id)) return prev;
                return [...prev, formattedPlayer];
              });
              // Do NOT automatically select the player for Playing XI.
              // Preserves all existing Playing XI selections for both teams.
            }

            // Also update the team's cached roster in the loaded teams list
            const currentTargetTeamId = addPlayerModalTeam === 'team1' ? team1?.id : team2?.id;
            if (currentTargetTeamId) {
              setTeams((prevTeams) =>
                prevTeams.map((t) => {
                  if (t.id === currentTargetTeamId) {
                    if (t.players.some((p) => p.id === formattedPlayer.id)) return t;
                    return {
                      ...t,
                      players: [
                        ...t.players,
                        {
                          id: formattedPlayer.id,
                          name: formattedPlayer.name,
                          jerseyNumber: formattedPlayer.jerseyNumber,
                          role: formattedPlayer.role,
                        },
                      ],
                    };
                  }
                  return t;
                })
              );
            }

            setAddPlayerModalTeam(null);
          }}
        />
      ) : null}

      {/* 5. Opener Picker Modal (for Stage 7) */}
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
                ListEmptyComponent={
                  <View style={{ padding: 24, alignItems: 'center' }}>
                    <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm }}>
                      No eligible players found in Playing XI.
                    </Text>
                  </View>
                }
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
    backgroundColor: COLORS.brandTeal,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBackBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitleText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  headerStepText: {
    color: '#CCFBF1',
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
    backgroundColor: '#5EEAD4',
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2F38',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#134E4A',
    marginBottom: 14,
    gap: 10,
  },
  infoBannerText: {
    color: '#99F6E4',
    fontSize: FONT_SIZE.xs,
    flex: 1,
    lineHeight: 18,
  },
  centerLoadingBox: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLoadingText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 12,
  },
  emptyTitle: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 14,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandTeal,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  emptyBtnText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  teamBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  teamBadgePillText: {
    color: COLORS.surfaceWhite,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  selectTeamPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    gap: 12,
  },
  placeholderTitle: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  placeholderSub: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  selectedTeamBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  selectedTeamName: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  selectedTeamSub: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  selectedTeamPlayerCount: {
    color: COLORS.brandTeal,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  changeTeamBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeTeamBtnText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
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
    color: '#5EEAD4',
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
    backgroundColor: '#007F78',
    borderColor: '#5EEAD4',
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
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    color: COLORS.surfaceWhite,
    paddingVertical: 12,
    fontSize: FONT_SIZE.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  nextCtaBtn: {
    backgroundColor: COLORS.brandTeal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  nextCtaBtnText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.5,
  },
  officialSlotLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  officialPopulatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  officialAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selfBadgeText: {
    color: COLORS.surfaceWhite,
    fontSize: 9,
    fontWeight: '800',
  },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 8,
  },
  addSlotBtnText: {
    color: COLORS.brandTeal,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
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
    paddingHorizontal: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    gap: 8,
  },
  teamTabBtnActive: {
    borderBottomColor: COLORS.brandTeal,
    backgroundColor: '#111C34',
  },
  teamTabBtnText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  teamTabBtnTextActive: {
    color: COLORS.surfaceWhite,
    fontWeight: FONT_WEIGHT.bold,
  },
  countBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    color: '#5EEAD4',
    fontSize: 11,
    fontWeight: '700',
  },
  squadAlertNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2F38',
    padding: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#134E4A',
  },
  squadAlertText: {
    color: '#99F6E4',
    fontSize: FONT_SIZE.xs,
    flex: 1,
    fontWeight: '500',
  },
  squadToolsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  squadSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  squadSearchInput: {
    flex: 1,
    color: COLORS.surfaceWhite,
    paddingVertical: 8,
    fontSize: FONT_SIZE.sm,
  },
  quickAddPlayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandTeal,
    borderRadius: 10,
    paddingHorizontal: 12,
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
    paddingVertical: 6,
    marginBottom: 4,
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
  emptySquadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 12,
  },
  emptySquadTitle: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 10,
  },
  emptySquadSub: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  emptySquadAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandTeal,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  emptySquadAddBtnText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
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
    borderColor: '#5EEAD4',
    backgroundColor: '#111C34',
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
    color: COLORS.surfaceWhite,
    fontSize: 9,
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
    fontSize: 9,
    fontWeight: '900',
  },
  capWkToggleGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  capToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
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
    color: COLORS.surfaceWhite,
  },
  wkToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
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
    alignItems: 'center',
    paddingVertical: 16,
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
    textAlign: 'center',
  },
  tossTeamsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
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
    borderColor: '#5EEAD4',
    backgroundColor: '#111C34',
  },
  tossAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  tossWinnerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandTeal,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10,
    gap: 4,
  },
  tossWinnerPillText: {
    color: COLORS.surfaceWhite,
    fontSize: 10,
    fontWeight: '800',
  },
  tossTapSelectBox: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10,
  },
  tossTapSelectText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  coinFlipContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
  coinFlipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  coinFlipBtnText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  coinTossResultText: {
    color: '#F59E0B',
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  decisionContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  decisionButtonsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 14,
    width: '100%',
  },
  decisionBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  decisionBtnActive: {
    borderColor: '#5EEAD4',
    backgroundColor: '#111C34',
  },
  decisionBtnTitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
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
    backgroundColor: '#111C34',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
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
    backgroundColor: COLORS.brandTeal,
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
