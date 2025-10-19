import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SubjectCard({ subject, onPress }) {
    const { name, grades, type } = subject;

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
            const nameFilled = g.name && g.name.trim() !== '';
            const valueFilled = g.value !== null && g.value !== undefined && g.value !== '';
            const weightFilled = type === 'Ponderada' ? g.weight !== null && g.weight !== undefined && g.weight !== '' : true;

            return nameFilled && valueFilled && weightFilled;
        });
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
});
