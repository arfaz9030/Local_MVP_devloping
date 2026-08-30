import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { TeamItem } from './TeamCard';
import { COLORS } from '../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../src/theme/typography';

interface SelectedTeamInfo {
  id?: string;
  name: string;
  captainName?: string;
  city?: string;
  playerCount?: number;
}

interface TeamPickerModalProps {
  visible: boolean;
  title: string;
  teams: TeamItem[];
  selectedTeamId?: string;
  disabledTeamId?: string;
  onSelectTeam: (team: SelectedTeamInfo) => void;
  onClose: () => void;
}

const AVATAR_COLORS = [
  '#16A34A',
  '#854D0E',
  '#7C3AED',
  '#2563EB',
  '#DC2626',
  '#D97706',
  '#0D9488',
];

function getInitials(name: string): string {
  if (!name) return 'TM';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const TeamPickerModal: React.FC<TeamPickerModalProps> = ({
  visible,
  title,
  teams,
  selectedTeamId,
  disabledTeamId,
  onSelectTeam,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customName, setCustomName] = useState('');

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.captainName && t.captainName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.city && t.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelect = (team: TeamItem) => {
    if (disabledTeamId && team.id === disabledTeamId) return;
    onSelectTeam({
      id: team.id,
      name: team.name,
      captainName: team.captainName,
      city: team.city,
      playerCount: team.players?.length || 0,
    });
    setSearchQuery('');
    setCustomName('');
    onClose();
  };

  const handleSelectCustom = () => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    onSelectTeam({
      name: trimmed,
      captainName: 'Custom Opponent',
      city: 'Custom',
      playerCount: 11,
    });
    setSearchQuery('');
    setCustomName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
            >
              <Icon source="close" size={24} color={COLORS.textDarkSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Icon source="magnify" size={20} color={COLORS.textDarkSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search team or captain..."
              placeholderTextColor={COLORS.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon source="close-circle" size={18} color={COLORS.textDarkSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Teams List */}
          <FlatList
            data={filteredTeams}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon source="account-group-outline" size={40} color={COLORS.textDarkSecondary} />
                <Text style={styles.emptyText}>No matching teams found</Text>
                <Text style={styles.emptySubText}>
                  Select or enter a custom team name below
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = selectedTeamId === item.id;
              const isDisabled = disabledTeamId === item.id;
              const avatarBg = getAvatarColor(item.name);
              const initials = getInitials(item.name);

              return (
                <Pressable
                  style={[
                    styles.teamItem,
                    isSelected ? styles.teamItemSelected : null,
                    isDisabled ? styles.teamItemDisabled : null,
                  ]}
                  onPress={() => handleSelect(item)}
                  disabled={isDisabled}
                >
                  <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>

                  <View style={styles.teamDetails}>
                    <Text
                      style={[
                        styles.teamName,
                        isDisabled ? styles.textDisabled : null,
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.teamSub} numberOfLines={1}>
                      Captain: {item.captainName || 'Not specified'} • {item.players?.length || 0} players
                    </Text>
                  </View>

                  {isDisabled ? (
                    <View style={styles.alreadyChosenBadge}>
                      <Text style={styles.alreadyChosenText}>Already Selected</Text>
                    </View>
                  ) : isSelected ? (
                    <Icon source="check-circle" size={22} color={COLORS.brandTeal} />
                  ) : (
                    <Icon source="chevron-right" size={20} color={COLORS.textDarkSecondary} />
                  )}
                </Pressable>
              );
            }}
          />

          {/* Custom Team Entry Fallback */}
          <View style={styles.customSection}>
            <Text style={styles.customLabel}>Or Enter Team / Opponent Name Manually</Text>
            <View style={styles.customInputRow}>
              <TextInput
                style={styles.customInput}
                placeholder="e.g. Hyderabad Kings"
                placeholderTextColor={COLORS.placeholder}
                value={customName}
                onChangeText={setCustomName}
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={[
                  styles.customBtn,
                  !customName.trim() ? styles.customBtnDisabled : null,
                ]}
                onPress={handleSelectCustom}
                disabled={!customName.trim()}
              >
                <Text style={styles.customBtnText}>Use Name</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surfaceWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textDark,
    paddingVertical: 2,
  },
  list: {
    maxHeight: 280,
  },
  listContent: {
    paddingBottom: 10,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    gap: 12,
  },
  teamItemSelected: {
    borderColor: COLORS.brandTeal,
    backgroundColor: '#F0FDFA',
  },
  teamItemDisabled: {
    opacity: 0.5,
    backgroundColor: '#F8FAFC',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 13,
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
  },
  teamSub: {
    fontSize: 11,
    color: COLORS.textDarkSecondary,
    marginTop: 2,
  },
  textDisabled: {
    color: COLORS.textDarkSecondary,
  },
  alreadyChosenBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alreadyChosenText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textDarkSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  emptySubText: {
    fontSize: 12,
    color: COLORS.textDarkSecondary,
  },
  customSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 12,
    marginTop: 8,
  },
  customLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDarkSecondary,
    marginBottom: 8,
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
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textDark,
  },
  customBtn: {
    backgroundColor: COLORS.brandTeal,
    borderRadius: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBtnDisabled: {
    opacity: 0.5,
  },
  customBtnText: {
    color: COLORS.surfaceWhite,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 12,
  },
});
