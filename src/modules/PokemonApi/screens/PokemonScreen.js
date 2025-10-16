import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, ToastAndroid } from 'react-native';
import { registerPokemonModule, persistPokemon } from '../store/register';
import { useDispatch } from 'react-redux';
import { addPokemon } from '../store/slice';
import { getPokemonByName } from '../requester/requester';
import PokemonCard from '../components/PokemonCard';
import Core from '../../../core/index';

const { ModuleProvider } = Core.redux
const { useModuleSelector } = Core.hooks

export default function PokemonScreenContainer() {
  const [meta, setMeta] = useState(null);

  useEffect(() => {
      (async () => {
        const m = await registerPokemonModule();
        setMeta(m);
      })();
  }, []);

  if (!meta) return <Text>Carregando módulo Pokémon...</Text>;

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
    const data = await getPokemonByName(name);
    console.log(data)
    if (!data) {
      ToastAndroid.show('Pokémon não encontrado!', ToastAndroid.SHORT);
      return;
    }
    dispatch(addPokemon(data));
    persistPokemon(data);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#111', padding: 20 }}>
      <Text style={{ color: '#fff', fontSize: 18 }}>Buscar Pokémon</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Ex: Pikachu"
        style={{ backgroundColor: '#fff', padding: 8, marginVertical: 10, borderRadius: 5 }}
      />
      <Button title="Buscar" onPress={handleSearch} />

      {pokes.map(p => (
        <PokemonCard key={p.id} pokemon={p} />
      ))}
    </ScrollView>
  );
}
