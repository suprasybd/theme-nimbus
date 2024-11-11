import { Button } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import {
  getOrders,
  getOrderProducts,
  OrderType,
  OrdersProductType,
} from '@/api/orders';
import React from 'react';
import { PaginationType } from '@/libs/types/responseTypes';
import PaginationMain from '@/components/Pagination/Pagination';
import { formatPrice } from '@/libs/helpers/formatPrice';
import {
  getProductImages,
  getProductVariationDetails,
  getProductsDetailsById,
} from '@/api/products';
import ImagePreview from '@/components/Image/ImagePreview';
import { Image } from 'lucide-react';
import cn from 'classnames';

import { ShoppingBag } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const Orders = () => {
  const [limit] = React.useState<number>(10);
  const [page, setPage] = React.useState<number>(1);

  const { data: ordersResponse } = useQuery({
    queryKey: ['getOrders', page, limit],
    queryFn: () => getOrders({ Page: page, Limit: limit }),
  });

  const orders = ordersResponse?.Data;

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-indigo-300 mb-4" />
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          No orders yet
        </h2>
        <p className="text-gray-500 max-w-md mb-8">
          When you place orders, they will appear here. Start shopping to create
          your first order!
        </p>
        <Link to="/">
          <Button className="min-w-[200px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders?.map((order) => (
        <OrdersCard key={order.Id} order={order} />
      ))}

      {ordersResponse?.Pagination && (
        <PaginationMain
          PaginationDetails={ordersResponse.Pagination}
          setPage={setPage}
        />
      )}
    </div>
  );
};

const OrdersCard: React.FC<{ order: OrderType }> = ({ order }) => {
  const { data: orderProductsResponse } = useQuery({
    queryKey: ['getOrderProducts', order.Id],
    queryFn: () => getOrderProducts(order.Id),
  });

  const orderProducts = orderProductsResponse?.Data;

  return (
    <div className="p-6 rounded-xl border border-gray-200 hover:border-indigo-200 bg-white shadow-sm hover:shadow-md transition-all duration-300">
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="font-semibold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Order #{order.Id}
            </div>
            <div className="px-3 py-1 text-sm rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium border border-indigo-100">
              {order.Status}
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {new Date(order.CreatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Order Products */}
      <div className="space-y-4">
        {orderProducts?.map((product) => (
          <OrderProductCard key={product.Id} product={product} />
        ))}
      </div>

      {/* Order Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Shipping:</span>
            <span className="font-medium">
              {formatPrice(order.ShippingMethodPrice)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery:</span>
            <span className="font-medium">
              {formatPrice(order.DeliveryMethodPrice)}
            </span>
          </div>
          <div className="flex justify-between font-medium text-base pt-3 border-t border-gray-100">
            <span>Total:</span>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {formatPrice(
                (orderProducts?.reduce(
                  (acc, product) => acc + product.Price * product.Quantity,
                  0
                ) || 0) +
                  order.ShippingMethodPrice +
                  order.DeliveryMethodPrice
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderProductCard: React.FC<{ product: OrdersProductType }> = ({
  product,
}) => {
  // Get variation details first
  const { data: variationResponse } = useQuery({
    queryKey: ['getVariationDetails', product.VariationId],
    queryFn: () => getProductVariationDetails(product.VariationId),
    enabled: !!product.VariationId,
  });

  const variation = variationResponse?.Data;

  // Get product details using ProductId from variation
  const { data: productDetailsResponse } = useQuery({
    queryKey: ['getProductDetails', variation?.ProductId],
    queryFn: () =>
      getProductsDetailsById(variation?.ProductId.toString() || ''),
    enabled: !!variation?.ProductId,
  });

  // Get product images
  const { data: productImagesResponse } = useQuery({
    queryKey: ['getProductImages', product.VariationId],
    queryFn: () => getProductImages(product.VariationId),
    enabled: !!product.VariationId,
  });

  const productDetails = productDetailsResponse?.Data;
  const productImages = productImagesResponse?.Data;

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-purple-50/30 rounded-lg hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300">
      {/* Product Image */}
      <div
        className={cn(
          'w-[80px] h-[80px]',
          'bg-white flex justify-center items-center rounded-lg overflow-hidden border border-gray-100 shadow-sm'
        )}
      >
        {productImages && productImages.length > 0 ? (
          <ImagePreview
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            src={productImages[0].ImageUrl}
            alt={productDetails?.Title || 'Product image'}
          />
        ) : (
          <Image size={'32px'} className="text-indigo-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {productDetails?.Title || 'Loading...'}
          {variation && (
            <span className="text-sm text-indigo-500 ml-2 font-normal">
              ({variation.ChoiceName})
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600 mt-1.5">
          Quantity: {product.Quantity}
        </div>
        <div className="text-sm mt-1">
          <span className="text-gray-700">{formatPrice(product.Price)}</span>
          <span className="mx-2 text-gray-400">·</span>
          <span className="font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {formatPrice(product.Price * product.Quantity)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Orders;
