import { get } from "./api";
import type { Format } from "@/types";

/**
 * Récupère tous les formats
 * GET /formats
 */
export async function getFormats(): Promise<Format[]> {
  return get<Format[]>("/formats");
}

/**
 * Récupère un format par son ID
 * GET /formats/:id
 */
export async function getFormatById(id: string): Promise<Format> {
  return get<Format>(`/formats/${id}`);
}
