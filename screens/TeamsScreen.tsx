import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { InvitePlayerModal } from '../components/InvitePlayerModal';
import { TeamCard, TeamItem } from '../components/TeamCard';
import { createTeam, CreateTeamPayload, getTeams } from '../src/api/matchApi';
import { COLORS } from '../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../src/theme/typography';

type TabType = 'your_teams' | 'opponents' | 'add';

export const TeamsScreen: React.FC = () => {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<TabType>('your_teams');
  const [searchQuery, setSearchQuery] = useState('');

  // Teams Data State
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Team Form State
  const [teamName, setTeamName] = useState('');
  const [city, setCity] = useState('Hyderabad (Telangana)');
  const [captainNumber, setCaptainNumber] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [allowCaptainAddPlayers, setAllowCaptainAddPlayers] = useState(true);
  const [addSelf, setAddSelf] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Invite Player Modal State
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedTeamForInvite, setSelectedTeamForInvite] = useState<TeamItem | null>(null);

  // Load teams on mount
  const loadTeams = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getTeams();
      setTeams(
        data.map((team: any) => ({
          id: String(team.id),
          name: team.name,
          captainName: team.captainName,
          city: team.city || 'Hyderabad (Telangana)',
          logoUrl: team.logoUrl,
          players: (team.players || []).map((p: any) => ({
            id: String(p.id),
            name: p.name,
            jerseyNumber: p.jerseyNumber,
            role: p.role,
            mobileNumber: p.mobileNumber,
          })),
        }))
      );
    } catch (e: any) {
      setError('Could not load teams from server.');
      // If server is not responding, keep local initial demo data if empty
      if (teams.length === 0) {
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
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  // Handle Team Creation
  const handleAddTeam = async () => {
    const trimmedTeamName = teamName.trim();
    const trimmedCaptainName = captainName.trim();
    const trimmedCity = city.trim();

    if (!trimmedTeamName) {
      setFormError('Please enter team name');
      return;
    }

    if (!trimmedCaptainName) {
      setFormError('Please enter team captain name');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const payload: CreateTeamPayload = {
        name: trimmedTeamName,
        captainName: trimmedCaptainName,
        city: trimmedCity || 'Hyderabad (Telangana)',
        captainNumber: captainNumber.trim() || undefined,
        allowCaptainAddPlayers,
        addSelf,
      };

      let newTeam: TeamItem;

      try {
        const response = await createTeam(payload);
        newTeam = {
          id: String(response.id),
          name: response.name,
          captainName: response.captainName,
          city: trimmedCity || 'Hyderabad (Telangana)',
          players: response.players
            ? response.players.map((p) => ({
              id: String(p.id),
              name: p.name,
              jerseyNumber: p.jerseyNumber,
              role: p.role,
            }))
            : [],
        };
      } catch (apiErr) {
        // Safe fallback for local state updates
        newTeam = {
          id: String(Date.now()),
          name: trimmedTeamName,
          captainName: trimmedCaptainName,
          city: trimmedCity || 'Hyderabad (Telangana)',
          captainNumber: captainNumber.trim() || undefined,
          players: addSelf
            ? [{ id: 'p_self', name: trimmedCaptainName, jerseyNumber: 1, role: 'Captain' }]
            : [],
        };
      }

      setTeams((prev) => [newTeam, ...prev]);

      // Reset form
      setTeamName('');
      setCaptainNumber('');
      setCaptainName('');
      setAddSelf(false);

      // Switch to your teams tab
      setActiveTab('your_teams');
      Alert.alert('Team Created', `${trimmedTeamName} has been added successfully!`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create team.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open invite modal
  const handleOpenInvite = (team: TeamItem) => {
    setSelectedTeamForInvite(team);
    setInviteModalVisible(true);
  };

  // Callback when a player is added
  const handlePlayerAdded = (newPlayer: any) => {
    console.log('PLAYER RECEIVED BY TEAM SCREEN:', newPlayer);
    if (!selectedTeamForInvite) return;

    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === selectedTeamForInvite.id) {
          return {
            ...team,
            players: [...team.players, newPlayer],
          };
        }
        return team;
      })
    );

    Alert.alert('Player Added', `${newPlayer.name} has been added to ${selectedTeamForInvite.name}`);
  };

  // Filtered teams for search
  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.captainName && t.captainName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Red Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.iconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon source="arrow-left" size={24} color={COLORS.surfaceWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {activeTab === 'add' ? 'Create your team' : 'Teams'}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon source="qrcode-scan" size={22} color={COLORS.surfaceWhite} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon source="magnify" size={24} color={COLORS.surfaceWhite} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub Header Tabs (Your teams | Opponents | Add) */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'your_teams' ? styles.tabButtonActive : null]}
          onPress={() => setActiveTab('your_teams')}
        >
          <Text
            style={[styles.tabText, activeTab === 'your_teams' ? styles.tabTextActive : null]}
          >
            Your teams
          </Text>
          {activeTab === 'your_teams' ? <View style={styles.activeIndicator} /> : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'opponents' ? styles.tabButtonActive : null]}
          onPress={() => setActiveTab('opponents')}
        >
          <Text
            style={[styles.tabText, activeTab === 'opponents' ? styles.tabTextActive : null]}
          >
            Opponents
          </Text>
          {activeTab === 'opponents' ? <View style={styles.activeIndicator} /> : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'add' ? styles.tabButtonActive : null]}
          onPress={() => setActiveTab('add')}
        >
          <Text
            style={[styles.tabText, activeTab === 'add' ? styles.tabTextActive : null]}
          >
            Add
          </Text>
          {activeTab === 'add' ? <View style={styles.activeIndicator} /> : null}
        </TouchableOpacity>
      </View>

      {/* Tab Body View */}
      <View style={styles.contentArea}>
        {/* 1. YOUR TEAMS TAB */}
        {activeTab === 'your_teams' ? (
          <View style={styles.tabContent}>
            {/* Search & Add Bar */}
            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <Icon source="magnify" size={20} color={COLORS.placeholder} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Quick search"
                  placeholderTextColor={COLORS.placeholder}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <TouchableOpacity
                style={styles.addTeamButton}
                onPress={() => setActiveTab('add')}
              >
                <Icon source="plus" size={18} color={COLORS.surfaceWhite} />
                <Text style={styles.addTeamButtonText}>Add team</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color={COLORS.brandTeal} />
                <Text style={styles.loadingText}>Loading teams...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredTeams}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listPadding}
                renderItem={({ item }) => (
                  <TeamCard
                    team={item}
                    onInvitePlayer={handleOpenInvite}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyCard}>
                    <Icon source="account-group" size={48} color={COLORS.textDarkSecondary} />
                    <Text style={styles.emptyTitle}>No teams found</Text>
                    <Text style={styles.emptySubtitle}>
                      {searchQuery
                        ? 'Try searching with a different keyword.'
                        : 'Create your first cricket team to start matches.'}
                    </Text>
                    <TouchableOpacity
                      style={styles.emptyCreateBtn}
                      onPress={() => setActiveTab('add')}
                    >
                      <Text style={styles.emptyCreateBtnText}>Create Team Now</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            )}
          </View>
        ) : null}

        {/* 2. OPPONENTS TAB */}
        {activeTab === 'opponents' ? (
          <ScrollView contentContainerStyle={styles.opponentsContainer}>
            <View style={styles.opponentsIllustration}>
              <View style={styles.opponentPhoneGraphic}>
                <Icon source="cellphone" size={100} color="#CBD5E1" />
                <View style={styles.opponentIconsRow}>
                  <Icon source="account" size={44} color="#F97316" />
                  <Icon source="account" size={44} color="#0F172A" />
                </View>
              </View>
            </View>

            <Text style={styles.opponentsText}>
              You haven't played a match yet. Start one now and your opponent teams will appear here automatically.
            </Text>

            <View style={styles.opponentsActionRow}>
              <TouchableOpacity
                style={styles.needHelpBtn}
                onPress={() => Alert.alert('Help', 'Opponents are automatically added when you score matches with other teams.')}
              >
                <Text style={styles.needHelpBtnText}>Need help?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createTeamBtn}
                onPress={() => setActiveTab('add')}
              >
                <Text style={styles.createTeamBtnText}>Create your team</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : null}

        {/* 3. ADD / CREATE TEAM FORM TAB */}
        {activeTab === 'add' ? (
          <View style={styles.createFormContainer}>
            <ScrollView
              style={styles.formScrollView}
              contentContainerStyle={styles.formScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formCard}>
                {/* Team Logo Badge */}
                <View style={styles.logoContainer}>
                  <View style={styles.logoCircle}>
                    <Icon source="shield-crown-outline" size={40} color="#64748B" />
                    <Text style={styles.logoBadgeText}>ALL-STAR</Text>
                    <View style={styles.logoAddOverlay}>
                      <Text style={styles.logoAddText}>Add</Text>
                    </View>
                  </View>
                  <Text style={styles.logoLabel}>Team logo</Text>
                </View>

                {/* Team Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Team name *</Text>
                  <TextInput
                    style={styles.underlineInput}
                    placeholder="e.g. Hyderabad Nizampet Boys"
                    placeholderTextColor={COLORS.placeholder}
                    value={teamName}
                    onChangeText={(text) => {
                      setTeamName(text);
                      if (formError) setFormError('');
                    }}
                    autoCapitalize="words"
                  />
                </View>

                {/* City / Town Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>City / town *</Text>
                  <TextInput
                    style={styles.underlineInput}
                    placeholder="e.g. Hyderabad (Telangana)"
                    placeholderTextColor={COLORS.placeholder}
                    value={city}
                    onChangeText={setCity}
                    autoCapitalize="words"
                  />
                </View>

                {/* Captain Number Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>
                    Team captain/coordinator number (optional)
                  </Text>
                  <View style={styles.captainPhoneRow}>
                    <Text style={styles.prefixText}>+91</Text>
                    <TextInput
                      style={styles.captainPhoneInput}
                      placeholder="7680922101"
                      placeholderTextColor={COLORS.placeholder}
                      value={captainNumber}
                      onChangeText={setCaptainNumber}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                    <Icon source="book-account-outline" size={22} color={COLORS.brandTeal} />
                  </View>
                </View>

                {/* Captain Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Team captain name</Text>
                  <TextInput
                    style={[
                      styles.underlineInput,
                      formError && !captainName.trim() ? styles.underlineInputError : null,
                    ]}
                    placeholder="e.g. MohammadArfaz Shaik"
                    placeholderTextColor={COLORS.placeholder}
                    value={captainName}
                    onChangeText={(text) => {
                      setCaptainName(text);
                      if (formError) setFormError('');
                    }}
                    autoCapitalize="words"
                  />
                  {formError && !captainName.trim() ? (
                    <Text style={styles.errorTextRed}>{formError}</Text>
                  ) : null}
                </View>

                {/* Checkbox: Let Captain Add Players */}
                <Pressable
                  style={styles.checkboxRow}
                  onPress={() => setAllowCaptainAddPlayers(!allowCaptainAddPlayers)}
                >
                  <Icon
                    source={
                      allowCaptainAddPlayers
                        ? 'checkbox-marked'
                        : 'checkbox-blank-outline'
                    }
                    size={22}
                    color={allowCaptainAddPlayers ? COLORS.brandTeal : COLORS.placeholder}
                  />
                  <Text style={styles.checkboxLabel}>
                    Let the captain add team players.
                  </Text>
                </Pressable>
              </View>

              {/* Checkbox: Add Yourself in Team */}
              <Pressable
                style={styles.addSelfCheckboxRow}
                onPress={() => setAddSelf(!addSelf)}
              >
                <Icon
                  source={addSelf ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={22}
                  color={addSelf ? COLORS.brandTeal : COLORS.placeholder}
                />
                <Text style={styles.addSelfLabel}>Add yourself in the team</Text>
              </Pressable>
            </ScrollView>

            {/* Bottom Full-Width CTA */}
            <View style={styles.bottomCtaContainer}>
              <TouchableOpacity
                style={[styles.addTeamCtaButton, submitting ? styles.ctaDisabled : null]}
                onPress={handleAddTeam}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.surfaceWhite} />
                ) : (
                  <Text style={styles.addTeamCtaText}>Add team</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>

      {/* Invite Player Modal */}
      {selectedTeamForInvite ? (
        <InvitePlayerModal
          visible={inviteModalVisible}
          teamId={selectedTeamForInvite.id}
          teamName={selectedTeamForInvite.name}
          onClose={() => setInviteModalVisible(false)}
          onPlayerAdded={handlePlayerAdded}
        />
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    backgroundColor: COLORS.brandRed,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 2,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surfaceWhite,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabButtonActive: {},
  tabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: COLORS.brandRed,
    borderRadius: 2,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabContent: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: '#0F172A',
  },
  addTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandTeal,
    borderRadius: 6,
    paddingHorizontal: 14,
    height: 40,
    gap: 4,
  },
  addTeamButtonText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  listPadding: {
    padding: 16,
    paddingBottom: 24,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: FONT_SIZE.sm,
    color: '#64748B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.xs,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  emptyCreateBtn: {
    backgroundColor: COLORS.brandTeal,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyCreateBtnText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  // Opponents Tab Styles
  opponentsContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  opponentsIllustration: {
    marginVertical: 24,
    alignItems: 'center',
  },
  opponentPhoneGraphic: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opponentIconsRow: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 16,
  },
  opponentsText: {
    fontSize: FONT_SIZE.sm,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  opponentsActionRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
  },
  needHelpBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.brandTeal,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  needHelpBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.brandTeal,
  },
  createTeamBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 6,
    backgroundColor: COLORS.brandTeal,
    alignItems: 'center',
  },
  createTeamBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.surfaceWhite,
  },
  // Create Team Form Styles
  createFormContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  formScrollView: {
    flex: 1,
  },
  formScrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  logoBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 2,
  },
  logoAddOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#334155',
    paddingVertical: 3,
    alignItems: 'center',
  },
  logoAddText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 8,
  },
  inputGroup: {
    marginTop: 16,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.xs,
    color: '#64748B',
    marginBottom: 4,
  },
  underlineInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 8,
    fontSize: FONT_SIZE.md,
    color: '#0F172A',
  },
  underlineInputError: {
    borderBottomColor: COLORS.error,
  },
  errorTextRed: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    marginTop: 4,
  },
  captainPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
  },
  prefixText: {
    fontSize: FONT_SIZE.md,
    color: '#0F172A',
    fontWeight: '600',
    marginRight: 6,
  },
  captainPhoneInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: FONT_SIZE.md,
    color: '#0F172A',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 6,
  },
  checkboxLabel: {
    fontSize: FONT_SIZE.sm,
    color: '#475569',
  },
  addSelfCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    marginTop: 16,
  },
  addSelfLabel: {
    fontSize: FONT_SIZE.sm,
    color: '#475569',
  },
  bottomCtaContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  addTeamCtaButton: {
    backgroundColor: COLORS.brandTeal,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  addTeamCtaText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.surfaceWhite,
  },
});

export default TeamsScreen;
