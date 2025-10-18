import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  ToastAndroid,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { registerPokemonModule, persistPokemon } from '../store/register';
import { useDispatch } from 'react-redux';
import { addPokemon, removePokemon } from '../store/slice';
import { getPokemonByName } from '../requester/requester';
import PokemonCard from '../components/PokemonCard';
import Icon from 'react-native-vector-icons/Ionicons';
import Core from '../../../core/index';

const { ModuleProvider } = Core.redux;
const { useModuleSelector } = Core.hooks;

export default function PokemonScreenContainer() {
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    (async () => {
      const m = await registerPokemonModule();
      setMeta(m);
    })();
  }, []);

  if (!meta) return <Text style={{ color: '#fff' }}>Carregando módulo Pokémon...</Text>;

  return (
    <ModuleProvider moduleId={meta.moduleId} moduleKey={meta.moduleKey}>
      <PokemonScreen realm={meta.realm} />
    </ModuleProvider>
  );
}

function PokemonScreen({ realm }) {
  const pokes = useModuleSelector(state => state.pokemon?.list || []);
  const dispatch = useDispatch();
  const [name, setName] = useState('');

  const handleSearch = async () => {
    if (!name.trim()) {
      ToastAndroid.show('Digite o nome de um Pokémon!', ToastAndroid.SHORT);
      return;
    }

    const data = await getPokemonByName(name.trim().toLowerCase());
    if (!data) {
      ToastAndroid.show('Pokémon não encontrado!', ToastAndroid.SHORT);
      return;
    }

    dispatch(addPokemon(data));
    persistPokemon(data);
    setName('');
  };

  const handleRemove = (id) => {
    try {
      // Remove do Realm
      realm.write(() => {
        const toDelete = realm.objectForPrimaryKey('Pokemon', id);
        if (toDelete) {
          realm.delete(toDelete);
        }
      });

      // Remove do Redux
      dispatch(removePokemon(id));

      ToastAndroid.show('Pokémon removido da lista!', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Erro ao remover Pokémon do Realm:', error);
      ToastAndroid.show('Erro ao remover Pokémon!', ToastAndroid.SHORT);
    }
  };


  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Pokédex</Text>

        <View style={styles.searchBox}>
          <Icon name="search" size={22} color="#333" />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Pikachu"
            placeholderTextColor="#888"
            style={styles.input}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Icon name="add-circle" size={28} color="#ffcc00" />
          </TouchableOpacity>
        </View>

        {pokes.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum Pokémon capturado ainda.</Text>
        ) : (
          pokes.map(p => (
            <PokemonCard key={p.id} pokemon={p} onRemove={handleRemove} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#111',
  },
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'android' ? 40 : 20, // espaço extra pra barra
  },
  title: {
    color: '#ffcc00',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 8,
    fontSize: 16,
    color: '#222',
  },
  searchButton: {
    padding: 4,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 30,
  },
});
