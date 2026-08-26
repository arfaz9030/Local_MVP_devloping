import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddScoreScreen from '../screens/AddScoreScreen';
import CreateMatchScreen from '../screens/CreateMatchScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';
import MatchListScreen from '../screens/MatchListScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MatchList">
        <Stack.Screen name="MatchList" component={MatchListScreen} options={{ title: 'Matches' }} />
        <Stack.Screen name="CreateMatch" component={CreateMatchScreen} options={{ title: 'Create Match' }} />
        <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: 'Match Detail' }} />
        <Stack.Screen name="AddScore" component={AddScoreScreen} options={{ title: 'Add Score' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}