import React, { useState } from 'react';
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

export default function EditContainer({ route }) {
    const subjectParam = route.params?.subject || { id: '', name: '', type: 'Normal', grades: [] };
    return <SubjectEditScreen initSubject={subjectParam} />;
}

function SubjectEditScreen({ initSubject }) {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const subject = initSubject;
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
            if (i !== index) return g; // mantém os outros
            return {
                ...g, // cria um clone do objeto
                [field]: field === 'name'
                    ? value
                    : value === '' ? null : parseFloat(value)
            };
        });
        setGrades(updated);
    };



    const handleSave = () => {
        const updatedSubject = { ...subject, name, type, grades };
        console.log('Salvando matéria:', updatedSubject);

        dispatch(updateSubject(updatedSubject));
        const currentState = Core.redux.store.getState();
        console.log('State completo:', currentState);
        console.log('Lista de subjects:', currentState.subject?.list);

        persistSubject(updatedSubject)
        navigation.goBack();

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

// Subcomponente para cada linha de nota
function GradeRow({ grade, type, index, onRemove, onUpdate }) {
    return (
        <View style={styles.gradeRow}>
            <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={grade.name}
                placeholder="Nome"
                onChangeText={(text) => onUpdate(index, 'name', text)}
            />
            <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={grade.value?.toString()}
                placeholder="Nota"
                keyboardType="numeric"
                onChangeText={(text) => onUpdate(index, 'value', text)}
            />
            {type === 'Ponderada' && (
                <TextInput
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    value={grade.weight?.toString()}
                    placeholder="Peso"
                    keyboardType="numeric"
                    onChangeText={(text) => onUpdate(index, 'weight', text)}
                />
            )}
            <TouchableOpacity onPress={() => onRemove(index)}>
                <Text style={{ color: 'red' }}>🗑</Text>
            </TouchableOpacity>
        </View>
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
