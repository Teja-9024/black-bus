import { useTheme } from '@/context/ThemeContext';
import React, { useState } from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';



type TCustomTextInputProps = TextInputProps & {
  label?: string;
  onBlur?: () => void;
  secureTextEntry?: boolean;
  bordered?: boolean;
  showPasswordStrengthMeter?: boolean;
  disabled?: boolean;
  errorMsg?: string;
  labelBackgroundColor?: string;
  textboxBackgroundColor?: string;
};

const CustomTextInput = ({
  label,
  style,
  onBlur,
  secureTextEntry,
  bordered,
  disabled,
  errorMsg,
  labelBackgroundColor,
  textboxBackgroundColor,
  ...rest
}: TCustomTextInputProps) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);
  
  const isEditable = rest.editable !== false;
  return (
    <ThemedView
      lightColor={labelBackgroundColor}
      style={[styles.container, disabled && styles.disabled]}
    >
      {label && (
        <ThemedView
          lightColor={labelBackgroundColor}
          style={styles.labelContainer}
        >
          <ThemedText
            lightColor={colors.text}
            style={styles.label}
          >
            {label}
          </ThemedText>
        </ThemedView>
      )}

      <ThemedView
        lightColor={textboxBackgroundColor}
        style={styles.inputWrapper}
      >
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: bordered
                ? isFocused
                  ? colors.tabBarBorder
                  : colors.border
                : 'transparent',
            },
            !isEditable && styles.nonEditable,
            style,
          ]}
          mode="outlined"
          underlineColor="transparent"
          activeUnderlineColor="transpare nt"
          placeholderTextColor={colors.textDim}
          cursorColor={colors.text}
          textColor={colors.text}
          selectionColor={colors.primary}
          onSubmitEditing={Keyboard.dismiss}
          onFocus={() => setIsFocused(true)}
          activeOutlineColor={colors.tabBarBorder} // Optional
          outlineColor={bordered ? colors.border : 'transparent'}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          secureTextEntry={secureTextEntry && isPasswordVisible}
          right={
            secureTextEntry ? (
              <TextInput.Icon
                icon={() => (
                  <Icon
                    name={isPasswordVisible ? 'eye' : 'eye-off'}
                    size={20}
                    color={colors.textDim}
                  />
                )}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              />
            ) : undefined
          }
          disabled={disabled}
          {...rest}
        />

        {errorMsg && (
          <ThemedText
            lightColor={colors.error}
            style={styles.errorText}
          >
            {errorMsg}
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 1,
  },
  labelContainer: {
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputWrapper: {
    borderRadius: 10,
    // Removed overflow: 'hidden' to prevent border cutoff
    // overflow: 'hidden',
    // Added marginVertical for spacing
    marginVertical: 2,
  },
  textInput: {
    fontSize: 14,
    // borderWidth: 2,
    borderRadius: 10,
    // paddingHorizontal: 12,
    // Ensure text is visible
    // paddingVertical: 6,

  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    paddingLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  nonEditable: {
  backgroundColor: '#413d3dff', // or colors.disabledBackground if defined
  opacity: 0.8, // gives a slightly dimmed feel
},
});
