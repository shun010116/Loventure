import CoupleQuest from "@/models/CoupleQuest";
import Character from "@/models/Character";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";
import { applyLevelUp } from "@/utils/checkLevelUp";

// PATCH /api/coupleQuest/:id/progress : 커플 퀘스트 진행도 업데이트
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const { user, error: authError } = await getAuthenticatedUser(req);

    if (authError) {
        return error(authError.message, authError.status);
    }

    const quest = await CoupleQuest.findById(params.id);

    if (!quest) return error("퀘스트를 찾을 수 없거나 접근 권한이 없습니다.", 404);
    if (quest.status !== "active") return error("이미 완료된 퀘스트입니다.", 400);

    if (String(quest.coupleId) !== String(user.coupleId)) {
        return error("이 퀘스트에 접근할 수 없습니다.", 403);
    }

    // Increment user's progress
    const current = quest.progress.get(user._id.toString()) || 0;
    quest.progress.set(user._id.toString(), current + 1);

    // Check if the quest is completed
    const userIds = Array.from(quest.progress.keys());
    const progresses = userIds.map(id => quest.progress.get(id) || 0);
    const total = progresses.reduce((a, b) => a + b, 0);

    const isComplete =
        quest.goalType === "shared-count"
            ? total >= quest.targetValue
            : progresses.every(p => p >= quest.targetValue);

    // Update quest status if completed
    if (isComplete) {
        quest.status = "completed";
        quest.completedAt = new Date();

        // Reward both users
        const characters = await Character.find({ userId: { $in: userIds } });
        characters.forEach((char) => {
            char.exp += quest.reward.exp;
            char.gold += quest.reward.gold;
            applyLevelUp(char);
        });

        await Promise.all(characters.map((c) => c.save()));
    }

    await quest.save();

    return success(isComplete ? "퀘스트 완료!" : "진행도가 업데이트되었습니다.", {
        completed: isComplete,
        progress: Object.fromEntries(quest.progress),
    });
}