import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import GradeCalc from '../GradeCalc';
import { SubjectsActions } from '../../../services/database/actions/Subjects.actions';
import styles from './styles';
import { useTranslation } from 'react-i18next';

export default function GradeCalcEditScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const route = useRoute();

  const { subjectId, subjectName, gradesData, weightMode } = route.params || {};

  const [name, setName] = useState(subjectName || '');
  const [grades, setGrades] = useState(gradesData || []);

  const handleGradesChange = async (updatedGrades) => {
    console.log("Updated Grades: ", updatedGrades)
    setGrades(updatedGrades);
    if (!name.trim()) {
      Alert.alert(t('gradeCalc.alerts.noSubject'));
      return;
    }
    if (grades.length === 0) {
      Alert.alert(t('gradeCalc.alerts.noRow'));
      return;
    }

    try {
      const payload = {
        id: subjectId,
        name: updatedGrades.subjectName,
        mode: updatedGrades.modeWeighted,
        grades: updatedGrades.rows,
      };

      await SubjectsActions.update(payload);

      Alert.alert('Sucesso', t('gradeCalc.alerts.sucessUpdate'), [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Erro ao salvar matéria:', error);
      Alert.alert('Erro', t('gradeCalc.alerts.failChange'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <GradeCalc onSave={handleGradesChange} initialData={{
        name: subjectName,
        id: subjectId,
        grades,
        weightMode: !weightMode

      }} />
    </KeyboardAvoidingView>
  );
}