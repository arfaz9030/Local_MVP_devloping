import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { TeamPickerModal } from '../components/TeamPickerModal';
import { TeamItem } from '../components/TeamCard';
import { createMatch, getTeams } from '../src/api/matchApi';
import { COLORS } from '../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../src/theme/typography';

const OVERS_OPTIONS = [5, 8, 10, 12, 15, 20];
const BALL_TYPES = ['Tennis', 'Leather', 'Rubber'];
const MATCH_TYPES = ['Limited Overs', 'Box Cricket', 'Test Match'];

export default function CreateMatchScreen() {
  const router = useRouter();

  // Loaded teams for picking
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  // Selected Teams
  const [team1, setTeam1] = useState<{ id?: string; name: string; captainName?: string; city?: string; playerCount?: number } | null>(null);
  const [team2, setTeam2] = useState<{ id?: string; name: string; captainName?: string; city?: string; playerCount?: number } | null>(null);

  // Match settings
  const [selectedOvers, setSelectedOvers] = useState<number>(10);
  const [selectedBall, setSelectedBall] = useState<string>('Tennis');
  const [selectedMatchType, setSelectedMatchType] = useState<string>('Limited Overs');

  // Picker modals
  const [pickerMode, setPickerMode] = useState<'team1' | 'team2' | null>(null);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Load existing teams
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
        } else {
          setTeams([
            {
              id: '1',
              name: 'Hyderabad Nizampet Boys',
              captainName: 'MohammadArfaz Shaik',
              city: 'Hyderabad (Telangana)',
              players: [
                { id: 'p1', name: 'MohammadArfaz Shaik', jerseyNumber: 7, role: 'All-Rounder' },
                { id: 'p2', name: 'Rahul Sharma', jerseyNumber: 18, role: 'Batsman' },
              ],
            },
            {
              id: '2',
              name: 'Hyderabad Tolichowki Boys',
              captainName: 'Ahmed Khan',
              city: 'Hyderabad (Telangana)',
              players: [
                { id: 'p3', name: 'Ahmed Khan', jerseyNumber: 10, role: 'Bowler' },
              ],
            },
            {
              id: '3',
              name: 'Secunderabad Strikers',
              captainName: 'Karan Patel',
              city: 'Secunderabad',
              players: [],
            },
          ]);
        }
      } catch (err) {
        // Fallback default demo teams
        setTeams([
          {
            id: '1',
            name: 'Hyderabad Nizampet Boys',
            captainName: 'MohammadArfaz Shaik',
            city: 'Hyderabad (Telangana)',
            players: [
              { id: 'p1', name: 'MohammadArfaz Shaik', jerseyNumber: 7, role: 'All-Rounder' },
              { id: 'p2', name: 'Rahul Sharma', jerseyNumber: 18, role: 'Batsman' },
            ],
          },
          {
            id: '2',
            name: 'Hyderabad Tolichowki Boys',
            captainName: 'Ahmed Khan',
            city: 'Hyderabad (Telangana)',
            players: [
              { id: 'p3', name: 'Ahmed Khan', jerseyNumber: 10, role: 'Bowler' },
            ],
          },
          {
            id: '3',
            name: 'Secunderabad Strikers',
            captainName: 'Karan Patel',
            city: 'Secunderabad',
            players: [],
          },
        ]);
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeamsList();
  }, []);

  const validateForm = () => {
    setValidationError('');

    if (!team1 || !team1.name.trim()) {
      setValidationError('Please select Team 1 (Your Team)');
      Alert.alert('Validation Error', 'Please select Team 1');
      return false;
    }

    if (!team2 || !team2.name.trim()) {
      setValidationError('Please select Team 2 (Opponent Team)');
      Alert.alert('Validation Error', 'Please select Team 2');
      return false;
    }

    if (team1.name.trim().toLowerCase() === team2.name.trim().toLowerCase()) {
      setValidationError('Team 1 and Team 2 must be different teams');
      Alert.alert('Validation Error', 'Team 1 and Team 2 must be different teams');
      return false;
    }

    return true;
  };

  const handleSaveMatch = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await createMatch({
        team1Name: team1!.name.trim(),
        team2Name: team2!.name.trim(),
      });
      router.back();
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Failed to create match.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Start a Match</Text>
          <Text style={styles.subtitle}>Select participating teams & configure match parameters</Text>
        </View>

        {validationError ? (
          <View style={styles.errorBanner}>
            <Icon source="alert-circle-outline" size={18} color="#F87171" />
            <Text style={styles.errorBannerText}>{validationError}</Text>
          </View>
        ) : null}

        {/* Teams Matchup Container */}
        <View style={styles.matchupCard}>
          <Text style={styles.sectionTitle}>PARTICIPATING TEAMS</Text>

          {/* Team 1 (Team A) Card / Selector */}
          <View style={styles.teamSlot}>
            <View style={styles.teamSlotHeader}>
              <Text style={styles.teamSlotLabel}>TEAM 1 (HOST / YOUR TEAM)</Text>
              {team1 ? (
                <TouchableOpacity
                  onPress={() => setPickerMode('team1')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.changeText}>Change</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {team1 ? (
              <View style={styles.selectedTeamBox}>
                <View style={[styles.teamAvatar, { backgroundColor: '#16A34A' }]}>
                  <Text style={styles.teamAvatarText}>
                    {team1.name.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.teamInfo}>
                  <Text style={styles.selectedTeamName} numberOfLines={1}>
                    {team1.name}
                  </Text>
                  <Text style={styles.selectedTeamMeta} numberOfLines={1}>
                    Captain: {team1.captainName || 'Not specified'} • {team1.playerCount ?? 11} players
                  </Text>
                </View>
                <Icon source="check-circle" size={22} color="#22C55E" />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setPickerMode('team1')}
                activeOpacity={0.7}
              >
                <Icon source="plus-circle-outline" size={20} color={COLORS.brandTeal} />
                <Text style={styles.selectButtonText}>Select Team 1</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* VS Badge */}
          <View style={styles.vsRow}>
            <View style={styles.vsLine} />
            <View style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={styles.vsLine} />
          </View>

          {/* Team 2 (Team B) Card / Selector */}
          <View style={styles.teamSlot}>
            <View style={styles.teamSlotHeader}>
              <Text style={styles.teamSlotLabel}>TEAM 2 (OPPONENT)</Text>
              {team2 ? (
                <TouchableOpacity
                  onPress={() => setPickerMode('team2')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.changeText}>Change</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {team2 ? (
              <View style={styles.selectedTeamBox}>
                <View style={[styles.teamAvatar, { backgroundColor: '#DC2626' }]}>
                  <Text style={styles.teamAvatarText}>
                    {team2.name.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.teamInfo}>
                  <Text style={styles.selectedTeamName} numberOfLines={1}>
                    {team2.name}
                  </Text>
                  <Text style={styles.selectedTeamMeta} numberOfLines={1}>
                    Captain: {team2.captainName || 'Not specified'} • {team2.playerCount ?? 11} players
                  </Text>
                </View>
                <Icon source="check-circle" size={22} color="#22C55E" />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setPickerMode('team2')}
                activeOpacity={0.7}
              >
                <Icon source="plus-circle-outline" size={20} color={COLORS.brandTeal} />
                <Text style={styles.selectButtonText}>Select Team 2</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Match Settings Configuration */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>MATCH SETTINGS</Text>

          {/* Overs Selector */}
          <Text style={styles.settingLabel}>Number of Overs</Text>
          <View style={styles.chipsRow}>
            {OVERS_OPTIONS.map((overs) => {
              const isSelected = selectedOvers === overs;
              return (
                <TouchableOpacity
                  key={overs}
                  style={[styles.chip, isSelected ? styles.chipActive : null]}
                  onPress={() => setSelectedOvers(overs)}
                >
                  <Text style={[styles.chipText, isSelected ? styles.chipTextActive : null]}>
                    {overs} Overs
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Ball Type */}
          <Text style={styles.settingLabel}>Ball Type</Text>
          <View style={styles.chipsRow}>
            {BALL_TYPES.map((ball) => {
              const isSelected = selectedBall === ball;
              return (
                <TouchableOpacity
                  key={ball}
                  style={[styles.chip, isSelected ? styles.chipActive : null]}
                  onPress={() => setSelectedBall(ball)}
                >
                  <Text style={[styles.chipText, isSelected ? styles.chipTextActive : null]}>
                    {ball}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Match Type */}
          <Text style={styles.settingLabel}>Match Type</Text>
          <View style={styles.chipsRow}>
            {MATCH_TYPES.map((type) => {
              const isSelected = selectedMatchType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.chip, isSelected ? styles.chipActive : null]}
                  onPress={() => setSelectedMatchType(type)}
                >
                  <Text style={[styles.chipText, isSelected ? styles.chipTextActive : null]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Action Buttons */}
        <Pressable
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleSaveMatch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Start Match</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
      </ScrollView>

      {/* Team Picker Modal */}
      {pickerMode ? (
        <TeamPickerModal
          visible={Boolean(pickerMode)}
          title={pickerMode === 'team1' ? 'Select Team 1 (Your Team)' : 'Select Team 2 (Opponent)'}
          teams={teams}
          selectedTeamId={pickerMode === 'team1' ? team1?.id : team2?.id}
          disabledTeamId={pickerMode === 'team1' ? team2?.id : team1?.id}
          onSelectTeam={(selected) => {
            if (pickerMode === 'team1') {
              setTeam1(selected);
            } else {
              setTeam2(selected);
            }
            setValidationError('');
          }}
          onClose={() => setPickerMode(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    marginTop: 10,
    marginBottom: 18,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#451A1A',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorBannerText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  matchupCard: {
    backgroundColor: '#111C34',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  teamSlot: {
    marginBottom: 6,
  },
  teamSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamSlotLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  changeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  selectedTeamBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162344',
    borderWidth: 1,
    borderColor: '#2A3C66',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  teamAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  teamInfo: {
    flex: 1,
  },
  selectedTeamName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  selectedTeamMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#162344',
    borderWidth: 1.5,
    borderColor: '#2A3C66',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  selectButtonText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10,
  },
  vsLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  vsBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '900',
  },
  settingsCard: {
    backgroundColor: '#111C34',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  settingLabel: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#0D9488',
    borderColor: '#14B8A6',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '700',
  },
});
