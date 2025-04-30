import CoupleQuest from "@/models/CoupleQuest";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";
import { getPartnerId } from "@/utils/getPartnerId";
import { sendNotification } from "@/lib/notify";

// POST /api/coupleQuest : 커플 퀘스트 생성
export async function POST(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);
    const partnerId = await getPartnerId(user._id, user.coupleId);

    if (authError) {
        return error(authError.message, authError.status);
    }

    const {
        title,
        description,
        goalType,
        targetValue,
        rewardExp = 0,
        rewardCoins = 0,
    } = await req.json();

    // Check condition
    if (!title) {
        return error("필수 항목이 누락되었습니다.", 400);
    }

    // Check couple exists
    if (!user.coupleId) {
        return error("커플이 아닙니다.", 403);
    }

    const newQuest = await CoupleQuest.create({
        coupleId: user.coupleId,
        title,
        description,
        goalType,
        targetValue,
        currentValue: 0,
        isCompleted: false,
        createdBy: user._id,
        agreed: false,
        reward: {
            exp: rewardExp,
            coins: rewardCoins,
        },
    });

    // send notification to partner
    sendNotification({
        userId: partnerId || "",
        type: "quest",
        content: `${user.nickname}님이 커플 퀘스트를 만들었어요!`,
        link: "/coupleQuest"
    });

    return success("커플 퀘스트가 생성되었습니다.", {
        questId: newQuest._id
    });
}

// GET /api/coupleQuest : 커플 퀘스트 목록 조회
export async function GET(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req);

    if (authError) {
        return error(authError.message, authError.status);
    }

    if (!user.coupleId) {
        return error("커플이 아닙니다.", 403);
    }

    // Get couple quests
    const quests = await CoupleQuest.find({ coupleId: user.coupleId })
        .sort({ createdAt: -1 })
        .populate("createdBy", "nickname");

    return success("커플 퀘트 목록을 불러왔습니다.", {
        quests,
    })
}