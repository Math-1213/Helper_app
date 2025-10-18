import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#222',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  info: { color: '#ccc', fontSize: 14 },
  actions: { flexDirection: 'row', gap: 10 },
});

export default styles;