import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 48,
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: '600',
  },
  progress: {
    marginVertical: 20,
    marginHorizontal: 20,
  },
  stopButton: {
    backgroundColor: '#f44336',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
