import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { ListComponentProps } from './types';
import { useWorkspaceData } from '../../store/useWorkspaceDataStore';

/**
 * ProductList - Display products in a card grid layout
 *
 * Subscribes to dataKey and renders product items as cards.
 * Optimized for product/item displays with image, title, description, price.
 *
 * @example
 * ```mdx
 * <ProductList
 *   dataKey="products"
 *   emptyMessage="No products found"
 * />
 * ```
 */
export const ProductList: React.FC<ListComponentProps> = ({
  dataKey,
  fallback = 'No data available',
  showLoading = true,
  emptyMessage = 'No products to display',
  className = '',
}) => {
  // Use Zustand hook for reactive data binding (cleaner than manual subscriptions)
  const { data, loading, error } = useWorkspaceData(dataKey);

  // Get array from data
  const getArray = (): any[] => {
    if (!data) return [];

    // If already an array
    if (Array.isArray(data)) return data;

    // If nested in an object
    if (data.items && Array.isArray(data.items)) return data.items;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.products && Array.isArray(data.products)) return data.products;

    // Single item - wrap in array
    return [data];
  };

  const products = getArray();

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-violet" />
        <span className="text-lg font-medium text-foreground">
          Products ({products.length})
        </span>
      </div>

      {loading && showLoading && (
        <div className="flex items-center gap-2 text-primary">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading products...</span>
        </div>
      )}

      {error && (
        <div className="text-destructive bg-destructive/10 p-4 rounded border border-destructive/30">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-muted-foreground italic p-4 border border-border rounded">
          {emptyMessage}
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, index) => (
            <div
              key={index}
              className="border border-border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name || product.title || 'Product'}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}

              <h3 className="font-medium text-foreground mb-1">
                {product.name || product.title || `Product ${index + 1}`}
              </h3>

              {product.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {product.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-3">
                {product.price && (
                  <span className="text-lg font-semibold text-violet">
                    ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                  </span>
                )}

                {product.category && (
                  <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded">
                    {product.category}
                  </span>
                )}
              </div>

              {product.rating && (
                <div className="text-sm text-muted-foreground mt-2">
                  ⭐ {product.rating}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && !data && (
        <div className="text-muted-foreground italic p-4 border border-border rounded">
          {fallback}
        </div>
      )}
    </div>
  );
};
