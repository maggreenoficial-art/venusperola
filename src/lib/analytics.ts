import crypto from "crypto";
import type { AnalyticsEvent, AnalyticsEventType } from "@/lib/analytics-types";
import { trackEventDb, getAllEventsDb, getEventsSinceDb } from "@/lib/db/analytics";
import { hasAdminClient } from "@/lib/supabase/admin";

export type { AnalyticsEvent, AnalyticsEventType };

export function generateEventId(): string {
  return crypto.randomUUID();
}

export async function trackEvent(
  event: Omit<AnalyticsEvent, "id" | "timestamp">
): Promise<AnalyticsEvent> {
  if (!hasAdminClient()) {
    return {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
  }
  return trackEventDb(event);
}

export async function getEventsSince(since: Date): Promise<AnalyticsEvent[]> {
  if (!hasAdminClient()) return [];
  return getEventsSinceDb(since);
}

export async function getAllEvents(): Promise<AnalyticsEvent[]> {
  if (!hasAdminClient()) return [];
  return getAllEventsDb();
}

export async function countEventsByType(
  type: AnalyticsEventType,
  since: Date
): Promise<number> {
  const events = await getEventsSince(since);
  return events.filter((e) => e.type === type).length;
}
