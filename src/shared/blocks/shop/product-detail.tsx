'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { useCart } from '@/shared/contexts/cart';
import { usePrice } from '@/shared/hooks/use-price';
import { cn } from '@/shared/lib/utils';

interface ProductSku {
  id: string;
  sku: string;
  attributes: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  image: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  currency: string;
  skus: ProductSku[];
  minPrice?: number;
  maxPrice?: number;
}

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { addItem, setDrawerOpen } = useCart();
  const { formatPrice } = usePrice();
  const [quantity, setQuantity] = useState(1);
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(
    product.skus.length > 0 ? product.skus[0].id : null
  );
  const [isAdding, setIsAdding] = useState(false);

  // Parse SKU attributes
  const parseAttributes = (attributesStr: string): Record<string, string> => {
    try {
      return JSON.parse(attributesStr);
    } catch {
      return {};
    }
  };

  // Get unique attribute names and their values
  const attributeOptions = useMemo(() => {
    const attributeMap: Record<string, Set<string>> = {};
    product.skus.forEach((sku) => {
      const attrs = parseAttributes(sku.attributes);
      Object.entries(attrs).forEach(([key, value]) => {
        if (!attributeMap[key]) attributeMap[key] = new Set();
        attributeMap[key].add(value);
      });
    });
    return Object.fromEntries(
      Object.entries(attributeMap).map(([key, values]) => [key, Array.from(values)])
    );
  }, [product.skus]);

  // Selected attributes state
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    if (product.skus.length > 0) {
      return parseAttributes(product.skus[0].attributes);
    }
    return {};
  });

  // Find matching SKU based on selected attributes
  const selectedSku = useMemo(() => {
    return product.skus.find((sku) => {
      const attrs = parseAttributes(sku.attributes);
      return Object.entries(selectedAttributes).every(
        ([key, value]) => attrs[key] === value
      );
    });
  }, [product.skus, selectedAttributes]);

  // Update selectedSkuId when selectedSku changes
  useMemo(() => {
    if (selectedSku) {
      setSelectedSkuId(selectedSku.id);
    }
  }, [selectedSku]);

  const handleAttributeSelect = (attributeName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedSku) {
      toast.error('Please select an option');
      return;
    }

    if (selectedSku.stock < quantity) {
      toast.error('Insufficient stock');
      return;
    }

    setIsAdding(true);
    addItem(
      {
        skuId: selectedSku.id,
        productId: product.id,
        productName: product.name,
        productImage: selectedSku.image || product.image,
        skuCode: selectedSku.sku,
        skuAttributes: parseAttributes(selectedSku.attributes),
        price: selectedSku.price,
        originalPrice: selectedSku.originalPrice,
        currency: product.currency,
        stock: selectedSku.stock,
      },
      quantity
    );

    // Open cart drawer
    setDrawerOpen(true);
    setTimeout(() => setIsAdding(false), 500);
  };

  const displayImage = selectedSku?.image || product.image || '/imgs/cases/1.png';

  return (
    <div className="container pt-24 pb-8 md:pt-28 md:pb-12">
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          {selectedSku?.originalPrice && selectedSku.originalPrice > selectedSku.price && (
            <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
              SALE
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>

          {product.description && (
            <p className="mt-4 text-muted-foreground">{product.description}</p>
          )}

          {/* Price */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              {selectedSku
                ? formatPrice(selectedSku.price, product.currency)
                : product.minPrice
                  ? formatPrice(product.minPrice, product.currency)
                  : 'N/A'}
            </span>
            {selectedSku?.originalPrice && selectedSku.originalPrice > selectedSku.price && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(selectedSku.originalPrice, product.currency)}
              </span>
            )}
          </div>

          {/* Attribute Selectors */}
          {Object.entries(attributeOptions).map(([attributeName, values]) => (
            <div key={attributeName} className="mt-6">
              <label className="mb-2 block text-sm font-medium capitalize">
                {attributeName}: {selectedAttributes[attributeName]}
              </label>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAttributeSelect(attributeName, value)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors',
                      selectedAttributes[attributeName] === value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    {selectedAttributes[attributeName] === value && (
                      <Check className="h-4 w-4" />
                    )}
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Stock Status */}
          {selectedSku && (
            <div className="mt-4">
              {selectedSku.stock > 0 ? (
                <span className="text-sm text-green-600">
                  {selectedSku.stock > 10
                    ? 'In Stock'
                    : `Only ${selectedSku.stock} left`}
                </span>
              ) : (
                <span className="text-sm text-red-500">Out of Stock</span>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">Quantity</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-lg font-medium">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                disabled={!selectedSku || quantity >= selectedSku.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            className="mt-8 gap-2"
            size="lg"
            onClick={handleAddToCart}
            disabled={!selectedSku || selectedSku.stock === 0 || isAdding}
          >
            <ShoppingCart className="h-5 w-5" />
            {isAdding ? 'Added!' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
