import LottieView from 'lottie-react-native';
import React from 'react';
import { Modal, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';

const SuccessDialog = ({ visible }: { visible: boolean }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <ThemedView style={styles.overlay}>
        <ThemedView style={styles.dialog}>
          <LottieView
            source={require('../assets/animations/success.json')}
            autoPlay
            loop={false}
            style={{ width: 170, height: 170 }}
          />
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

export default SuccessDialog;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});


