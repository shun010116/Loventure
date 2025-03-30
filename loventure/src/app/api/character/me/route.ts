import Character from "@/models/Character";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// GET /api/character/me : 내 캐릭터 상태 조회
export async function GET(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req);

    if (authError) {
        return error(authError.message, authError.status);
    }

    // Find character by userId
    const character = await Character.findOne({ userId: user._id });

    // Check character exists
    if (!character) {
        return error("캐릭터를 찾을 수 없습니다.", 404);
    }

    // Return Character
    return success("캐릭터 정보를 불러왔습니다.", {
        character,
    });
}