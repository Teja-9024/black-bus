import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

interface RoleBadgeProps {
  style?: any;
}

export default function RoleBadge({ style }: RoleBadgeProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [role, setRole] = useState<string>("worker");

  useEffect(() => {
    const getRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem("userRole");
        if (storedRole) {
          setRole(storedRole);
        } else if (user?.role) {
          setRole(user.role);
        }
      } catch (error) {
        console.error("Error getting role:", error);
      }
    };

    getRole();
  }, [user]);

  const getRoleColor = () => {
    return role === "owner" ? "#FFD700" : "#4CAF50";
  };

  const getRoleText = () => {
    return role === "owner" ? "Owner" : "Worker";
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
        {getRoleText()}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
}); 