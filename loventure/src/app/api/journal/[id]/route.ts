import ExchangeJournal from "@/models/ExchangeJournal";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// PATCH /api/journal/:id : 교환일기 수정
export async function PATCH(req: Request, context: { params: { id: string } }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    const journalId = context.params.id;
    const journal = await ExchangeJournal.findById(journalId);

    // Check journal exists
    if (!journal || String(journal.coupleId) !== String(user._id)) {
        return error("일기를 찾을 수 없습니다.", 404);
    }

    // Compare Id
    if (String(journal.senderId) !== String(user._id)) {
        return error("권한이 없습니다.", 403);
    }

    // Wait input
    const {
        content,
        images,
        mood,
        weather
    } = await req.json();

    // Change values
    if (content !== undefined) journal.content = content;
    if (images !== undefined) journal.images = images;
    if (mood !== undefined) journal.mood = mood;
    if (weather !== undefined) journal.weatehr = weather;

    await journal.save()

    // Return journal
    return success("일기가 수정되었습니다.", {
        journal,
    });
}

// DELETE /api/journal/:id : 교환일기 삭제
export async function DELETE(req: Request, context: { params: { id: string } }) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    const journalId = context.params.id;
    const journal = await ExchangeJournal.findById(journalId);

    // Check journal exists
    if (!journal || String(journal.coupleId) !== String(user.coupleId)) {
        return error("일기를 찾을 수 없습니다", 404);
    }

    // Compoare Id
    if (String(journal.senderId) !== String(user._id)) {
        return error("권한이 없습니다.", 403);
    }

    // Delete journal
    await ExchangeJournal.deleteOne({ _id: journal._id });

    // Return journal
    return success("일기가 삭제되었습니다.");
}