const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiResponse<T = Record<string, unknown>> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

async function apiRequest<T = Record<string, unknown>>(
    endpoint: string,
    body: Record<string, unknown>
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: errorData.detail || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
            };
        }

        return await response.json();
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return {
                success: false,
                error: 'Network error: Unable to connect to the server',
            };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
        };
    }
}

export const loadAgent = async (url: string): Promise<ApiResponse> => {
    return apiRequest('/api/v1/inspector/load', { url });
};

export const sendMessage = async (url: string, message: string): Promise<ApiResponse> => {
    return apiRequest('/api/v1/inspector/send-message', { url, message });
};
