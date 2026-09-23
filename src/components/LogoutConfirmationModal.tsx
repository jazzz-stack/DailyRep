import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function LogoutConfirmationModal({visible, onCancel, onConfirm}: Props) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.card}>
          <View style={styles.icon}><Text style={styles.iconText}>↗</Text></View>
          <Text style={styles.title}>Log out of DailyRep?</Text>
          <Text style={styles.message}>You can sign back in with your phone number anytime.</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>Log out</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {alignItems: 'center', backgroundColor: 'rgba(16, 33, 27, 0.55)', flex: 1, justifyContent: 'center', padding: 24},
  card: {backgroundColor: '#FFFFFF', borderRadius: 20, maxWidth: 380, padding: 24, width: '100%'},
  icon: {alignItems: 'center', backgroundColor: '#E4F6D2', borderRadius: 22, height: 44, justifyContent: 'center', width: 44},
  iconText: {color: '#37734F', fontSize: 24, fontWeight: '800'},
  title: {color: '#10211B', fontSize: 22, fontWeight: '800', marginTop: 18},
  message: {color: '#607069', fontSize: 15, lineHeight: 22, marginTop: 8},
  actions: {flexDirection: 'row', gap: 10, marginTop: 24},
  cancelButton: {alignItems: 'center', borderColor: '#DCE6DD', borderRadius: 11, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 50},
  cancelText: {color: '#37734F', fontSize: 15, fontWeight: '800'},
  confirmButton: {alignItems: 'center', backgroundColor: '#163B2A', borderRadius: 11, flex: 1, justifyContent: 'center', minHeight: 50},
  confirmText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'},
});
