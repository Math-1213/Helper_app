import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// import HomeScreen from "../screens/HomeScreen";
import PokemonScreen from "../../modules/moduleTest/screens";

const Stack = createNativeStackNavigator();

export default function Router() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="test"
        screenOptions={{
          headerStyle: { backgroundColor: "#121212" },
          headerTintColor: "#fff",
          contentStyle: { backgroundColor: "#1c1c1c" },
        }}
      >
        {/* Telas internas do sistema */}
        {/* <Stack.Screen name="Home" component={HomeScreen} /> */}

        {/* Telas dos módulos */}
        <Stack.Screen name="test" component={PokemonScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
