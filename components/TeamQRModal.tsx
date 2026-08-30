import React from 'react';
import {
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { TeamItem } from './TeamCard';
import { COLORS } from '../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../src/theme/typography';

interface TeamQRModalProps {
  visible: boolean;
  team: TeamItem | null;
  onClose: () => void;
}

export const TeamQRModal: React.FC<TeamQRModalProps> = ({
  visible,
  team,
  onClose,
}) => {
  if (!team) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Team QR Code: ${team.name}`,
        message: `Join ${team.name} on CrickHero! Captain: ${team.captainName} (Demo QR Code Invitation)`,
      });
    } catch (err) {
      console.error('Error sharing QR details:', err);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Team QR Code</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.closeBtn}
            >
              <Icon source="close" size={22} color={COLORS.textDarkSecondary} />
            </TouchableOpacity>
          </View>

          {/* Team Summary */}
          <View style={styles.teamSummary}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.captainText}>Captain: {team.captainName}</Text>
            {team.city ? (
              <Text style={styles.cityText}>{team.city}</Text>
            ) : null}
          </View>

          {/* Visual QR Code Display Container */}
          <View style={styles.qrContainer}>
            <View style={styles.qrFrame}>
              {/* Corner Finder Patterns */}
              <View style={[styles.finderCorner, styles.finderTopLeft]}>
                <View style={styles.finderInner} />
              </View>
              <View style={[styles.finderCorner, styles.finderTopRight]}>
                <View style={styles.finderInner} />
              </View>
              <View style={[styles.finderCorner, styles.finderBottomLeft]}>
                <View style={styles.finderInner} />
              </View>

              {/* QR Pattern Matrix Simulation */}
              <View style={styles.matrixCenter}>
                <Icon source="qrcode" size={140} color={COLORS.textDark} />
              </View>
            </View>
            <Text style={styles.scanPrompt}>Scan with device camera to view team</Text>
          </View>

          {/* Explicit Demo Disclaimer Banner */}
          <View style={styles.disclaimerBox}>
            <Icon source="information-outline" size={18} color="#D97706" />
            <Text style={styles.disclaimerText}>
              <Text style={{ fontWeight: '700' }}>Demo Placeholder:</Text> Dynamic scan-to-join tokens are not yet provided by the backend API.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Icon source="share-variant" size={18} color={COLORS.surfaceWhite} />
              <Text style={styles.shareBtnText}>Share Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeActionBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeActionText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  teamSummary: {
    alignItems: 'center',
    marginBottom: 16,
  },
  teamName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
    textAlign: 'center',
  },
  captainText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textDarkSecondary,
    marginTop: 2,
  },
  cityText: {
    fontSize: 12,
    color: COLORS.textDarkSecondary,
    marginTop: 2,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    width: '100%',
  },
  qrFrame: {
    width: 170,
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  finderCorner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderWidth: 3,
    borderColor: '#1E293B',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finderInner: {
    width: 12,
    height: 12,
    backgroundColor: '#1E293B',
    borderRadius: 2,
  },
  finderTopLeft: {
    top: 8,
    left: 8,
  },
  finderTopRight: {
    top: 8,
    right: 8,
  },
  finderBottomLeft: {
    bottom: 8,
    left: 8,
  },
  matrixCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanPrompt: {
    fontSize: 12,
    color: COLORS.textDarkSecondary,
    marginTop: 10,
    fontWeight: '500',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 10,
    marginBottom: 18,
    gap: 8,
    width: '100%',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: COLORS.brandTeal,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareBtnText: {
    color: COLORS.surfaceWhite,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.sm,
  },
  closeActionBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeActionText: {
    color: COLORS.textDark,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.sm,
  },
});
