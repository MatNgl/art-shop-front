import { get, post, patch, del } from "./api";
import type { Address, AddressPayload } from "@/types";

/**
 * Récupère toutes les adresses de l'utilisateur connecté
 * GET /addresses
 */
export async function getAddresses(): Promise<Address[]> {
  return get<Address[]>("/addresses");
}

/**
 * Récupère une adresse par son ID
 * GET /addresses/:id
 */
export async function getAddress(id: string): Promise<Address> {
  return get<Address>(`/addresses/${id}`);
}

/**
 * Récupère l'adresse par défaut
 * GET /addresses/default
 */
export async function getDefaultAddress(): Promise<Address | null> {
  try {
    return await get<Address>("/addresses/default");
  } catch {
    return null;
  }
}

/**
 * Crée une nouvelle adresse
 * POST /addresses
 */
export async function createAddress(
  payload: AddressPayload,
): Promise<Address> {
  return post<Address>("/addresses", payload);
}

/**
 * Met à jour une adresse existante
 * PATCH /addresses/:id
 */
export async function updateAddress(
  id: string,
  payload: Partial<AddressPayload>,
): Promise<Address> {
  return patch<Address>(`/addresses/${id}`, payload);
}

/**
 * Définit une adresse comme adresse par défaut
 * PATCH /addresses/:id/default
 */
export async function setDefaultAddress(id: string): Promise<Address> {
  return patch<Address>(`/addresses/${id}/default`, {});
}

/**
 * Supprime une adresse
 * DELETE /addresses/:id
 */
export async function deleteAddress(id: string): Promise<void> {
  return del<void>(`/addresses/${id}`);
}