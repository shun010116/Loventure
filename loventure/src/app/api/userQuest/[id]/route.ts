import UserQuest from "@/models/UserQuest";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";
import Character from "@/models/Character";
import { applyLevelUp } from "@/utils/checkLevelUp";

// PATCH /api/userQuest/:id : 퀘스트 수정
export async function PATCH(req: Request, { params }: { params: Promise<{id: string }> }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);
    const { id } = await params;

    if (authError) {
        return error(authError.message, authError.status);
    }

    const quest = await UserQuest.findById(id);

    if (!quest || String(quest.userId) !== String(user._id)) {
        return error("퀘스트를 찾을 수 없거나 접근 권한이 없습니다.", 404);
    }

    const { title, description, difficulty, goalType, resetType, targetValue } = await req.json();

    // 수정 가능한 필드만 업데이트
    if (title !== undefined) quest.title = title;
    if (description !== undefined) quest.description = description;
    if (difficulty !== undefined) quest.difficulty = difficulty;
    if (goalType !== undefined) quest.goalType = goalType;
    if (resetType !== undefined) quest.resetType = resetType;
    if (targetValue !== undefined) quest.targetValue = targetValue;

    quest.status = "pending";
    quest.updatedAt = new Date();
    await quest.save();

    return success("퀘스트가 수정되었습니다.", {
        questId: quest._id,
    });

}

// DELETE /api/userQuest/:id : 퀘스트 삭제
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error: authError } = await getAuthenticatedUser(req);
    const { id } = await params;

    if (authError) {
        return error(authError.message, authError.status);
    }

    const quest = await UserQuest.findById(id);
    if (!quest || String(quest.createdBy) !== String(user._id)) {
        return error("퀘스트를 찾을 수 없거나 삭제 권한이 없습니다.", 403);
    }

    await quest.deleteOne();
    return success("퀘스트가 삭제되었습니다.");
}
