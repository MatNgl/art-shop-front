import { get, post, patch } from "./api";
import type { Order, OrderSummary, CreateOrderPayload } from "@/types";

/**
 * Crée une commande depuis le panier actif
 * POST /orders
 */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return post<Order>("/orders", payload);
}

/**
 * Récupère la liste de mes commandes (résumé)
 * GET /orders
 */
export async function getMyOrders(): Promise<OrderSummary[]> {
  return get<OrderSummary[]>("/orders");
}

/**
 * Récupère le détail d'une commande
 * GET /orders/:id
 */
export async function getOrder(orderId: string): Promise<Order> {
  return get<Order>(`/orders/${orderId}`);
}

/**
 * Annule une commande (PENDING ou CONFIRMED uniquement)
 * PATCH /orders/:id/cancel
 */
export async function cancelOrder(orderId: string): Promise<Order> {
  return patch<Order>(`/orders/${orderId}/cancel`, {});
}
