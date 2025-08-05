import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';

const apps = [
  { id: '1', name: 'Calculadora de Hora', usage: 10, screenTitle: "TimeCalculator" },
  { id: '2', name: 'Temporizador de Almoço', usage: 5, screenTitle: "LunchBreakTimer" },
];

const SORT_OPTIONS = {
  AZ: 'A-Z',
  MOST_USED: 'Most Utilized',
};

export default function App() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(SORT_OPTIONS.AZ);

  const filteredApps = apps
    .filter(app => app.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === SORT_OPTIONS.AZ) {
        return a.name.localeCompare(b.name);
      } else {
        return b.usage - a.usage;
      }
    });

  const renderAppItem = ({ item }) => {
    console.log(item)
    return (<TouchableOpacity
      style={styles.appItem}
      onPress={() => navigation.navigate(item.screenTitle)} 
    >
      <Text style={styles.appName}>{item.name}</Text>
    </TouchableOpacity>)
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Helper</Text>
        <TouchableOpacity style={styles.translateButton}>
          <Text>🌐</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <TextInput
          placeholder="Search apps..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <TouchableOpacity
          style={styles.sortSelector}
          onPress={() => {
            setSort(sort === SORT_OPTIONS.AZ ? SORT_OPTIONS.MOST_USED : SORT_OPTIONS.AZ);
          }}
        >
          <Text style={styles.sortSelectorText}>{sort}</Text>
        </TouchableOpacity>
      </View>

      {/* Apps list */}
      <FlatList
        data={filteredApps}
        keyExtractor={item => item.id}
        renderItem={renderAppItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}


