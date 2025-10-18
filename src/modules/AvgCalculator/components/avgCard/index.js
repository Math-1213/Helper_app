import React from 'react';
import style from './styles'
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function AvgCard({ subject, onEdit, onDelete }) {

  const calculateAverage = () => {
    if (subject.type === 'normal') {
      const sum = subject.grades.reduce((a, b) => a + b, 0);
      return subject.grades.length ? (sum / subject.grades.length).toFixed(2) : 0;
    } else { // ponderada
      const totalWeight = subject.weights.reduce((a,b)=>a+b,0);
      if (!totalWeight) return 0;
      const sum = subject.grades.reduce((a,b,i)=>a + b * subject.weights[i],0);
      return (sum / totalWeight).toFixed(2);
    }
  };

  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{subject.name}</Text>
        <Text style={styles.info}>Média: {calculateAverage()}</Text>
        <Text style={styles.info}>Faltam {subject.grades.length < 5 ? 5 - subject.grades.length : 0} notas</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit}><Icon name="edit" size={24} color="#fff" /></TouchableOpacity>
        <TouchableOpacity onPress={onDelete}><Icon name="delete" size={24} color="#ff5555" /></TouchableOpacity>
      </View>
    </View>
  );
}
