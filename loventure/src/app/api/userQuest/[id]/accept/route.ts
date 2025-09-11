import UserQuest from "@/models/UserQuest";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";
import { sendNotification } from "@/lib/notify";

// PATCH /api/userQuest/:id/accept : 퀘스트 수락
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);
    const { id } = await params;

    if (authError) {
        return error(authError.message, authError.status);
    }

    const quest = await UserQuest.findById(id);
    if (!quest || quest.status != "pending") {
        return error("유효하지 않은 퀘스트입니다.", 400);
    }

    quest.status = "accepted";
    await quest.save();

    return success("퀘스트를 수락했습니다.");
}
