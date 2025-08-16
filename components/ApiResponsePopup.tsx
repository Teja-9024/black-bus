import { useTheme } from '@/context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React from 'react';
import {
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface ApiResponsePopupProps {
  visible: boolean;
  onClose: () => void;
  response: {
    success: boolean;
    message?: string;
    data?: any;
    status?: number;
  } | null;
}

const ApiResponsePopup: React.FC<ApiResponsePopupProps> = ({
  visible,
  onClose,
  response,
}) => {
  const { colors } = useTheme();

  if (!response) return null;

  const isSuccess = response.success || response.status === 200;
  const message = response.message || (isSuccess ? 'Operation completed successfully!' : 'Something went wrong');

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <ThemedView style={styles.overlay}>
        <ThemedView style={[styles.dialog, { backgroundColor: colors.background }]}>
          {isSuccess ? (
            // Success Animation
            <LottieView
              source={require('../assets/animations/success.json')}
              autoPlay
              loop={false}
              style={{ width: 120, height: 120, marginBottom: 20 }}
            />
          ) : (
            // Error Icon
            <View style={[styles.errorIcon, { backgroundColor: '#ffebee' }]}>
              <MaterialIcons name="error" size={60} color="#f44336" />
            </View>
          )}

          <ThemedText style={[styles.title, { color: isSuccess ? '#4caf50' : '#f44336' }]}>
            {isSuccess ? 'Success!' : 'Error'}
          </ThemedText>

          <ThemedText style={[styles.message, { color: colors.text }]}>
            {message}
          </ThemedText>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: isSuccess ? '#4caf50' : '#f44336' }]}
            onPress={onClose}
          >
            <ThemedText style={styles.closeButtonText}>OK</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  closeButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ApiResponsePopup;
