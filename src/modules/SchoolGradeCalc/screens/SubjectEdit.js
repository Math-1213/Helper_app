import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { persistSubject } from '../store/register';
import { useDispatch } from 'react-redux';
import { updateSubject } from '../store/slice';
import Core from '../../../core';
import GradeRow from '../components/GradeRow';

export default function EditContainer({ route }) {
    const subjectParam = route.params?.subject || { id: '', name: '', type: 'Normal', grades: [] };
    return <SubjectEditScreen initSubject={subjectParam} />;
}

function SubjectEditScreen({ initSubject }) {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [subject, setSubject] = useState(initSubject || null);
    const [id, setId] = useState(initSubject?.id || -1);
    const [name, setName] = useState(initSubject?.name || '');
    const [type, setType] = useState(initSubject?.type || 'Normal');
    const [grades, setGrades] = useState(initSubject?.grades || []);

    const handleTypeChange = (newType) => {
        setType(newType);
        setGrades(
            grades.map((g) => ({
                ...g,
                weight: newType === 'Ponderada' ? g.weight ?? 1 : null,
            }))
        );
    };

    const handleAddGrade = () => {
        setGrades([...grades, { name: '', value: null, weight: type === 'Ponderada' ? 1 : null }]);
    };

    const handleRemoveGrade = (index) => {
        setGrades(grades.filter((_, i) => i !== index));
    };

    const handleUpdateGrade = (index, field, value) => {
        const updated = grades.map((g, i) => {
            if (i !== index) return g;
            return {
                ...g,
                [field]: value // mantém como string
            };
        });
        setGrades(updated);
    };

    const handleSave = () => {
        const numberGrades = grades.map(g => ({
            name: g.name,
            value: g.value ? parseFloat(g.value.toString().replace(',', '.')) : null,
            weight: g.weight ? parseFloat(g.weight.toString().replace(',', '.')) : null
        }));

        const updatedSubject = { ...subject, id, name, type, grades:numberGrades };
        console.log('Salvando matéria:', updatedSubject, subject);
        try {
            if (id < 0) throw new Error("Algo deu Errado!!");

            dispatch(updateSubject(updatedSubject));
            persistSubject(updatedSubject)
            navigation.goBack();
        } catch (error) {
            console.warn(error)
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.label}>Nome da Matéria</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Digite o nome"
            />

            <Text style={styles.label}>Tipo de Média</Text>
            <View style={styles.row}>
                {['Normal', 'Ponderada'].map((opt) => (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.typeButton, type === opt && styles.typeSelected]}
                        onPress={() => handleTypeChange(opt)}
                    >
                        <Text style={styles.typeText}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Notas</Text>
            <View style={styles.gradesContainer}>
                <FlatList
                    data={grades}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={({ item, index }) => (
                        <GradeRow
                            grade={item}
                            type={type}
                            index={index}
                            onRemove={handleRemoveGrade}
                            onUpdate={handleUpdateGrade}
                        />
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>Nenhuma nota adicionada.</Text>}
                />

                <TouchableOpacity style={styles.addGradeButton} onPress={handleAddGrade}>
                    <Text style={styles.addGradeText}>＋ Adicionar Nota</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Salvar</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#111' },
    label: { fontWeight: 'bold', fontSize: 16, marginTop: 12, color: '#fff' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        marginTop: 6,
        color: '#fff',
    },
    row: { flexDirection: 'row', marginVertical: 8 },
    typeButton: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    typeSelected: { backgroundColor: '#2196f3', borderColor: '#2196f3' },
    typeText: { color: '#fff' },
    gradeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    addGradeButton: {
        backgroundColor: '#2196f3',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 10,
    },
    addGradeText: { color: '#fff' },
    saveButton: {
        backgroundColor: '#4caf50',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    empty: { textAlign: 'center', marginTop: 20, color: '#777' },
    gradesContainer: {
        flex: 1,          // ocupa espaço disponível
        marginBottom: 16, // deixa distância do botão de salvar
    },

});