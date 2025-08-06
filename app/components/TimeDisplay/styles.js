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
    color: '#666',
  },
  displayItem: {
    width: 60, 
    alignItems: 'center',
  },
  displayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#777',
    textAlign: 'center',
    width: '100%',
    flexWrap: 'nowrap', 
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
  signToggle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    marginRight: 8,
  },
  signToggleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#AAA',
  },
  signSpace: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  signText: {
    fontSize: 28,
    fontWeight: 'bold',
  },

});
