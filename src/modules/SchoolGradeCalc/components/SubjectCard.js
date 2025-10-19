import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { deleteSubjectById } from '../store/register';

export default function SubjectCard({ subject, onPress }) {
    const { name, grades, type, id } = subject;

    function getFinalAvarage() {
        getAllFilled()
        let finalAverage = 0;
        switch (type) {
            case 'Ponderada':
                if (!grades || grades.length === 0) return 0;
                let totalPonderado = 0;
                let somaPesos = 0;

                grades.forEach(g => {
                    const valor = g.value ?? 0;
                    const peso = g.weight ?? 1; // se peso não existir, considera 1
                    totalPonderado += valor * peso;
                    somaPesos += peso;
                });

                finalAverage = somaPesos > 0 ? totalPonderado / somaPesos : 0;
                break;
            default:
                if (!grades || grades.length === 0) return 0;
                const total = grades.reduce((acc, g) => acc + (g.value ?? 0), 0);
                finalAverage = total / grades.length;
                break;
        }
        return finalAverage
    }

    function getAllFilled(grades, type = 'Normal') {
        if (!grades || grades.length === 0) return false;

        return grades.every(g => {
            const valueFilled = g.value !== null && g.value !== undefined && g.value !== '';
            const weightFilled = type === 'Ponderada' ? g.weight !== null && g.weight !== undefined && g.weight !== '' : true;

            if(type = 'Ponderada') return valueFilled && weightFilled;
            return valueFilled;
        });
    }

    function handleDeleteSubject() {
        Alert.alert(
            'Excluir Matéria',
            'Tem certeza que deseja excluir esta matéria?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => deleteSubjectById(id)
                }
            ]
        );
    }

    // Exemplo de uso
    let allFilled = getAllFilled(grades, type);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.row}>
                <Text style={styles.name}>{name || 'Nova Matéria'}</Text>
                <Text style={styles.type}>{type || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.info}>Média Final: {getFinalAvarage()}</Text>
                <Text style={[styles.info, { color: allFilled ? 'green' : 'orange' }]}>
                    {allFilled ? 'Completa' : 'Incompleta'}
                </Text>
            </View>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSubject}>
                <Text style={styles.deleteText}>Excluir</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#333',
        borderRadius: 10,
        padding: 16,
        marginVertical: 8,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    type: { fontSize: 14, color: '#eee' },
    infoRow: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    info: { fontSize: 14, color: '#fff' },
    deleteButton: {
        marginTop: 10,
        alignSelf: 'flex-end',
        backgroundColor: '#b22222',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    deleteText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
});
