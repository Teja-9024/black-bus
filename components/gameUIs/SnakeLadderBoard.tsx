import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const BOARD_SIZE = 100;
const BOARD_DIM = screenWidth - 40;
const CELL_SIZE = BOARD_DIM / 10;

interface PlayerInfo {
    userId: string;
    username: string;
    avatar: string | null;
    position: number;
}

interface SnakeLadderGameState {
    players: PlayerInfo[];
    boardSize: number;
    staticSnakes: { head: number; tail: number }[];
    staticLadders: { bottom: number; top: number }[];
    dynamicSnakes: { head: number; tail: number }[];
    dynamicLadders: { bottom: number; top: number }[];
    currentPlayer: string;
    lastDiceRoll: number;
    message: string;
    status: 'playing' | 'waiting' | 'gameOver' | 'draw' | 'completed';
    winner?: string;
}

interface SnakeLadderBoardProps {
    gameState: SnakeLadderGameState;
    currentUserId: string;
    onRollDice: () => void;
}

const SnakeLadderBoard: React.FC<SnakeLadderBoardProps> = ({ gameState, currentUserId, onRollDice }) => {
    const { colors } = useTheme();

    const renderBoardCells = () => {
        const cells = [];
        for (let i = BOARD_SIZE; i >= 1; i--) {
            let row = Math.floor((i - 1) / 10);
            let col;
            if (row % 2 === 0) {
                col = (i - 1) % 10;
            } else {
                col = 9 - ((i - 1) % 10);
            }

            const cellNumber = i;
            const playersOnCell = gameState.players.filter(p => p.position === cellNumber);

            const isLadderBottom = gameState.dynamicLadders.some(l => l.bottom === cellNumber);
            const isLadderTop = gameState.dynamicLadders.some(l => l.top === cellNumber);
            const isSnakeHead = gameState.dynamicSnakes.some(s => s.head === cellNumber);
            const isSnakeTail = gameState.dynamicSnakes.some(s => s.tail === cellNumber);

            cells.push(
                <View
                    key={cellNumber}
                    style={[
                        styles.cell,
                        { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                        (row % 2 === 0 && col % 2 === 0) || (row % 2 !== 0 && col % 2 !== 0) ? {} : { backgroundColor: colors.background }
                    ]}
                >
                    <ThemedText style={[styles.cellNumber, { color: colors.textDim }]}>{cellNumber}</ThemedText>
                    {playersOnCell.map(player => (
                        <View
                            key={player.userId}
                            style={[
                                styles.playerToken,
                                { backgroundColor: player.userId === currentUserId ? colors.primary : colors.tint },
                            ]}
                        >
                            <ThemedText style={{fontSize: 10, color: colors.buttonText}}>
                                {player.username ? player.username[0].toUpperCase() : '?'}{player.userId === currentUserId ? '*' : ''}
                            </ThemedText>
                        </View>
                    ))}
                    {isLadderBottom && <Ionicons name="arrow-up-circle-outline" size={CELL_SIZE / 3} color={colors.success} style={styles.snlIcon} />}
                    {isSnakeHead && <Ionicons name="arrow-down-circle-outline" size={CELL_SIZE / 3} color={colors.error} style={styles.snlIcon} />}
                </View>
            );
        }
        return cells;
    };

    const isMyTurn = gameState.currentPlayer === currentUserId;
    const canRoll = isMyTurn && gameState.status === 'playing';

    return (
        <View style={styles.boardContainer}>
            <View style={styles.boardGrid}>
                {renderBoardCells()}
            </View>

            <View style={styles.controlsContainer}>
                <ThemedText style={[styles.statusMessage, { color: colors.text }]}>
                    {gameState.message}
                </ThemedText>
                {gameState.status === 'playing' && (
                    <ThemedText style={[styles.currentPlayerText, { color: colors.textDim }]}>
                        {isMyTurn ? 'It\'s your turn!' : `Waiting for ${gameState.players.find(p => p.userId === gameState.currentPlayer)?.username || 'opponent'}'s turn`}
                    </ThemedText>
                )}

                {gameState.lastDiceRoll > 0 && (
                    <ThemedText style={[styles.lastRollText, { color: colors.primary }]}>
                        Last Roll: {gameState.lastDiceRoll}
                    </ThemedText>
                )}

                {canRoll && (
                    <TouchableOpacity
                        style={[styles.rollDiceButton, { backgroundColor: colors.primary }]}
                        onPress={onRollDice}
                        disabled={!canRoll}
                    >
                        <ThemedText style={[styles.rollDiceButtonText, { color: colors.buttonText }]}>
                            Roll Dice
                        </ThemedText>
                    </TouchableOpacity>
                )}

                {gameState.status === 'gameOver' && (
                    <ThemedText style={[styles.gameOverText, { color: colors.error }]}>
                        Game Over! {gameState.winner ? `${gameState.players.find(p => p.userId === gameState.winner)?.username || 'A player'} won!` : 'It\'s a draw!'}
                    </ThemedText>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    boardContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    boardGrid: {
        width: BOARD_DIM,
        height: BOARD_DIM,
        flexDirection: 'row',
        flexWrap: 'wrap-reverse',
        borderWidth: 2,
        borderColor: '#333',
        backgroundColor: '#eee',
        overflow: 'hidden',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderWidth: 0.5,
        borderColor: '#aaa',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    cellNumber: {
        position: 'absolute',
        top: 2,
        left: 2,
        fontSize: 10,
        fontWeight: 'bold',
    },
    playerToken: {
        width: CELL_SIZE * 0.6,
        height: CELL_SIZE * 0.6,
        borderRadius: CELL_SIZE * 0.3,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
        elevation: 2,
    },
    snlIcon: {
        position: 'absolute',
        bottom: 2,
        right: 2,
    },
    controlsContainer: {
        marginTop: 20,
        alignItems: 'center',
        width: '80%',
    },
    statusMessage: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    currentPlayerText: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
    },
    lastRollText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    rollDiceButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    rollDiceButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    gameOverText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
    },
});

export default SnakeLadderBoard;