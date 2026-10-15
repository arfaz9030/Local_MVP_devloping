import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Divider, List, Surface, Text } from 'react-native-paper';
import { useAuth } from '../_layout';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header */}
      <Surface style={styles.profileHeader} elevation={1}>
        <View style={styles.avatarContainer}>
          <Avatar.Text size={80} label="AM" style={styles.avatar} labelStyle={styles.avatarLabel} />
          <View style={styles.verifiedBadge}>
            <List.Icon icon="check-decagram" color="#007F78" style={styles.badgeIcon} />
          </View>
        </View>
        <Text style={styles.userName}>Arfaz Mohammad</Text>
        <Text style={styles.userRole}>Pro Batsman | Elite CricHeroes Member</Text>
      </Surface>

      {/* Account Info Section */}
      <List.Section style={styles.listSection}>
        <List.Subheader style={styles.subheader}>Account Information</List.Subheader>
        <List.Item
          title="Mobile Number"
          description="+91 7680922101"
          left={(props) => <List.Icon {...props} icon="phone" color="#007F78" />}
        />
        <Divider style={styles.divider} />
        <List.Item
          title="Email Address"
          description="arfaz3838@gmail.com"
          left={(props) => <List.Icon {...props} icon="email" color="#007F78" />}
        />
        <Divider style={styles.divider} />
        <List.Item
          title="Primary Location"
          description="Hyderabad, India"
          left={(props) => <List.Icon {...props} icon="map-marker" color="#007F78" />}
        />
        <Divider style={styles.divider} />
        <List.Item
          title="Member Since"
          description="July 2026"
          left={(props) => <List.Icon {...props} icon="calendar-check" color="#007F78" />}
        />
      </List.Section>

      {/* Preferences & Active Promos */}
      <List.Section style={styles.listSection}>
        <List.Subheader style={styles.subheader}>Cricket & Equipment</List.Subheader>
        <List.Item
          title="Willow Bat Customizer"
          description="Premium English Willow Grade-1 Active"
          left={(props) => <List.Icon {...props} icon="cricket" color="#007F78" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider style={styles.divider} />
        <List.Item
          title="Batting Stance Preference"
          description="Right-hand top-order batsman"
          left={(props) => <List.Icon {...props} icon="run-fast" color="#ffa000" />}
          right={(props) => <List.Icon {...props} icon="pencil-outline" />}
        />
      </List.Section>

      {/* Support & Legal */}
      <List.Section style={styles.listSection}>
        <List.Subheader style={styles.subheader}>Support & Settings</List.Subheader>
        <List.Item
          title="Help & Support"
          description="Contact support or read FAQs"
          left={(props) => <List.Icon {...props} icon="help-circle" color="#757575" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider style={styles.divider} />
        <List.Item
          title="Terms of Service & Privacy"
          description="Read our latest compliance documents"
          left={(props) => <List.Icon {...props} icon="file-document-outline" color="#757575" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
        />
      </List.Section>

      {/* Sign Out Button */}
      <Button
        mode="outlined"
        onPress={() => {
          logout();
          router.replace('/onboarding');
        }
        }
        style={styles.logoutBtn}
        textColor="#DC2626"
        labelStyle={styles.logoutBtnLabel}
        icon="logout"
      >
        Sign Out / Reset Simulator
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 30,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#007F78',
  },
  avatarLabel: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    margin: 0,
    padding: 0,
    width: 24,
    height: 24,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  userRole: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  listSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subheader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    backgroundColor: '#E2E8F0',
    height: 1,
  },
  logoutBtn: {
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#DC2626',
  },
  logoutBtnLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});