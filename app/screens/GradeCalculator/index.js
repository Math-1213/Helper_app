import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import GradeCalc from './GradeCalc';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from './styles';

export default function GradeCalcScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const [currentGrades, setCurrentGrades] = useState(null);

    useEffect(() => {
        if (route.params?.gradesData) {
            setCurrentGrades(route.params.gradesData);
        }
    }, [route.params?.gradesData]);

    const handleSave = (rows, average) => {
        console.log('Salvar notas:', rows, average);
        navigation.navigate('SubjectsList');
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
