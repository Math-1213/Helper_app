import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import { Notifications } from 'react-native-notifications';
// import ProgressBar from 'react-native-progress/Bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LunchBreakTimeHistoryActions } from '../../../services/database/actions/LunchBreakTimeHistory.actions'
import styles from './styles';

export default function LunchTimer() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, startTime, endTime, duration } = route.params;

  const start = new Date(startTime);
  const end = new Date(endTime);
  const totalSeconds = (end.getTime() - start.getTime()) / 1000;

  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);

  const intervalRef = useRef(null);

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const notify = (message) => {
    Notifications.postLocalNotification({
      title: 'Almoço',
      body: message,
    });
  };

  const stopTimer = async () => {
    if (intervalRef.current) BackgroundTimer.clearInterval(intervalRef.current);

    const stoppedAt = new Date();
    const payload = {
      id: id,
      startTime: start,
      stoppedAt: stop,
      durationMinutes: Math.round((stoppedAt - start) / 60000),
    };
    console.log(payload)

    try {
      await LunchBreakTimeHistoryActions.stopTimerBefore(payload)
    } catch (err) {
      console.error('Erro ao salvar info:', err, payload);
    }

    notify('Timer encerrado manualmente.');
    navigation.goBack();
  };

  useEffect(() => {
    notify(`Almoço iniciado! Retorno às ${end.toLocaleTimeString().slice(0, 5)}`);

    intervalRef.current = BackgroundTimer.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          BackgroundTimer.clearInterval(intervalRef.current);
          notify('Tempo de almoço encerrado!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) BackgroundTimer.clearInterval(intervalRef.current);
    };
  }, []);

  const progress = 1 - remainingSeconds / totalSeconds;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tempo Restante</Text>
      <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>

      {/* <ProgressBar
        progress={progress}
        width={null}
        height={12}
        color="#4CAF50"
        borderRadius={8}
        style={styles.progress}
      /> */}

      <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
        <Text style={styles.stopButtonText}>Encerrar Agora</Text>
      </TouchableOpacity>
    </View>
  );
}
