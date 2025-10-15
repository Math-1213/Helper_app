import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function PokemonCard({ pokemon }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: pokemon.sprite }} style={styles.image} />
      <Text style={styles.name}>{pokemon.name}</Text>
      <Text style={styles.info}>Tipo: {pokemon.type}</Text>
      <Text style={styles.info}>Altura: {pokemon.height}</Text>
      <Text style={styles.info}>Peso: {pokemon.weight}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#222',
    borderRadius: 10,
    marginVertical: 10,
    padding: 15,
    alignItems: 'center',
  },
  image: { width: 100, height: 100 },
  name: { fontSize: 18, color: '#fff', marginTop: 5 },
  info: { color: '#ccc', fontSize: 14 },
});
