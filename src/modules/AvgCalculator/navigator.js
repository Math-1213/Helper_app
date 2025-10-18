import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AvgEditScreenContainer from './screens/avgEditScreen'
import AvgListScreenContainer from './screens/avgListScreen'

const Stack = createNativeStackNavigator();

export default function AvgSubjectsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AvgList"
        component={AvgListScreenContainer}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AvgEdit"
        component={AvgEditScreenContainer}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
