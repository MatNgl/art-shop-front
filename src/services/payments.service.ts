import { post } from "./api";
import type { CreateCheckoutPayload, CheckoutSessionResponse } from "@/types";

/**
 * Crée une session Stripe Checkout et retourne l'URL de redirection
 * POST /payments/checkout
 */
export async function createCheckoutSession(
  payload: CreateCheckoutPayload,
): Promise<CheckoutSessionResponse> {
  return post<CheckoutSessionResponse>("/payments/checkout", payload);
}