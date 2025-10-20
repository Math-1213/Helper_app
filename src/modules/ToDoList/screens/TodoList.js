import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerTodoListModule, persistTodoList, deleteTodoListById } from '../store/register';
import { useDispatch } from 'react-redux';
import { addList } from '../store/slice';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Core from '../../../core';
import TodoListCard from '../components/TodoCard';

const { ModuleProvider } = Core.redux;
const { useModuleSelector } = Core.hooks;

export default function ListContainer() {
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    (async () => {
      const m = await registerTodoListModule();
      setMeta(m);
    })();
  }, []);

  if (!meta) return <Text style={{ color: '#fff' }}>Carregando módulo...</Text>;

  return (
    <ModuleProvider moduleId={meta.moduleId} moduleKey={meta.moduleKey}>
      <TodoListsScreen realm={meta.realm} />
    </ModuleProvider>
  );
}

function TodoListsScreen({ realm }) {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const lists = useModuleSelector(state => state.todolist?.list || []);

  function nextId() {
    return lists.length > 0 ? Math.max(...lists.map(l => l.id)) + 1 : 1;
  }

  function handleAddList() {
    const id = nextId();
    const newList = { id, name: `Lista ${id}`, tasks: [] };
    dispatch(addList(newList));
    persistTodoList(newList);
    navigation.navigate('TodoEdit', { list: newList });
  }

  function handleEdit(list) {
    navigation.navigate('TodoEdit', { list });
  }

  function handleDelete(listId) {
    if (!isFocused) return; 
    Alert.alert(
      'Excluir lista',
      'Tem certeza que deseja excluir esta lista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteTodoListById(listId)
        }
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={lists}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TodoListCard
            list={item}
            onPress={() => handleEdit(item)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma lista criada.</Text>}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddList}>
        <Text style={styles.addButtonText}>＋ Nova Lista</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#111' },
  empty: { color: '#777', textAlign: 'center', marginTop: 30 },
  addButton: {
    backgroundColor: '#2196f3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
