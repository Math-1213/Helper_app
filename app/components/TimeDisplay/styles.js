import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212', // fundo escuro
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scroll: {
    width: 60,
    height: 140,
  },
  scrollContent: {
    paddingVertical: 40,
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 26,
    color: '#666', // cinza escuro para valores acima/abaixo
  },
  displayItem: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff', // branco para valor selecionado
    textShadowColor: '#0008',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  separator: {
    color: '#888',
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
  dot: {
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: 3,
    color: '#888',
  },
});
