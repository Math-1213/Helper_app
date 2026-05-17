import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: #0A0A0C;
`;

export const Content = styled.View`
  flex: 1;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
`;

export const HeaderTitle = styled.Text`
  color: #FFFFFF;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -1px;
`;

export const HeaderActions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

export const IconButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: #16161A;
  align-items: center;
  justify-content: center;
  border: 1px solid #24242A;
`;

export const Card = styled.View`
  background-color: #121216;
  padding: 16px;
  border-radius: 16px;
  margin: 0 20px 12px 20px;
  flex-direction: row;
  align-items: center;
  border: 1px solid #22222A;
`;

export const CardTouchable = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

export const CardIconContainer = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: #1C1C24;
  align-items: center;
  justify-content: center;
`;

export const CardInfo = styled.View`
  flex: 1;
`;

export const CardText = styled.Text`
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
`;

export const CardSubtext = styled.Text`
  color: #707080;
  font-size: 12px;
`;

export const DeleteButton = styled.TouchableOpacity`
  padding: 8px;
  border-radius: 8px;
  background-color: rgba(255, 77, 77, 0.1);
`;

export const EmptyContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px;
  margin-top: 80px;
`;

export const EmptyText = styled.Text`
  color: #4A4A5A;
  text-align: center;
  margin-top: 16px;
  font-size: 15px;
  line-height: 22px;
`;

export const Fab = styled.TouchableOpacity`
  position: absolute;
  right: 24px;
  background-color: #6200EE;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  elevation: 6;
  shadow-color: #6200EE;
  shadow-opacity: 0.5;
  shadow-radius: 12px;
  shadow-offset: 0px 6px;
`;

export const ModalOverlay = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: rgba(5, 5, 5, 0.8);
  justify-content: flex-end;
`;

export const ModalContent = styled.View`
  background-color: #121216;
  padding: 24px 24px 40px 24px;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  border-top-width: 1px;
  border-left-width: 1px;
  border-right-width: 1px;
  border-color: #22222A;
`;

export const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const ModalTitle = styled.Text`
  color: #FFFFFF;
  font-size: 20px;
  font-weight: 700;
`;

export const StyledInput = styled.TextInput`
  background-color: #1C1C24;
  color: #FFFFFF;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 15px;
  border: 1px solid #22222A;
`;

export const PrimaryButton = styled.TouchableOpacity`
  background-color: #6200EE;
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  margin-top: 8px;
`;

export const ButtonText = styled.Text`
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
`;