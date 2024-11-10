import { Button, useToast } from '@/components/ui';
import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import cn from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { SuprasyRender } from 'suprasy-render-react';
import {
  getProductImagesOption,
  getProductVariations,
  getProductsDetails,
} from '../../../api/products';
import ProductImages from './components/ProductImages';

import {
  calculateDiscountPercentage,
  formatPrice,
} from '@/libs/helpers/formatPrice';
import { useCartStore } from '@/store/cartStore';
import ProductPricing from './components/ProductPricing';
import { CheckCircle, XCircle } from 'lucide-react';

export const getProductsDetailsOptions = (slug: string) =>
  queryOptions({
    queryKey: ['getProductsDetails', slug],
    queryFn: () => getProductsDetails(slug),
    enabled: !!slug,
  });

const ProductDetails: React.FC = () => {
  const { slug } = useParams({ strict: false }) as { slug: string };

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariation, setSelectedVariation] = useState<number>(0);

  const { toast } = useToast();

  const {
    addToCart,
    cart,
    setQuantity: setQtyCart,
    clearCart,
  } = useCartStore((state) => state);

  const { data: productsDetailsResponse } = useSuspenseQuery(
    getProductsDetailsOptions(slug)
  );

  const productDetails = productsDetailsResponse?.Data;

  const ProductID = productDetails?.Id;

  const { data: productImagesResponse } = useSuspenseQuery(
    getProductImagesOption(selectedVariation)
  );

  const { data: productVariationsResponse } = useQuery({
    queryKey: ['getProductVariations', productDetails?.Id],
    queryFn: () => getProductVariations(productDetails?.Id || 0),
    enabled: !!productDetails?.Id,
  });

  const productImages =
    productImagesResponse?.Data &&
    productImagesResponse?.Data?.length > 0 &&
    productImagesResponse?.Data;

  const productVariation = productVariationsResponse?.Data?.find(
    (v) => v.Id === selectedVariation
  );

  useEffect(() => {
    if (
      productVariationsResponse?.Data &&
      productVariationsResponse?.Data?.length > 0
    ) {
      setSelectedVariation(productVariationsResponse?.Data[0].Id);
    }
  }, [productVariationsResponse?.Data]);

  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb - Optional */}
      <div className="bg-white border-b">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-sm">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="text-gray-500 hover:text-indigo-600">
                  Home
                </Link>
              </li>
              <span className="text-gray-400">/</span>
              <li className="text-gray-900 font-medium truncate">
                {productDetails?.Title}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="lg:grid lg:grid-cols-2 lg:items-start">
            {/* Left column - Product Images */}
            <div className="lg:border-r lg:border-gray-200">
              <div className="sticky top-24 h-full">
                {productImages && (
                  <ProductImages
                    key={selectedVariation.toString()}
                    Images={productImages}
                  />
                )}
              </div>
            </div>

            {/* Right column - Product Info */}
            <div className="p-6 lg:p-10">
              {productDetails && (
                <>
                  {/* Sale Badge */}
                  {isOnSale && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600 mb-4">
                      Sale
                    </span>
                  )}

                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {productDetails.Title}
                  </h1>

                  {/* Pricing Section */}
                  <div className="mt-6 flex items-baseline gap-4">
                    <ProductPricing
                      price={productVariation?.Price || 0}
                      salesPrice={productVariation?.SalesPrice}
                    />
                  </div>

                  {/* Summary */}
                  <div className="mt-6 pb-6 border-b border-gray-200">
                    <SuprasyRender
                      className="prose prose-sm max-w-none text-gray-600"
                      initialVal={productDetails.Summary}
                    />
                  </div>

                  {/* Variations */}
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                      Select Variation
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {productVariationsResponse?.Data?.map((variation) => (
                        <button
                          key={variation.Id}
                          onClick={() => setSelectedVariation(variation.Id)}
                          className={cn(
                            'px-4 py-2 rounded-lg border-2 transition-all duration-200',
                            variation.Id === selectedVariation
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          )}
                        >
                          {variation.ChoiceName}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inventory Status */}
                  <div className="mt-6">
                    {productVariation?.Inventory &&
                    productVariation.Inventory > 0 ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {productVariation.Inventory} items available
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Out of stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  <div className="mt-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex rounded-lg border border-gray-300 w-32">
                      <button
                        className="px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors"
                        onClick={() =>
                          quantity > 1 && setQuantity(quantity - 1)
                        }
                      >
                        -
                      </button>
                      <input
                        type="text"
                        className="w-full text-center border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(parseInt(e.target.value) || 1)
                        }
                      />
                      <button
                        className="px-3 py-2 hover:bg-gray-50 text-gray-600 transition-colors"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 space-y-4">
                    <Button
                      onClick={() => {
                        if (
                          selectedVariation &&
                          ProductID &&
                          isVariationUnderQty
                        ) {
                          addToCart({
                            ProductId: ProductID,
                            VariationId: selectedVariation,
                            Quantity: quantity,
                          });
                          toast({
                            title: 'Added to Cart',
                            description: 'Item successfully added to your cart',
                            variant: 'default',
                          });
                        }
                      }}
                      className="w-full py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                      disabled={!isVariationUnderQty}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      onClick={() => {
                        if (
                          selectedVariation &&
                          ProductID &&
                          isVariationUnderQty
                        ) {
                          addToCart({
                            ProductId: ProductID,
                            VariationId: selectedVariation,
                            Quantity: quantity,
                          });
                          navigate({ to: '/checkout' });
                        }
                      }}
                      className="w-full py-3 bg-green-600 text-white hover:bg-green-700 transition-colors"
                      disabled={!isVariationUnderQty}
                    >
                      Buy Now
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Product Description
          </h2>
          {productDetails?.Description && (
            <div className="prose prose-lg max-w-none">
              <SuprasyRender initialVal={productDetails.Description} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
