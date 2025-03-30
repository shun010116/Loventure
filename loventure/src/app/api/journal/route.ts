import ExchangeJournal from "@/models/ExchangeJournal";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// POST /api/journal : 교환일기 작성
export async function POST(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    // Create ExchangeJournal
    const { content, images, mood, weather } = await req.json();

    if (!content || typeof content !== "string") {
        return error("내용을 입력해주세요.", 400);
    }
    // turnNumber 결정
    const lastEntry = await ExchangeJournal.findOne({ coupleId: user.coupleId })
        .sort({ turnNumber: -1 });
    const turnNumber = lastEntry ? lastEntry.turnNumber + 1 : 1;

    const newEntry = await ExchangeJournal.create({
        coupleId: user.coupleId,
        senderId: user._id,
        content,
        images: images || [],
        mood: mood || null,
        weather: weather || null,
        turnNumber,
        isRead: false,
        createdAt: new Date(),
    });

    // Return ExchangeJournal info
    return success("일기가 작성되었습니다.", {
        journal: newEntry,
    });
}

// GET /api/journal : 교환일기 목록 조회
export async function GET(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    // Get ExchangeJournals
    const journals = await ExchangeJournal.find({ coupleId: user.coupleId })
        .sort({ turnNumber: 1})
        .populate("senderId", "nickname profileImage");

    // Return ExchangeJournals info
    return success("교환일기 목록을 불러왔습니다.", {
        journals,
        lastTurn: journals.at(-1)?.turnNumber || 0
    });
}