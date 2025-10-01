import UserQuest from "@/models/UserQuest";
import Character from "@/models/Character";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";
import { sendNotification } from "@/lib/notify";
import { computeUserQuestReward } from "@/utils/rewardCalculator";

// POST /api/userQuest : 개인 퀘스트 생성
export async function POST(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    // Wait input
    const {
        userId,
        createdBy = user._id,
        title,
        description,
        difficulty,
        goalType = "check",
        resetType = "Daily",
        targetValue = 1,
        reward = {
            exp: 0,
            gold: 0,
        },
        needApproval,
    } = await req.json();

    // Check couple exists
    if (String(createdBy) !== String(user._id) && !user.coupleId) {
        return error("상대에게 퀘스트를 주려면 커플이 연결되어 있어야 합니다.", 403);
    }
    
    // Check condition
    if (!userId || !createdBy || !title || !difficulty || !goalType || !resetType) {
        return error("필수 항목이 누락되었습니다.", 400);
    }
    
    const isSelf = userId === createdBy;

    if (!isSelf) {
        const creatorCharacter = await Character.findOne({ userId: createdBy });
        if (!creatorCharacter || creatorCharacter.gold < reward.gold) {
            return error("보상 설정에 필요한 골드가 부족합니다.", 400);
        }

        // Deduct gold from creator's character
        creatorCharacter.gold -= reward.gold;
        creatorCharacter.lockedGold += reward.gold;
        await creatorCharacter.save();
    }

    const char = await Character.findOne({ userId: userId });
    const level = char.level;

    const calcReward = computeUserQuestReward({
        level,
        difficulty: difficulty,
        goalType: goalType,
        resetType: resetType,
        targetValue: goalType === "count" ? (targetValue ?? 1) : 1,
        evolved: level >= 20,
    })

    // Create UserQuest
    const newQuest = await UserQuest.create({
        userId,
        createdBy,
        title,
        description,
        difficulty,
        goalType,
        resetType,
        targetValue,
        reward: {
            exp: calcReward.exp,
            gold: isSelf ? calcReward.gold : reward.gold
        },
        needApproval,
        status: isSelf ? "accepted" : "pending", // If self-created, set status to accepted
    });

    sendNotification({
        userId: user._id,
        type: "quest",
        content: `${user.nickname}님이 퀘스트를 생성했어요!`,
        link: "/",
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

    // Return UserQuest
    return success("개인 퀘스트 목록을 불러왔습니다.", {
        quests,
    });
}