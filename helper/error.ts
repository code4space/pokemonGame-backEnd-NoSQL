export default function handleError(status: "Bad Request" | "Unauthorized" | "Forbidden" | "Not Found" | "Internal Server Error", message: string): object {
    return { status, message }
}