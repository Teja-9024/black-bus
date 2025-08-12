import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Role = 'owner' | 'worker';
type UserData = { role: Role; name: string };

interface RoleBadgeProps { style?: any; }

export default function RoleBadge({ style }: RoleBadgeProps) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [userData, setUserData] = useState<UserData>({
    role: (user?.role as Role) || 'worker',
    name: user?.name || 'User',
  });

  useEffect(() => {
    const getRole = async () => {
      try {
        const stored = await AsyncStorage.getItem('userData');
        if (stored) {
          // parse the JSON string you saved earlier
          const parsed = JSON.parse(stored) as Partial<UserData>;
          setUserData(prev => ({
            role: (parsed.role as Role) || prev.role,
            name: parsed.name || prev.name,
          }));
        } 
        else if (user?.role || user?.name) {
          // fall back to context if nothing in storage
          setUserData({
            role: (user?.role as Role) || 'worker',
            name: user?.name || 'User',
          });
        }
      } catch (error) {
        console.error('Error getting userData:', error);
      }
    };

    getRole();
  }, [user]);

  const getRoleColor = () => (userData.role === 'owner' ? '#FFD700' : '#4CAF50');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <ThemedView
      style={[
        styles.badge,
        { backgroundColor: getRoleColor() },
        style,
      ]}
    >
      <ThemedText style={styles.roleText}>
        {userData.name} ({userData.role}) • {formatDate(new Date())}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 60,
  },
  roleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
