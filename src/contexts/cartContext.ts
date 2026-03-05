import { createContext } from "react";
import type { Cart, AddCartItemPayload } from "@/types";

export interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  total: number;
  addItem: (payload: AddCartItemPayload) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  resetCart: () => void;

}

export const CartContext = createContext<CartContextType | null>(null);
