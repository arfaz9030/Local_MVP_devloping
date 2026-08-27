import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { getTeams } from '../src/api/matchApi'; // adjust path if your api file is elsewhere
import { COLORS } from '../src/theme/color';
import { FONT_SIZE, FONT_WEIGHT } from '../src/theme/typography';

type Player = {
  id: string;
  name: string;
  jerseyNumber?: number;
  role?: string;
};

type Team = {
    id: string;
    name: string;
    captainName: string;
  players: Player[];
};

export const TeamsScreen: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
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
            players: (team.players || []).map((p: any) => ({
              id: String(p.id),
              name: p.name,
              jerseyNumber: p.jerseyNumber,
              role: p.role,
            })),
                    }))
                );
            } catch (e) {
                setError('Could not load teams. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadTeams();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Teams</Text>
                <View style={styles.centerBlock}>
                    <Text style={styles.infoText}>Loading teams...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Teams</Text>
                <View style={styles.centerBlock}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Teams</Text>
            <FlatList
                data={teams}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.teamName}>{item.name}</Text>
                        <Text style={styles.captain}>Captain: {item.captainName}</Text>

            <Text style={styles.playersTitle}>
              Players ({item.players.length})
            </Text>

            {item.players.length === 0 ? (
              <Text style={styles.playerLine}>No players added yet.</Text>
            ) : (
              item.players.map((p) => (
                <Text key={p.id} style={styles.playerLine}>
                  #{p.jerseyNumber ?? '-'} · {p.name}
                  {p.role ? ` (${p.role})` : ''}
                </Text>
              ))
            )}
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.centerBlock}>
                        <Text style={styles.infoText}>No teams available.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    title: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },

    card: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: COLORS.card,
        marginBottom: 8,
    },

    teamName: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        color: COLORS.textPrimary,
    },

    captain: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
        marginTop: 2,
    },

  playersTitle: {
    marginTop: 8,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },

  playerLine: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

    centerBlock: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    infoText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textMuted,
    },

    errorText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.errorText,
    },
});

export default TeamsScreen;