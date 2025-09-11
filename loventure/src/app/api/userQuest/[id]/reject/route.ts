import UserQuest from "@/models/UserQuest";
import Character from "@/models/Character";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// PATCH /api/userQuest/:id/reject : 퀘스트 거절
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);
    const { id } = await params;

    if (authError) {
        return error(authError.message, authError.status);
    }

    const quest = await UserQuest.findById(id);
    if (!quest) {
        return error("유효하지 않은 퀘스트입니다.", 400);
    }

    const creatorCharacter = await Character.findOne({ userId: quest.createdBy });
    if (quest.status === "pending" && creatorCharacter) {
        creatorCharacter.lockedGold -= quest.reward.gold;
        creatorCharacter.gold += quest.reward.gold;
        await creatorCharacter.save();
    }

    quest.status = "rejected";
    await quest.save();

    return success("퀘스트를 거절하였습니다.");
}
