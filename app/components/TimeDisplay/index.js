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

  const TIME_UNITS = ['hh', 'mm'];
  if (showSeconds) TIME_UNITS.push('ss');
  if (showMilliseconds) TIME_UNITS.push('ms');

  // Referências para scroll
  const scrollRefs = {
    hh: useRef(null),
    mm: useRef(null),
    ss: useRef(null),
    ms: useRef(null),
  };

  // Valores base de cada unidade
  const baseRanges = {
    hh: Array.from({ length: 24 }, (_, i) => i),
    mm: Array.from({ length: 60 }, (_, i) => i),
    ss: Array.from({ length: 60 }, (_, i) => i),
    ms: Array.from({ length: 10 }, (_, i) => i * 100),
  };

  // Construir arrays triplicados para efeito loop-around
  const extendedRanges = {};
  Object.entries(baseRanges).forEach(([unit, arr]) => {
    extendedRanges[unit] = [...arr, ...arr, ...arr];
  });

  const ITEM_HEIGHT = 40;
  const TRIPLE_LENGTH = (unit) => baseRanges[unit].length * 3;

  const updateValue = (unit, val) => {
    const updated = { ...currentValue, [unit]: val };
    setCurrentValue(updated);
    onChange(updated);
  };

  // Centraliza o scroll no "bloco do meio" do array triplicado
  const centerScroll = (unit, idx) => {
    if (scrollRefs[unit].current) {
      // índice real dentro do bloco do meio
      const baseLen = baseRanges[unit].length;
      const centerIdx = baseLen + idx; 
      scrollRefs[unit].current.scrollTo({ y: centerIdx * ITEM_HEIGHT, animated: false });
    }
  };

  // Na montagem ou editable mudando, centraliza o scroll
  useEffect(() => {
    if (editable) {
      TIME_UNITS.forEach((unit) => {
        const baseLen = baseRanges[unit].length;
        const idx = baseRanges[unit].indexOf(currentValue[unit]);
        if (idx >= 0) centerScroll(unit, idx);
      });
    }
  }, [editable]);

  // Detecta scroll e corrige para efeito loop-around
  const handleScroll = (unit) => ({ nativeEvent }) => {
    const y = nativeEvent.contentOffset.y;
    const baseLen = baseRanges[unit].length;
    const totalLen = baseLen * 3;
    const maxOffset = (totalLen - 1) * ITEM_HEIGHT;
    
    let idx = Math.round(y / ITEM_HEIGHT);

    // Corrige o índice para dentro do range base
    let baseIdx = idx % baseLen;
    if (baseIdx < 0) baseIdx += baseLen;

    updateValue(unit, baseRanges[unit][baseIdx]);

    // Se scroll passou da faixa do bloco do meio, reposiciona no meio
    if (y < baseLen * ITEM_HEIGHT || y > (baseLen * 2) * ITEM_HEIGHT) {
      centerScroll(unit, baseIdx);
    }
  };

  const renderPicker = (unit) => (
    <ScrollView
      key={unit}
      ref={scrollRefs[unit]}
      style={styles.scroll}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      onScroll={handleScroll(unit)}
      scrollEventThrottle={16}
    >
      {extendedRanges[unit].map((num, idx) => {
        // O número base correto para exibir, independente do loop-around
        const baseLen = baseRanges[unit].length;
        const displayVal = String(baseRanges[unit][idx % baseLen]).padStart(2, '0');

        // Opacidade para foco (centralizado)
        const valIdx = baseRanges[unit].indexOf(currentValue[unit]);
        const centerIdx = baseLen + valIdx;
        const distance = Math.abs(centerIdx - idx);
        const opacity = distance === 0 ? 1 : distance === 1 ? 0.5 : 0.2;

        return (
          <View key={idx} style={styles.pickerItem}>
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
