import CoupleQuest from "@/models/CoupleQuest";
import Character from "@/models/Character";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";
import { applyLevelUp } from "@/utils/checkLevelUp";

// PATCH /api/coupleQuest/:id/complete : 커플 퀘스트 완료 요청
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    const quest = await CoupleQuest.findById(params.id);
    if (!quest || quest.status !== "active") {
        return error("진행 중인 커플 퀘스트가 아닙니다.", 400);
    }

    const characters = await Character.find({ coupleId: quest.coupleId });
    characters.forEach((char) => {
        char.exp += quest.reward.exp;
        char.gold += quest.reward.gold;
        applyLevelUp(char);
    });

    quest.status = "completed";
    quest.completedAt = new Date();

    await Promise.all(characters.map((c) => c.save()));

    await quest.save();

    return success("커플 퀘스트가 완료되었습니다.", {
        quest,
    });
}