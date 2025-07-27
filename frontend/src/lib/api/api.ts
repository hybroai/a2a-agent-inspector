
export const loadAgent = async (url: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/inspector/load`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
    })
    return response.json()
}

export const sendMessage = async (url: string, message: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/inspector/sendMessage`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, message }),
    })
    return response.json()
}
