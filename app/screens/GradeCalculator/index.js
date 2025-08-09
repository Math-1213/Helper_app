import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import GradeCalc from '../components/GradeCalc';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from './styles';

export default function GradeCalcScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    // Estado local para notas da matéria atual (para edição)
    const [currentGrades, setCurrentGrades] = useState(null);

    // Se vier params da lista de matérias (editar)
    useEffect(() => {
        if (route.params?.gradesData) {
            setCurrentGrades(route.params.gradesData);
        }
    }, [route.params?.gradesData]);

    // Função para salvar os dados da matéria
    const handleSave = (rows, average) => {
        // Você pode mandar salvar no SQLite aqui ou navegar pra lista de matérias depois
        console.log('Salvar notas:', rows, average);

        // Aqui, só exemplo: navega pra lista depois de salvar
        navigation.navigate('SubjectsList');
    };

    // Botão para abrir lista de matérias
    const openSubjectsList = () => {
        navigation.navigate('SubjectsList');
    };

    return (
        <View style={styles.container}>
            <GradeCalc
                key={currentGrades ? 'edit' : 'new'} // forçar reset quando mudar
                onSave={handleSave}
                initialData={currentGrades}
            />

            <View style={styles.buttonContainer}>
                <Button title="Open Subjects List" onPress={openSubjectsList} />
            </View>
        </View>
    );
}
