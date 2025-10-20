import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

export default function TodoListCard({ list, onPress, onDelete }) {
    const doneCount = (list.tasks || []).filter(t => t.checked).length;
    const total = (list.tasks || []).length;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.row}>
                <Text style={styles.title}>{list.name || 'Nova Lista'}</Text>
                <Text style={styles.count}>{doneCount}/{total}</Text>
            </View>
            <View style={styles.footer}>
                <Text style={styles.info}>{total === 0 ? 'Sem tarefas' : `${doneCount} concluídas`}</Text>
                <TouchableOpacity onPress={onDelete}>
                    <Text style={styles.delete}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#222', padding: 12, borderRadius: 8, marginVertical: 6 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    count: { color: '#aaa', fontSize: 14 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
    info: { color: '#ccc' },
    delete: { color: 'red', fontSize: 18 }
});
