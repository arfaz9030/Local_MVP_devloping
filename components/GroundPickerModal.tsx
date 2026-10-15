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

interface GroundPickerModalProps {
  visible: boolean;
  selectedGround: string;
  onSelectGround: (groundName: string) => void;
  onClose: () => void;
}

const POPULAR_GROUNDS = [
  { id: 'g1', name: 'Rajiv Gandhi International Cricket Stadium', city: 'Uppal, Hyderabad', type: 'Stadium' },
  { id: 'g2', name: 'Gymkhana Cricket Ground', city: 'Secunderabad, Hyderabad', type: 'Turf Ground' },
  { id: 'g3', name: 'LB Stadium', city: 'Basheerbagh, Hyderabad', type: 'Stadium' },
  { id: 'g4', name: 'SMC Cricket Ground', city: 'Nizampet, Hyderabad', type: 'Open Turf' },
  { id: 'g5', name: 'Gachibowli Stadium Ground', city: 'Gachibowli, Hyderabad', type: 'Stadium' },
  { id: 'g6', name: 'NTR Cricket Ground', city: 'Tolichowki, Hyderabad', type: 'Turf Ground' },
  { id: 'g7', name: 'Kukatpally Sports Complex Ground', city: 'Kukatpally, Hyderabad', type: 'Matting Ground' },
  { id: 'g8', name: 'Cyberabad Sports Arena', city: 'Madhapur, Hyderabad', type: 'Box / Turf' },
  { id: 'g9', name: 'Osmania University Ground', city: 'Hyderabad', type: 'Open Ground' },
  { id: 'g10', name: 'Hitec City Cricket Club', city: 'Kondapur, Hyderabad', type: 'Turf Ground' },
];

export const GroundPickerModal: React.FC<GroundPickerModalProps> = ({
  visible,
  selectedGround,
  onSelectGround,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  const topInset = Math.max(insets.top, statusBarHeight);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredGrounds = POPULAR_GROUNDS.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (groundName: string) => {
    onSelectGround(groundName);
    setSearchQuery('');
    onClose();
  };

  const handleCustomAdd = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    onSelectGround(trimmed);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: topInset }]}>
        {/* Red Header matching CrickHero design */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Icon source="arrow-left" size={24} color={COLORS.surfaceWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Ground</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon source="magnify" size={20} color={COLORS.placeholder} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search ground by name or city..."
              placeholderTextColor={COLORS.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon source="close-circle" size={18} color={COLORS.placeholder} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Use Current Location banner */}
        <TouchableOpacity
          style={styles.locationBanner}
          onPress={() => handleSelect('Current Location Ground (Hyderabad)')}
        >
          <View style={styles.locationIconBox}>
            <Icon source="crosshairs-gps" size={20} color={COLORS.brandTeal} />
          </View>
          <View style={styles.locationTextGroup}>
            <Text style={styles.locationTitle}>Use Current Location</Text>
            <Text style={styles.locationSubtitle}>Hyderabad, Telangana</Text>
          </View>
          <Icon source="chevron-right" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Custom Ground entry if searched and not matching exactly */}
        {searchQuery.trim().length > 0 ? (
          <TouchableOpacity style={styles.customAddButton} onPress={handleCustomAdd}>
            <Icon source="plus-circle" size={20} color={COLORS.brandTeal} />
            <Text style={styles.customAddText}>
              Add &quot;{searchQuery.trim()}&quot; as Ground
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Section title */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderText}>NEARBY & POPULAR GROUNDS</Text>
        </View>

        {/* Grounds List */}
        <FlatList
          data={filteredGrounds}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = selectedGround === item.name;
            return (
              <TouchableOpacity
                style={[styles.groundCard, isSelected && styles.groundCardSelected]}
                onPress={() => handleSelect(item.name)}
                activeOpacity={0.7}
              >
                <View style={styles.groundIconBox}>
                  <Icon source="stadium" size={24} color={isSelected ? COLORS.brandTeal : '#94A3B8'} />
                </View>

                <View style={styles.groundInfo}>
                  <Text style={[styles.groundName, isSelected && styles.groundNameSelected]}>
                    {item.name}
                  </Text>
                  <Text style={styles.groundCity}>
                    {item.city} • <Text style={styles.groundType}>{item.type}</Text>
                  </Text>
                </View>

                {isSelected ? (
                  <Icon source="check-circle" size={22} color={COLORS.brandTeal} />
                ) : (
                  <Icon source="chevron-right" size={20} color={COLORS.border} />
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon source="map-marker-off" size={42} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No grounds found</Text>
              <Text style={styles.emptySubText}>
                You can add &quot;{searchQuery}&quot; by tapping the button above.
              </Text>
            </View>
          }
        />
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
  searchContainer: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111C34',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
  },
  locationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTextGroup: {
    flex: 1,
  },
  locationTitle: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  locationSubtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  customAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2F38',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.brandTeal,
    gap: 10,
  },
  customAddText: {
    color: COLORS.brandTeal,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    flex: 1,
  },
  sectionHeaderRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  groundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  groundCardSelected: {
    borderColor: '#5EEAD4',
    backgroundColor: '#111C34',
  },
  groundIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groundInfo: {
    flex: 1,
  },
  groundName: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  groundNameSelected: {
    color: COLORS.surfaceWhite,
  },
  groundCity: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: 3,
  },
  groundType: {
    color: COLORS.brandTeal,
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 10,
  },
  emptyTitle: {
    color: COLORS.surfaceWhite,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  emptySubText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
