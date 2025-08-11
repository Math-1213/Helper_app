import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import { ModulesActions } from '../../services/database/actions/Modules.actions';

// const apps = [
//   { id: '1', name: 'Calculadora de Hora', usage: 10, screenTitle: "TimeCalculator" },
//   { id: '2', name: 'Temporizador de Almoço', usage: 5, screenTitle: "LunchBreakTimer" },
//   { id: '3', name: 'Calculadora de Médias', usage: 5, screenTitle: "GradeCalcScreen" },
// ];
const defaultModules = [
  { id: 1, name: 'Calculadora de Hora', usage: 0, screen_title: 'TimeCalculator' },
  { id: 2, name: 'Temporizador de Almoço', usage: 0, screen_title: 'LunchBreakTimer' },
  { id: 3, name: 'Calculadora de Médias', usage: 0, screen_title: 'GradeCalcScreen' },
];


const SORT_OPTIONS = {
  AZ: 'A-Z',
  MOST_USED: 'Most Utilized',
};

export default function App() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(SORT_OPTIONS.AZ);
  const [apps, setApps] = useState([])

  useEffect(() => {
    async function init() {
      await ModulesActions.ensureDefaultsExist(defaultModules);
      const modulesFromDB = await ModulesActions.getAll();
      setApps(modulesFromDB);
    }
    init();
  }, []);

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
      onPress={() => navigation.navigate(item.screen_title)}
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


