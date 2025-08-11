import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import TimeDisplay from '../../components/TimeDisplay';
import styles from './styles';
import HistoryModal from './HistoryModal';
import { LunchBreakTimeHistoryActions } from '../../services/database/actions/LunchBreakTimeHistory.actions'
import { useTranslation } from 'react-i18next';

const predefinedDurations = [30, 45, 60]; // Só 0h30, 0h45 e 1h

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
  const candidate = new Date(now);

  candidate.setHours(timeValue.hh);
  candidate.setMinutes(timeValue.mm);
  candidate.setSeconds(timeValue.ss || 0);
  candidate.setMilliseconds(timeValue.ms || 0);

  if (candidate < now) {
    candidate.setDate(candidate.getDate() + 1);
  }

  return candidate;
};

export default function LunchBreakerScreen({ navigation }) {
  const { t } = useTranslation();
  const defaultStartTime = new Date();

  const [startTime, setStartTime] = useState(defaultStartTime);
  const [duration, setDuration] = useState(60);
  const [showHistory, setShowHistory] = useState(false);

  const startTimeValue = dateToTimeValue(startTime);
  const [customDurationModalVisible, setCustomDurationModalVisible] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState('');


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
      alert(t('lunchTimer.alert.timerError'));
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={customDurationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCustomDurationModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.8)', // fundo mais escuro
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: '#222', // fundo escuro do modal
            borderRadius: 8,
            width: '100%',
            padding: 20,
          }}>
            <Text style={{ fontSize: 18, marginBottom: 10, color: '#eee' }}>
              {t('lunchTimer.custonDur')}
            </Text>
            <TextInput
              keyboardType="numeric"
              placeholder={t('lunchTimer.inputTime')}
              placeholderTextColor="#888"
              value={customDurationInput}
              onChangeText={setCustomDurationInput}
              style={{
                borderWidth: 1,
                borderColor: '#555',
                borderRadius: 6,
                paddingHorizontal: 10,
                paddingVertical: 8,
                fontSize: 16,
                marginBottom: 20,
                color: '#eee',
                backgroundColor: '#333',
              }}
            />
            <Button
              title="Confirmar"
              onPress={() => {
                const parsed = parseInt(customDurationInput, 10);
                if (!isNaN(parsed) && parsed > 0) {
                  setDuration(parsed);
                  setCustomDurationModalVisible(false);
                } else {
                  alert(t('lunchTimer.alert.moreThanZero'));
                }
              }}
              color="#4CAF50"
            />
            <View style={{ height: 10 }} />
            <Button
              title="Cancelar"
              onPress={() => setCustomDurationModalVisible(false)}
              color="#f44336"
            />
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>{t('lunchTimer.moduleName')}</Text>

      {/* Texto acima do TimeDisplay */}
      <Text style={styles.label}>{t('lunchTimer.exitTime')}</Text>
      <TimeDisplay
        value={startTimeValue}
        onChange={handleTimeChange}
        editable={true}
        showSeconds={false}
      />

      <Text style={styles.subTitle}>{t('lunchTimer.duration')}</Text>

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
              onPress={() => {
                setDuration(d);
                setCustomDurationInput(''); 
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.durationText}>{label}</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[
            styles.durationButton,
            duration !== 30 && duration !== 45 && duration !== 60 && styles.activeDuration,
          ]}
          onPress={() => {
            setCustomDurationInput('');
            setCustomDurationModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.durationText}>Custom</Text>
        </TouchableOpacity>

      </View>

      <TouchableOpacity style={styles.insertButton} onPress={handleStart} activeOpacity={0.8}>
        <Text style={styles.insertButtonText}>{t('lunchTimer.start')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistory(true)} activeOpacity={0.8}>
        <Text style={styles.historyButtonText}>{t('lunchTimer.seeHistory')}</Text>
      </TouchableOpacity>

      {showHistory && (
        <HistoryModal visible={showHistory} onClose={() => setShowHistory(false)} />
      )}


    </View>
  );
}
