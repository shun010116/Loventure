import Character from "@/models/Character";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";
import { getPartnerId } from "@/utils/getPartnerId";

// GET /api/character/me : 내 캐릭터 상태 조회
export async function GET(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (authError) {
        return error(authError.message, authError.status);
    }

    const partnerId = await getPartnerId(user._id, user.coupleId);

    // Find character by userId
    const myCharacter = await Character.findOne({ userId: user._id });
    const partnerCharacter = await Character.findOne({ userId: partnerId });

    // Check character exists
    if (!myCharacter) {
        return error("캐릭터를 찾을 수 없습니다.", 404);
    }

    // Return Character
    return success("캐릭터 정보를 불러왔습니다.", {
        myCharacter,
        partnerCharacter,
    });
}