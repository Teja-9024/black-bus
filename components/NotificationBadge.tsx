import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  size = 'medium' 
}) => {
  const { colors } = useTheme();
  
  if (count <= 0) return null;

  const sizeConfig = {
    small: { width: 16, height: 16, fontSize: 8, top: -3, right: -6 },
    medium: { width: 20, height: 20, fontSize: 10, top: -5, right: -10 },
    large: { width: 24, height: 24, fontSize: 12, top: -6, right: -12 }
  };

  const config = sizeConfig[size];

  return (
    <View 
      style={[
        styles.badge, 
        { 
          backgroundColor: colors.primary,
          width: config.width,
          height: config.height,
          top: config.top,
          right: config.right,
        }
      ]}
    >
      <ThemedText 
        style={[
          styles.badgeText, 
          { 
            fontSize: config.fontSize,
            lineHeight: config.height,
          }
        ]}
      >
        {count > 99 ? '99+' : count.toString()}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 16,
    paddingHorizontal: 2,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 