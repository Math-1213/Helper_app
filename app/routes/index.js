import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import TimeCalculator from '../screens/TimeCalculator';
import LunchBreakTimer from '../screens/LunchBreakTimer';

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TimeCalculator" component={TimeCalculator} />
        <Stack.Screen name="LunchBreakTimer" component={LunchBreakTimer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
