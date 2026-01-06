export interface CartItem {
  skuId: string;
  productId: string;
  quantity: number;
  // Cached product info for display
  productName: string;
  productImage: string | null;
  skuCode: string;
  skuAttributes: Record<string, string>;
  price: number; // in cents
  originalPrice: number | null;
  currency: string;
  stock: number;
}

export interface CartState {
  items: CartItem[];
  lastUpdated: number;
}

export interface CartContextValue {
  items: CartItem[];
  isLoading: boolean;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (skuId: string) => void;
  updateQuantity: (skuId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getCurrency: () => string;
}
