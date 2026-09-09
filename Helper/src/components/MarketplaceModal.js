import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../bridges/Marketplace';
import {unzip} from 'react-native-zip-archive';

export default function MarketplaceModal({
  visible,
  onClose,
  onInstall,
  openManualAdd,
  installedApps = [],
}) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingAppId, setDownloadingAppId] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchApps();
    }
  }, [visible]);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const response = await api.get('apps.json');
      setApps(response.data || []);
    } catch (err) {
      console.log('[Marketplace] Erro carregando catálogo:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const installApp = async app => {
    if (downloadingAppId) return;

    setDownloadingAppId(app.id);

    // Estrutura de diretórios
    const appDir = `${RNFS.DocumentDirectoryPath}/${app.id}`;
    const tempZipPath = `${RNFS.CachesDirectoryPath}/${app.id}_temp.zip`;

    try {
      // 1. Limpa instalações antigas ou incompletas no diretório de destino
      if (await RNFS.exists(appDir)) {
        await RNFS.unlink(appDir);
      }
      if (await RNFS.exists(tempZipPath)) {
        await RNFS.unlink(tempZipPath);
      }

      // 2. Cria o diretório de destino limpo
      await RNFS.mkdir(appDir);

      // 3. Faz o download do pacote .zip para a pasta temporária de Cache
      const result = await RNFS.downloadFile({
        fromUrl: app.url,
        toFile: tempZipPath,
      }).promise;

      if (result.statusCode !== 200) {
        throw new Error(`Servidor retornou status HTTP ${result.statusCode}`);
      }

      // 4. Descompacta no diretório final
      await unzip(tempZipPath, appDir);

      // 5. Deleta o ZIP temporário
      await RNFS.unlink(tempZipPath);

      // 6. Confirma arquivo de entrada
      const entryPath = `${appDir}/index.html`;
      const hasEntry = await RNFS.exists(entryPath);

      if (!hasEntry) {
        throw new Error('Pacote inválido: index.html não encontrado no ZIP.');
      }

      const installedApp = {
        id: app.id,
        label: app.label,
        url: `file://${entryPath}`,
      };

      onInstall(installedApp);
      onClose();
    } catch (err) {
      console.log(`[Marketplace] Erro na instalação de ${app.id}:`, err);
      Alert.alert('Erro ao Instalar', err.message || 'Falha ao baixar módulo.');

      // Cleanup em caso de erro na instalação
      try {
        if (await RNFS.exists(appDir)) await RNFS.unlink(appDir);
        if (await RNFS.exists(tempZipPath)) await RNFS.unlink(tempZipPath);
      } catch (cleanErr) {
        console.log('[Marketplace] Erro no cleanup:', cleanErr);
      }
    } finally {
      setDownloadingAppId(null);
    }
  };

  const availableApps = apps.filter(
    remoteApp => !installedApps.some(localApp => localApp.id === remoteApp.id),
  );

  const renderItem = ({item}) => {
    const isDownloading = downloadingAppId === item.id;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => installApp(item)}
        disabled={downloadingAppId !== null}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.label}</Text>
          {isDownloading && <ActivityIndicator size="small" color="#6200EE" />}
        </View>
        <Text style={styles.url} numberOfLines={1}>
          {item.url}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.header}>Marketplace</Text>
            <TouchableOpacity
              onPress={fetchApps}
              disabled={loading || downloadingAppId !== null}
              style={styles.reloadButton}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Icon name="refresh" size={22} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>

          {loading && apps.length === 0 ? (
            <ActivityIndicator
              size="large"
              color="#6200EE"
              style={{marginVertical: 30}}
            />
          ) : (
            <FlatList
              data={availableApps}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={{paddingBottom: 10}}
              ListEmptyComponent={
                !loading && (
                  <Text style={styles.emptyText}>
                    Todos os módulos disponíveis já estão instalados!
                  </Text>
                )
              }
            />
          )}

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.manualButton}
            disabled={downloadingAppId !== null}
            onPress={() => {
              onClose();
              openManualAdd();
            }}>
            <Text style={styles.manualText}>Adicionar App Manualmente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            disabled={downloadingAppId !== null}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  header: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  reloadButton: {
    padding: 6,
  },
  card: {
    backgroundColor: '#2A2A2A',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  url: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
  },
  manualButton: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  manualText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  closeText: {
    color: '#AAA',
    textAlign: 'center',
    paddingVertical: 4,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginVertical: 20,
  },
});
