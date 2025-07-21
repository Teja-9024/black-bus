import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import GameService from '@/services/GameService';
import { showToast } from '@/constants/Functions';

interface GameInvite {
  gameSessionId: string;
  gameId: string;
  gameName: string;
  initiator: {
    id: string;
    username: string;
    avatar: string | null;
  };
  timestamp: string;
}

interface GameContextType {
  pendingInvites: GameInvite[];
  acceptGameInvite: (gameSessionId: string) => Promise<void>;
  declineGameInvite: (gameSessionId: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { accessToken } = useAuth();
  const router = useRouter();
  const [pendingInvites, setPendingInvites] = useState<GameInvite[]>([]);

  useEffect(() => {
    if (!socket || !accessToken) {
        console.log("[GameContext] Socket or accessToken not available for listeners.");
        return;
    }
    console.log("[GameContext] Setting up socket listeners.");

    const handleGameInvite = (invite: GameInvite) => {
      setPendingInvites((prev) => [...prev, invite]);
      Alert.alert(
        `Game Invite from ${invite.initiator.username}`,
        `You've been invited to play ${invite.gameName}!`,
        [
          {
            text: 'Decline',
            onPress: async () => {
              try {
                await GameService.declineGameInvite(accessToken, invite.gameSessionId);
                showToast('info', `Declined invite for ${invite.gameName}`);
                setPendingInvites((prev) => prev.filter(inv => inv.gameSessionId !== invite.gameSessionId));
              } catch (e: any) {
                showToast('error', e.response?.data?.message || 'Failed to decline invite.');
              }
            },
            style: 'cancel',
          },
          {
            text: 'Accept',
            onPress: async () => {
              try {
                await GameService.acceptGameInvite(accessToken, invite.gameSessionId);
                showToast('success', `Accepted invite for ${invite.gameName}!`);
                setPendingInvites((prev) => prev.filter(inv => inv.gameSessionId !== invite.gameSessionId));
              } catch (e: any) {
                showToast('error', e.response?.data?.message || 'Failed to accept invite.');
              }
            },
          },
        ]
      );
    };

    const handleGameInviteAccepted = (data: any) => {
        console.log("[GameContext] Received gameInviteAccepted:", data);
        setPendingInvites((prev) => prev.filter(inv => inv.gameSessionId !== data.gameSessionId));
    };

    const handleGameInviteDeclined = (data: any) => {
        console.log("[GameContext] Received gameInviteDeclined:", data);
        setPendingInvites((prev) => prev.filter(inv => inv.gameSessionId !== data.gameSessionId));
    };

    const handleGameSessionStarted = (data: any) => {
        console.log("[GameContext] Received gameSessionStarted:", data);
        showToast('success', `Game ${data.gameId} is starting!`);
        setPendingInvites((prev) => prev.filter(inv => inv.gameSessionId !== data.gameSessionId));
        
        console.log(`[GameContext] Attempting to navigate to game session: / (game) / [id] with ID: ${data.gameSessionId}, Game ID: ${data.gameId}`);
        router.push({
            pathname: '/games/[id]', // Corrected path for group routing
            params: { id: data.gameSessionId, gameId: data.gameId }
        });
    };

    socket.on('gameInvite', handleGameInvite);
    socket.on('gameInviteAccepted', handleGameInviteAccepted);
    socket.on('gameInviteDeclined', handleGameInviteDeclined);
    socket.on('gameSessionStarted', handleGameSessionStarted);

    return () => {
      socket.off('gameInvite', handleGameInvite);
      socket.off('gameInviteAccepted', handleGameInviteAccepted);
      socket.off('gameInviteDeclined', handleGameInviteDeclined);
      socket.off('gameSessionStarted', handleGameSessionStarted);
      console.log("[GameContext] Cleared socket listeners.");
    };
  }, [socket, accessToken, router]);

  const acceptGameInvite = useCallback(async (gameSessionId: string) => {
    if (!accessToken) throw new Error("No access token available.");
    await GameService.acceptGameInvite(accessToken, gameSessionId);
  }, [accessToken]);

  const declineGameInvite = useCallback(async (gameSessionId: string) => {
    if (!accessToken) throw new Error("No access token available.");
    await GameService.declineGameInvite(accessToken, gameSessionId);
  }, [accessToken]);

  const contextValue: GameContextType = {
    pendingInvites,
    acceptGameInvite,
    declineGameInvite,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};