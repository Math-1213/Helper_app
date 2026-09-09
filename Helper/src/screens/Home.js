import React, {useState, useEffect, useCallback} from 'react';
import {
  FlatList,
  Modal,
  Alert,
  Platform,
  StatusBar,
  DeviceEventEmitter,
  TouchableOpacity,
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
  EmptyContainer,
  EmptyTitle,
  EmptyText,
  Fab,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  ModalTitle,
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
import {downloadUpdateCode} from '../Services/Helper';
import {setMarketplaceBaseURL} from '../bridges/Marketplace';

const DEBUG = false;
const IP_HISTORY_KEY = 'marketplaceIpHistory';

export default function HomeScreen({navigation}) {
  const [apps, setApps] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [marketplaceVisible, setMarketplaceVisible] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [configVisible, setConfigVisible] = useState(false);
  const [marketplaceIp, setMarketplaceIp] = useState('');
  const [ipHistory, setIpHistory] = useState([]);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    handlePermissions();
    loadApps();
    loadMarketplaceConfig();
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'UPDATE_APP_CACHE',
      data => {
        setApps(prevApps => {
          const updated = prevApps.map(app =>
            app.id === data.id
              ? {...app, htmlLocal: data.html, lastUpdate: Date.now()}
              : app,
          );
          saveApps(updated);
          return updated;
        });
      },
    );

    return () => subscription.remove();
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

  const addApp = async () => {
    if (!newUrl.trim()) return;

    try {
      const id = Date.now().toString();
      const resultado = await downloadUpdateCode(newUrl.trim());

      const newApp = {
        id,
        url: newUrl.trim(),
        label: newLabel.trim() || newUrl.trim(),
        htmlLocal: resultado,
        lastUpdate: Date.now(),
      };

      await saveApps([...apps, newApp]);
      closeModal();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível baixar o Módulo.');
    }
  };

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
              <Icon name="cube-outline" size={20} color="#7C4DFF" />
            </CardIconContainer>
            <CardInfo>
              <CardText numberOfLines={1}>{item.label}</CardText>
              <CardSubtext numberOfLines={1}>
                {item.url} {formattedDate ? `• ${formattedDate}` : ''}
              </CardSubtext>
            </CardInfo>
          </CardTouchable>
          <DeleteButton onPress={() => deleteApp(item.id)}>
            <Icon name="trash-outline" size={18} color="#FF4D4D" />
          </DeleteButton>
        </Card>
      );
    },
    [navigation, deleteApp],
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
                Importe executando um endereço de rede local ou selecione no
                Marketplace.
              </EmptyText>
            </EmptyContainer>
          }
        />

        <Fab
          style={{bottom: insets.bottom + 20}}
          onPress={() => setModalVisible(true)}>
          <Icon name="add" size={28} color="#FFFFFF" />
        </Fab>

        {/* Modal Adicionar Módulo */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <ModalOverlay behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Adicionar Módulo</ModalTitle>
                <TouchableOpacity onPress={closeModal}>
                  <Icon name="close" size={22} color="#707080" />
                </TouchableOpacity>
              </ModalHeader>

              <StyledInput
                value={newLabel}
                onChangeText={setNewLabel}
                placeholder="Nome do Módulo"
                placeholderTextColor="#555565"
              />
              <StyledInput
                value={newUrl}
                onChangeText={setNewUrl}
                placeholder="Ex: 192.168.1.102:3000"
                placeholderTextColor="#555565"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <PrimaryButton onPress={addApp}>
                <ButtonText>Instalar Módulo</ButtonText>
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
                <TouchableOpacity onPress={() => setConfigVisible(false)}>
                  <Icon name="close" size={22} color="#707080" />
                </TouchableOpacity>
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
