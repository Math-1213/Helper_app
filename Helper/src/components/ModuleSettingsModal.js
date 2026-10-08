import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  getAppPermissions,
  setAppPermissions,
} from '../Services/PermissionService.js';

export default ModuleSettingsModal = ({
  app,
  visible,
  onClose,
  onReinstall,
  onDelete,
  isReinstalling,
}) => {
  const [permissions, setPermissions] = useState({
    storage: true, // Isolado em apps/{appId}/
    files: true, // Isolado em apps/{appId}/data/
    location: false, // Requer autorização do usuário
    camera: false, // Requer autorização do usuário
    audio: false, // Requer autorização do usuário
    sensors: false, // Acelerômetro, Giroscópio, etc.
  });

  // Mapeamento visual das permissões
  const PERMISSION_CONFIG = [
    {
      key: 'storage',
      label: 'Armazenamento (Storage)',
      desc: 'Chaves e valores de estado do módulo',
      icon: 'server-outline',
    },
    {
      key: 'files',
      label: 'Arquivos Locais (Files)',
      desc: 'Acesso à pasta de dados isolada',
      icon: 'folder-open-outline',
    },
    {
      key: 'location',
      label: 'Geolocalização (Location)',
      desc: 'GPS e localização aproximada',
      icon: 'location-outline',
    },
    {
      key: 'camera',
      label: 'Câmera (Camera)',
      desc: 'Captura de fotos e vídeos',
      icon: 'camera-outline',
    },
    {
      key: 'audio',
      label: 'Microfone e Áudio (Audio)',
      desc: 'Gravação e reprodução de som',
      icon: 'mic-outline',
    },
    {
      key: 'sensors',
      label: 'Sensores (Sensors)',
      desc: 'Acelerômetro e giroscópio',
      icon: 'compass-outline',
    },
  ];

  useEffect(() => {
    if (app && visible) {
      getAppPermissions(app.id).then(setPermissions);
    }
  }, [app, visible]);

  if (!app) return null;

  const handleTogglePermission = async key => {
    const updated = {...permissions, [key]: !permissions[key]};
    setPermissions(updated);
    await setAppPermissions(app.id, updated);
  };

  const isModule = app.type === 'module';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {app.label}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name="close" size={24} color="#8F8EA8" />
            </TouchableOpacity>
          </View>

          {/* Informações Técnicas */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Identificação</Text>
            <Text style={styles.infoLabel}>App ID:</Text>
            <Text style={styles.infoValue}>{app.id}</Text>

            <Text style={styles.infoLabel}>Origem / Entrada:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {app.url || app.htmlLocal}
            </Text>
          </View>

          {/* Permissões */}
          <View style={styles.permissionsSection}>
            <Text style={styles.sectionTitle}>Permissões da Bridge</Text>

            {PERMISSION_CONFIG.map(item => (
              <View key={item.key} style={styles.switchRow}>
                <View style={styles.permissionInfo}>
                  <Icon
                    name={item.icon}
                    size={18}
                    color="#7C4DFF"
                    style={{marginRight: 8}}
                  />
                  <View style={{flex: 1}}>
                    <Text style={styles.switchLabel}>{item.label}</Text>

                    <Text style={styles.switchDesc}>{item.desc}</Text>
                  </View>
                </View>
                <Switch
                  value={!!permissions[item.key]}
                  onValueChange={() => handleTogglePermission(item.key)}
                  thumbColor={permissions[item.key] ? '#7C4DFF' : '#444450'}
                  trackColor={{false: '#262632', true: '#3D2580'}}
                />
              </View>
            ))}
          </View>

          {/* Ações */}
          <View style={styles.actionsSection}>
            {isModule && app.sourceUrl && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onReinstall(app)}
                disabled={isReinstalling}>
                {isReinstalling ? (
                  <ActivityIndicator size="small" color="#7C4DFF" />
                ) : (
                  <>
                    <Icon name="refresh-outline" size={18} color="#7C4DFF" />
                    <Text style={styles.actionText}>Atualizar Módulo</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                onClose();
                onDelete(app.id);
              }}>
              <Icon name="trash-outline" size={18} color="#FF4D4D" />
              <Text style={styles.deleteText}>Remover Módulo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#181820',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#262632',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F0F0F5',
    flex: 1,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8F8EA8',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  infoSection: {
    marginBottom: 20,
    backgroundColor: '#121218',
    padding: 12,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6E6D8A',
    marginTop: 4,
  },
  infoValue: {
    fontSize: 13,
    color: '#D1D0E0',
    fontWeight: '500',
  },
  permissionsSection: {
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#20202B',
  },
  switchLabel: {
    fontSize: 14,
    color: '#E0E0EC',
  },
  actionsSection: {
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#20202C',
    gap: 8,
  },
  actionText: {
    color: '#7C4DFF',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#2A181C',
  },
  deleteText: {
    color: '#FF4D4D',
    fontWeight: '600',
    fontSize: 14,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#20202B',
  },
  switchLabel: {
    fontSize: 14,
    color: '#E0E0EC',
    fontWeight: '500',
  },
  switchDesc: {
    fontSize: 11,
    color: '#6E6D8A',
    marginTop: 1,
  },
});
