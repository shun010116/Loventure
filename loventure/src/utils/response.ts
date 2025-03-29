type MakeResponseOptions<T = any> = {
    success: boolean;
    message: string;
    data?: T;
};

export function makeResponse<T>(
    options: MakeResponseOptions<T>,
    status: number = 200
): Response {
    const { success, message, data } = options;

    const body = data !== undefined
        ? { success, message, data }
        : { success, message };
    
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

/**
 * 성공 응답 생성
 * @param message - 성공 메시지
 * @param data - 포함할 데이터(optional)
 * @param status - 상태 코드 (default 200)
 */
export function success<T>(
    message: string,
    data?: T,
    status: number = 200
): Response {
    return makeResponse({ success: true, message, data }, status);
}

/**
 * 실패 응답 생성
 * @param message - 에러 메시지
 * @param status - 상태 코드 (default 400)
 */
export function error(message: string, status: number = 400): Response {
    return makeResponse({ success: false, message }, status);
}