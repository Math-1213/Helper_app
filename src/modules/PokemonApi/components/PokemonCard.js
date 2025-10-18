// src/screens/components/PokemonCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function PokemonCard({ pokemon, onRemove }) {

  function UpperCaseFirst(texto) {
    if (!texto) {
      return "";
    }
    if (typeof texto !== 'string' || !texto.length) {
      return texto; 
    }
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{pokemon.name.toUpperCase()}</Text>

        {onRemove && (
          <TouchableOpacity onPress={() => onRemove(pokemon.id)} style={styles.removeButton}>
            <Icon name="delete" size={22} color="#ff5555" />
          </TouchableOpacity>
        )}
      </View>

      <Image source={{ uri: pokemon.sprite }} style={styles.image} />

      <View style={styles.infoBox}>
        <Text style={styles.info}>Tipo: {UpperCaseFirst(pokemon.type)}</Text>
        <Text style={styles.info}>Altura: {pokemon.height}</Text>
        <Text style={styles.info}>Peso: {pokemon.weight}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    marginVertical: 10,
    padding: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  header: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    color: '#ffcc00',
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 6,
    borderRadius: 50,
    backgroundColor: '#2a0000',
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  infoBox: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 5,
  },
  info: {
    color: '#ccc',
    fontSize: 14,
    marginVertical: 2,
  },
});
