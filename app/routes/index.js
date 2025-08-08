import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../screens/Home';
import TimeCalculator from '../screens/TimeCalculator'
import LunchBreakTimer from '../screens/LunchBreakTimer'
import LunchTimer from '../screens/LunchBreakTimer/LunchTimer'

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="TimeCalculator" component={TimeCalculator} />
        <Stack.Screen name="LunchBreakTimer" component={LunchBreakTimer} />
        <Stack.Screen name="LunchTimer" component={LunchTimer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
