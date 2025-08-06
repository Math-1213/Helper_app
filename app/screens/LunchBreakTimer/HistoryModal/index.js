import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { lunchBreakTimeHistory } from '../../services/realm/actions/lunchBreakTimeHistory';
import styles from './styles';

const formatDate = (date) => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear().toString().slice(-2);
  return `${d}/${m}/${y}`;
};

const getWeekDay = (date) => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[date.getDay()];
};

const getWeekDays = (date) => {
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));

  let weekDays = [];
  for (let i = 0; i < 5; i++) {
    let d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDays.push(d);
  }
  return weekDays;
};

export default function LunchBreakHistoryModal({ visible, onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [weekDays, setWeekDays] = useState(getWeekDays(selectedDate));
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setWeekDays(getWeekDays(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    loadHistory();
  }, [weekDays]);

  const loadHistory = async () => {
    // try {
    //   const realmResults = await lunchBreakTimeHistory.index();
    //   const allData = [...realmResults];
    //   const data = allData.filter((item) => {
    //     const dt = new Date(item.year, item.month - 1, item.day);
    //     return weekDays.some(
    //       (wd) =>
    //         wd.getDate() === dt.getDate() &&
    //         wd.getMonth() === dt.getMonth() &&
    //         wd.getFullYear() === dt.getFullYear()
    //     );
    //   });
    //   setHistory(data);
    // } catch (err) {
    //   console.error('Erro ao carregar histórico:', err);
    // }
  };

  const openDatePicker = () => {
    setShowPicker(true);
  };

  const onDateChange = (event, date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (date) setSelectedDate(date);
  };

  const renderItem = ({ item }) => {
    const { day, month, year, weekDay, startTime, returnTime } = item;

    const formatTime = (date) => {
      if (!date) return '--:--';
      const d = new Date(date);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes()
        .toString()
        .padStart(2, '0')}`;
    };

    return (
      <View style={styles.item}>
        <Text style={styles.dateText}>
          {String(day).padStart(2, '0')}/{String(month).padStart(2, '0')}/{year.toString().slice(-2)}
        </Text>
        <Text style={styles.weekDayText}>{weekDay}</Text>
        <Text style={styles.timeText}>
          Saída: {formatTime(startTime)} | Volta: {formatTime(returnTime)}
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Histórico do Almoço</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.calendarButton} onPress={openDatePicker}>
            <Ionicons name="calendar" size={24} color="#007AFF" />
            <Text style={styles.calendarButtonText}>Selecionar data</Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="calendar"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          <FlatList
            data={history}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            style={styles.list}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum registro nessa semana.</Text>}
          />
        </View>
      </View>
    </Modal>
  );
}
