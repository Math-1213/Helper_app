import { StyleSheet } from 'react-native';

export default styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212', // fundo escuro
  },
  header: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#eee', // texto claro para contraste
  },
  input: {
    borderWidth: 1,
    borderColor: '#444', // borda mais escura
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#eee', // texto claro dentro do input
    backgroundColor: '#222', // fundo do input escuro
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: '#388E3C', // verde escuro
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
