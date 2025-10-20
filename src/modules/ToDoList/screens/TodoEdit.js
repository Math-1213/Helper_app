import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { updateList } from '../store/slice';
import { persistTodoList } from '../store/register';
import TaskRow from '../components/TaskRow'

export default function EditContainer() {
    const route = useRoute();
    const nav = useNavigation();
    const dispatch = useDispatch();

    const init = route.params?.list || { id: -1, name: '', tasks: [] };
    const [id] = useState(init.id);
    const [name, setName] = useState(init.name || '');
    const [tasks, setTasks] = useState(init.tasks ? [...init.tasks] : []);

    const handleAddTask = () => {
        setTasks([...tasks, { text: '', checked: false }]);
    };

    const handleRemoveTask = (index) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    const handleToggle = (index) => {
        const next = tasks.map((t, i) => (i === index ? { ...t, checked: !t.checked } : t));
        setTasks(next);
    };

    const handleUpdateText = (index, text) => {
        const next = tasks.map((t, i) => (i === index ? { ...t, text } : t));
        setTasks(next);
    };

    const handleSave = () => {
        const updated = { id, name, tasks };
        dispatch(updateList(updated)); // updates redux
        persistTodoList(updated); // persist in realm
        nav.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.label}>Nome da Lista</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nome da lista" />
            <Text style={[styles.label, { marginTop: 12 }]}>Tarefas</Text>

            <FlatList
                data={tasks}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item, index }) => (
                    <TaskRow
                        item={item}
                        index={index}
                        onToggle={handleToggle}
                        onUpdateText={handleUpdateText}
                        onRemove={handleRemoveTask}
                    />
                )}
                ListEmptyComponent={<Text style={styles.empty}>Nenhuma tarefa</Text>}
            />

            <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
                <Text style={styles.addButtonText}>＋ Adicionar Tarefa</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Salvar</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#111' },
    label: { color: '#fff', fontWeight: 'bold', marginBottom: 6 },
    input: { borderWidth: 1, borderColor: '#444', borderRadius: 6, padding: 10, color: '#fff' },
    taskRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    addButton: { backgroundColor: '#2196f3', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 12 },
    addButtonText: { color: '#fff', fontWeight: 'bold' },
    saveButton: { backgroundColor: '#4caf50', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 18 },
    saveText: { color: '#fff', fontWeight: 'bold' },
    empty: { color: '#777', marginTop: 10, textAlign: 'center' },
});
