import { z } from "zod";

export const addressSchema = z.object({
  recipientName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(150, "Le nom ne peut pas dépasser 150 caractères"),
  line1: z
    .string()
    .min(5, "L'adresse doit contenir au moins 5 caractères")
    .max(255, "L'adresse ne peut pas dépasser 255 caractères"),
  line2: z
    .string()
    .max(255, "Le complément ne peut pas dépasser 255 caractères")
    .optional()
    .or(z.literal("")),
 postalCode: z
  .string()
  .regex(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres'),
  city: z
    .string()
    .min(1, "La ville est requise")
    .max(100, "La ville ne peut pas dépasser 100 caractères"),
  country: z
    .string()
    .length(2, "Le code pays doit contenir 2 caractères (ex: FR)")
    .toUpperCase(),
  isDefault: z.boolean().optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;