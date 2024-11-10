import { useSuspenseQuery, useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/libs/helpers/formatPrice';
import {
  getProductImages,
  getProductImagesOption,
  getProductsDetailsByIdOption,
  getProductVariations,
} from '@/api/products';
import React from 'react';
import ImagePreview from '../Image/ImagePreview';
import cn from 'classnames';
import { Image } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const ProductCardSmall: React.FC<{
  ProductId: number;
  setModal?: (s: boolean) => void;
}> = ({ ProductId, setModal }) => {
  const { data: productsDetailsResponse } = useSuspenseQuery(
    getProductsDetailsByIdOption(ProductId)
  );

  const productDetails = productsDetailsResponse?.Data;

  // Get variations first
  const { data: productVariationsResponse } = useSuspenseQuery({
    queryKey: ['getProductVariations', ProductId],
    queryFn: () => getProductVariations(ProductId),
  });

  const variation = productVariationsResponse?.Data?.[0];

  // Use variation ID to get images
  const { data: productImagesResponse } = useQuery({
    queryKey: ['getProductImages', variation?.Id],
    queryFn: () => getProductImages(variation?.Id || 0),
    enabled: !!variation?.Id,
  });

  const productImages = productImagesResponse?.Data;

  const handleClick = () => {
    setModal?.(false);
  };

  return (
    <div className="w-full hover:cursor-pointer group">
      <Link
        to="/products/$slug"
        params={{ slug: productDetails?.Slug || '/' }}
        className="block"
        onClick={handleClick}
      >
        <div className="rounded-xl border border-gray-100 hover:border-indigo-200 overflow-hidden p-4 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-slate-50/50">
          <div className="flex items-center gap-5">
            <div
              className={cn(
                'w-[90px] h-[90px] rounded-xl overflow-hidden flex-shrink-0 shadow-sm',
                !productImages &&
                  'bg-gradient-to-br from-slate-100 to-indigo-50 flex justify-center items-center'
              )}
            >
              {productImages && productImages.length > 0 ? (
                <ImagePreview
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  src={productImages[0].ImageUrl}
                  alt={productDetails?.Title || 'product'}
                />
              ) : (
                <Image size={'44px'} className="text-slate-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base mb-2 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                {productDetails?.Title}
              </h3>

              {variation && (
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-base bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {formatPrice(variation.SalesPrice || variation.Price)}
                  </span>
                  {variation.SalesPrice &&
                    variation.SalesPrice < variation.Price && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(variation.Price)}
                      </span>
                    )}
                </div>
              )}

              {variation && (
                <p className="text-sm mt-2">
                  {variation.Inventory > 0 ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                      {variation.Inventory} in stock
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white">
                      Out of stock
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCardSmall;
