import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import styles from './styles';

const TimeDisplay = ({
  editable = false,
  showSeconds = true,
  showMilliseconds = true,
  value = { hh: 0, mm: 0, ss: 0, ms: 0 },
  onChange = () => {},
  style = {},
}) => {
  const [currentValue, setCurrentValue] = useState(value);

  // Define as unidades a exibir
  const TIME_UNITS = ['hh', 'mm'];
  if (showSeconds) TIME_UNITS.push('ss');
  if (showMilliseconds) TIME_UNITS.push('ms');

  const scrollRefs = {
    hh: useRef(null),
    mm: useRef(null),
    ss: useRef(null),
    ms: useRef(null),
  };

  const unitRanges = {
    hh: Array.from({ length: 24 }, (_, i) => i),
    mm: Array.from({ length: 60 }, (_, i) => i),
    ss: Array.from({ length: 60 }, (_, i) => i),
    ms: Array.from({ length: 10 }, (_, i) => i * 100),
  };

  const updateValue = (unit, val) => {
    const updated = { ...currentValue, [unit]: val };
    setCurrentValue(updated);
    onChange(updated);
  };

  useEffect(() => {
    if (editable) {
      TIME_UNITS.forEach((unit) => {
        const ref = scrollRefs[unit];
        const idx = unitRanges[unit].indexOf(currentValue[unit]);
        if (ref.current && idx >= 0) {
          ref.current.scrollTo({ y: idx * 40, animated: false });
        }
      });
    }
  }, [editable]);

  const renderPicker = (unit) => (
    <ScrollView
      key={unit}
      ref={scrollRefs[unit]}
      style={styles.scroll}
      snapToInterval={40}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      onScroll={({ nativeEvent }) => {
        const index = Math.round(nativeEvent.contentOffset.y / 40);
        updateValue(unit, unitRanges[unit][index]);
      }}
      scrollEventThrottle={16}
    >
      {unitRanges[unit].map((num, idx) => {
        const displayVal = String(num).padStart(2, '0');
        const valIdx = unitRanges[unit].indexOf(currentValue[unit]);
        const distance = Math.abs(valIdx - idx);
        const opacity = distance === 0 ? 1 : distance === 1 ? 0.5 : 0.2;

        return (
          <View key={num} style={styles.pickerItem}>
            <Text style={[styles.pickerText, { opacity }]}>{displayVal}</Text>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderDisplay = (unit) => (
    <View key={unit} style={styles.displayItem}>
      <Text style={styles.displayText}>
        {String(currentValue[unit]).padStart(2, '0')}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {TIME_UNITS.map((unit, idx) => (
        <React.Fragment key={unit}>
          {editable ? renderPicker(unit) : renderDisplay(unit)}
          {idx < TIME_UNITS.length - 1 && (
            <Text style={styles.separator}>:</Text>
          )}
        </React.Fragment>
      ))}
      {showMilliseconds && TIME_UNITS.includes('ms') && (
        <>
          <Text style={styles.dot}>.</Text>
          {editable ? renderPicker('ms') : renderDisplay('ms')}
        </>
      )}
    </View>
  );
};

export default TimeDisplay;
