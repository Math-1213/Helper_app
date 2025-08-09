import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { SubjectsActions } from '../../../services/database/actions/Subjects.actions'; // Import corrigido
import styles from './styles';

export default function SubjectsList() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (isFocused) {
      loadSubjects();
    }
  }, [isFocused]);

  const loadSubjects = async () => {
    try {
      const list = await SubjectsActions.getAll();
      setSubjects(list);
    } catch (error) {
      console.error('Erro ao carregar matérias:', error);
    }
  };

  const handleEdit = (subject) => {
    navigation.navigate('GradeCalcScreen', {
      gradesData: subject.grades,
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
              await SubjectsActions.delete(subject.id);
              loadSubjects();
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
