import Schedule from "@/models/Schedule";
import { getAuthenticatedUser } from "@/lib/auth";
import { success, error } from "@/utils/response";

// POST /api/schedule schedule 생성
export async function POST(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    // 1. Create schedule
    const { title, description, startDate, endDate, repeat, participants } = await req.json();

    if (!title || !startDate || !endDate || !participants || !Array.isArray(participants)) {
        return error("필수 항목이 누락되었습니다.", 400);
    }

    const newSchedule = await Schedule.create({
        coupleId: user.coupleId,
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        repeat: repeat || "none",
        isCompleted: false,
        createdBy: user._id,
        participants,
    });

    // 2. Return schedule info
    return success("일정이 생성되었습니다.", {
        schedule: newSchedule,
    });
}

// GET /api/schedule : schedule 조회
export async function GET(req: Request) {
    const { user, error: authError } = await getAuthenticatedUser(req, true);

    if (authError) {
        return error(authError.message, authError.status);
    }

    // 1. Get schedules
    const schedules = await Schedule.find({ coupleId: user.coupleId })
        .sort({ startDate: 1 });

    // 2. Return schedules info
    return success("일정 목록을 불러왔습니다.", {
        schedules,
    });
}