// modules/pokemon/PokemonScreen.js
import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { ModuleProvider } from '../../../core/redux/ModuleContext';
import { registerPokemonModule, add } from '../store';
import { useModuleSelector } from '../../../core/hooks/useModuleSelector';
import { useDispatch } from 'react-redux';

export default function PokemonScreenContainer() {
  // Register module at mount (or do this during module loader flow)
  const [meta, setMeta] = React.useState(null);
  useEffect(() => {
    (async () => {
      const m = await registerPokemonModule();
      setMeta(m);
    })();
  }, []);

  if (!meta) return <View><Text>Carregando módulo...</Text></View>;

  return (
    <ModuleProvider moduleId={meta.moduleId} moduleKey={meta.moduleKey} config={require('../module.config.json')}>
      <PokemonScreen />
    </ModuleProvider>
  );
}

function PokemonScreen() {
  const pokes = useModuleSelector(state => state.pokemon?.list);
  const dispatch = useDispatch();

  return (
    <View>
      <Text>Pokemons: {pokes?.length || 0}</Text>
      <Button title="Adicionar Pikachu" onPress={() => dispatch(add({ id: Date.now(), name: 'Pikachu' }))} />
    </View>
  );
}



// import React, { useState, useEffect } from "react";
// import { View, Text, TextInput, Button, ScrollView, Image, StyleSheet } from "react-native";
// import { getPokemon, getDoguinho } from "../requester";

// export default function PokemonScreen() {
//   const [pokemonName, setPokemonName] = useState("");
//   const [pokemonData, setPokemonData] = useState(null);
//   const [dogUrl, setDogUrl] = useState(null);

//   const handleSearch = async () => {
//     if (!pokemonName) return;
//     const res = await getPokemon(pokemonName.toLowerCase());
//     setPokemonData(res);
//   };

//   const handleDoguinho = async () => {
//     const res = await getDoguinho();
//     setDogUrl(res.data.message || null); // dependendo da API que você usou
//   };

//   useEffect(() => {
//     console.log("Pokémon:", pokemonData);
//     console.log("Dog:", dogUrl);
//   }, [pokemonData, dogUrl]);

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Buscar Pokémon</Text>
//       <TextInput
//         placeholder="Ex: pikachu"
//         value={pokemonName}
//         onChangeText={setPokemonName}
//         style={styles.input}
//       />
//       <Button title="Buscar Pokémon" onPress={handleSearch} />
//       <Button title="Buscar Doguinho" onPress={handleDoguinho} style={{ marginTop: 20 }} />

//       {pokemonData && (
//         <Text style={styles.result}>
//           {JSON.stringify(pokemonData, null, 2)}
//         </Text>
//       )}

//       {dogUrl && (
//         <Image
//           source={{ uri: dogUrl }}
//           style={styles.image}
//           resizeMode="contain"
//         />
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#121212" },
//   title: { fontSize: 18, color: "#fff", marginBottom: 10 },
//   input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 10, backgroundColor: "#fff" },
//   result: { marginTop: 20, fontFamily: "monospace", color: "#fff" },
//   image: { width: 200, height: 200, marginTop: 20, alignSelf: "center" },
// });
