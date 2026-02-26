import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string; // ID المفروق (للسلة): unique id for cart
  productId: string; // ID الحقيقي (للداتابيز): real db id <--- ZID HADI
  title: string;
  price: number;
  image: string;
  quantity: number;
  specs?: CartSpec[]; // Store selected options (shipping, color, etc.)
}

export interface CartSpec {
  name: string;
  value: string | number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === newItem.id);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === newItem.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
            isOpen: true,
          });
        } else {
          // هنا كنضمنو أن newItem فيه productId
          set({ items: [...items, { ...newItem, quantity: 1 }], isOpen: true });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),

      getCartTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: "shopping-cart", // Key in localStorage
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
