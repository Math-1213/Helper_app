import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#121212', // fundo escuro padrão dark mode
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#e0e0e0', // texto claro
  },
  timerText: {
    fontSize: 48,
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: '600',
    color: '#ffffff', // texto branco
  },
  progress: {
    marginVertical: 20,
    marginHorizontal: 20,
    // você pode ajustar a cor no componente ProgressBar também
  },
  stopButton: {
    backgroundColor: '#d32f2f', // vermelho mais suave para dark mode
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
