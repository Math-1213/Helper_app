// GradeCalc.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import styles from './styles';

const defaultRow = { id: Date.now().toString(), name: '', weight: '', grade: '' };

export default function GradeCalc({ onSave }) {
    const [rows, setRows] = useState([defaultRow]);
    const [modeWeighted, setModeWeighted] = useState(true);
    const [average, setAverage] = useState(0);

    useEffect(() => {
        if (modeWeighted) {
            let totalWeight = 0;
            let total = 0;
            rows.forEach(({ weight, grade }) => {
                const w = parseFloat(weight);
                const g = parseFloat(grade);
                if (!isNaN(w) && !isNaN(g)) {
                    totalWeight += w;
                    total += g * w;
                }
            });
            setAverage(totalWeight > 0 ? total / totalWeight : 0);
        } else {
            let total = 0;
            rows.forEach(({ grade }) => {
                const g = parseFloat(grade);
                if (!isNaN(g)) total += g;
            });
            setAverage(total);
        }
    }, [rows, modeWeighted]);

    const addRow = () => {
        setRows([...rows, { id: Date.now().toString(), name: '', weight: '', grade: '' }]);
    };

    const updateRow = (id, field, value) => {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const removeRow = (id) => {
        setRows(rows.filter(row => row.id !== id));
    };

    return (
        <View style={styles.container}>

            {/* Toggle Mode */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, modeWeighted && styles.toggleActive]}
                    onPress={() => setModeWeighted(true)}
                >
                    <Text style={modeWeighted ? styles.toggleTextActive : styles.toggleText}>Weighted Average</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.toggleButton, !modeWeighted && styles.toggleActive]}
                    onPress={() => setModeWeighted(false)}
                >
                    <Text style={!modeWeighted ? styles.toggleTextActive : styles.toggleText}>Sum Values</Text>
                </TouchableOpacity>
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.cell, styles.nameCol, styles.headerText]}>Name</Text>
                <Text style={[styles.cell, styles.weightCol, styles.headerText]}>Weight</Text>
                <Text style={[styles.cell, styles.gradeCol, styles.headerText]}>Grade</Text>
                <Text style={[styles.cell, styles.removeCol]}></Text>
            </View>

            {/* Table Rows */}
            <FlatList
                data={rows}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.tableRow}>
                        <TextInput
                            placeholder="Name"
                            placeholderTextColor="#aaa"
                            style={[styles.cell, styles.nameCol, styles.input]}
                            value={item.name}
                            onChangeText={text => updateRow(item.id, 'name', text)}
                            autoCapitalize="none"
                        />
                        <TextInput
                            placeholder="Weight"
                            placeholderTextColor="#aaa"
                            style={[styles.cell, styles.weightCol, styles.input]}
                            keyboardType="numeric"
                            value={item.weight}
                            onChangeText={text => updateRow(item.id, 'weight', text)}
                            editable={modeWeighted}
                        />
                        <TextInput
                            placeholder="Grade"
                            placeholderTextColor="#aaa"
                            style={[styles.cell, styles.gradeCol, styles.input]}
                            keyboardType="numeric"
                            value={item.grade}
                            onChangeText={text => updateRow(item.id, 'grade', text)}
                        />
                        <TouchableOpacity
                            style={[styles.cell, styles.removeCol, styles.removeButton]}
                            onPress={() => removeRow(item.id)}
                        >
                            <Text style={{ color: '#ff6b6b' }}>X</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* Add Row Button */}
            <TouchableOpacity style={styles.addButton} onPress={addRow}>
                <Text style={styles.addButtonText}>Add Row</Text>
            </TouchableOpacity>

            {/* Average Display */}
            <View style={styles.averageContainer}>
                <Text style={styles.averageLabel}>Current Average:</Text>
                <Text style={styles.averageValue}>{average.toFixed(2)}</Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={() => onSave(rows, average)}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

        </View>
    );
}