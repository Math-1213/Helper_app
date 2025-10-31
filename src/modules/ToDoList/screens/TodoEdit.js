import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { updateList } from '../store/slice';
import { persistTodoList } from '../store/register';
import TaskRow from '../components/TaskRow';

export default function EditContainer() {
    const route = useRoute();
    const nav = useNavigation();
    const dispatch = useDispatch();

    const init = route.params?.list || { id: -1, name: '', tasks: [] };
    const [id] = useState(init.id);
    const [name, setName] = useState(init.name || '');
    const [tasks, setTasks] = useState(init.tasks ? [...init.tasks] : []);
    const [address, setAddress] = useState(''); // apenas ip:porta

    const handleAddTask = () => setTasks([...tasks, { text: '', checked: false }]);

    const handleRemoveTask = (index) => setTasks(tasks.filter((_, i) => i !== index));

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
        dispatch(updateList(updated)); // atualiza redux
        persistTodoList(updated); // persiste em Realm
        nav.goBack();
    };

    const handleSend = async () => {
        if (!address) {
            Alert.alert('Erro', 'Digite um endereço IP e porta (ex: 192.168.0.10:5000)');
            return;
        }

        // Normaliza o endereço e monta o endpoint final
        let cleanAddress = address.trim().toLowerCase();
        cleanAddress = cleanAddress.replace(/^https?:\/\//, ''); // remove http:// ou https:// se o usuário digitar

        const url = `http://${cleanAddress}/push`; // endpoint padrão
        const payload = { name, tasks };

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    id: id.toString(), // header com o ID
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json().catch(() => ({}));

            Alert.alert('Sucesso', 'Lista enviada com sucesso!');
            console.log('Resposta do servidor:', result);
        } catch (err) {
            console.error(err);
            Alert.alert('Falha no envio', 'Não foi possível enviar os dados. Verifique o IP e a porta.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.label}>Nome da Lista</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nome da lista"
                placeholderTextColor="#666"
            />

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
                <Text style={styles.saveText}>Salvar Localmente</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 20 }]}>Enviar para Servidor</Text>
            <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Ex: 192.168.0.10:5000"
                placeholderTextColor="#666"
                autoCapitalize="none"
                keyboardType="default"
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Text style={styles.sendText}>📤 Enviar Lista</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#0d0d0d' },
    label: { color: '#fff', fontWeight: 'bold', marginBottom: 6, fontSize: 16 },
    input: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 16,
        backgroundColor: '#1b1b1b',
    },
    addButton: {
        backgroundColor: '#2196f3',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 14,
        elevation: 3,
    },
    addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    saveButton: {
        backgroundColor: '#4caf50',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        elevation: 4,
    },
    saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    sendButton: {
        backgroundColor: '#ff9800',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
        elevation: 3,
    },
    sendText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    empty: { color: '#777', marginTop: 10, textAlign: 'center', fontStyle: 'italic' },
});
