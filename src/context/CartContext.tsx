"use client";

import { createContext, useContext, useReducer, ReactNode, useEffect, useState } from "react";
import { CatalogueProduct } from "@/lib/catalogue-data";

export interface CartItem {
  product: CatalogueProduct;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: CatalogueProduct; quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: { slug: string } }
  | { type: "UPDATE_QUANTITY"; payload: { slug: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState };

interface CartContextValue {
  items: CartItem[];
  addItem: (product: CatalogueProduct, quantity?: number) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i.product.slug === product.slug);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.slug === product.slug
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { product, quantity }] };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.product.slug !== action.payload.slug),
      };
    case "UPDATE_QUANTITY": {
      const { slug, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.product.slug !== slug),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.slug === slug ? { ...i, quantity } : i
        ),
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "LOAD_CART":
      return action.payload;
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("eryx_cart");
      if (saved) {
        dispatch({ type: "LOAD_CART", payload: JSON.parse(saved) });
      }
    } catch (e) {
      console.error("Failed to parse cart from local storage", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("eryx_cart", JSON.stringify(state));
    }
  }, [state, isInitialized]);

  const addItem = (product: CatalogueProduct, quantity = 1) =>
    dispatch({ type: "ADD_ITEM", payload: { product, quantity } });

  const removeItem = (slug: string) =>
    dispatch({ type: "REMOVE_ITEM", payload: { slug } });

  const updateQuantity = (slug: string, quantity: number) =>
    dispatch({ type: "UPDATE_QUANTITY", payload: { slug, quantity } });

  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const cartCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = state.items.reduce((sum, i) => {
    if (typeof i.product.mrp !== "number") return sum;
    return sum + i.quantity * i.product.mrp;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}