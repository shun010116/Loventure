import UserQuest from "@/models/UserQuest";
import Character from "@/models/Character";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";
import { applyLevelUp } from "@/utils/checkLevelUp";

// PATCH api/userQuest/:id/complete : 퀘스트 완료 요청
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);
    const { id } = await params;

    if (authError) {
        return error(authError.message, authError.status);
    }

    const quest = await UserQuest.findById(id);
    if (!quest || quest.status !== "accepted") {
        return error("진행 중인 퀘스트가 아닙니다.", 400);
    }

    const receiverCharacter = await Character.findOne({ userId: quest.userId });
    const creatorCharacter = await Character.findOne({ userId: quest.createdBy });

    if (!receiverCharacter || !creatorCharacter) {
        return error("캐릭터 정보를 찾을 수 없습니다.", 400);
    }

    quest.completedAt = new Date();

    if (quest.needApproval) {
        quest.status = "completed";
    } else {
        quest.status = "approved";
        quest.approvedAt = new Date();

        receiverCharacter.exp += quest.reward.exp;
        receiverCharacter.gold += quest.reward.gold;

        if (quest.createdBy !== quest.UserId) {
            // If the quest was created by a different user, update the creator's locked gold
            creatorCharacter.lockedGold -= quest.reward.gold;
            await creatorCharacter.save();
        }
    }

    applyLevelUp(receiverCharacter);

    await receiverCharacter.save();
    await quest.save();

    return success(quest.needApproval ? "퀘스트 완료 요청이 전송되었습니다." : "퀘스트가 완료되었습니다.");
}
