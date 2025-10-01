import ExchangeJournal from "@/models/ExchangeJournal";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";
import { getPartnerId } from "@/utils/getPartnerId";
import { sendNotification } from "@/lib/notify";

// POST /api/journal : 교환일기 작성
export async function POST(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);
    const partnerId = await getPartnerId(user._id, user.coupleId);

    if (authError) {
        return error(authError.message, authError.status);
    }

    // Create ExchangeJournal
    const { date, title, content, images, mood, weather } = await req.json();

    if (!title || typeof title !== "string") {
        return error("제목을 입력해주세요.", 400);
    }
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
        date,
        title,
        content,
        images: images || [],
        mood: mood || null,
        weather: weather || null,
        turnNumber,
        isReadBy: [],
        createdAt: new Date(),
    });

    // Send notification to partner
    await sendNotification({
        userId: partnerId || "",
        type: "exchange_journal",
        content: `${user.nickname}님이 교환일기를 작성했어요`,
        link: "/"
    })

    // Return ExchangeJournal info
    return success("일기가 작성되었습니다.", {
        journal: newEntry,
    });
}

// GET /api/journal : 교환일기 목록 조회
export async function GET(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);
    const partnerId = await getPartnerId(user._id, user.coupleId);

    //console.log("partnerId:", partnerId);

    if (authError) {
        return error(authError.message, authError.status);
    }

    // Get ExchangeJournals
    const journals = await ExchangeJournal.find({ coupleId: user.coupleId })
        .sort({ turnNumber: 1})
        .populate("senderId", "nickname profileImage")
        .lean();

    journals.forEach(j => {
        j.isReadByCurrentUser = j.isReadBy?.includes(user._id);
    });

    // Return ExchangeJournals info
    return success("교환일기 목록을 불러왔습니다.", {
        journals,
        lastTurn: journals.at(-1)?.turnNumber || 0,
        partnerId,
    });
}