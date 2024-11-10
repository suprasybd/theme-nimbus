import { Button, useToast } from '@/components/ui';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  calculateDiscountPercentage,
  formatPrice,
} from '@/libs/helpers/formatPrice';
import {
  getProductImages,
  getProductImagesOption,
  getProductsDetailsByIdOption,
  getProductVariations,
} from '@/api/products';
import { useCartStore } from '@/store/cartStore';
import React, { useMemo } from 'react';
import ImagePreview from '../Image/ImagePreview';
import cn from 'classnames';
import { Image } from 'lucide-react';
import { CheckCircle, XCircle } from 'lucide-react';

const ProductCard: React.FC<{ ProductId: number }> = ({ ProductId }) => {
  const { data: productsDetailsResponse } = useSuspenseQuery(
    getProductsDetailsByIdOption(ProductId)
  );

  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    addToCart,
    cart,
    setQuantity: setQtyCart,
    clearCart,
  } = useCartStore((state) => state);

  // Return early if no product data
  if (!productsDetailsResponse?.Data) {
    return null;
  }

  const productDetails = productsDetailsResponse?.Data;

  const { data: productVariationsResponse } = useQuery({
    queryKey: ['getProductVariations', productDetails?.Id],
    queryFn: () => getProductVariations(productDetails?.Id || 0),
    enabled: !!productDetails?.Id,
  });

  const productVariation = productVariationsResponse?.Data?.[0];

  const { data: productImagesResponse } = useQuery({
    queryKey: ['getProductImages', productVariation?.Id],
    queryFn: () => getProductImages(productVariation?.Id || 0),
    enabled: !!productVariation?.Id,
  });

  const productImages = productImagesResponse?.Data;

  const inStock = true;

  const ProductID = productDetails?.Id;
  const selectedVariation = productVariation?.Id;

  const isVariationUnderQty = useMemo(() => {
    const cartVariation = cart?.find(
      (c) => c.VariationId === selectedVariation
    );

    const variation = productVariationsResponse?.Data?.find(
      (v) => v.Id === selectedVariation
    );

    if ((variation?.Inventory || 0) > (cartVariation?.Quantity || 0)) {
      return true;
    }

    return false;
  }, [cart, productVariationsResponse?.Data, selectedVariation]);

  const isOnSale =
    productVariation?.SalesPrice &&
    calculateDiscountPercentage(
      productVariation?.SalesPrice,
      productVariation?.Price
    ) < 0;

  const truncateTitle = (title: string, maxLength = 45) => {
    if (!title) return '';
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + '...';
  };

  return (
    <Link
      to={`/products/${productDetails.Slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 w-full max-w-sm"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {productImages && productImages.length > 0 ? (
          <>
            <img
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              src={productImages[0].ImageUrl}
              alt={productDetails?.Title || 'product'}
            />
            {productVariation?.SalesPrice &&
              productVariation.SalesPrice < productVariation.Price && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                  {Math.abs(
                    calculateDiscountPercentage(
                      productVariation.SalesPrice,
                      productVariation.Price
                    )
                  )
                    .toFixed(2)
                    .replace(/\.?0+$/, '')}
                  % OFF
                </div>
              )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-medium text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {productDetails?.Title}
        </h3>

        {/* Price */}
        {productVariation && (
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(
                productVariation.SalesPrice || productVariation.Price
              )}
            </span>
            {productVariation.SalesPrice &&
              productVariation.SalesPrice < productVariation.Price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(productVariation.Price)}
                </span>
              )}
          </div>
        )}

        {/* Stock Status */}
        {productVariation && (
          <div className="flex items-center justify-between">
            <p className="text-sm">
              {productVariation.Inventory > 0 ? (
                <span className="text-green-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  In Stock
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />
                  Out of Stock
                </span>
              )}
            </p>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View Details →
            </button>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
