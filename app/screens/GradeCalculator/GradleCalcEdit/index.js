import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import GradeCalc from '../../components/GradeCalc'; // Ajuste o caminho conforme seu projeto
import { SubjectActions } from '../../services/database/actions/Subject.actions';
import styles from './styles';

export default function GradeCalcEditScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Espera receber { subjectId, subjectName, gradesData } via params
  const { subjectId, subjectName, gradesData } = route.params || {};

  const [name, setName] = useState(subjectName || '');
  const [grades, setGrades] = useState(gradesData || []);

  // Função chamada pelo componente GradeCalc para atualizar as notas
  const handleGradesChange = (updatedGrades) => {
    setGrades(updatedGrades);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Digite o nome da matéria');
      return;
    }

    if (grades.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma nota');
      return;
    }

    try {
      const payload = {
        id: subjectId,
        name: name.trim(),
        grades, // array de { name, weight, score }
      };

      await SubjectActions.update(payload); // Função que atualiza matéria no SQLite

      Alert.alert('Sucesso', 'Matéria atualizada com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Erro ao salvar matéria:', error);
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.header}>
        <Text style={styles.label}>Nome da Matéria</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Digite o nome da matéria"
        />
      </View>

      <GradeCalc grades={grades} onChange={handleGradesChange} />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
        <Text style={styles.saveButtonText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}