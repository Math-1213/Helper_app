// styles.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#121212',
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'center',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4da3ff',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  toggleActive: {
    backgroundColor: '#4da3ff',
  },
  toggleText: {
    color: '#4da3ff',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#333',
    paddingBottom: 6,
    marginBottom: 6,
  },
  headerText: {
    color: '#ddd',
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  cell: {
    paddingHorizontal: 6,
  },
  nameCol: {
    flex: 3,
  },
  weightCol: {
    flex: 1,
    textAlign: 'center',
  },
  gradeCol: {
    flex: 1,
    textAlign: 'center',
  },
  removeCol: {
    flex: 0.5,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 4,
    height: 36,
    paddingHorizontal: 8,
    color: '#fff',
    backgroundColor: '#1e1e1e',
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  averageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 12,
  },
  averageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccc',
  },
  averageValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#4da3ff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#fff',  // ajusta para dark mode, se quiser
  },
  subjectInput: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 18,
    color: '#eee',
    backgroundColor: '#222',
    marginBottom: 16,
  },
  disabledInput: {
    backgroundColor: '#141414ff', // cinza claro
    color: '#999',              // texto mais apagado
    borderColor: '#1e1e1e'
  }

});
