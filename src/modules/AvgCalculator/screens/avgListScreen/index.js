import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, ToastAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { setSubjects, removeSubject, updateSubjects, deleteSubject } from '../../store/slice';
import { registerModule, persistSubject } from '../../store/register';
import AvgCard from '../../components/avgCard'
import Core from '../../../../core/index';
import { useNavigation } from '@react-navigation/native';
import avgEditScreen from '../avgEditScreen'

const { ModuleProvider } = Core.redux
const { useModuleSelector } = Core.hooks

export default function AvgListScreenContainer() {
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    (async () => {
      const m = await registerModule()
      setMeta(m);
    })();
  }, []);

  if (!meta) return <Text>Carregando módulo...</Text>;

  return (
    <ModuleProvider moduleId={meta.moduleId} moduleKey={meta.moduleKey}>
      <AvgListScreen />
    </ModuleProvider>
  );
}

function AvgListScreen() {
  const subjects = useModuleSelector(state => state.avg?.subjects ?? []);
  const dispatch = useDispatch();
  const navigation = useNavigation()

  useEffect(() => {
    (async () => {
      const loaded = {};
      dispatch(setSubjects(loaded));
    })();
  }, []);

  const handleDelete = async (id) => {
    await deleteSubject(id);
    dispatch(removeSubject(id));
    ToastAndroid.show('Matéria excluída', ToastAndroid.SHORT);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#111', padding: 20 }}>
      <SafeAreaView>
        <Button title="Adicionar Matéria" onPress={() => navigation.navigate("AvgEdit", { subjectId: 12 })} />
        {subjects.map(sub => (
          <AvgCard
            key={sub.id}
            subject={sub}
            onEdit={() => console.log('Editar', sub.id)}
            onDelete={() => handleDelete(sub.id)}
          />
        ))}
      </SafeAreaView>
    </ScrollView>
  );
}
