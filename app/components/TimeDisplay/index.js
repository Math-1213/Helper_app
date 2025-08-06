import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import styles from './styles';

const isTimeEqual = (t1, t2) =>
    t1.hh === t2.hh &&
    t1.mm === t2.mm &&
    t1.ss === t2.ss &&
    t1.ms === t2.ms;

const TimeDisplay = ({
    editable = false,
    showSeconds = true,
    showMilliseconds = false,
    value = { hh: 0, mm: 0, ss: 0, ms: 0 },
    onChange = () => { },
    style = {},
}) => {
    const [currentValue, setCurrentValue] = useState(value);
    const isScrolling = useRef({ hh: false, mm: false, ss: false, ms: false });

    const TIME_UNITS = ['hh', 'mm'];
    if (showSeconds) TIME_UNITS.push('ss');
    if (showMilliseconds) TIME_UNITS.push('ms');

    const scrollRefs = {
        hh: useRef(null),
        mm: useRef(null),
        ss: useRef(null),
        ms: useRef(null),
    };

    const baseRanges = {
        hh: Array.from({ length: 24 }, (_, i) => i),
        mm: Array.from({ length: 60 }, (_, i) => i),
        ss: Array.from({ length: 60 }, (_, i) => i),
        ms: Array.from({ length: 10 }, (_, i) => i * 100),
    };

    const extendedRanges = {};
    Object.entries(baseRanges).forEach(([unit, arr]) => {
        extendedRanges[unit] = [...arr, ...arr, ...arr];
    });

    const ITEM_HEIGHT = 40;

    const centerScroll = (unit, idx) => {
        const baseLen = baseRanges[unit].length;
        const centerIdx = baseLen + idx;

        scrollRefs[unit].current?.scrollTo({
            y: centerIdx * ITEM_HEIGHT,
            animated: false,
        });
    };

    useEffect(() => {
        if (!isTimeEqual(value, currentValue)) {
            setCurrentValue(value);

            TIME_UNITS.forEach((unit) => {
                const val = Math.abs(value[unit]);
                const idx = baseRanges[unit].indexOf(val);
                if (idx >= 0) centerScroll(unit, idx);
            });
        }
    }, [value]);

    useEffect(() => {
        if (editable) {
            TIME_UNITS.forEach((unit) => {
                const val = Math.abs(currentValue[unit]);
                const idx = baseRanges[unit].indexOf(val);
                if (idx >= 0) centerScroll(unit, idx);
            });
        }
    }, [editable]);

    const updateValue = (unit, val) => {
        const updated = { ...currentValue, [unit]: val };
        if (!isTimeEqual(updated, currentValue)) {
            setCurrentValue(updated);
            onChange(updated);
        }
    };

    const handleScroll = (unit) => ({ nativeEvent }) => {
        const y = nativeEvent.contentOffset.y;
        const baseLen = baseRanges[unit].length;

        let idx = Math.round(y / ITEM_HEIGHT);
        let baseIdx = idx % baseLen;
        if (baseIdx < 0) baseIdx += baseLen;

        updateValue(unit, baseRanges[unit][baseIdx]);

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
                const baseLen = baseRanges[unit].length;
                const baseNum = baseRanges[unit][idx % baseLen];
                const displayVal = String(baseNum).padStart(2, '0');

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
                {/* Apenas "-" se negativo, nunca "+" */}
                {unit === 'hh' && !editable && currentValue.hh < 0 ? '-' : ''}
                {String(Math.abs(currentValue[unit])).padStart(2, '0')}
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, style]}>
            {TIME_UNITS.map((unit, idx) => (
                <React.Fragment key={unit}>
                    {editable ? renderPicker(unit) : renderDisplay(unit)}
                    {idx < TIME_UNITS.length - 1 && <Text style={styles.separator}>:</Text>}
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
