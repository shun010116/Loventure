import UserQuest from "@/models/UserQuest";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// PATCH /api/userQuest/:id : 퀘스트 진행/완료 처리
export async function PATCH(req: Request, context: { params: { id: string } }) {
    const { user, error: authError } = await getAuthenticatedUser(req);

    if (authError) {
        return error(authError.message, authError.status);
    }

    // find quest by Id
    const questId = context.params.id;
    const { increment = 1 } = await req.json(); // 기본 +1 증가

    const quest = await UserQuest.findById(questId);

    // Check quest exists
    if (!quest || String(quest.userId) !== String(user._id)) {
        return error("퀘스트를 찾을 수 없거나 접근 권한이 없습니다.", 404);
    }

    // Check quest completed
    if (quest.isCompleted) {
        return error("이미 완료된 퀘스트입니다.", 400);
    }

    // Increse currentValue
    quest.currentValue += increment;

    // Check complete
    if (quest.currentValue >= quest.targetValue) {
        quest.isCompleted = true;
        quest.completedAt = new Date();
    }

    // Update userQuest
    quest.updatedAt = new Date();
    await quest.save();

    // Return userQuest
    return success("퀘스트가 업데이트 되었습니다.", {
        isCompleted: quest.isCompleted,
        currentValue: quest.currentValue,
        targetValue: quest.targetValue,
    });
}

// DELETE /api/userQuest/:id : 퀘스트 삭제
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (authError) {
        return error(authError.message, authError.status);
    }

    const quest = await UserQuest.findById(params.id);
    if (!quest || String(quest.userId) !== String(user._id)) {
        return error("퀘스트를 찾을 수 없거나 삭제 권한이 없습니다.", 403);
    }

    await quest.deleteOne();
    return success("퀘스트가 삭제되었습니다.");
}