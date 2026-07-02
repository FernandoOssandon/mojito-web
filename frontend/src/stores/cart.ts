import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface CartItem {
  serviceId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  categoryName?: string;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const isOpen = ref(false);

  const total = computed(() =>
    items.value.reduce((acc, i) => acc + i.price * i.quantity, 0),
  );

  const count = computed(() =>
    items.value.reduce((acc, i) => acc + i.quantity, 0),
  );

  const isEmpty = computed(() => items.value.length === 0);

  function add(item: Omit<CartItem, 'quantity'>) {
    const existing = items.value.find((i) => i.serviceId === item.serviceId);
    if (existing) {
      existing.quantity++;
    } else {
      items.value.push({ ...item, quantity: 1 });
    }
  }

  function remove(serviceId: string) {
    items.value = items.value.filter((i) => i.serviceId !== serviceId);
  }

  function decrement(serviceId: string) {
    const item = items.value.find((i) => i.serviceId === serviceId);
    if (!item) return;
    if (item.quantity <= 1) remove(serviceId);
    else item.quantity--;
  }

  function clear() {
    items.value = [];
  }

  function toOrderDto() {
    return {
      items: items.value.map((i) => ({ serviceId: i.serviceId, quantity: i.quantity })),
    };
  }

  /** Formatear precio en CLP */
  function formatPrice(cents: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(
      cents / 100,
    );
  }

  return { items, isOpen, total, count, isEmpty, add, remove, decrement, clear, toOrderDto, formatPrice };
});
