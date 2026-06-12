import { create } from "zustand";
import { persist } from "zustand/middleware";
import { decodeEntities } from "./utils";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, variation = null) => {
        const variationId = variation?.id ?? null;
        const existing = get().items.find(
          (item) => item.id === product.id && item.variationId === variationId
        );

        if (existing) {
          set({
            items: get().items.map((item) =>
              item.id === product.id && item.variationId === variationId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
          return;
        }

        const price = variation?.price ?? product.price;
        const image =
          variation?.image?.src ?? product.images?.[0]?.src ?? null;

        set({
          items: [
            ...get().items,
            {
              id: product.id,
              variationId,
              name: decodeEntities(product.name),
              slug: product.slug,
              price,
              image,
              quantity,
            },
          ],
        });
      },

      removeItem: (id, variationId = null) => {
        set({
          items: get().items.filter(
            (item) => !(item.id === id && item.variationId === variationId)
          ),
        });
      },

      updateQuantity: (id, variationId, quantity) => {
        if (quantity < 1) {
          get().removeItem(id, variationId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id && item.variationId === variationId
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (total, item) => total + Number(item.price) * item.quantity,
          0
        ),
    }),
    {
      name: "ecb-cart",
    }
  )
);
