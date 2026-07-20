import { isAxiosError } from "axios"

interface ProblemDetails {
  title?: string
}

/** Surfaces the backend's ProblemDetails "title" (e.g. a ConflictException message) when present. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ProblemDetails>(error) && error.response?.data?.title) {
    return error.response.data.title
  }
  return fallback
}
