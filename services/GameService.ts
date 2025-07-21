// services/GameService.ts
import { _post, _get } from "../configs/api-methods.config";

class GameService {
    static async sendGameInvite(token: string, gameId: string, invitedUserIds: string[]) {
        return await _post('games/invite', { gameId, invitedUserIds }, token);
    }

    static async acceptGameInvite(token: string, gameSessionId: string) {
        return await _post(`games/${gameSessionId}/accept`, {}, token);
    }

    static async declineGameInvite(token: string, gameSessionId: string) {
        return await _post(`games/${gameSessionId}/decline`, {}, token);
    }
}
export default GameService;