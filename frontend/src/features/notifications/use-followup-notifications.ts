import { useEffect, useRef } from "react"
import { useNavigate, type NavigateFunction } from "react-router-dom"
import { toast } from "sonner"
import { useUpcomingFollowups } from "@/features/followups/hooks"
import type { Followup } from "@/features/followups/types"

const THRESHOLDS_MIN = [10, 5, 1]
const POLL_INTERVAL_MS = 30_000

/**
 * Client-side only (tab must be open) -- polls for followups due in the next 15 minutes and
 * fires a browser Notification + toast at the 10/5/1-minute-before marks. Each (followup,
 * threshold) pair only fires once per tab session (tracked in a ref, not persisted) -- if the
 * remaining time has already dropped past multiple thresholds by the time this first polls
 * (e.g. the tab was just opened), those thresholds fire together on the first tick rather than
 * being silently skipped.
 */
export function useFollowupNotifications() {
  const navigate = useNavigate()
  const { data } = useUpcomingFollowups({ refetchInterval: POLL_INTERVAL_MS })
  const firedRef = useRef(new Set<string>())

  useEffect(() => {
    if (typeof Notification === "undefined") return
    if (Notification.permission === "default") {
      void Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (!data) return
    const now = Date.now()

    for (const followup of data) {
      const minutesUntilDue = (new Date(followup.dueAtUtc).getTime() - now) / 60_000

      for (const threshold of THRESHOLDS_MIN) {
        const key = `${followup.id}:${threshold}`
        if (minutesUntilDue <= threshold && !firedRef.current.has(key)) {
          firedRef.current.add(key)
          fireNotification(followup, threshold, navigate)
        }
      }
    }
  }, [data, navigate])
}

function fireNotification(followup: Followup, thresholdMin: number, navigate: NavigateFunction) {
  const message = `Followup with ${followup.leadName} due in ${thresholdMin} min`

  toast(message, {
    action: { label: "View", onClick: () => navigate(`/leads/${followup.leadId}`) },
  })

  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    const notification = new Notification("Followup reminder", { body: message })
    // A raw DOM Notification click isn't inside React Router's context, and background/inactive
    // tabs can be frozen by the browser -- window.location.href is a hard navigation that works
    // unconditionally (React Router deep-links /leads/:id correctly on load), instead of relying
    // on the SPA's navigate() firing correctly from an event source outside the page's normal
    // interaction flow.
    notification.onclick = (event) => {
      event.preventDefault()
      window.focus()
      window.location.href = `/leads/${followup.leadId}`
      notification.close()
    }
  }
}
