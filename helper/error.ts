export default function handleError(status: "Bad Request" | "Conflict" | "Unauthorized" | "Forbidden" | "Not Found" | "Internal Server Error", message: string): object {
    return { status, message }
}