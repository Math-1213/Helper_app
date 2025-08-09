import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { SubjectActions } from '../../services/database/actions/Subject.actions'; // Ajuste pro seu caminho real
import styles from './styles';

export default function SubjectsList() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [subjects, setSubjects] = useState([]);

  // Carrega matérias sempre que a tela ficar focada
  useEffect(() => {
    if (isFocused) {
      loadSubjects();
    }
  }, [isFocused]);

  const loadSubjects = async () => {
    try {
      const list = await SubjectActions.getAll(); // Função que retorna lista de matérias
      setSubjects(list);
    } catch (error) {
      console.error('Erro ao carregar matérias:', error);
    }
  };

  const handleEdit = (subject) => {
    navigation.navigate('GradeCalcScreen', {
      gradesData: subject.grades, // ou o formato que você salvar as notas
      subjectId: subject.id,
    });
  };

  const handleDelete = (subject) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja excluir a matéria "${subject.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await SubjectActions.delete(subject.id);
              loadSubjects(); // Recarrega lista após exclusão
            } catch (err) {
              console.error('Erro ao excluir matéria:', err);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleEdit(item)}
      onLongPress={() => handleDelete(item)}
    >
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={subjects}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma matéria salva.</Text>
        }
      />
    </View>
  );
}


