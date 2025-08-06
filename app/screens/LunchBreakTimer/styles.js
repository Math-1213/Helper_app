import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 16,
    color: '#BBB',
    marginVertical: 12,
  },
  durationButton: {
    flex: 1,            // para dividir espaço igualmente
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#ddd', // cor base
    alignItems: 'center',
  },
  durationButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    marginBottom: 10,
  },
  activeDuration: {
    backgroundColor: '#007AFF',
  },
  durationText: {
    color: '#000',
    fontWeight: '600',
  },
  insertButton: {
    marginTop: 20,
    backgroundColor: '#00c853',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  insertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyButton: {
    marginTop: 14,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#424242',
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#DDD',
  },

});




