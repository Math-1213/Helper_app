import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EditCountainer from './SubjectEdit'
import ListContainer from './SubjectsList'

const Stack = createNativeStackNavigator();

export default function GradeCalcRouter() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SubjectList"
        component={ListContainer}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SubjectEdit"
        component={EditCountainer}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}