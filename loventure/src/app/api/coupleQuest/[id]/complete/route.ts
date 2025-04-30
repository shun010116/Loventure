import CoupleQuest from "@/models/CoupleQuest";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// PATCH /api/coupleQuest/:id/complete : 커플 퀘스트 완료 처리
export async function PATCH(req: Request, context: { params: {id: string } }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    const questId = context.params.id;

    const quest = await CoupleQuest.findById(questId);

    if (!quest || String(quest.coupleId) !== String(user.coupleId)) {
        return error("퀘스트를 찾을 수 없거나 접근 권한이 없습니다.", 404);
    }

    if (quest.isCompleted) {
        return error("이미 완료된 퀘스트입니다.", 400);
    }

    // 퀘스트 완료 처리
    quest.isCompleted = true;
    quest.compltedAt = new Date();
    quest.updatedAt = new Date();
    await quest.save();

    return success("커플 퀘스트가 완료되었습니다.", {
        quest
    });
}