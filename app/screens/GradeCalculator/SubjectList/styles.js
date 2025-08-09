import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#121212' // Fundo escuro
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333', // Linha mais discreta
  },
  itemText: { 
    fontSize: 16, 
    color: '#fff' // Texto claro
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 20, 
    color: '#aaa' // Texto de vazio mais suave
  },
});
