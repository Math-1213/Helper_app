import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scroll: {
    width: 50,
    height: 120,
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
    fontSize: 24,
    color: '#AAA',
  },
  displayItem: {
    width: 50,
    alignItems: 'center',
  },
  displayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  separator: {
    color: '#AAA',
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  dot: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 2,
  },
});
