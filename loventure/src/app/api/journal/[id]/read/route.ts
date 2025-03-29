import ExchangeJournal from "@/models/ExchangeJournal";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// PATCH /api/journal/:id/read : 교환일기 읽음 처리
export async function PATCH(req: Request, context: { params: { id: string } }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }
    
    // 1. Check if journal exists
    const journalId = context.params.id;

    const journal = await ExchangeJournal.findById(journalId);

    if (!journal || String(journal.coupleId) !== String(user.coupleId)) {
        return error("일기를 찾을 수 없거나 접근 권한이 없습니다.", 404);
    }

    // 2. PATCH ExchangeJournal
    if (!journal.isRead) {
        journal.isRead = true;
        await journal.save();
    }

    // 4. Return Journal info
    return success("읽음 처리 완료", {
        journalId
    });
}