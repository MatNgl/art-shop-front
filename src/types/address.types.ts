/** Adresse de livraison (retournée par l'API) */
export interface Address {
  id: string
  userId: string
  recipientName: string
  line1: string
  line2?: string
  postalCode: string
  city: string
  country: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

/** Payload pour créer ou modifier une adresse */
export interface AddressPayload {
  recipientName: string
  line1: string
  line2?: string
  postalCode: string
  city: string
  country: string
  isDefault?: boolean
}