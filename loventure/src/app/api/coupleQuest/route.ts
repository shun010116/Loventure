import CoupleQuest from "@/models/CoupleQuest";
import Character from "@/models/Character";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";
import { getPartnerId } from "@/utils/getPartnerId";
import { sendNotification } from "@/lib/notify";
import { computeCoupleQuestReward } from "@/utils/rewardCalculator";

// POST /api/coupleQuest : 커플 퀘스트 생성
export async function POST(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);
    const partnerId = await getPartnerId(user._id, user.coupleId);

    if (authError) {
        return error(authError.message, authError.status);
    }

    // Check couple exists
    if (!user.coupleId) {
        return error("커플이 아닙니다.", 403);
    }

    const {
        title,
        description,
        goalType = "shared-count",
        targetValue = 1,
        resetType = "Daily",
    } = await req.json();

    // Check condition
    if (!title || !targetValue) {
        return error("필수 항목이 누락되었습니다.", 400);
    }

    const chars = await Character.find({ userId: { $in: [user._id, partnerId] } }).lean();
    const avgLevel = Math.max(
        1,
        Math.round(
            (chars.reduce((s, c) => s+ Number(c?.level ?? 1), 0)) / (chars.length || 1)
        )
    );

    const reward = computeCoupleQuestReward({
        levelForCalc: avgLevel,
        goalType: goalType,
        resetType: resetType,
        targetValue: targetValue,
        evolved: avgLevel >= 20,
    });

    const newQuest = await CoupleQuest.create({
        coupleId: user.coupleId,
        createdBy: user._id,
        title,
        description,
        goalType,
        targetValue,
        reward: {
            exp: reward.exp,
            gold: reward.gold
        },
        progress: { [user._id]: 0 },
    });


    // send notification to partner
    sendNotification({
        userId: partnerId || "",
        type: "quest",
        content: `${user.nickname}님이 커플 퀘스트를 만들었어요!`,
        link: "/"
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

    return success("커플 퀘트 목록을 불러왔습니다.", {
        quests,
    })
}