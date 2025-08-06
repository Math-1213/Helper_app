import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';

import TimeDisplay from '../../components/TimeDisplay';

// Converte minutos para objeto { hh, mm, ss }
function minutesToTimeObj(totalMinutes) {
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  const ss = 0;
  return { hh, mm, ss, ms: 0 };
}

// Converte objeto { hh, mm, ss } para minutos totais
function timeObjToMinutes(time) {
  return time.hh * 60 + time.mm + Math.floor(time.ss / 60);
}

export default function TimeCalculator() {
  const [time1, setTime1] = useState({ hh: 0, mm: 0, ss: 0, ms: 0 });
  const [time2, setTime2] = useState({ hh: 0, mm: 0, ss: 0, ms: 0 });
  const [mode, setMode] = useState('add');

  const result = useMemo(() => {
    const t1 = timeObjToMinutes(time1);
    const t2 = timeObjToMinutes(time2);
    const total = mode === 'add' ? t1 + t2 : t1 - t2;
    return total;
  }, [time1, time2, mode]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Calculadora de Hora</Text>

      {/* Tempo 1 */}
      <View style={styles.timeBox}>
        <TimeDisplay
          editable={true}
          value={time1}
          showMilliseconds={false}
          showSeconds={false}
          onChange={setTime1}
          style={{ marginVertical: 12 }}
        />
      </View>

      {/* Tempo 2 */}
      <View style={styles.timeBox}>
        <TimeDisplay
          editable={true}
          value={time2}
          showMilliseconds={false}
          showSeconds={false}
          onChange={setTime2}
          style={{ marginVertical: 12 }}
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

      {/* Resultado com TimeDisplay */}
      <View style={[styles.timeBox, { alignItems: 'center', marginTop: 16 }]}>
        <Text style={styles.resultLabel}>Resultado:</Text>
        <TimeDisplay
          editable={false}
          value={minutesToTimeObj(result)}
          showMilliseconds={false}
          showSeconds={false}
          style={{ marginTop: 8 }}
        />
      </View>
    </SafeAreaView>
  );
}
