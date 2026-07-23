export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "pix" | "credit_card" | "boleto";

export interface OrderItem {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  supplierCode: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  service?: string;
  deliveryDays?: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  cpf?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: CustomerInfo;
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  redeemedPearls: number;
  total: number;
  pearlsEarned: number;
  paymentReference?: string;
  shippingService?: string;
  shippingDeliveryDays?: number;
}

export interface CreateOrderPayload {
  customer: CustomerInfo;
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  redeemedPearls: number;
  total: number;
  pearlsEarned: number;
  shippingService?: string;
  shippingDeliveryDays?: number;
}

export function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VP-${ts}-${rand}`;
}
