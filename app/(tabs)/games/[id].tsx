import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import ThemedSafeArea from '@/components/ThemedSafeArea';
import CommonHeader from '@/components/CommonHeader';
import BackButton from '@/components/BackButton';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/constants/Functions';
import { Ionicons } from '@expo/vector-icons';
import SnakeLadderBoard from '@/components/gameUIs/SnakeLadderBoard';

interface GameState {
  status: 'playing' | 'waiting' | 'gameOver' | 'draw' | 'paused';
  winner?: string;
  message?: string;
  players?: any[];
  boardSize?: number;
  dynamicSnakes?: any[];
  dynamicLadders?: any[];
  currentPlayer?: string;
  lastDiceRoll?: number;
  board?: string[][];
}

export default function GameSessionScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { socket } = useSocket();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id: string; gameId: string }>();

  const gameSessionId = params.id;
  const gameIdentifier = params.gameId;
  const currentUserId = user?._id;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loadingGame, setLoadingGame] = useState(true);
  const [isMakingMove, setIsMakingMove] = useState(false);

  console.log(`[GameSessionScreen] Component Mounted. gameSessionId: ${gameSessionId}, gameIdentifier: ${gameIdentifier}, currentUserId: ${currentUserId}`);


  useEffect(() => {
    if (!socket || !gameSessionId || !currentUserId) {
      console.warn('[GameSessionScreen] Essential params missing. Cannot join game.', { socket: !!socket, gameSessionId, currentUserId });
      // It's crucial to ensure navigation happens only if params are valid
      if (!gameSessionId || !currentUserId) { // If ID or user is missing, truly a bad state
          router.replace('/games'); // Redirect to games list
          return;
      }
      return; // Wait for socket to be ready
    }

    console.log(`[GameSessionScreen] Joining game session: ${gameSessionId}`);
    socket.emit('joinGameSession', gameSessionId);
    console.log(`[GameSessionScreen] Requesting initial game state for: ${gameSessionId}`);
    socket.emit('requestGameState', gameSessionId);
    setLoadingGame(true);

    const handleGameStateUpdate = (updatedState: GameState) => {
      console.log('[GameSessionScreen] Received game state update:', updatedState);
      setGameState(updatedState);
      setLoadingGame(false);
      setIsMakingMove(false);

      if (updatedState.status === 'gameOver') {
        Alert.alert('Game Over!', updatedState.winner ? `${updatedState.winner} won!` : 'It\'s a draw!');
      } else if (updatedState.status === 'draw') {
        Alert.alert('Game Over!', 'It\'s a draw!');
      }
    };

    const handleGameError = (errorMsg: string) => {
      showToast('error', `Game Error: ${errorMsg}`);
      console.error('[GameSessionScreen] Game Error:', errorMsg);
      setIsMakingMove(false);
    };

    socket.on('gameStateUpdate', handleGameStateUpdate);
    socket.on('gameError', handleGameError);

    return () => {
      socket.off('gameStateUpdate', handleGameStateUpdate);
      socket.off('gameError', handleGameError);
      socket.emit('leaveGameSession', gameSessionId);
      console.log(`[GameSessionScreen] Left game session: ${gameSessionId}`);
    };
  }, [socket, gameSessionId, currentUserId, router]);


  const handleMakeMove = useCallback((moveData: any) => {
    if (!socket || !gameState || isMakingMove || gameState.status !== 'playing' || gameState.currentPlayer !== currentUserId) {
      console.warn('[GameSessionScreen] Cannot make move:', { socket: !!socket, gameStateStatus: gameState?.status, isMakingMove, currentPlayer: gameState?.currentPlayer, currentUserId });
      showToast('info', gameState?.message || 'Not your turn or game not ready.');
      return;
    }
    setIsMakingMove(true);
    console.log(`[GameSessionScreen] Emitting makeMove for session ${gameSessionId}, player ${currentUserId}, move:`, moveData);
    socket.emit('makeMove', {
      gameSessionId: gameSessionId,
      playerId: currentUserId,
      move: moveData,
    });
  }, [socket, gameState, isMakingMove, currentUserId, gameSessionId]);


  const renderGameSpecificUI = () => {
    if (!gameState) return null;

    switch (gameIdentifier) {
      case 'snake_ladder':
        return (
          <SnakeLadderBoard
            gameState={gameState as any}
            currentUserId={currentUserId!}
            onRollDice={() => handleMakeMove({ type: 'rollDice' })}
          />
        );
      default:
        return (
          <ThemedView style={styles.unknownGameContainer}>
            <ThemedText style={[styles.unknownGameText, { color: colors.error }]}>
              Game not implemented: {gameIdentifier}
            </ThemedText>
          </ThemedView>
        );
    }
  };

  if (loadingGame || !gameState) {
    return (
      <LinearGradient colors={colors.gradient} style={styles.loadingContainer}>
        <ThemedSafeArea style={styles.safeArea}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={[styles.loadingText, { color: colors.text }]}>
            Loading {gameIdentifier || 'game'}...
          </ThemedText>
        </ThemedSafeArea>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={colors.gradient} style={styles.container}>
      <ThemedSafeArea style={styles.safeArea}>
        <CommonHeader
          leftContent={<BackButton />}
          title={gameIdentifier || "Game Session"}
          showBottomBorder={true}
        />
        <View style={styles.gameContent}>
          {renderGameSpecificUI()}
          {isMakingMove && (
            <ThemedText style={[styles.makingMoveText, { color: colors.primary }]}>
              Sending move...
            </ThemedText>
          )}
        </View>
      </ThemedSafeArea>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  gameContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  unknownGameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unknownGameText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  makingMoveText: {
    fontSize: 14,
    marginTop: 10,
  },
});