import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import GradeCalc from './GradeCalc';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from './styles';
import { SubjectsActions } from '../../services/database/actions/Subjects.actions';

export default function GradeCalcScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const [currentGrades, setCurrentGrades] = useState(null);

    useEffect(() => {
        if (route.params?.gradesData) {
            setCurrentGrades(route.params.gradesData);
        }
    }, [route.params?.gradesData]);

    const handleSave = async ({ subjectName, rows, average, modeWeighted }) => {
        if (!subjectName.trim()) {
            alert('Por favor, informe o nome da matéria.');
            return;
        }
        if (!rows.length) {
            alert('Adicione pelo menos um trabalho com nota.');
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
                alert('Matéria atualizada com sucesso!');
            } else {
                console.log(modeWeighted)
                // Insert
                await SubjectsActions.insert({
                    name: subjectName,
                    mode: modeWeighted === true ? 1 : 0,
                    grades,
                });
                alert('Matéria salva com sucesso!');
            }
            navigation.navigate('SubjectsList');
        } catch (error) {
            console.error('Erro ao salvar matéria:', error);
            alert('Erro ao salvar a matéria. Tente novamente.');
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
                <Button title="Abrir Lista de Matérias" onPress={openSubjectsList} color="#4CAF50" />
            </View>
        </View>
    );
}
