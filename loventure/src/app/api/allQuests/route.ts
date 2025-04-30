import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";
import UserQuest from "@/models/UserQuest";
import CoupleQuest from "@/models/CoupleQuest";
import { getPartnerId } from "@/utils/getPartnerId";

// GET /api/allQuests
export async function GET(req: Request) {
    const{ user, error: authError } = await getAuthenticatedUser(req, true);
    const partnerId = await getPartnerId(user._id, user.coupleId);
    console.log("user._id : ", user._id);
    console.log("partnerId: ", partnerId);

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
    console.log("userQuests: ", userQuests);

    // 커플 퀘스트 가져오기
    const coupleQuests = await CoupleQuest.find({ coupleId: user.coupleId })
        .sort({ createdAt: -1 });
    console.log("coupleQuests: ", coupleQuests);

    // 파트너 퀘스트 가져오기
    let partnerQuests=[];
    if (partnerId) {
        partnerQuests = await UserQuest.find({ userId: partnerId })
            .sort({ createdAt: -1})
            .populate("assignedBy", "nickname");
    }
    console.log("partnerQuests: ", partnerQuests);

    // 통합 반환
    return success("퀘스트 정보를 가져왔습니다.", {
        userQuests,
        coupleQuests,
        partnerQuests,
    })
}