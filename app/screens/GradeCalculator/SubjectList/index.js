import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { SubjectsActions } from '../../../services/database/actions/Subjects.actions'; // Import corrigido
import styles from './styles';
import { useTranslation } from 'react-i18next';

export default function SubjectsList() {
  const navigation = useNavigation();
  const { t } = useTranslation();
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
      // console.log("Returned From DB: ", list)
      setSubjects(list);
    } catch (error) {
      console.error('Erro ao carregar matérias:', error);
    }
  };

  const handleEdit = (subject) => {
    console.log("Subject", subject)
    navigation.navigate('GradeCalcEditScreen', {
      gradesData: subject.grades,
      subjectId: subject.id,
      subjectName: subject.name,
      weightMode: subject.weightMode
    });
  };

  const handleDelete = (subject) => {
    Alert.alert(
      t('gradeCalc.confirmDelete.confirmDelete'),
      t('gradeCalc.confirmDelete.confirmDeleteSubject', { subjectName: subject.name }),
      [
        { text: t('gradeCalc.confirmDelete.cancel'), style: 'cancel' },
        {
          text: t('gradeCalc.confirmDelete.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await SubjectsActions.remove(subject.id);
              loadSubjects();
            } catch (err) {
              console.error(t('gradeCalc.alerts.failDelete'), err);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const grades = item.grades || [];
    const isSumMode = Boolean(Number(item.weightMode)); // true = soma, false = média
    let average = 0;

    if (isSumMode) {
      // Soma simples
      grades.forEach(({ score }) => {
        const s = parseFloat(score);
        if (!isNaN(s)) average += s;
      });
    } else {
      // Média ponderada
      let totalWeight = 0;
      grades.forEach(({ weight, score }) => {
        const w = parseFloat(weight);
        const s = parseFloat(score);
        if (!isNaN(w) && !isNaN(s)) {
          totalWeight += w;
          average += s * w;
        }
      });
      average = totalWeight > 0 ? average / totalWeight : 0;
    }

    const modeLabel = isSumMode ? t('gradeCalc.calcMode.sum') : t('gradeCalc.calcMode.avg');

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleEdit(item)}
        onLongPress={() => handleDelete(item)}
      >
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSubtitle}>{t('gradeCalc.current')} {average.toFixed(2)}</Text>
        <Text style={styles.itemSubtitle}>{t('gradeCalc.calcMode.mode')} {modeLabel}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('gradeCalc.subjectList')}</Text>
      <FlatList
        data={subjects}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('gradeCalc.noSubject')}</Text>
        }
      />
    </View>
  );
}
