import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import RNFS from 'react-native-fs';
import Config from 'react-native-config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../bridges/Marketplace';
import { unzip } from 'react-native-zip-archive';

export default function MarketplaceModal({
  visible,
  onClose,
  onInstall,
  openManualAdd,
  installedApps = [],
}) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchApps();
    }
  }, [visible]);

  const fetchApps = async () => {
    try {
      setLoading(true);

      // Usando apenas o endpoint relativo. O Axios prefixará automaticamente a baseURL salva
      const response = await api.get(Config.MARKETPLACE_APPS_ENDPOINT);

      setApps(response.data);
    } catch (err) {
      console.log('Erro carregando marketplace');
      console.log('ENDPOINT:', Config.MARKETPLACE_APPS_ENDPOINT);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  // const installApp = async app => {
  //   try {
  //     const folder = `${RNFS.DocumentDirectoryPath}/${app.id}`;
  //     const filePath = `${folder}/index.html`;

  //     const exists = await RNFS.exists(folder);

  //     if (!exists) {
  //       await RNFS.mkdir(folder);
  //     }

  //     const result = await RNFS.downloadFile({
  //       fromUrl: app.url,
  //       toFile: filePath,
  //     }).promise;

  //     if (result.statusCode === 200) {
  //       const installedApp = {
  //         id: app.id,
  //         label: app.label,
  //         url: `file://${filePath}`,
  //       };

  //       onInstall(installedApp);
  //       onClose();
  //     } else {
  //       console.log('Download falhou:', result.statusCode);
  //     }
  //   } catch (err) {
  //     console.log('Erro instalando app');
  //     console.log(err);
  //   }
  // };

  const installApp = async app => {
    try {
      const folder = `${RNFS.DocumentDirectoryPath}/${app.id}`;
      const zipPath = `${folder}.zip`;

      console.log(zipPath);

      const exists = await RNFS.exists(folder);

      if (!exists) {
        await RNFS.mkdir(folder);
      }

      const result = await RNFS.downloadFile({
        fromUrl: app.url,
        toFile: zipPath,
      }).promise;

      if (result.statusCode === 200) {
        await unzip(zipPath, folder);

        await RNFS.unlink(zipPath);

        const installedApp = {
          id: app.id,
          label: app.label,
          url: `file://${folder}/index.html`,
        };

        onInstall(installedApp);
        onClose();
      } else {
        console.log('Download falhou:', result.statusCode);
      }
    } catch (err) {
      console.log('Erro instalando app');
      console.log(err);
    }
  };

  const availableApps = apps.filter(
    remoteApp => !installedApps.some(localApp => localApp.id === remoteApp.id)
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => installApp(item)}>
      <Text style={styles.title}>{item.label}</Text>
      <Text style={styles.url}>{item.url}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.header}>Marketplace</Text>
            <TouchableOpacity onPress={fetchApps} disabled={loading} style={styles.reloadButton}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Icon name="refresh" size={22} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>

          {loading && apps.length === 0 ? (
            <></>
          ) : (
            <FlatList
              data={availableApps}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                !loading && (
                  <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>
                    Todos os módulos disponíveis já estão instalados!
                  </Text>
                )
              }
            />
          )}

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => {
              onClose();
              openManualAdd();
            }}
          >
            <Text style={styles.manualText}>Adicionar App Manualmente</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
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

  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  url: {
    color: '#888',
    fontSize: 12,
    marginTop: 3,
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
  },
});
