import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import styles from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TimeCalculator() {
  const [time1, setTime1] = useState(0); // em minutos
  const [time2, setTime2] = useState(0); // em minutos
  const [mode, setMode] = useState('add'); // ou 'subtract'

  const result = useMemo(() => {
    const total = mode === 'add' ? time1 + time2 : time1 - time2;
    return total;
  }, [time1, time2, mode]);

  const formatTime = (totalMinutes) => {
    const h = Math.floor(Math.abs(totalMinutes) / 60);
    const m = Math.abs(totalMinutes) % 60;
    const sign = totalMinutes < 0 ? '-' : '';
    return `${sign}${h}h ${m}min`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Calculadora de Hora</Text>

      {/* Primeiro tempo */}
      <View style={styles.sliderBlock}>
        <Text style={styles.label}>Tempo 1: {formatTime(time1)}</Text>
        <Slider
          minimumValue={0}
          maximumValue={600}
          step={5}
          value={time1}
          onValueChange={setTime1}
          style={styles.slider}
        />
      </View>

      {/* Segundo tempo */}
      <View style={styles.sliderBlock}>
        <Text style={styles.label}>Tempo 2: {formatTime(time2)}</Text>
        <Slider
          minimumValue={0}
          maximumValue={600}
          step={5}
          value={time2}
          onValueChange={setTime2}
          style={styles.slider}
        />
      </View>

      {/* Botões Somar/Subtrair */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'add' && styles.activeButton]}
          onPress={() => setMode('add')}
        >
          <Text style={styles.buttonText}>Somar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'subtract' && styles.activeButton]}
          onPress={() => setMode('subtract')}
        >
          <Text style={styles.buttonText}>Subtrair</Text>
        </TouchableOpacity>
      </View>

      {/* Resultado */}
      <View style={styles.resultBlock}>
        <Text style={styles.resultLabel}>Resultado:</Text>
        <Text style={styles.result}>{formatTime(result)}</Text>
      </View>
    </SafeAreaView>
  );
}
