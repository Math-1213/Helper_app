import {
  StyleSheet
} from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { color: '#ccc', fontSize: 14, marginTop: 10 },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  typeContainer: { flexDirection: 'row', marginTop: 10, gap: 10 },
  typeButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeType: { backgroundColor: '#555' },
  typeText: { color: '#fff' },
  gradeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  removeButton: { marginLeft: 10 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 8,
  },
  addText: { color: '#0f0' },
  avgBox: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  avgText: { color: '#fff', fontSize: 16 },
  saveButton: {
    backgroundColor: '#0a84ff',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default styles;