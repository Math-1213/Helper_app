import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { registerSubjectModule, persistSubject } from '../store/register';
import { useDispatch } from 'react-redux';
import { addSubject, removeSubject } from '../store/slice';
import { useNavigation } from '@react-navigation/native';
import SubjectCard from '../components/SubjectCard';
import Core from '../../../core/index';

const { ModuleProvider } = Core.redux;
const { useModuleSelector } = Core.hooks;

export default function ListContainer() {
    const [meta, setMeta] = useState(null);

    useEffect(() => {
        (async () => {
            const m = await registerSubjectModule();
            setMeta(m);
        })();
    }, []);

    if (!meta) return <Text style={{ color: '#fff' }}>Carregando módulo...</Text>;

    return (
        <ModuleProvider moduleId={meta.moduleId} moduleKey={meta.moduleKey}>
            <SubjectListScreen realm={meta.realm} />
        </ModuleProvider>
    );
}

function SubjectListScreen({ realm }) {
    const navigation = useNavigation();
    const subjects = useModuleSelector(state => state.subject?.list || []);
    const dispatch = useDispatch();

    function handleAddSubject() {
        // Calcula o próximo ID incremental
        const nextId = subjects.length > 0
            ? Math.max(...subjects.map(s => parseInt(s.id))) + 1
            : 1;

        const newSubject = {
            id: nextId,
            name: "",
            type: "Normal",
            grades: []
        };
        console.log("Id: ", nextId)

        dispatch(addSubject(newSubject));
        persistSubject(newSubject);
        navigation.navigate('SubjectEdit', { subject: newSubject });

    }

    function handleEditSubject(sub) {
        console.log(sub, sub.id)
        navigation.navigate('SubjectEdit', { subject: sub });
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={subjects}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SubjectCard subject={item} onPress={() => handleEditSubject(item)} />
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>Nenhuma matéria adicionada.</Text>
                }
            />

            <TouchableOpacity style={styles.addButton} onPress={handleAddSubject}>
                <Text style={styles.addButtonText}>＋ Adicionar Matéria</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#111' },
    empty: { textAlign: 'center', marginTop: 40, color: '#777' },
    addButton: {
        backgroundColor: '#2196f3',
        borderRadius: 25,
        padding: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
