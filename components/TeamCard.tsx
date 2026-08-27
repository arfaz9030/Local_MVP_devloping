import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { COLORS } from '../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../src/theme/typography';

export interface PlayerItem {
  id: string;
  name: string;
  jerseyNumber?: number;
  role?: string;
  mobileNumber?: string;
}

export interface TeamItem {
  id: string;
  name: string;
  captainName: string;
  city?: string;
  captainNumber?: string;
  logoUrl?: string;
  players: PlayerItem[];
}

interface TeamCardProps {
  team: TeamItem;
  onInvitePlayer: (team: TeamItem) => void;
  onSelectTeam?: (team: TeamItem) => void;
}

// Generate consistent avatar color based on team name
const AVATAR_COLORS = [
  '#16A34A', // Green (HT)
  '#854D0E', // Brown (MO)
  '#7C3AED', // Purple (HN)
  '#2563EB', // Blue
  '#DC2626', // Red
  '#D97706', // Amber
  '#0D9488', // Teal
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
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onInvitePlayer,
  onSelectTeam,
}) => {
  const [expanded, setExpanded] = useState(false);
  const initials = getInitials(team.name);
  const avatarBg = getAvatarColor(team.name);

  return (
    <View style={styles.card}>
      {/* Team Header Row */}
      <Pressable
        style={styles.mainRow}
        onPress={() => (onSelectTeam ? onSelectTeam(team) : setExpanded(!expanded))}
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.teamName} numberOfLines={1}>
            {team.name}
          </Text>

          <View style={styles.metaRow}>
            <Icon source="map-marker" size={15} color={COLORS.textDarkSecondary} />
            <Text style={styles.cityText} numberOfLines={1}>
              {team.city || 'Hyderabad (Telangana)'}
            </Text>
          </View>

          {team.captainName ? (
            <View style={styles.captainRow}>
              <View style={styles.captainBadge}>
                <Text style={styles.captainBadgeText}>C</Text>
              </View>
              <Text style={styles.captainName} numberOfLines={1}>
                {team.captainName}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Right QR and Action */}
        <View style={styles.rightActions}>
          <Icon source="qrcode" size={24} color={COLORS.brandTeal} />
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setExpanded(!expanded)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon
              source={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.textDarkSecondary}
            />
          </TouchableOpacity>
        </View>
      </Pressable>

      {/* Squad Action Strip */}
      <View style={styles.actionStrip}>
        <TouchableOpacity
          style={styles.squadButton}
          onPress={() => setExpanded(!expanded)}
        >
          <Icon
            source="account-group"
            size={16}
            color={COLORS.brandTeal}
          />
          <Text style={styles.squadButtonText}>
            {expanded ? 'Hide Squad' : `Squad (${team.players.length})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() => onInvitePlayer(team)}
        >
          <Icon source="account-plus" size={16} color={COLORS.surfaceWhite} />
          <Text style={styles.inviteButtonText}>Invite Player</Text>
        </TouchableOpacity>
      </View>

      {/* Expanded Players List */}
      {expanded ? (
        <View style={styles.squadContainer}>
          <Text style={styles.squadTitle}>PLAYERS ROSTER</Text>
          {team.players.length === 0 ? (
            <View style={styles.emptySquad}>
              <Text style={styles.emptySquadText}>
                No players added to this squad yet.
              </Text>
              <TouchableOpacity
                style={styles.emptyInviteBtn}
                onPress={() => onInvitePlayer(team)}
              >
                <Text style={styles.emptyInviteBtnText}>+ Add First Player</Text>
              </TouchableOpacity>
            </View>
          ) : (
            team.players.map((p, idx) => (
              <View key={p.id || idx} style={styles.playerRow}>
                <View style={styles.jerseyCircle}>
                  <Text style={styles.jerseyText}>
                    {p.jerseyNumber ? `#${p.jerseyNumber}` : `#${idx + 1}`}
                  </Text>
                </View>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{p.name}</Text>
                  {p.role ? (
                    <Text style={styles.playerRole}>{p.role}</Text>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surfaceWhite,
  },
  infoContainer: {
    flex: 1,
  },
  teamName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  cityText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDarkSecondary,
  },
  captainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  captainBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captainBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.surfaceWhite,
  },
  captainName: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDarkSecondary,
  },
  rightActions: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginLeft: 8,
  },
  expandButton: {
    padding: 2,
  },
  actionStrip: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  squadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  squadButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.brandTeal,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brandTeal,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  inviteButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surfaceWhite,
  },
  squadContainer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: '#FAFBFD',
  },
  squadTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textDarkSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  emptySquad: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  emptySquadText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDarkSecondary,
    marginBottom: 8,
  },
  emptyInviteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#E0F2F1',
  },
  emptyInviteBtnText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.brandTeal,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  jerseyCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  jerseyText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  playerRole: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textDarkSecondary,
  },
});
