import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../app/_layout';
import { COLORS } from '../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../src/theme/typography';

interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
  activeItem?: 'matches' | 'teams' | 'academy' | 'create-match';
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
  visible,
  onClose,
  activeItem = 'matches',
}) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  const topInset = Math.max(insets.top, statusBarHeight);
  const bottomInset = insets.bottom;
  const router = useRouter();
  const { logout } = useAuth();

  const drawerWidth = Math.min(320, Dimensions.get('window').width * 0.78);
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -drawerWidth,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible, drawerWidth, slideAnim, fadeAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -drawerWidth,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleNavigate = (route: string) => {
    handleClose();
    if (route === '/(tabs)' || route === '/(tabs)/teams' || route === '/(tabs)/academy') {
      router.replace(route as any);
    } else {
      router.push(route as any);
    }
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Drawer Slide-in Container (Positioned on the Left) */}
        <Animated.View
          style={[
            styles.drawerContent,
            {
              paddingTop: topInset + 16,
              paddingBottom: Math.max(bottomInset, 16),
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* User Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>MA</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.userName}>MohammadArfaz Shaik</Text>
              <Text style={styles.userRole}>Captain • Hyderabad (Telangana)</Text>
            </View>
          </View>

          {/* Nav Items List */}
          <View style={styles.navSection}>
            <Text style={styles.sectionHeader}>NAVIGATION</Text>

            {/* Matches */}
            <TouchableOpacity
              style={[
                styles.navItem,
                activeItem === 'matches' ? styles.navItemActive : null,
              ]}
              onPress={() => handleNavigate('/(tabs)')}
            >
              <Icon
                source="trophy-outline"
                size={22}
                color={activeItem === 'matches' ? COLORS.brandTeal : COLORS.textDarkSecondary}
              />
              <Text
                style={[
                  styles.navItemText,
                  activeItem === 'matches' ? styles.navItemTextActive : null,
                ]}
              >
                Matches
              </Text>
            </TouchableOpacity>

            {/* Teams */}
            <TouchableOpacity
              style={[
                styles.navItem,
                activeItem === 'teams' ? styles.navItemActive : null,
              ]}
              onPress={() => handleNavigate('/(tabs)/teams')}
            >
              <Icon
                source="account-group-outline"
                size={22}
                color={activeItem === 'teams' ? COLORS.brandTeal : COLORS.textDarkSecondary}
              />
              <Text
                style={[
                  styles.navItemText,
                  activeItem === 'teams' ? styles.navItemTextActive : null,
                ]}
              >
                Teams & Squads
              </Text>
            </TouchableOpacity>

            {/* Academy */}
            <TouchableOpacity
              style={[
                styles.navItem,
                activeItem === 'academy' ? styles.navItemActive : null,
              ]}
              onPress={() => handleNavigate('/(tabs)/academy')}
            >
              <Icon
                source="school-outline"
                size={22}
                color={activeItem === 'academy' ? COLORS.brandTeal : COLORS.textDarkSecondary}
              />
              <Text
                style={[
                  styles.navItemText,
                  activeItem === 'academy' ? styles.navItemTextActive : null,
                ]}
              >
                Academy
              </Text>
            </TouchableOpacity>

            {/* Create Match */}
            <TouchableOpacity
              style={[
                styles.navItem,
                activeItem === 'create-match' ? styles.navItemActive : null,
              ]}
              onPress={() => handleNavigate('/create-match')}
            >
              <Icon
                source="plus-circle-outline"
                size={22}
                color={activeItem === 'create-match' ? COLORS.brandTeal : COLORS.textDarkSecondary}
              />
              <Text
                style={[
                  styles.navItemText,
                  activeItem === 'create-match' ? styles.navItemTextActive : null,
                ]}
              >
                Start Match
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer & Logout */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Icon source="logout" size={20} color="#DC2626" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>CrickHero MVP v1.0 • Demo Build</Text>
          </View>
        </Animated.View>

        {/* Backdrop press to close (Right Side) */}
        <Animated.View style={[styles.backdropContainer, { opacity: fadeAnim }]}>
          <Pressable style={styles.backdrop} onPress={handleClose} />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdropContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    flex: 1,
  },
  drawerContent: {
    width: '78%',
    maxWidth: 320,
    backgroundColor: COLORS.surfaceWhite,
    height: '100%',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.surfaceWhite,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: 16,
  },
  profileText: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
  },
  userRole: {
    fontSize: 11,
    color: COLORS.textDarkSecondary,
    marginTop: 2,
  },
  navSection: {
    flex: 1,
    paddingTop: 20,
    gap: 6,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textDarkSecondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: '#F0FDFA',
  },
  navItemText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  navItemTextActive: {
    color: COLORS.brandTeal,
    fontWeight: FONT_WEIGHT.bold,
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 16,
    gap: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#DC2626',
  },
  versionText: {
    fontSize: 11,
    color: COLORS.textDarkSecondary,
  },
});
