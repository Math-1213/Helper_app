import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, ScrollView, Image, StyleSheet } from "react-native";
import { getPokemon, getDoguinho } from "../requester";

export default function PokemonScreen() {
  const [pokemonName, setPokemonName] = useState("");
  const [pokemonData, setPokemonData] = useState(null);
  const [dogUrl, setDogUrl] = useState(null);

  const handleSearch = async () => {
    if (!pokemonName) return;
    const res = await getPokemon(pokemonName.toLowerCase());
    setPokemonData(res);
  };

  const handleDoguinho = async () => {
    const res = await getDoguinho();
    setDogUrl(res.data.message || null); // dependendo da API que você usou
  };

  useEffect(() => {
    console.log("Pokémon:", pokemonData);
    console.log("Dog:", dogUrl);
  }, [pokemonData, dogUrl]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Buscar Pokémon</Text>
      <TextInput
        placeholder="Ex: pikachu"
        value={pokemonName}
        onChangeText={setPokemonName}
        style={styles.input}
      />
      <Button title="Buscar Pokémon" onPress={handleSearch} />
      <Button title="Buscar Doguinho" onPress={handleDoguinho} style={{ marginTop: 20 }} />

      {pokemonData && (
        <Text style={styles.result}>
          {JSON.stringify(pokemonData, null, 2)}
        </Text>
      )}

      {dogUrl && (
        <Image
          source={{ uri: dogUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#121212" },
  title: { fontSize: 18, color: "#fff", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 10, backgroundColor: "#fff" },
  result: { marginTop: 20, fontFamily: "monospace", color: "#fff" },
  image: { width: 200, height: 200, marginTop: 20, alignSelf: "center" },
});
