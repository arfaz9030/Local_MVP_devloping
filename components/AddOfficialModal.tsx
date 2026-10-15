import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../src/theme/typography';

export type OfficialRole =
  | 'umpire1'
  | 'umpire2'
  | 'third_umpire'
  | 'scorer1'
  | 'scorer2'
  | 'commentator';

export interface OfficialMember {
  id: string;
  name: string;
  phone: string;
  city?: string;
  role: OfficialRole;
  isSelf?: boolean;
}

interface AddOfficialModalProps {
  visible: boolean;
  role: OfficialRole;
  currentOfficial?: OfficialMember | null;
  onSaveOfficial: (official: OfficialMember) => void;
  onClose: () => void;
}

const ROLE_METADATA: Record<
  OfficialRole,
  { title: string; defaultPlaceholder: string; icon: string }
> = {
  umpire1: { title: 'Select Umpire 1', defaultPlaceholder: 'Search umpire...', icon: 'whistle' },
  umpire2: { title: 'Select Umpire 2', defaultPlaceholder: 'Search umpire...', icon: 'whistle' },
  third_umpire: { title: 'Select Third Umpire', defaultPlaceholder: 'Search umpire...', icon: 'video-account' },
  scorer1: { title: 'Select Scorer 1', defaultPlaceholder: 'Search scorer...', icon: 'scoreboard' },
  scorer2: { title: 'Select Scorer 2', defaultPlaceholder: 'Search scorer...', icon: 'scoreboard' },
  commentator: { title: 'Select Commentator', defaultPlaceholder: 'Search commentator...', icon: 'microphone' },
};

const SAVED_OFFICIALS = [
  { id: 'off_1', name: 'Ramesh Kumar', phone: '9876543210', city: 'Hyderabad' },
  { id: 'off_2', name: 'Suresh Rao', phone: '9848012345', city: 'Secunderabad' },
  { id: 'off_3', name: 'Karthik Varma', phone: '9988776655', city: 'Hyderabad' },
  { id: 'off_4', name: 'Imran Farooq', phone: '9123456780', city: 'Hyderabad' },
];

export const AddOfficialModal: React.FC<AddOfficialModalProps> = ({
  visible,
  role,
  onSaveOfficial,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  const topInset = Math.max(insets.top, statusBarHeight);

  const [activeView, setActiveView] = useState<'picker' | 'create'>('picker');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for creating new official
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Hyderabad (Telangana)');
  const [formError, setFormError] = useState('');

  const meta = ROLE_METADATA[role] || ROLE_METADATA.umpire1;

  const handleSelectSelf = () => {
    onSaveOfficial({
      id: 'self_' + Date.now(),
      name: 'Match Scorer (You)',
      phone: '9876543210',
      city: 'Local',
      role,
      isSelf: true,
    });
    handleClose();
  };

  const handleSelectSaved = (saved: typeof SAVED_OFFICIALS[0]) => {
    onSaveOfficial({
      id: saved.id,
      name: saved.name,
      phone: saved.phone,
      city: saved.city,
      role,
      isSelf: false,
    });
    handleClose();
  };

  const handleCreateSubmit = () => {
    setFormError('');
    const trimmedName = name.trim();
    const cleanPhone = phone.trim().replace(/\D/g, '');

    if (!trimmedName) {
      setFormError('Please enter full name');
      return;
    }

    if (cleanPhone.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    onSaveOfficial({
      id: 'custom_' + Date.now(),
      name: trimmedName,
      phone: cleanPhone,
      city: city.trim() || 'Hyderabad',
      role,
      isSelf: false,
    });

    handleClose();
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setFormError('');
    setSearchQuery('');
    setActiveView('picker');
    onClose();
  };

  const filteredSaved = SAVED_OFFICIALS.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery)
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.container, { paddingTop: topInset }]}>
        {/* Header matching CrickHero red bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (activeView === 'create') {
                setActiveView('picker');
              } else {
                handleClose();
              }
            }}
          >
            <Icon source="arrow-left" size={24} color={COLORS.surfaceWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {activeView === 'create' ? `Add New ${role.startsWith('umpire') ? 'Umpire' : role.startsWith('scorer') ? 'Scorer' : 'Commentator'}` : meta.title}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {activeView === 'picker' ? (
          <View style={styles.contentBody}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Icon source="magnify" size={20} color={COLORS.placeholder} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or mobile number..."
                placeholderTextColor={COLORS.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon source="close-circle" size={18} color={COLORS.placeholder} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Quick Assign Myself Option (Especially for Scorer or Umpire) */}
            <TouchableOpacity style={styles.selfOptionCard} onPress={handleSelectSelf}>
              <View style={styles.selfAvatar}>
                <Text style={styles.selfAvatarText}>ME</Text>
              </View>
              <View style={styles.selfInfo}>
                <View style={styles.nameBadgeRow}>
                  <Text style={styles.selfName}>Current User</Text>
                  <View style={styles.youBadge}>
                    <Text style={styles.youBadgeText}>YOU</Text>
                  </View>
                </View>
                <Text style={styles.selfPhone}>Assign as Official</Text>
              </View>
              <View style={styles.assignChip}>
                <Text style={styles.assignChipText}>Select Myself</Text>
              </View>
            </TouchableOpacity>

            {/* Create New Official Action Button */}
            <TouchableOpacity
              style={styles.addNewButton}
              onPress={() => setActiveView('create')}
            >
              <View style={styles.addIconCircle}>
                <Icon source="plus" size={20} color={COLORS.surfaceWhite} />
              </View>
              <Text style={styles.addNewButtonText}>
                + Add New {role.startsWith('umpire') ? 'Umpire' : role.startsWith('scorer') ? 'Scorer' : 'Commentator'}
              </Text>
              <Icon source="chevron-right" size={20} color={COLORS.brandTeal} />
            </TouchableOpacity>

            {/* Recent & Saved Officials */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderText}>RECENT & NETWORK OFFICIALS</Text>
            </View>

            <FlatList
              data={filteredSaved}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.officialItemCard}
                  onPress={() => handleSelectSaved(item)}
                >
                  <View style={styles.officialAvatar}>
                    <Text style={styles.officialAvatarText}>
                      {item.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.officialInfo}>
                    <Text style={styles.officialName}>{item.name}</Text>
                    <Text style={styles.officialPhone}>
                      +91 {item.phone} • {item.city}
                    </Text>
                  </View>
                  <Icon source="plus-circle-outline" size={22} color={COLORS.brandTeal} />
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          /* Create Form View (Screenshots 6 & 7) */
          <View style={styles.formContainer}>
            <View style={styles.formNoticeCard}>
              <Icon source="shield-check" size={20} color={COLORS.brandTeal} />
              <Text style={styles.formNoticeText}>
                Official will be tagged in this match and can access the scorecard.
              </Text>
            </View>

            {formError ? (
              <View style={styles.errorBox}>
                <Icon source="alert-circle-outline" size={18} color="#F87171" />
                <Text style={styles.errorBoxText}>{formError}</Text>
              </View>
            ) : null}

            {/* Full Name */}
            <Text style={styles.fieldLabel}>FULL NAME *</Text>
            <View style={styles.inputWrapper}>
              <Icon source="account" size={20} color={COLORS.placeholder} />
              <TextInput
                style={styles.inputField}
                placeholder="Enter official's name (e.g. Ramesh)"
                placeholderTextColor={COLORS.placeholder}
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  setFormError('');
                }}
              />
            </View>

            {/* Mobile Number */}
            <Text style={styles.fieldLabel}>MOBILE NUMBER (10 DIGITS) *</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.inputField}
                placeholder="9876543210"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(val) => {
                  setPhone(val);
                  setFormError('');
                }}
              />
              {phone.trim().length === 10 ? (
                <Icon source="check-circle" size={20} color="#22C55E" />
              ) : null}
            </View>

            {/* City */}
            <Text style={styles.fieldLabel}>CITY / LOCATION</Text>
            <View style={styles.inputWrapper}>
              <Icon source="map-marker-outline" size={20} color={COLORS.placeholder} />
              <TextInput
                style={styles.inputField}
                placeholder="Hyderabad (Telangana)"
                placeholderTextColor={COLORS.placeholder}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleCreateSubmit}>
              <Text style={styles.submitButtonText}>Save & Assign Official</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelLink}
              onPress={() => setActiveView('picker')}
            >
              <Text style={styles.cancelLinkText}>Back to Selection</Text>
            </TouchableOpacity>
          </View>
        )}
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
    backgroundColor: COLORS.brandTeal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  contentBody: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
  },
  selfOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162344',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  selfAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.brandTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selfAvatarText: {
    color: COLORS.surfaceWhite,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.sm,
  },
  selfInfo: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selfName: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  youBadge: {
    backgroundColor: '#0F766E',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  youBadgeText: {
    color: COLORS.surfaceWhite,
    fontSize: 10,
    fontWeight: '800',
  },
  selfPhone: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  assignChip: {
    backgroundColor: COLORS.brandTeal,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  assignChipText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.brandTeal,
    gap: 12,
    marginBottom: 16,
  },
  addIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.brandTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNewButtonText: {
    flex: 1,
    color: COLORS.brandTeal,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionHeaderText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.8,
  },
  listContent: {
    paddingBottom: 24,
  },
  officialItemCard: {
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
  officialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  officialAvatarText: {
    color: COLORS.surfaceWhite,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.sm,
  },
  officialInfo: {
    flex: 1,
  },
  officialName: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  officialPhone: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  formContainer: {
    flex: 1,
    padding: 18,
  },
  formNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2F38',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.brandTeal,
    gap: 10,
    marginBottom: 18,
  },
  formNoticeText: {
    color: COLORS.surfaceLight,
    fontSize: FONT_SIZE.xs,
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#451A1A',
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorBoxText: {
    color: COLORS.errorText,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    flex: 1,
  },
  fieldLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
    marginBottom: 12,
  },
  countryCode: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingRight: 8,
  },
  inputField: {
    flex: 1,
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
  },
  submitButton: {
    backgroundColor: COLORS.brandTeal,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelLinkText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },
});
