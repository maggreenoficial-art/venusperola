export type AnalyticsEventType =
  | "page_view"
  | "view_content"
  | "add_to_cart"
  | "initiate_checkout"
  | "purchase";

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: string;
  sessionId?: string;
  path?: string;
  productId?: string;
  productName?: string;
  variantId?: string;
  value?: number;
  orderId?: string;
  source: "browser" | "server" | "capi";
  eventId?: string;
}
