import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import styles from './styles';
import { useTranslation } from 'react-i18next';

const defaultRow = { id: Date.now().toString(), name: '', weight: '', grade: '' };

export default function GradeCalc({ onSave, initialData }) {
    const { t } = useTranslation();
    const [subjectName, setSubjectName] = useState(initialData?.name || '');
    const [rows, setRows] = useState(
        initialData?.grades && initialData.grades.length > 0
            ? initialData.grades.map(g => ({
                id: Date.now().toString() + Math.random(),
                name: g.name || '',
                weight: g.weight?.toString() || '',
                grade: g.score?.toString() || '',
            }))
            : [defaultRow]
    );
    const [modeWeighted, setModeWeighted] = useState(
        initialData?.weightMode !== undefined
            ? Boolean(initialData.weightMode)
            : true
    );
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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
        >

            {/* Título e input nome da matéria */}
            <Text style={styles.title}>{t('gradeCalc.moduleName')}</Text>
            <TextInput
                placeholder={t('gradeCalc.subjectName')}
                placeholderTextColor="#aaa"
                style={styles.subjectInput}
                value={subjectName}
                onChangeText={setSubjectName}
                autoCapitalize="words"
            />

            {/* Toggle Mode */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, modeWeighted && styles.toggleActive]}
                    onPress={() => setModeWeighted(true)}
                >
                    <Text style={modeWeighted ? styles.toggleTextActive : styles.toggleText}>{t('gradeCalc.calcMode.avg')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.toggleButton, !modeWeighted && styles.toggleActive]}
                    onPress={() => setModeWeighted(false)}
                >
                    <Text style={!modeWeighted ? styles.toggleTextActive : styles.toggleText}>{t('gradeCalc.calcMode.sum')}</Text>
                </TouchableOpacity>
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.cell, styles.nameCol, styles.headerText]}>{t('gradeCalc.row.name')}</Text>
                <Text style={[styles.cell, styles.weightCol, styles.headerText]}>{t('gradeCalc.row.weight')}</Text>
                <Text style={[styles.cell, styles.gradeCol, styles.headerText]}>{t('gradeCalc.row.grade')}</Text>
                <Text style={[styles.cell, styles.removeCol]}></Text>
            </View>

            {/* Table Rows */}
            <FlatList
                data={rows}
                keyExtractor={item => item.id}
                nestedScrollEnabled={true}
                renderItem={({ item }) => (
                    <View style={styles.tableRow}>
                        <TextInput
                            placeholder={t('gradeCalc.row.name')}
                            placeholderTextColor="#aaa"
                            style={[styles.cell, styles.nameCol, styles.input]}
                            value={item.name}
                            onChangeText={text => updateRow(item.id, 'name', text)}
                            autoCapitalize="none"
                        />
                        <TextInput
                            placeholder={t('gradeCalc.row.weight')}
                            placeholderTextColor="#aaa"
                            style={[
                                styles.cell,
                                styles.weightCol,
                                styles.input,
                                !modeWeighted && styles.disabledInput // aplica um estilo "desativado"
                            ]}
                            keyboardType="numeric"
                            value={item.weight}
                            onChangeText={text => updateRow(item.id, 'weight', text)}
                            editable={modeWeighted}
                        />

                        <TextInput
                            placeholder={t('gradeCalc.row.grade')}
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
                <Text style={styles.addButtonText}>{t('gradeCalc.addRow')}</Text>
            </TouchableOpacity>

            {/* Average Display */}
            <View style={styles.averageContainer}>
                <Text style={styles.averageLabel}>{t('gradeCalc.currentAvg')}:</Text>
                <Text style={styles.averageValue}>{average.toFixed(2)}</Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
                style={styles.saveButton}
                onPress={() => onSave({ subjectName, rows, average, modeWeighted: !modeWeighted })}
            >
                <Text style={styles.saveButtonText}>{t('gradeCalc.save')}</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}
