// import { useRouter } from 'expo-router';
// import React from 'react';
// import {
//   FlatList,
//   Pressable,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
// } from 'react-native';

// type Match = {
//   matchId: string;
//   team1Name: string;
//   team2Name: string;
//   runs: number;
//   wickets: number;
//   overs: number;
//   status: string;
// };

// const matches: Match[] = [
//   {
//     matchId: 'M1001',
//     team1Name: 'RCB',
//     team2Name: 'CSK',
//     runs: 186,
//     wickets: 4,
//     overs: 18.3,
//     status: 'LIVE',
//   },
//   {
//     matchId: 'M1002',
//     team1Name: 'India',
//     team2Name: 'Australia',
//     runs: 142,
//     wickets: 7,
//     overs: 17.0,
//     status: 'IN PROGRESS',
//   },
//   {
//     matchId: 'M1003',
//     team1Name: 'SRH',
//     team2Name: 'MI',
//     runs: 201,
//     wickets: 6,
//     overs: 20.0,
//     status: 'COMPLETED',
//   },
// ];

// export default function MatchListScreen() {
//   const router = useRouter();

//   const renderItem = ({ item }: { item: Match }) => (
//     <Pressable
//       style={styles.card}
//       onPress={() =>
//         router.push({
//           pathname: '/match/[matchId]',
//           params: {
//             matchId: item.matchId,
//             team1Name: item.team1Name,
//             team2Name: item.team2Name,
//             runs: String(item.runs),
//             wickets: String(item.wickets),
//             overs: String(item.overs),
//             status: item.status,
//           },
//         })
//       }
//     >
//       <View style={styles.rowBetween}>
//         <Text style={styles.matchTitle}>
//           {item.team1Name} vs {item.team2Name}
//         </Text>
//         <View style={[styles.badge, item.status !== 'LIVE' && styles.badgeMuted]}>
//           <Text style={styles.badgeText}>{item.status}</Text>
//         </View>
//       </View>

//       <Text style={styles.score}>
//         {item.runs}/{item.wickets}
//       </Text>

//       <Text style={styles.overs}>{item.overs} overs</Text>
//       <Text style={styles.matchId}>Match ID: {item.matchId}</Text>
//     </Pressable>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.headerBlock}>
//         <Text style={styles.header}>CrickHero MVP</Text>
//         <Text style={styles.subHeader}>Live & recent matches</Text>
//       </View>

//       <Pressable
//         style={styles.createButton}
//         onPress={() => router.push('/create-match')}
//       >
//         <Text style={styles.createButtonText}>+ Create Match</Text>
//       </Pressable>

//       <FlatList<Match>
//         data={matches}
//         keyExtractor={(item) => item.matchId}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0B1220',
//     paddingHorizontal: 16,
//   },
//   headerBlock: {
//     marginTop: 18,
//     marginBottom: 18,
//   },
//   header: {
//     color: '#FFFFFF',
//     fontSize: 28,
//     fontWeight: '800',
//   },
//   subHeader: {
//     color: '#94A3B8',
//     fontSize: 14,
//     marginTop: 4,
//   },
//   createButton: {
//     backgroundColor: '#2563EB',
//     borderRadius: 16,
//     paddingVertical: 14,
//     alignItems: 'center',
//     marginBottom: 18,
//   },
//   createButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '800',
//   },
//   listContent: {
//     paddingBottom: 30,
//   },
//   card: {
//     backgroundColor: '#111C34',
//     borderRadius: 18,
//     padding: 18,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#1E293B',
//   },
//   rowBetween: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   matchTitle: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '700',
//     flex: 1,
//     paddingRight: 12,
//   },
//   badge: {
//     backgroundColor: '#DC2626',
//     borderRadius: 999,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },
//   badgeMuted: {
//     backgroundColor: '#334155',
//   },
//   badgeText: {
//     color: '#FFFFFF',
//     fontSize: 11,
//     fontWeight: '700',
//   },
//   score: {
//     color: '#22C55E',
//     fontSize: 34,
//     fontWeight: '900',
//     marginTop: 18,
//   },
//   overs: {
//     color: '#E2E8F0',
//     fontSize: 15,
//     marginTop: 6,
//   },
//   matchId: {
//     color: '#64748B',
//     fontSize: 13,
//     marginTop: 10,
//   },
// });

import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { AppDrawer } from '../components/AppDrawer';
import { fetchMatches, Match } from '../src/api/matchApi';

export default function MatchListScreen() {
  const router = useRouter();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);

  const loadMatches = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const data = await fetchMatches();
      setMatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [loadMatches])
  );

  const renderItem = ({ item }: { item: Match }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/match/[matchId]',
          params: {
            matchId: item.matchId,
            team1Name: item.team1Name,
            team2Name: item.team2Name,
            runs: String(item.runs),
            wickets: String(item.wickets),
            overs: String(item.overs),
            status: item.status,
          },
        })
      }
    >
      <View style={styles.rowBetween}>
        <Text style={styles.matchTitle}>
          {item.team1Name} vs {item.team2Name}
        </Text>
        <View style={[styles.badge, item.status !== 'LIVE' && styles.badgeMuted]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.score}>
        {item.runs}/{item.wickets}
      </Text>

      <Text style={styles.overs}>{item.overs} overs</Text>
      <Text style={styles.matchId}>Match ID: {item.matchId}</Text>
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading matches...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadMatches}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBlock}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setDrawerVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon source="menu" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextGroup}>
            <Text style={styles.header}>CrickHero MVP</Text>
            <Text style={styles.subHeader}>Live & recent matches</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={styles.createButton}
        onPress={() => router.push('/create-match')}
      >
        <Text style={styles.createButtonText}>+ Create Match</Text>
      </Pressable>

      <FlatList<Match>
        data={matches}
        keyExtractor={(item) => item.matchId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No matches found</Text>
            <Text style={styles.emptySubText}>Create your first match to get started</Text>
          </View>
        }
      />

      <AppDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeItem="matches"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    paddingHorizontal: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBlock: {
    marginTop: 18,
    marginBottom: 18,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#162344',
  },
  headerTextGroup: {
    flex: 1,
  },
  header: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  subHeader: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
  },
  createButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#111C34',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    paddingRight: 12,
  },
  badge: {
    backgroundColor: '#DC2626',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeMuted: {
    backgroundColor: '#334155',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  score: {
    color: '#22C55E',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 18,
  },
  overs: {
    color: '#E2E8F0',
    fontSize: 15,
    marginTop: 6,
  },
  matchId: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 10,
  },
  loadingText: {
    color: '#CBD5E1',
    marginTop: 12,
    fontSize: 15,
  },
  errorText: {
    color: '#F87171',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyBox: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubText: {
    color: '#94A3B8',
    marginTop: 6,
    fontSize: 14,
  },
});