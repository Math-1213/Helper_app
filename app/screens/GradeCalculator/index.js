import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import GradeCalc from './GradeCalc';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from './styles';
import { SubjectsActions } from '../../services/database/actions/Subjects.actions';
import { useTranslation } from 'react-i18next';

export default function GradeCalcScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const route = useRoute();

    const [currentGrades, setCurrentGrades] = useState(null);

    useEffect(() => {
        if (route.params?.gradesData) {
            setCurrentGrades(route.params.gradesData);
        }
    }, [route.params?.gradesData]);

    const handleSave = async ({ subjectName, rows, average, modeWeighted }) => {
        if (!subjectName.trim()) {
            alert(t('gradeCalc.alerts.noSubject'));
            return;
        }
        if (!rows.length) {
            alert(t('gradeCalc.alerts.noRow'));
            return;
        }

        // Preparar os dados para salvar (filtrando linhas válidas)
        const grades = rows
            .filter(r => r.name.trim() !== '' && r.grade !== '')
            .map(r => ({
                name: r.name.trim(),
                weight: r.weight.trim() === '' ? 0 : parseFloat(r.weight),
                score: parseFloat(r.grade) || 0,
            }));

        try {
            if (currentGrades && currentGrades.id) {
                // Update
                await SubjectsActions.update({
                    id: currentGrades.id,
                    name: subjectName,
                    mode: modeWeighted === true ? 1 : 0,
                    grades,
                });
                alert(t('gradeCalc.alerts.sucessUpdate'));
            } else {
                console.log(modeWeighted)
                // Insert
                await SubjectsActions.insert({
                    name: subjectName,
                    mode: modeWeighted === true ? 1 : 0,
                    grades,
                });
                alert(t('gradeCalc.alerts.sucessInsert'));
            }
            navigation.navigate('SubjectsList');
        } catch (error) {
            console.error('Erro ao salvar matéria:', error);
            alert(t('gradeCalc.alerts.failChange'));
        }
    };

    const openSubjectsList = () => {
        navigation.navigate('SubjectsList');
    };

    return (
        <View style={styles.container}>
            <GradeCalc
                key={currentGrades ? 'edit' : 'new'}
                onSave={handleSave}
                initialData={currentGrades}
            />

            <View style={styles.buttonContainer}>
                <Button title={t('gradeCalc.openList')} onPress={openSubjectsList} color="#4CAF50" />
            </View>
        </View>
    );
}
