import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function TaskRow({ item, index, onToggle, onUpdateText, onRemove }) {
    return (
        <View style={styles.taskRow}>
            <TouchableOpacity onPress={() => onToggle(index)} style={styles.checkbox}>
                <MaterialIcons
                    name={item.checked ? 'check-box' : 'check-box-outline-blank'}
                    size={26}
                    color={item.checked ? '#4caf50' : '#777'}
                />
            </TouchableOpacity>

            <TextInput
                style={[
                    styles.input,
                    {
                        flex: 1,
                        marginLeft: 8,
                        textDecorationLine: item.checked ? 'line-through' : 'none',
                        color: item.checked ? '#999' : '#fff',
                    },
                ]}
                value={item.text}
                onChangeText={(text) => onUpdateText(index, text)}
                placeholder="Texto da tarefa"
                placeholderTextColor="#666"
                editable={!item.checked} // bloqueia edição se estiver marcada
            />

            <TouchableOpacity onPress={() => onRemove(index)} style={styles.deleteButton}>
                <MaterialIcons name="delete" size={22} color="#ff5252" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#1b1b1b',
        borderRadius: 8,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    checkbox: {
        padding: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 15,
    },
    deleteButton: {
        marginLeft: 8,
        padding: 4,
    },
});
