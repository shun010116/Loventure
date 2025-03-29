import { success, error } from "@/utils/response";

// POST /api/user/logout : 로그아웃
export async function POST(req: Request) {
    try {
        const expiredToken = `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;`;

        // Clear the cookie by setting its expiration date to the past
        return new Response(JSON.stringify({ 
            success: true,
            message: "로그아웃 성공"
        }), {
            status: 200,
            headers: {
                "Set-Cookie": expiredToken,
                "Content-Type": "application/json",
            },
        });
    } catch (err) {
        //console.error("로그아웃 실패:", err);
        return error("서버 오류 발생", 500);
    }
}