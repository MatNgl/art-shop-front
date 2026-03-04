// Types Orders — Miroir des DTOs backend

/** Statuts d'une commande (miroir de OrderStatus backend) */
export const OrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

/** Statuts d'un shipment (miroir de ShipmentStatus backend) */
export const ShipmentStatus = {
  PENDING: "PENDING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type ShipmentStatus =
  (typeof ShipmentStatus)[keyof typeof ShipmentStatus];

// Sous-types (snapshots immutables)

/** Snapshot de la variante au moment de la commande */
export interface VariantSnapshot {
  formatName: string;
  material: string;
  widthMm?: number;
  heightMm?: number;
}

/** Snapshot de l'adresse de livraison au moment de la commande */
export interface ShippingAddressSnapshot {
  recipientName: string;
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
}

// Réponses API — Détail commande

/** Article d'une commande (miroir OrderItemResponseDto) */
export interface OrderItem {
  id: string;
  productId: string;
  productVariantId: string;
  productTitleSnapshot: string;
  variantSnapshot: VariantSnapshot;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

/** Entrée d'historique de statut (miroir OrderStatusHistoryResponseDto) */
export interface OrderStatusHistoryEntry {
  id: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  changedByUserId?: string;
  createdAt: string;
}

/** Shipment (miroir ShipmentResponseDto) */
export interface Shipment {
  id: string;
  status: ShipmentStatus;
  carrier: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

/** Commande complète (miroir OrderResponseDto) */
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountTotal: number;
  total: number;
  shippingAddressSnapshot: ShippingAddressSnapshot;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
  shipments: Shipment[];
  createdAt: string;
  paidAt?: string;
}

/** Résumé commande pour la liste (miroir OrderSummaryResponseDto) */
export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  createdAt: string;
  paidAt?: string;
}

// Payloads — Requêtes vers l'API

/** POST /orders — Créer une commande */
export interface CreateOrderPayload {
  addressId: string;
}

/** POST /payments/checkout — Créer une session Stripe */
export interface CreateCheckoutPayload {
  orderId: string;
}

/** Réponse POST /payments/checkout */
export interface CheckoutSessionResponse {
  checkoutUrl: string;
  sessionId: string;
}
