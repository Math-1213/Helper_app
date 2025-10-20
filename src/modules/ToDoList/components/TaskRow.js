import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function TaskRow({ item, index, onToggle, onUpdateText, onRemove }) {
    return (
        <View style={styles.taskRow}>
            <Switch value={!!item.checked} onValueChange={() => onToggle(index)} />
            <TextInput
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
                value={item.text}
                onChangeText={(text) => onUpdateText(index, text)}
                placeholder="Texto da tarefa"
                placeholderTextColor="#777"
            />
            <TouchableOpacity onPress={() => onRemove(index)}>
                <MaterialIcons name="delete" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    taskRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#444', borderRadius: 6, padding: 10, color: '#fff' },
});