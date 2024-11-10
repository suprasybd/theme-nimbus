import { formatPrice } from '@/libs/helpers/formatPrice';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
} from '@/components/ui';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  RadioGroup,
  RadioGroupItem,
  FormMessage,
} from '@/components/ui';
import { Input } from '@/components/ui';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from '@/components/Modals/Cart/Cart';
import {
  getDevliveryMethods,
  getShippingMethods,
  placeOrderPost,
  checkUserExists,
  getPaymentMethods,
} from '../../api/checkout/index';
import FullScreenLoader from '@/components/Loader/Loader';
import {
  Link,
  useParams,
  useSearch,
  useNavigate,
} from '@tanstack/react-router';
import { Turnstile } from '@marsidev/react-turnstile';
import useTurnStileHook from '@/hooks/turnstile';
import { ReloadIcon } from '@radix-ui/react-icons';
import { CheckCircle, Lock } from 'lucide-react';
import { Route as CheckoutRoute } from '@/routes/checkout';
import { encode, decode } from 'js-base64';

import ProductDescription from '../products/details/components/ProductDescription';
import { useAuthStore } from '@/store/authStore';
const orderProducts = z.object({
  VariationId: z.number(),
  Quantity: z.number(),
});

export const formSchemaCheckout = z.object({
  FullName: z.string().min(1).max(50),
  Address: z.string().min(2).max(100),
  Email: z.string().email().min(2).max(100),
  Phone: z.string().min(2).max(100),
  DeliveryMethodId: z.number(),
  ShippingMethodId: z.number(),
  PaymentMethodId: z.number(),
  Products: z.array(orderProducts).min(1).max(10),
});

const LoginPrompt = () => {
  return (
    <div className="mt-2 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Lock className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-indigo-900">
              Welcome Back!
            </h3>
            <p className="text-sm text-indigo-600">
              Looks like you already have an account. Please sign in to
              continue.
            </p>
          </div>
        </div>
        <Link to="/login" search={{ redirect: '/checkout' }} className="w-full">
          <Button
            variant="default"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          >
            Sign In to Continue
          </Button>
        </Link>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { products } = useSearch({
    from: CheckoutRoute.fullPath,
  });
  const { cart, priceMap, clearCart, addToCart } = useCartStore(
    (state) => state
  );
  const { isAuthenticated, user } = useAuthStore((state) => state);

  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState<number>(0);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] =
    useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number>(0);

  const form = useForm<z.infer<typeof formSchemaCheckout>>({
    resolver: zodResolver(formSchemaCheckout),
    defaultValues: {},
  });

  const {
    mutate: handlePlaceOrder,
    isPending,
    isSuccess,
    data,
  } = useMutation({
    mutationFn: placeOrderPost,
    onSuccess: () => {
      clearCart();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error?.response?.data?.Message ||
          error?.response?.data?.message ||
          'Something went wrong. Please try again.',
      });
    },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      form.setValue('Email', user.Email);
      form.setValue('FullName', user.FullName);
    }
  }, [isAuthenticated, user, form]);

  const { data: shippingMethodsResponse } = useQuery({
    queryKey: ['getShippingMethods'],
    queryFn: () => getShippingMethods(),
  });

  const { data: deliveryMethodsResponse } = useQuery({
    queryKey: ['getDevliveryMethods'],
    queryFn: () => getDevliveryMethods(),
  });

  const shippingMethods = shippingMethodsResponse?.Data;
  const deliveryMethods = deliveryMethodsResponse?.Data;

  useEffect(() => {
    if (shippingMethods && shippingMethods.length) {
      setSelectedShippingMethod(shippingMethods[0].Id);
    }

    if (deliveryMethods && deliveryMethods.length) {
      setSelectedDeliveryMethod(deliveryMethods[0].Id);
    }
  }, [deliveryMethods, shippingMethods]);

  useEffect(() => {
    if (selectedDeliveryMethod) {
      form.setValue('DeliveryMethodId', selectedDeliveryMethod);
    }

    if (selectedShippingMethod) {
      form.setValue('ShippingMethodId', selectedShippingMethod);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeliveryMethod, selectedShippingMethod]);

  useEffect(() => {
    if (cart && cart.length) {
      const cartFormatter = async () => {
        const formatedCart = cart.map(async (cartItem) => {
          return {
            VariationId: cartItem.VariationId,
            Quantity: cartItem.Quantity,
          };
        });

        form.setValue('Products', await Promise.all(formatedCart));
      };

      cartFormatter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  const [canPurchase, setCanPurchase] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const { mutate: checkUser } = useMutation({
    mutationFn: checkUserExists,
    onSuccess: (response) => {
      setCanPurchase(response.Data.canPurchase);
    },
  });

  useEffect(() => {
    const email = form.watch('Email');
    const debounceTimer = setTimeout(() => {
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        checkUser(email);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [form.watch('Email')]);

  function onSubmit(
    values: z.infer<typeof formSchemaCheckout>,
    turnstileResponse: string | null
  ) {
    if (!canPurchase) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to place an order.',
        variant: 'destructive',
      });
      navigate({
        to: '/login',
        search: { redirect: '/checkout' },
      });
      return;
    }
    handlePlaceOrder({ ...values, 'cf-turnstile-response': turnstileResponse });
  }

  useEffect(() => {
    if (isAuthenticated && user?.Email) {
      checkUser(user.Email);
    }
  }, [isAuthenticated, user]);

  const estimatedTotal = useMemo(() => {
    if (priceMap) {
      let estimateTotal = 0;
      Object.keys(priceMap).forEach((key) => {
        estimateTotal += priceMap[key];
      });
      const deliveryCost =
        deliveryMethods?.find((d) => d.Id === selectedDeliveryMethod)?.Cost ||
        0;
      const shippingCost =
        shippingMethods?.find((d) => d.Id === selectedShippingMethod)?.Cost ||
        0;

      estimateTotal += deliveryCost;
      estimateTotal += shippingCost;
      return estimateTotal;
    } else {
      return 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceMap, selectedDeliveryMethod, selectedShippingMethod]);

  const [siteKey, turnstileLoaded, resetTurnstile] = useTurnStileHook();

  const handleFormWrapper = (e: any) => {
    e.preventDefault();
    try {
      const tRes = e.target['cf-turnstile-response']?.value;

      if (!tRes) {
        toast({
          title: 'Verification Required',
          description: 'Please complete the verification check',
          variant: 'destructive',
        });
        return;
      }

      form.handleSubmit((values: z.infer<typeof formSchemaCheckout>) =>
        onSubmit(values, tRes)
      )(e);
    } catch (error) {
      resetTurnstile();
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const { data: paymentMethodsResponse } = useQuery({
    queryKey: ['getPaymentMethods'],
    queryFn: () => getPaymentMethods(),
  });

  const paymentMethods = paymentMethodsResponse?.Data;

  useEffect(() => {
    if (paymentMethods && paymentMethods.length) {
      setSelectedPaymentMethod(paymentMethods[0].Id);
    }
  }, [paymentMethods]);

  useEffect(() => {
    if (selectedPaymentMethod) {
      form.setValue('PaymentMethodId', selectedPaymentMethod);
    }
  }, [selectedPaymentMethod]);

  if (isSuccess) {
    return (
      <div className="w-full max-w-[1220px] min-h-full mx-auto gap-6 py-6 px-4 sm:px-8">
        <div className="flex justify-center items-center w-full h-[80vh]">
          <div className="text-center max-w-lg">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-indigo-500 mx-auto" />
            </div>
            <h1 className="text-3xl font-medium mb-4 text-gray-900">
              Thank you for your order!
            </h1>
            <p className="text-gray-600 mb-6">
              Your order has been successfully placed. We've sent a confirmation
              email to your inbox with all the order details.
            </p>
            <div className="space-y-4">
              <Link to="/details">
                <Button
                  variant="outline"
                  className="w-full py-6 border-gray-200 hover:bg-gray-50"
                >
                  View Order Details
                </Button>
              </Link>
              <Link to="/" className="mt-3">
                <Button className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-gradient-to-br from-slate-50 to-purple-50/30">
      <div className="max-w-[1220px] mx-auto gap-6 py-8 px-4 sm:px-8">
        <div className="flex flex-col-reverse md:grid md:grid-cols-[1fr,380px] gap-8">
          {/* Form Section */}
          <Form {...form}>
            <form onSubmit={handleFormWrapper} className="space-y-6">
              {/* Delivery Details Section */}
              <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 rounded-xl shadow-sm p-6 border border-gray-100 hover:border-indigo-200 transition-colors">
                <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-sm">
                    1
                  </span>
                  Delivery Details
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <FormField
                    control={form.control}
                    name="FullName"
                    render={({ field }) => (
                      <FormItem className="!my-[10px] w-full">
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            className="py-5 sm:py-6"
                            FormError={!!form.formState.errors.FullName}
                            placeholder="Full name"
                            readOnly={isAuthenticated && !!user?.FullName}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Email"
                    render={({ field }) => (
                      <FormItem className="!my-[10px]">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            className="py-5 sm:py-6"
                            FormError={!!form.formState.errors.Email}
                            placeholder="Email"
                            readOnly={isAuthenticated && !!user?.Email}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        {canPurchase === false && <LoginPrompt />}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Phone"
                    render={({ field }) => (
                      <FormItem className="!my-[10px]">
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            className="py-5 sm:py-6"
                            FormError={!!form.formState.errors.Phone}
                            placeholder="Phone"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Address"
                    render={({ field }) => (
                      <FormItem className="!my-[10px]">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            className="py-7"
                            FormError={!!form.formState.errors.Address}
                            placeholder="Address eg. - Area, Road Number , House Number"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Shipping Section */}
              <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 rounded-xl shadow-sm p-6 border border-gray-100 hover:border-indigo-200 transition-colors">
                <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-sm">
                    2
                  </span>
                  Shipping Area
                </h2>
                {shippingMethods && shippingMethods.length && (
                  <RadioGroup
                    onValueChange={(val) =>
                      setSelectedShippingMethod(parseInt(val))
                    }
                    defaultValue={shippingMethods[0].Id.toString()}
                    className="space-y-3"
                  >
                    {shippingMethods.map((method) => (
                      <Label
                        key={method.Id}
                        htmlFor={method.Id.toString()}
                        className="relative flex p-4 cursor-pointer rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3 sm:gap-4 w-full">
                          <RadioGroupItem
                            value={method.Id.toString()}
                            id={method.Id.toString()}
                          />
                          <div className="flex justify-between w-full flex-col sm:flex-row gap-2">
                            <div>
                              <h3 className="font-medium">{method.Area}</h3>
                              {method.Description && (
                                <p className="text-sm text-gray-500">
                                  {method.Description}
                                </p>
                              )}
                            </div>
                            <div className="sm:text-right">
                              {method.Cost === 0 ? (
                                <span className="font-medium text-indigo-600">
                                  Free
                                </span>
                              ) : (
                                <span className="font-medium">
                                  {formatPrice(method.Cost)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                )}
              </div>

              {/* Delivery Method Section */}
              <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 rounded-xl shadow-sm p-6 border border-gray-100 hover:border-indigo-200 transition-colors">
                <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-sm">
                    3
                  </span>
                  Delivery Method
                </h2>
                {deliveryMethods && deliveryMethods.length && (
                  <RadioGroup
                    onValueChange={(val) => {
                      setSelectedDeliveryMethod(parseInt(val));
                    }}
                    defaultValue={deliveryMethods[0].Id.toString()}
                    className="space-y-3"
                  >
                    {deliveryMethods.map((method) => (
                      <Label
                        key={method.Id}
                        htmlFor={`delivery-${method.Id}`}
                        className="relative flex p-4 cursor-pointer rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3 sm:gap-4 w-full">
                          <RadioGroupItem
                            value={method.Id.toString()}
                            id={`delivery-${method.Id}`}
                          />
                          <div className="flex justify-between w-full flex-col sm:flex-row gap-2">
                            <div>
                              <h3 className="font-medium">
                                {method.DeliveryMethod}
                              </h3>
                              {method.Description && (
                                <p className="text-sm text-gray-500">
                                  {method.Description}
                                </p>
                              )}
                            </div>
                            <div className="sm:text-right">
                              {method.Cost === 0 ? (
                                <span className="font-medium text-indigo-600">
                                  Free
                                </span>
                              ) : (
                                <span className="font-medium">
                                  {formatPrice(method.Cost)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                )}
              </div>

              {/* Payment Section */}
              <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 rounded-xl shadow-sm p-6 border border-gray-100 hover:border-indigo-200 transition-colors">
                <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-sm">
                    4
                  </span>
                  Payment Method
                </h2>
                {paymentMethods && paymentMethods.length > 0 && (
                  <RadioGroup
                    onValueChange={(val) =>
                      setSelectedPaymentMethod(parseInt(val))
                    }
                    defaultValue={paymentMethods[0].Id.toString()}
                    className="space-y-3"
                  >
                    {paymentMethods.map((method) => (
                      <Label
                        key={method.Id}
                        htmlFor={`payment-${method.Id}`}
                        className="relative flex p-4 cursor-pointer rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 w-full">
                          <RadioGroupItem
                            value={method.Id.toString()}
                            id={`payment-${method.Id}`}
                          />
                          <div>
                            <h3 className="font-medium">
                              {method.PaymentMethod}
                            </h3>
                            {method.Description && (
                              <p className="text-sm text-gray-500">
                                {method.Description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                )}

                {/* Turnstile and Place Order Button */}
                <div className="mt-6 space-y-4">
                  {siteKey && (
                    <div className="w-full overflow-hidden">
                      <Turnstile
                        className="w-full"
                        options={{ size: 'compact' }}
                        siteKey={siteKey}
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full py-6 text-base sm:text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-200 rounded-lg"
                    disabled={!turnstileLoaded || isPending || !canPurchase}
                    variant="default"
                  >
                    {!turnstileLoaded ? (
                      <>
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        Please wait...
                      </>
                    ) : !canPurchase ? (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Login Required
                      </>
                    ) : (
                      <>
                        {isPending ? (
                          <>
                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Place Order
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>

          {/* Order Summary Card */}
          <div className="md:sticky md:top-24 h-fit mb-6 md:mb-0">
            <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-purple-50/30">
              <CardHeader className="border-b border-gray-100 p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
                <CardTitle className="text-gray-900">Order Summary</CardTitle>
                <CardDescription className="text-indigo-600 font-medium">
                  {cart?.length} {cart?.length === 1 ? 'item' : 'items'} in cart
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-gradient-to-br from-slate-50 to-purple-50/30">
                <div className="space-y-4">
                  {cart?.map((cartItem) => (
                    <CartItem key={cartItem.VariationId} Cart={cartItem} />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-100 p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="w-full space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(estimatedTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(
                        shippingMethods?.find(
                          (s) => s.Id === selectedShippingMethod
                        )?.Cost || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(
                        deliveryMethods?.find(
                          (s) => s.Id === selectedDeliveryMethod
                        )?.Cost || 0
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">
                        Total
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPrice(estimatedTotal)}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          Including VAT
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
