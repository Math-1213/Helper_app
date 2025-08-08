import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import TimeDisplay from '../../components/TimeDisplay';
import styles from './styles';
import HistoryModal from './HistoryModal';
import { LunchBreakTimeHistoryActions } from '../../services/database/actions/LunchBreakTimeHistory.actions'

const predefinedDurations = [0.2, 30, 45, 60]; // Só 0h30, 0h45 e 1h

const dateToTimeValue = (date) => {
  return {
    hh: date.getHours(),
    mm: date.getMinutes(),
    ss: date.getSeconds(),
    ms: 0,
  }
}

const timeValueToDate = (timeValue) => {
  const now = new Date();
  now.setHours(timeValue.hh);
  now.setMinutes(timeValue.mm);
  now.setSeconds(timeValue.ss || 0);
  now.setMilliseconds(timeValue.ms || 0);
  return now;
};

export default function LunchBreakerScreen({ navigation }) {
  const defaultStartTime = new Date();

  const [startTime, setStartTime] = useState(defaultStartTime);
  const [duration, setDuration] = useState(60); 
  const [showHistory, setShowHistory] = useState(false);

  const startTimeValue = dateToTimeValue(startTime);

  const handleTimeChange = (newTimeValue) => {
    const newDate = timeValueToDate(newTimeValue);
    setStartTime(newDate);
  };

  const handleStart = async () => {

    try {
      if (!(startTime instanceof Date) || isNaN(startTime.getTime())) {
        alert('Data/hora inválida');
        return;
      }
      const endTime = new Date(startTime.getTime() + duration * 60000)
      const payload = {
        date: startTime,
        weekday: startTime.toLocaleDateString('pt-BR', { weekday: 'long' }),
        startTime,
        endTime,
        durationMinutes: duration,
      }

      const id = await LunchBreakTimeHistoryActions.insert(payload);

      navigation.navigate('LunchTimer', {
        id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
      });

    } catch (err) {
      console.error('Erro ao iniciar o timer:', err);
      alert('Não foi possível iniciar o timer. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Horário de Almoço</Text>

      {/* Texto acima do TimeDisplay */}
      <Text style={styles.label}>Horário de Saída</Text>
      <TimeDisplay
        value={startTimeValue}
        onChange={handleTimeChange}
        editable={true}
        showSeconds={false}
      />

      <Text style={styles.subTitle}>Duração:</Text>

      <View style={styles.durationButtons}>
        {predefinedDurations.map((d) => {
          const hours = Math.floor(d / 60);
          const minutes = (d % 60).toString().padStart(2, '0');
          const label = `${hours}h${minutes}`;
          const isActive = duration === d;

          return (
            <TouchableOpacity
              key={d}
              style={[styles.durationButton, isActive && styles.activeDuration]}
              onPress={() => setDuration(d)}
              activeOpacity={0.7}
            >
              <Text style={styles.durationText}>{label}</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.durationButton, duration !== 30 && duration !== 45 && duration !== 60 && styles.activeDuration]}
          onPress={() => {
            // Você pode abrir um modal de customização ou input aqui
            alert('Implementar duração customizada');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.durationText}>Custom</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.insertButton} onPress={handleStart} activeOpacity={0.8}>
        <Text style={styles.insertButtonText}>Começar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistory(true)} activeOpacity={0.8}>
        <Text style={styles.historyButtonText}>Ver Horários Anteriores</Text>
      </TouchableOpacity>

      <Modal
        visible={showHistory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <HistoryModal onClose={() => setShowHistory(false)} />
          </View>
        </View>
      </Modal>


    </View>
  );
}
