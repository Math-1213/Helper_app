import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import uuid from 'react-native-uuid';
import { useDispatch } from 'react-redux';
import { addSubject } from '../../store/slice';
import { persistSubject } from '../../store/register';
import { SafeAreaView } from 'react-native-safe-area-context';
import Core from '../../../../core/index';

const { ModuleProvider } = Core.redux;
const { useModuleSelector } = Core.hooks;

export default function AvgEditScreenContainer() {
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    (async () => {
      const m = { moduleId: 'avg', moduleKey: 'avg' };
      setMeta(m);
    })();
  }, []);

  if (!meta) return <Text>Carregando módulo...</Text>;

  return (
    <ModuleProvider moduleId={meta.moduleId} moduleKey={meta.moduleKey}>
      <AvgEditScreen />
    </ModuleProvider>
  );
}

function AvgEditScreen() {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [type, setType] = useState('normal');
  const [grades, setGrades] = useState([]);
  const [weights, setWeights] = useState([]);

  const handleAddGrade = () => {
    setGrades([...grades, '']);
    if (type === 'ponderada') setWeights([...weights, '']);
  };

  const handleRemoveGrade = (index) => {
    const g = [...grades];
    g.splice(index, 1);
    setGrades(g);
    if (type === 'ponderada') {
      const w = [...weights];
      w.splice(index, 1);
      setWeights(w);
    }
  };

  const handleChangeGrade = (text, index) => {
    const g = [...grades];
    g[index] = text;
    setGrades(g);
  };

  const handleChangeWeight = (text, index) => {
    const w = [...weights];
    w[index] = text;
    setWeights(w);
  };

  const calculateAverage = () => {
    if (!grades.length) return 0;
    const g = grades.map(Number).filter(v => !isNaN(v));
    if (type === 'normal') {
      const sum = g.reduce((a, b) => a + b, 0);
      return (sum / g.length).toFixed(2);
    } else {
      const w = weights.map(Number);
      const total = w.reduce((a, b) => a + b, 0);
      if (!total) return 0;
      const sum = g.reduce((a, b, i) => a + b * (w[i] || 0), 0);
      return (sum / total).toFixed(2);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      ToastAndroid.show('Digite o nome da matéria!', ToastAndroid.SHORT);
      return;
    }

    const subject = {
      id: uuid.v4(),
      name,
      type,
      grades: grades.map(Number),
      weights: weights.map(Number),
    };

    await persistSubject(subject);
    dispatch(addSubject(subject));
    ToastAndroid.show('Matéria salva!', ToastAndroid.SHORT);
    setName('');
    setGrades([]);
    setWeights([]);
  };

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView>

        <Text style={styles.title}>Nova Matéria</Text>

        <Text style={styles.label}>Nome da Matéria</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Matemática"
          placeholderTextColor="#777"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Tipo de Média</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'normal' && styles.activeType]}
            onPress={() => setType('normal')}>
            <Text style={styles.typeText}>Normal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'ponderada' && styles.activeType]}
            onPress={() => setType('ponderada')}>
            <Text style={styles.typeText}>Ponderada</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Notas</Text>
        {grades.map((grade, i) => (
          <View key={i} style={styles.gradeRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              keyboardType="numeric"
              placeholder="Nota"
              placeholderTextColor="#777"
              value={grade.toString()}
              onChangeText={(t) => handleChangeGrade(t, i)}
            />
            {type === 'ponderada' && (
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 5 }]}
                keyboardType="numeric"
                placeholder="Peso"
                placeholderTextColor="#777"
                value={weights[i]?.toString() || ''}
                onChangeText={(t) => handleChangeWeight(t, i)}
              />
            )}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveGrade(i)}>
              <Icon name="delete" size={22} color="#ff5555" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={handleAddGrade}>
          <Icon name="add-circle-outline" size={22} color="#0f0" />
          <Text style={styles.addText}>Adicionar Nota</Text>
        </TouchableOpacity>

        <View style={styles.avgBox}>
          <Text style={styles.avgText}>Média Atual: {calculateAverage()}</Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Salvar Matéria</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { color: '#ccc', fontSize: 14, marginTop: 10 },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  typeContainer: { flexDirection: 'row', marginTop: 10, gap: 10 },
  typeButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeType: { backgroundColor: '#555' },
  typeText: { color: '#fff' },
  gradeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  removeButton: { marginLeft: 10 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 8,
  },
  addText: { color: '#0f0' },
  avgBox: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  avgText: { color: '#fff', fontSize: 16 },
  saveButton: {
    backgroundColor: '#0a84ff',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
