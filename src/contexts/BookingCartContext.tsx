import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BookingData } from '@/components/cultural-activities/BookingWizard';

interface CartItem extends BookingData {
  cartItemId: string;
  addedAt: Date;
}

interface BookingCartContextType {
  cartItems: CartItem[];
  addToCart: (booking: BookingData) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  totalItems: number;
}

const BookingCartContext = createContext<BookingCartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cultural_activities_cart';

export function BookingCartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Reconvertir les dates
        const items = parsed.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
          startDate: item.startDate ? new Date(item.startDate) : undefined,
          endDate: item.endDate ? new Date(item.endDate) : undefined,
          eventSlots: item.eventSlots?.map((slot: any) => ({
            ...slot,
            date: new Date(slot.date)
          }))
        }));
        setCartItems(items);
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
      }
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [cartItems]);

  const addToCart = (booking: BookingData) => {
    const cartItem: CartItem = {
      ...booking,
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date()
    };
    setCartItems(prev => [...prev, cartItem]);
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  return (
    <BookingCartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems: cartItems.length
      }}
    >
      {children}
    </BookingCartContext.Provider>
  );
}

export function useBookingCart() {
  const context = useContext(BookingCartContext);
  if (!context) {
    throw new Error('useBookingCart doit être utilisé dans un BookingCartProvider');
  }
  return context;
}
