import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function GradeRow({ grade, type, index, onRemove, onUpdate }) {
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
                <MaterialIcons name="delete" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        marginTop: 6,
        color: '#fff',
    },
    gradeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
});