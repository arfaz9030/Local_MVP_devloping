import { getToken, registerUnauthorizedHandler, removeToken } from '@/src/auth/tokenService';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { PaperProvider } from 'react-native-paper';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => { },
  logout: () => { },
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getToken();

        setIsAuthenticated(Boolean(token));
      } catch (error) {
        console.error('Failed to restore authentication session:', error);
        setIsAuthenticated(false);
      } finally {
        setIsRestoringSession(false);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    if (isRestoringSession) {
      return;
    }

    const inTabsGroup = segments[0] === '(tabs)';
    const isOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated && inTabsGroup) {
      router.replace('/onboarding');
    }

    if (isAuthenticated && isOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isRestoringSession, segments, router]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await removeToken();
    setIsAuthenticated(false);
  };
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setIsAuthenticated(false);
    });
  }, []);
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <PaperProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0B1220',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '700',
            },
            contentStyle: {
              backgroundColor: '#0B1220',
            },
          }}
        >
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />

          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />

          <Stack.Screen
            name="create-match"
            options={{
              title: 'Create Match',
            }}
          />

          <Stack.Screen
            name="match/[matchId]"
            options={{
              title: 'Match Detail',
            }}
          />
        </Stack>
      </PaperProvider>
    </AuthContext.Provider>
  );
}
