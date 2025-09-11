import ExchangeJournal from "@/models/ExchangeJournal";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// PATCH /api/journal/:id/read : 교환일기 읽음 처리
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);
    const { id } = await params;

    if (authError) {
        return error(authError.message, authError.status);
    }

    const journal = await ExchangeJournal.findById(id);

    if (!journal || String(journal.coupleId) !== String(user.coupleId)) {
        return error("일기를 찾을 수 없거나 접근 권한이 없습니다.", 404);
    }

    // Check if the journal is already read by the user
    if (journal.senderId.toString() === user._id.toString()) {
        return success("본인이 작성한 일기입니다.");
    }

    const alreadyRead = (journal.isReadBy ?? []).some((uid: { toString(): string }) => uid.toString() === user._id.toString());

    // PATCH ExchangeJournal
    if (!alreadyRead) {
        journal.isReadBy = [...(journal.isReadBy || []), user._id];
        await journal.save();
    }

    // Return Journal info
    return success("읽음 처리 완료", {
        journal
    });
}
