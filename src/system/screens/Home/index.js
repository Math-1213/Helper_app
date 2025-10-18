// modules/Home/screens/HomeScreen.js
import React from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { screens } from '../../../modules';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Bem-vindo ao App!</Text>
        <Text style={styles.subtitle}>Selecione um módulo:</Text>

        {Object.keys(screens).map((moduleName) => (
          <View key={moduleName} style={styles.buttonWrapper}>
            <Button
              title={moduleName}
              onPress={() => navigation.navigate(moduleName)}
              color="#6200EE"
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 20,
  },
  buttonWrapper: {
    width: '100%',
    marginVertical: 8,
  },
});
