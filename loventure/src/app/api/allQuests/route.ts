import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";
import UserQuest from "@/models/UserQuest";
import CoupleQuest from "@/models/CoupleQuest";

// GET /api/allQuests
export async function GET(req: Request) {
    const{ user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    if (!user.coupleId) {
        return error("커플이 아닙니다.", 400);
    }

    // 유저 퀘스트 가져오기
    const userQuests = await UserQuest.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .populate("assignedBy", "nickname");

    // 커플 퀘스트 가져오기
    const coupleQuests = await CoupleQuest.find({ coupleId: user.coupleId })
        .sort({ createdAt: -1 });

    // 통합 반환
    return success("퀘스트 정보를 가져왔습니다.", {
        userQuests,
        coupleQuests,
    })
}