import { useMemo } from "react"
import { useCompanyProfile } from "@/features/settings/company-profile-hooks"

const DEFAULT_TIMEZONE = "Asia/Kolkata"

/**
 * Formats dates against the company's configured timezone instead of the viewing browser's
 * local timezone -- two people on different machines/timezones should see the same wall-clock
 * time for the same lead activity. Falls back to the seeded default while the profile is
 * still loading, so there's no flash of browser-local time before it resolves.
 */
export function useFormatDate() {
  const { data: profile } = useCompanyProfile()
  const timeZone = profile?.timezone || DEFAULT_TIMEZONE

  return useMemo(() => {
    const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
      timeZone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    const dateFormatter = new Intl.DateTimeFormat("en-IN", {
      timeZone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

    return {
      formatDateTime: (value: string | Date) => dateTimeFormatter.format(new Date(value)),
      formatDate: (value: string | Date) => dateFormatter.format(new Date(value)),
    }
  }, [timeZone])
}
