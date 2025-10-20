import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EditContainer from './TodoEdit'
import ListContainer from './TodoList'

const Stack = createNativeStackNavigator();

export default function GradeCalcRouter() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TodoList"
        component={ListContainer}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TodoEdit"
        component={EditContainer}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}