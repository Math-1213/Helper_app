import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../screens/Home';
import TimeCalculator from '../screens/TimeCalculator'
import LunchBreakTimer from '../screens/LunchBreakTimer'
import LunchTimer from '../screens/LunchBreakTimer/LunchTimer'
import GradeCalc from '../screens/GradeCalculator/GradeCalc';
import GradeCalcEditScreen from '../screens/GradeCalculator/GradleCalcEdit';
import GradeCalcScreen from '../screens/GradeCalculator';
import SubjectsList from '../screens/GradeCalculator/SubjectList';

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="TimeCalculator" component={TimeCalculator} />
        <Stack.Screen name="LunchBreakTimer" component={LunchBreakTimer} />
        <Stack.Screen name="LunchTimer" component={LunchTimer} />
        <Stack.Screen name="GradeCalc" component={GradeCalc} />
        <Stack.Screen name="GradeCalcEditScreen" component={GradeCalcEditScreen} />
        <Stack.Screen name="GradeCalcScreen" component={GradeCalcScreen} />
        <Stack.Screen name="SubjectsList" component={SubjectsList} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
