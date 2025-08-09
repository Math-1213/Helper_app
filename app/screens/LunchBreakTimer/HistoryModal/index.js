import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LunchBreakTimeHistoryActions } from '../../../services/database/actions/LunchBreakTimeHistory.actions';
import styles from './styles';

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

const formatDate = (date) => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear().toString().slice(-2);
  return `${d}/${m}/${y}`;
};

const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const getWeekDay = (date) => {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[date.getDay()];
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
    try {
      const allData = await LunchBreakTimeHistoryActions.getAll();
      const filtered = allData.filter((item) => {
        const itemDate = new Date(item.date);
        return weekDays.some(
          (wd) =>
            wd.getDate() === itemDate.getDate() &&
            wd.getMonth() === itemDate.getMonth() &&
            wd.getFullYear() === itemDate.getFullYear()
        );
      });
      setHistory(filtered);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  const openDatePicker = () => setShowPicker(true);

  const onDateChange = (event, date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (date) setSelectedDate(date);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.dateText}>{formatDate(new Date(item.date))}</Text>
      <Text style={styles.weekDayText}>{getWeekDay(new Date(item.date))}</Text>
      <Text style={styles.timeText}>
        Saída: {formatTime(item.startTime)} | Retorno: {formatTime(item.endTime)}
      </Text>
      <Text style={styles.durationText}>Duração: {item.durationMinutes} min</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Histórico</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <View>
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
          </View>

          <View style={{ flex: 1, marginTop: 10 }}>
            <FlatList
              data={history}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Nenhum registro nessa semana.</Text>
              }
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
