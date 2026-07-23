import { createAdminClient } from "@/lib/supabase/admin";
import type {
  CustomerInfo,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  ShippingAddress,
} from "@/lib/orders";

type OrderRow = {
  id: string;
  user_id: string | null;
  status: string;
  payment_method: string;
  customer: CustomerInfo;
  shipping: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  discount: number;
  redeemed_pearls: number;
  total: number;
  pearls_earned: number;
  payment_reference: string | null;
  created_at: string;
};

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status as OrderStatus,
    customer: row.customer,
    shipping: row.shipping,
    paymentMethod: row.payment_method as PaymentMethod,
    items: row.items,
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shipping_cost),
    discount: Number(row.discount),
    redeemedPearls: row.redeemed_pearls,
    total: Number(row.total),
    pearlsEarned: row.pearls_earned,
    paymentReference: row.payment_reference ?? undefined,
  };
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as OrderRow[]).map(rowToOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return rowToOrder(data as OrderRow);
}

export async function createOrder(
  order: Order,
  userId?: string | null
): Promise<Order> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").insert({
    id: order.id,
    user_id: userId ?? null,
    status: order.status,
    payment_method: order.paymentMethod,
    customer: order.customer,
    shipping: order.shipping,
    items: order.items,
    subtotal: order.subtotal,
    shipping_cost: order.shippingCost,
    discount: order.discount,
    redeemed_pearls: order.redeemedPearls,
    total: order.total,
    pearls_earned: order.pearlsEarned,
    payment_reference: order.paymentReference ?? null,
    created_at: order.createdAt,
  });

  if (error) throw error;
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToOrder(data as OrderRow);
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as OrderRow[]).map(rowToOrder);
}
