import React, {useState, useEffect, useCallback} from 'react';
import {
  FlatList,
  Modal,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {requestMultiple, PERMISSIONS, RESULTS} from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  Container,
  Header,
  HeaderTitle,
  Card,
  CardText,
  CardSubtext,
  CardTouchable,
  CardIconContainer,
  CardInfo,
  DeleteButton,
  ReinstallButton,
  EmptyContainer,
  EmptyTitle,
  EmptyText,
  Fab,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  StyledInput,
  PrimaryButton,
  ButtonText,
  HeaderActions,
  IconButton,
  Content,
  IpHistoryLabel,
  IpBadge,
  IpBadgeText,
} from './styles';

import MarketplaceModal from '../components/MarketplaceModal';
import {identifySource} from '../Services/Helper';
import {installModuleFromUrl} from '../Services/ModuleInstaller';
import {setMarketplaceBaseURL} from '../bridges/Marketplace';

const DEBUG = false;
const IP_HISTORY_KEY = 'marketplaceIpHistory';

export default function HomeScreen({navigation}) {
  const [apps, setApps] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [marketplaceVisible, setMarketplaceVisible] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [installing, setInstalling] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);
  const [marketplaceIp, setMarketplaceIp] = useState('');
  const [ipHistory, setIpHistory] = useState([]);
  const [reinstallingId, setReinstallingId] = useState(null);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    handlePermissions();
    loadApps();
    loadMarketplaceConfig();
  }, []);

  const loadMarketplaceConfig = async () => {
    try {
      const savedIp = await AsyncStorage.getItem('marketplaceIp');
      const historyStr = await AsyncStorage.getItem(IP_HISTORY_KEY);

      if (savedIp) {
        setMarketplaceIp(savedIp);
        setMarketplaceBaseURL(savedIp);
      }
      if (historyStr) {
        setIpHistory(JSON.parse(historyStr));
      }
    } catch (error) {
      console.log('Erro ao carregar configurações de IP', error);
    }
  };

  const saveMarketplaceIp = async () => {
    if (!marketplaceIp.trim()) return;

    const formattedIp = marketplaceIp.trim();

    try {
      await AsyncStorage.setItem('marketplaceIp', formattedIp);
      setMarketplaceBaseURL(formattedIp);

      // Atualiza o histórico limpando duplicados e limitando a 5 entradas
      const updatedHistory = [
        formattedIp,
        ...ipHistory.filter(item => item !== formattedIp),
      ].slice(0, 5);

      setIpHistory(updatedHistory);
      await AsyncStorage.setItem(
        IP_HISTORY_KEY,
        JSON.stringify(updatedHistory),
      );

      setConfigVisible(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o endereço.');
    }
  };

  const handlePermissions = async () => {
    if (Platform.OS === 'android') {
      const permissionsToRequest = [
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
      ];

      const statuses = await requestMultiple(permissionsToRequest);
      const denied = Object.values(statuses).some(
        s => s === RESULTS.DENIED || s === RESULTS.BLOCKED,
      );

      if (denied) {
        Alert.alert(
          'Permissões Necessárias',
          'Alguns recursos podem não funcionar sem as permissões solicitadas.',
        );
      }
    }
  };

  const loadApps = async () => {
    const stored = await AsyncStorage.getItem('miniApps');
    if (stored) setApps(JSON.parse(stored));
  };

  const saveApps = async updatedApps => {
    await AsyncStorage.setItem('miniApps', JSON.stringify(updatedApps));
    setApps(updatedApps);
  };

  // Detecta sozinho se a URL aponta pra um .zip (vira módulo instalado,
  // offline) ou uma página comum (vira atalho, sempre carregado ao vivo) —
  // o mesmo campo serve pros dois casos.
  const addApp = async () => {
    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl || installing) return;

    setInstalling(true);
    try {
      const id = Date.now().toString();
      const {type, url} = await identifySource(trimmedUrl);

      let newApp;
      if (type === 'module') {
        const installed = await installModuleFromUrl(url, id);
        newApp = {
          id,
          type: 'module',
          label: newLabel.trim() || 'Módulo sem nome',
          url: installed.url,
          sourceUrl: url,
          lastUpdate: Date.now(),
        };
      } else {
        newApp = {
          id,
          type: 'shortcut',
          label: newLabel.trim() || url,
          url,
          lastUpdate: Date.now(),
        };
      }

      await saveApps([...apps, newApp]);
      closeModal();
    } catch (error) {
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível adicionar esse endereço.',
      );
    } finally {
      setInstalling(false);
    }
  };

  // Reinstala só o CÓDIGO do módulo (apps/{id}/code). Dados salvos via
  // Storage/File ficam em outro lugar e não são tocados — ver
  // Services/ModuleInstaller.js para o porquê disso ser garantido.
  const reinstallApp = useCallback(app => {
    Alert.alert(
      'Reinstalar Módulo',
      `Isso baixa a versão mais recente de "${app.label}". Dados salvos pelo módulo (armazenamento e arquivos) não são afetados.`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Reinstalar',
          onPress: async () => {
            setReinstallingId(app.id);
            try {
              const installed = await installModuleFromUrl(
                app.sourceUrl,
                app.id,
              );
              setApps(prev => {
                const updated = prev.map(a =>
                  a.id === app.id
                    ? {...a, url: installed.url, lastUpdate: Date.now()}
                    : a,
                );
                saveApps(updated);
                return updated;
              });
            } catch (error) {
              Alert.alert(
                'Erro',
                error.message || 'Não foi possível reinstalar o módulo.',
              );
            } finally {
              setReinstallingId(null);
            }
          },
        },
      ],
    );
  }, []);

  const deleteApp = useCallback(id => {
    Alert.alert(
      'Excluir Módulo',
      'Deseja remover este módulo permanentemente?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setApps(prev => {
              const updated = prev.filter(app => app.id !== id);
              saveApps(updated);
              return updated;
            });
          },
        },
      ],
    );
  }, []);

  const closeModal = () => {
    setModalVisible(false);
    setNewUrl('');
    setNewLabel('');
  };

  const renderAppItem = useCallback(
    ({item}) => {
      const formattedDate = item.lastUpdate
        ? new Date(item.lastUpdate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : null;
      const isShortcut = item.type === 'shortcut';
      const canReinstall = item.type === 'module' && !!item.sourceUrl;
      const isReinstalling = reinstallingId === item.id;

      return (
        <Card>
          <CardTouchable
            onPress={() =>
              navigation.navigate('WebView', {
                url: item.url,
                htmlLocal: item.htmlLocal,
                appId: item.id,
              })
            }>
            <CardIconContainer>
              <Icon
                name={isShortcut ? 'globe-outline' : 'cube-outline'}
                size={20}
                color="#7C4DFF"
              />
            </CardIconContainer>
            <CardInfo>
              <CardText numberOfLines={1}>{item.label}</CardText>
              <CardSubtext numberOfLines={1}>
                {item.url} {formattedDate ? `• ${formattedDate}` : ''}
              </CardSubtext>
            </CardInfo>
          </CardTouchable>
          {canReinstall && (
            <ReinstallButton
              onPress={() => reinstallApp(item)}
              disabled={isReinstalling}>
              {isReinstalling ? (
                <ActivityIndicator size="small" color="#7C4DFF" />
              ) : (
                <Icon name="refresh-outline" size={18} color="#7C4DFF" />
              )}
            </ReinstallButton>
          )}
          <DeleteButton onPress={() => deleteApp(item.id)}>
            <Icon name="trash-outline" size={18} color="#FF4D4D" />
          </DeleteButton>
        </Card>
      );
    },
    [navigation, deleteApp, reinstallApp, reinstallingId],
  );

  return (
    <Container>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />
      <Content style={{paddingTop: insets.top}}>
        <Header>
          <HeaderTitle>Helper</HeaderTitle>
          <HeaderActions>
            <IconButton onPress={() => setConfigVisible(true)}>
              <Icon name="settings-outline" size={18} color="#FFFFFF" />
            </IconButton>

            {DEBUG && (
              <IconButton onPress={() => navigation.navigate('Lab')}>
                <Icon name="construct-outline" size={18} color="#7C4DFF" />
              </IconButton>
            )}

            <IconButton onPress={() => setMarketplaceVisible(true)}>
              <Icon name="grid-outline" size={18} color="#FFFFFF" />
            </IconButton>
          </HeaderActions>
        </Header>

        <FlatList
          data={apps}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 80,
            paddingTop: 12,
          }}
          renderItem={renderAppItem}
          ListEmptyComponent={
            <EmptyContainer>
              <Icon name="layers-outline" size={44} color="#262632" />
              <EmptyTitle>Nenhum módulo instalado</EmptyTitle>
              <EmptyText>
                Adicione um módulo (.zip) ou um site pela URL, ou escolha algo
                no Marketplace.
              </EmptyText>
            </EmptyContainer>
          }
        />

        <Fab
          style={{bottom: insets.bottom + 20}}
          onPress={() => setModalVisible(true)}>
          <Icon name="add" size={28} color="#FFFFFF" />
        </Fab>

        {/* Modal Adicionar Módulo ou Site */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <ModalOverlay behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Adicionar Módulo ou Site</ModalTitle>
                <ModalCloseButton onPress={closeModal}>
                  <Icon name="close" size={22} color="#707080" />
                </ModalCloseButton>
              </ModalHeader>

              <StyledInput
                value={newLabel}
                onChangeText={setNewLabel}
                placeholder="Nome (opcional)"
                placeholderTextColor="#555565"
              />
              <StyledInput
                value={newUrl}
                onChangeText={setNewUrl}
                placeholder="URL do .zip ou do site — ex: 192.168.1.102:3000"
                placeholderTextColor="#555565"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                editable={!installing}
              />
              <PrimaryButton onPress={addApp} disabled={installing}>
                {installing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ButtonText>Adicionar</ButtonText>
                )}
              </PrimaryButton>
            </ModalContent>
          </ModalOverlay>
        </Modal>

        {/* Modal Configuração de IP com Histórico */}
        <Modal visible={configVisible} animationType="slide" transparent>
          <ModalOverlay behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Configurar Marketplace</ModalTitle>
                <ModalCloseButton onPress={() => setConfigVisible(false)}>
                  <Icon name="close" size={22} color="#707080" />
                </ModalCloseButton>
              </ModalHeader>

              <StyledInput
                value={marketplaceIp}
                onChangeText={setMarketplaceIp}
                placeholder="Ex: 192.168.1.50:8080"
                placeholderTextColor="#555565"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              {ipHistory.length > 0 && (
                <View style={{marginBottom: 8}}>
                  <IpHistoryLabel>IPs Recentes</IpHistoryLabel>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {ipHistory.map(ip => (
                      <IpBadge key={ip} onPress={() => setMarketplaceIp(ip)}>
                        <IpBadgeText>{ip}</IpBadgeText>
                      </IpBadge>
                    ))}
                  </ScrollView>
                </View>
              )}

              <PrimaryButton onPress={saveMarketplaceIp}>
                <ButtonText>Salvar Endereço</ButtonText>
              </PrimaryButton>
            </ModalContent>
          </ModalOverlay>
        </Modal>

        <MarketplaceModal
          visible={marketplaceVisible}
          onClose={() => setMarketplaceVisible(false)}
          openManualAdd={() => setModalVisible(true)}
          onInstall={app => saveApps([...apps, app])}
          installedApps={apps}
        />
      </Content>
    </Container>
  );
}
