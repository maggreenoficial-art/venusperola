import { createAdminClient } from "@/lib/supabase/admin";
import type { AnalyticsEvent, AnalyticsEventType } from "@/lib/analytics-types";

type EventRow = {
  id: string;
  type: string;
  session_id: string | null;
  path: string | null;
  product_id: string | null;
  product_name: string | null;
  variant_id: string | null;
  value: number | null;
  order_id: string | null;
  source: string;
  event_id: string | null;
  created_at: string;
};

function rowToEvent(row: EventRow): AnalyticsEvent {
  return {
    id: row.id,
    type: row.type as AnalyticsEventType,
    timestamp: row.created_at,
    sessionId: row.session_id ?? undefined,
    path: row.path ?? undefined,
    productId: row.product_id ?? undefined,
    productName: row.product_name ?? undefined,
    variantId: row.variant_id ?? undefined,
    value: row.value != null ? Number(row.value) : undefined,
    orderId: row.order_id ?? undefined,
    source: row.source as AnalyticsEvent["source"],
    eventId: row.event_id ?? undefined,
  };
}

export async function trackEventDb(
  event: Omit<AnalyticsEvent, "id" | "timestamp">
): Promise<AnalyticsEvent> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("analytics_events")
    .insert({
      type: event.type,
      session_id: event.sessionId ?? null,
      path: event.path ?? null,
      product_id: event.productId ?? null,
      product_name: event.productName ?? null,
      variant_id: event.variantId ?? null,
      value: event.value ?? null,
      order_id: event.orderId ?? null,
      source: event.source,
      event_id: event.eventId ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToEvent(data as EventRow);
}

export async function getAllEventsDb(): Promise<AnalyticsEvent[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("analytics_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50000);

  if (error) throw error;
  return (data as EventRow[]).map(rowToEvent);
}

export async function getEventsSinceDb(since: Date): Promise<AnalyticsEvent[]> {
  const events = await getAllEventsDb();
  return events.filter((e) => new Date(e.timestamp) >= since);
}
