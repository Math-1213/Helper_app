import RNFS from 'react-native-fs';

export async function resetRealm() {
  try {
    const dir = RNFS.DocumentDirectoryPath; // geralmente: /data/user/0/com.helper/files
    console.log('🔍 Limpando arquivos Realm em:', dir);

    const files = await RNFS.readDir(dir);

    const realmFiles = files.filter((f) => f.name.endsWith('.realm'));
    console.log('📦 Arquivos Realm encontrados:', realmFiles.map(f => f.name));

    for (const file of realmFiles) {
      const path = `${dir}/${file.name}`;
      console.log('🗑️ Apagando:', path);
      await RNFS.unlink(path);
    }

    console.log('✅ Realm limpo com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar Realm:', error);
  }
}
