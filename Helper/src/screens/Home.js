import React, { useState, useEffect } from 'react';
import {
  FlatList,
  Modal,
  Alert,
  Platform,
  StatusBar,
  DeviceEventEmitter,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  requestMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
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
} from './styles';

import MarketplaceModal from '../components/MarketplaceModal';
import { downloadUpdateCode } from '../Services/Helper';
import { setMarketplaceBaseURL } from '../bridges/Marketplace'; // Importe a função que criamos

const debug = false;
export default function HomeScreen({ navigation }) {
  const [apps, setApps] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [marketplaceVisible, setMarketplaceVisible] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [configVisible, setConfigVisible] = useState(false);
  const [marketplaceIp, setMarketplaceIp] = useState('');

  const insets = useSafeAreaInsets();

  useEffect(() => {
    handlePermissions();
    loadApps();
    loadMarketplaceIp(); // Carrega o IP salvo ao abrir o app
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'UPDATE_APP_CACHE',
      data => {
        setApps(prevApps => {
          const updated = prevApps.map(app =>
            app.id === data.id
              ? { ...app, htmlLocal: data.html, lastUpdate: Date.now() }
              : app,
          );
          saveApps(updated);
          return updated;
        });
      },
    );

    return () => subscription.remove();
  }, []);

  const loadMarketplaceIp = async () => {
    try {
      const savedIp = await AsyncStorage.getItem('marketplaceIp');
      if (savedIp) {
        setMarketplaceIp(savedIp);
        setMarketplaceBaseURL(savedIp); // Aplica na instância do Axios
      }
    } catch (error) {
      console.log('Erro ao carregar IP do marketplace', error);
    }
  };

  // Salva o novo IP
  const saveMarketplaceIp = async () => {
    if (!marketplaceIp) return;
    try {
      await AsyncStorage.setItem('marketplaceIp', marketplaceIp);
      setMarketplaceBaseURL(marketplaceIp); // Atualiza o Axios imediatamente
      setConfigVisible(false);
      Alert.alert('Sucesso', 'Endereço do Marketplace atualizado!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a configuração.');
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
          'Alguns recursos do Helper podem não funcionar sem as permissões aceitas.',
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
    if (!newUrl) return;

    try {
      const id = Date.now().toString();
      const resultado = await downloadUpdateCode(newUrl);

      const newApp = {
        id,
        url: newUrl,
        label: newLabel || newUrl,
        htmlLocal: resultado,
        lastUpdate: Date.now(),
      };

      const updatedApps = [...apps, newApp];
      await saveApps(updatedApps);
      closeModal();
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível baixar o Modulo.');
    }
  };

  const deleteApp = id => {
    Alert.alert('Excluir App', 'Deseja realmente remover este Modulo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          const updatedApps = apps.filter(app => app.id !== id);
          saveApps(updatedApps);
        },
      },
    ]);
  };

  const closeModal = () => {
    setModalVisible(false);
    setNewUrl('');
    setNewLabel('');
  };

  return (
    <Container bottom={insets.bottom}>
      <Content top={insets.top + 30}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />

        <Header>
          <HeaderTitle>Helper</HeaderTitle>
          <HeaderActions>
            {/* NOVO: Botão de Configuração do IP */}
            <IconButton onPress={() => setConfigVisible(true)}>
              <Icon name="settings-outline" size={20} color="#FFFFFF" />
            </IconButton>

            {debug && (
              <IconButton onPress={() => navigation.navigate('Lab')}>
                <Icon name="construct-outline" size={20} color="#7c4dff" />
              </IconButton>
            )}

            <IconButton onPress={() => setMarketplaceVisible(true)}>
              <Icon name="grid-outline" size={20} color="#FFFFFF" />
            </IconButton>
          </HeaderActions>
        </Header>

        <FlatList
          data={apps}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 100,
            paddingTop: 8,
          }}
          renderItem={({ item }) => (
            <Card>
              <CardTouchable
                onPress={() =>
                  navigation.navigate('WebView', {
                    url: item.url,
                    htmlLocal: item.htmlLocal,
                    appId: item.id,
                  })
                }
              >
                <CardIconContainer>
                  <Icon name="cube-outline" size={22} color="#7c4dff" />
                </CardIconContainer>
                <CardInfo>
                  <CardText numberOfLines={1}>{item.label}</CardText>
                  <CardSubtext numberOfLines={1}>{item.url}</CardSubtext>
                </CardInfo>
              </CardTouchable>
              <DeleteButton onPress={() => deleteApp(item.id)}>
                <Icon name="trash-outline" size={18} color="#FF4D4D" />
              </DeleteButton>
            </Card>
          )}
          ListEmptyComponent={
            <EmptyContainer>
              <Icon name="layers-outline" size={48} color="#22222A" />
              <EmptyText>Nenhum Modulo importado ainda.</EmptyText>
            </EmptyContainer>
          }
        />

        <Fab
          style={{ bottom: insets.bottom + 24 }}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add" size={28} color="#FFFFFF" />
        </Fab>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <ModalOverlay behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Adicionar Modulo</ModalTitle>
                <TouchableOpacity onPress={closeModal}>
                  <Icon name="close" size={24} color="#707080" />
                </TouchableOpacity>
              </ModalHeader>

              <StyledInput
                value={newLabel}
                onChangeText={setNewLabel}
                placeholder="Nome do App"
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
                <ButtonText>Confirmar e Instalar</ButtonText>
              </PrimaryButton>
            </ModalContent>
          </ModalOverlay>
        </Modal>

        <Modal visible={configVisible} animationType="slide" transparent>
          <ModalOverlay behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Configurar Marketplace</ModalTitle>
                <TouchableOpacity onPress={() => setConfigVisible(false)}>
                  <Icon name="close" size={24} color="#707080" />
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
