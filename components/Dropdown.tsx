import { useTheme } from '@/context/ThemeContext';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { DropdownProps } from 'react-native-element-dropdown/lib/typescript/components/Dropdown/model';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const INPUT_FONT_SIZE = 14;
const INPUT_GAP = 8;
const INPUT_HEIGHT = 48;
const LABEL_FONT_SIZE = 15;
const ROUNDNESS = 5;

type TCustomDropdownProps = DropdownProps<any> & {
  data?: unknown[];
  value?: string | number;
  onChange: (value: string) => void;
  label?: string;
  bordered?: boolean;
  errorMsg?: string;
  labelField?: string;
  valueField?: string;
  backgroundColor?: string;
  disabled?: boolean;
};

const CustomDropdown = ({
  data,
  value,
  onChange,
  label,
  bordered,
  errorMsg,
  labelField = 'label',
  valueField = 'value',
  backgroundColor,
  disabled,
  ...rest
}: TCustomDropdownProps) => {
   const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <ThemedView
      lightColor={backgroundColor}
      style={[styles.container, disabled && styles.disabled]}
    >
      {label && (
        <ThemedText lightColor={colors.text} style={styles.label}>
          {label}
        </ThemedText>
      )}

      <ThemedView lightColor={backgroundColor} style={styles.dropdownContainer}>
              <Dropdown
                  value={value ?? null}
                  data={data ?? []}
                  onChange={(item) => onChange(item[valueField])}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  maxHeight={300}
                  style={[
                      styles.dropdown,
                      { backgroundColor: colors.backgroundSecondary },
                      bordered && { borderColor: colors.border },
                      isFocused && { borderColor: colors.selectedItemBackground },
                  ]}
                  containerStyle={[
                      styles.innerDropdownContainer,
                      { backgroundColor: colors.backgroundSecondary },
                  ]}
                  selectedTextStyle={[
                      styles.text,
                      { color: colors.text },
                      disabled && styles.disabled,
                  ]}
                  placeholderStyle={[styles.text, { color: colors.textDim }]}
                  itemContainerStyle={[styles.innerDropdownContainer]}
                  itemTextStyle={[styles.dropdownText, { color: colors.textSecondary }]}
                  inputSearchStyle={[
                      styles.searchInput,
                      {
                          borderColor: colors.border,
                          color: colors.text,
                          backgroundColor: colors.backgroundSecondary,
                      },
                  ]}
                  searchPlaceholderTextColor={colors.selectedItemBackground}
                  iconStyle={styles.dropdownIcon}
                  iconColor={colors.textDim}
                  searchPlaceholder={'search'}
                  labelField={labelField}
                  valueField={valueField}
                  disable={disabled}
                  flatListProps={{
                      initialNumToRender: 1000,
                      maxToRenderPerBatch: 1000,
                      windowSize: 5,
                      keyExtractor: (item) => item[valueField]?.toString(), 
                  }}
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

export default CustomDropdown;

const styles = StyleSheet.create({
  container: {
    gap: INPUT_GAP,
  },
  label: {
    fontSize: LABEL_FONT_SIZE,
    fontFamily: 'Poppins-Medium', 
    // paddingLeft: 12,
  },
  dropdownContainer: {
    gap: INPUT_GAP,
  },
  dropdown: {
    height: INPUT_HEIGHT + 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderRadius: ROUNDNESS,
    borderWidth: 1,
    borderColor: '#555555',
  },
  innerDropdownContainer: {
    borderRadius: ROUNDNESS - 4,
    marginTop: 0,
  },
  text: {
    fontSize: INPUT_FONT_SIZE,
    fontFamily: 'Poppins-Medium',
  },
  dropdownText: {
    fontSize: INPUT_FONT_SIZE - 2,
    fontFamily: 'Poppins-Medium',
  },
  dropdownIcon: {
    height: 24,
    width: 16,
  },
  searchInput: {
    borderRadius: ROUNDNESS - 4,
    fontFamily: 'Poppins-Medium',
    fontSize: INPUT_FONT_SIZE - 2,
  },
  errorText: {
    paddingLeft: 12,
  },
  disabled: {
    opacity: 0.6,
  },
});
