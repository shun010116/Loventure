import UserQuest from "@/models/UserQuest";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";
import { sendNotification } from "@/lib/notify";

// POST /api/userQuest : 개인 퀘스트 생성
export async function POST(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    // Wait input
    const {
        title,
        description,
        goalType,
        targetValue,
        rewardExp,
        assignedToId,
    } = await req.json();

    // Check condition
    if (!title || !goalType || !targetValue == null || !assignedToId || !rewardExp == null) {
        return error("필수 항목이 누락되었습니다.", 400);
    }

    // Check couple exists
    if (String(assignedToId) !== String(user._id) && !user.coupleId) {
        return error("상대에게 퀘스트를 주려면 커플이 연결되어 있어야 합니다.", 403);
    }

    // Create UserQuest
    const newQuest = await UserQuest.create({
        userId: assignedToId,
        assignedBy: user._id,
        title,
        description,
        goalType,
        targetValue,
        currentValue: 0,
        isCompleted: false,
        reward: {
            exp: rewardExp,
        },
    });

    sendNotification({
        userId: assignedToId,
        type: "quest",
        content: `${user.nickname}님이 퀘스트를 생성했어요!`,
        link: "/UserQuest",
    })

    // Return UserQuest
    return success("개인 퀘스트가 생성되었습니다.", {
        questId: newQuest._id,
    });
}

// GET /api/userQuest : 내가 받은 개인 퀘스트 목록
export async function GET(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req);

    if (authError) {
        return error(authError.message, authError.status);
    }

    // Find UserQuest
    const quests = await UserQuest.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .populate("assignedBy", "nickname");

    // Return UserQuest
    return success("개인 퀘스트 목록을 불러왔습니다.", {
        quests,
    });
}