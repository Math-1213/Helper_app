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
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../bridges/Marketplace';
import {installModuleFromUrl} from '../Services/ModuleInstaller';

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

    try {
      const installed = await installModuleFromUrl(app.url, app.id);

      onInstall({
        id: app.id,
        type: 'module',
        label: app.label,
        url: installed.url,
        sourceUrl: app.url,
        lastUpdate: Date.now(),
      });
      onClose();
    } catch (err) {
      console.log(`[Marketplace] Erro na instalação de ${app.id}:`, err);
      Alert.alert('Erro ao Instalar', err.message || 'Falha ao baixar módulo.');
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
        disabled={downloadingAppId !== null}
        activeOpacity={0.7}>
        <View style={styles.cardIconContainer}>
          <Icon name="extension" size={24} color="#7C4DFF" />
        </View>

        <View style={styles.cardTextContainer}>
          <Text style={styles.title}>{item.label}</Text>
          <Text style={styles.url} numberOfLines={1}>
            {item.url}
          </Text>
        </View>

        <View style={styles.actionIconContainer}>
          {isDownloading ? (
            <ActivityIndicator size="small" color="#7C4DFF" />
          ) : (
            <Icon name="file-download" size={24} color="#444450" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <View style={styles.headerTitleContainer}>
              <Icon
                name="storefront"
                size={24}
                color="#FFF"
                style={styles.headerIcon}
              />
              <Text style={styles.header}>Marketplace</Text>
            </View>
            <TouchableOpacity
              onPress={fetchApps}
              disabled={loading || downloadingAppId !== null}
              style={styles.reloadButton}
              activeOpacity={0.7}>
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
              color="#7C4DFF"
              style={{marginVertical: 40}}
            />
          ) : (
            <FlatList
              data={availableApps}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                !loading && (
                  <View style={styles.emptyContainer}>
                    <Icon
                      name="check-circle-outline"
                      size={48}
                      color="#2E2E38"
                    />
                    <Text style={styles.emptyText}>
                      Todos os módulos disponíveis já estão instalados.
                    </Text>
                  </View>
                )
              }
            />
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.manualButton}
              disabled={downloadingAppId !== null}
              onPress={() => {
                onClose();
                openManualAdd();
              }}
              activeOpacity={0.8}>
              <Icon
                name="add-link"
                size={20}
                color="#FFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.manualText}>Adicionar URL Manual</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={downloadingAppId !== null}
              activeOpacity={0.7}>
              <Text style={styles.closeText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#121216',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: '#22222a',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  header: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  reloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22222A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1C1C24',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A35',
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  url: {
    color: '#8A8A9E',
    fontSize: 13,
  },
  actionIconContainer: {
    paddingLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#555565',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  footer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#22222a',
    paddingTop: 20,
  },
  manualButton: {
    flexDirection: 'row',
    backgroundColor: '#7C4DFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  manualText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#1C1C24',
    alignItems: 'center',
  },
  closeText: {
    color: '#A0A0B0',
    fontSize: 15,
    fontWeight: '600',
  },
});
