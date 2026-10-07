import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: #0a0a0c;
`;

export const TopBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #121216;
  border-bottom-width: 1px;
  border-bottom-color: #22222a;
  elevation: 4;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 4px;
`;

export const TopBarTitle = styled.Text`
  color: #9494a6;
  font-size: 13px;
  font-weight: 500;
  flex: 1;
  text-align: center;
  margin-horizontal: 10px;
`;

export const WebViewContainer = styled.View`
  flex: 1;
`;

export const Content = styled.View`
  flex: 1;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px 20px;
`;

export const HeaderTitle = styled.Text`
  color: #ffffff;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
`;

export const HeaderActions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const IconButton = styled.TouchableOpacity`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  background-color: #1c1c24;
  align-items: center;
  justify-content: center;
`;

export const Card = styled.View`
  background-color: #121216;
  border-radius: 16px;
  margin: 0 20px 10px 20px;
  flex-direction: row;
  align-items: center;
  border: 1px solid #22222a;
  padding: 12px 16px;
`;

export const CardTouchable = styled.TouchableOpacity.attrs({
  activeOpacity: 0.6,
})`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 14px;
`;

export const CardIconContainer = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: rgba(124, 77, 255, 0.12);
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(124, 77, 255, 0.25);
`;

export const CardInfo = styled.View`
  flex: 1;
`;

export const CardText = styled.Text`
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 2px;
`;

export const CardSubtext = styled.Text`
  color: #707080;
  font-size: 12px;
`;

export const DeleteButton = styled.TouchableOpacity.attrs({
  activeOpacity: 0.6,
})`
  padding: 8px;
  border-radius: 8px;
  background-color: rgba(255, 77, 77, 0.08);
`;

export const ReinstallButton = styled.TouchableOpacity.attrs({
  activeOpacity: 0.6,
})`
  padding: 8px;
  border-radius: 8px;
  background-color: rgba(124, 77, 255, 0.08);
  margin-right: 6px;
`;

export const EmptyContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px;
  margin-top: 60px;
`;

export const EmptyTitle = styled.Text`
  color: #ececf1;
  font-size: 16px;
  font-weight: 600;
  margin-top: 16px;
`;

export const EmptyText = styled.Text`
  color: #555565;
  text-align: center;
  margin-top: 6px;
  font-size: 13px;
  line-height: 18px;
`;

export const Fab = styled.TouchableOpacity.attrs({
  activeOpacity: 0.8,
})`
  position: absolute;
  right: 20px;
  background-color: #7c4dff;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  elevation: 8;
  shadow-color: #7c4dff;
  shadow-opacity: 0.4;
  shadow-radius: 10px;
  shadow-offset: 0px 4px;
`;

export const ModalOverlay = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.75);
  justify-content: flex-end;
`;

export const ModalContent = styled.View`
  background-color: #121216;
  padding: 20px 20px 32px 20px;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  border-top-width: 1px;
  border-color: #22222a;
`;

export const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const ModalTitle = styled.Text`
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
`;

export const ModalCloseButton = styled.TouchableOpacity.attrs({
  activeOpacity: 0.7,
  hitSlop: {top: 8, bottom: 8, left: 8, right: 8},
})`
  padding: 4px;
`;

export const StyledInput = styled.TextInput`
  background-color: #1a1a22;
  color: #ffffff;
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  border: 1px solid #262632;
`;

export const PrimaryButton = styled.TouchableOpacity.attrs({
  activeOpacity: 0.8,
})`
  background-color: #7c4dff;
  padding: 14px;
  border-radius: 12px;
  align-items: center;
  margin-top: 6px;
`;

export const ButtonText = styled.Text`
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
`;

/* Novos componentes para o Histórico de IPs */
export const IpHistoryLabel = styled.Text`
  color: #707080;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

export const IpBadge = styled.TouchableOpacity.attrs({
  activeOpacity: 0.7,
})`
  background-color: #1a1a22;
  border: 1px solid #262632;
  border-radius: 8px;
  padding: 6px 12px;
  margin-right: 8px;
  margin-bottom: 12px;
`;

export const IpBadgeText = styled.Text`
  color: #7c4dff;
  font-size: 13px;
  font-weight: 500;
`;
