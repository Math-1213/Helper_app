import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import { Notifications } from 'react-native-notifications';
import ProgressBar from 'react-native-progress/Bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LunchBreakTimeHistoryActions } from '../../../services/database/actions/LunchBreakTimeHistory.actions';
import styles from './styles';

export default function LunchTimer() {
  const navigation = useNavigation();
  const { t } = useTranslation();
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
      title: t('lunchTimer.timer.lunch'),
      body: message,
      extra: { screen: 'LunchTimer', id, startTime, endTime, duration },
    });
  };

  const stopTimer = async () => {
    if (intervalRef.current) BackgroundTimer.clearInterval(intervalRef.current);

    const stoppedAt = new Date();
    const payload = {
      id,
      startTime: start,
      stoppedAt,
      durationMinutes: Math.round((stoppedAt - start) / 60000),
    };

    try {
      await LunchBreakTimeHistoryActions.stopTimerBefore(payload);
    } catch (err) {
      console.error('Erro ao salvar info:', err, payload);
      Alert.alert('Erro', t('lunchTimer.exit'));
    }

    notify(t('lunchTimer.timer.manualExit'));
    navigation.goBack();
  };

  function handleEndTimer() {
    Alert.alert(
      t('lunchTimer.timer.finishTime'),
      t('lunchTimer.timer.noMoreTime'),
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
      { cancelable: false }
    );
  }

  useEffect(() => {
    notify(t('lunchTimer.timer.lunch', { time: end.toLocaleTimeString().slice(0, 5) }));

    intervalRef.current = BackgroundTimer.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          BackgroundTimer.clearInterval(intervalRef.current);
          notify(t('lunchTimer.timer.finishLunch'));
          handleEndTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) BackgroundTimer.clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const onNotificationOpened = Notifications.events().registerNotificationOpened((notification, completion) => {
      navigation.navigate('LunchTimer', { id, startTime, endTime, duration });
      completion();
    });

    return () => {
      onNotificationOpened.remove();
    };
  }, []);

  const progress = 1 - remainingSeconds / totalSeconds;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('lunchTimer.timer.timeLeft')}</Text>
      <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>

      <ProgressBar
        progress={progress}
        width={null}
        height={12}
        color="#4CAF50"
        borderRadius={8}
        style={styles.progress}
      />

      <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
        <Text style={styles.stopButtonText}>{t('lunchTimer.timer.finishNow')}</Text>
      </TouchableOpacity>
    </View>
  );
}
