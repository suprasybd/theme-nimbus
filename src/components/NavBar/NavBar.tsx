import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useCartStore } from '@/store/cartStore';
import { useModalStore } from '@/store/modalStore';
import {
  ChevronDown,
  Menu,
  Power,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  UserRound,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { CategoryType, getCategoriesOptions, getSubCategories } from './api';
import { getLogo } from '@/api/turnstile';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  SheetFooter,
} from '@/components/ui';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui';

import { useAuthStore } from '@/store/authStore';
import { logoutUser } from '@/config/profile/logout';
import classNames from 'classnames';
import { useSidebarStore } from '@/store/sidebarStore';

const NavBar: React.FC = () => {
  const { cart } = useCartStore((state) => state);
  const { isAuthenticated, user } = useAuthStore((state) => state);
  const { setModalPath } = useModalStore((state) => state);
  const { toggleSideBar } = useSidebarStore((state) => state);

  const navigate = useNavigate();

  const { data: logoResponse } = useQuery({
    queryKey: ['getLogo'],
    queryFn: getLogo,
  });

  const { data: catagoriesResponse } = useSuspenseQuery(getCategoriesOptions());

  const categories = catagoriesResponse?.Data;
  const logo = logoResponse?.Data;

  const totalCartQuantity = useMemo(() => {
    if (cart) {
      let total = 0;
      cart.forEach((cartItem) => {
        total += cartItem.Quantity;
      });
      return total;
    } else {
      return 0;
    }
  }, [cart]);

  return (
    <>
      {/* Main Navbar */}
      <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-[1220px] mx-auto">
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            {/* Upper Nav - Search & Account */}
            <div className="flex items-center justify-between py-3 px-4 sm:px-8 border-b border-indigo-500/30">
              {/* Logo - Left */}
              <Link to="/" className="flex-shrink-0">
                <img className="h-10 w-auto" src={logo?.LogoLink} alt="logo" />
              </Link>

              {/* Search Bar - Center */}
              <div className="flex-1 max-w-md mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-white placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    onClick={() => setModalPath({ modal: 'search' })}
                  />
                  <Search
                    className="absolute left-3 top-2.5 h-5 w-5 text-indigo-200"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* Account & Cart */}
              <div className="flex items-center space-x-6">
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2 text-white hover:bg-indigo-500/30"
                      >
                        <UserRound className="h-5 w-5" />
                        <span className="font-medium hidden sm:inline">
                          {user?.FullName}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-64 bg-indigo-900 border-indigo-700 text-white"
                    >
                      <DropdownMenuLabel className="border-b border-indigo-700">
                        <div className="text-sm text-indigo-300">
                          Signed in as
                        </div>
                        <div className="font-medium truncate">
                          {user?.Email}
                        </div>
                      </DropdownMenuLabel>
                      <Link to="/details">
                        <DropdownMenuItem className="hover:bg-indigo-800 focus:bg-indigo-800">
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Orders
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        onClick={logoutUser}
                        className="text-red-400 hover:bg-indigo-800 focus:bg-indigo-800"
                      >
                        <Power className="h-4 w-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => navigate({ to: '/login' })}
                    className="text-white hover:bg-indigo-500/30"
                  >
                    <UserRound className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">Sign in</span>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-indigo-500/30 relative"
                  onClick={() => setModalPath({ modal: 'cart' })}
                >
                  <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
                  {cart && cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-medium rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                      {totalCartQuantity}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Lower Nav - Categories */}
            <div className="px-4 sm:px-8">
              <div className="flex items-center justify-center space-x-8 py-4">
                {categories?.map((category) => (
                  <div key={category.Id} className="flex-shrink-0">
                    <CategoryComponent category={category} isMobile={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center justify-between py-3 px-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-indigo-500/30"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[300px] p-0 bg-indigo-900 border-indigo-700 text-white"
              >
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-4 border-b border-indigo-700 bg-indigo-800">
                    <SheetTitle className="text-white">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-auto">
                    <nav className="flex flex-col py-2">
                      {categories?.map((category) => (
                        <div key={category.Id}>
                          <CategoryComponent
                            category={category}
                            isMobile={true}
                          />
                        </div>
                      ))}
                    </nav>
                  </div>
                  {isAuthenticated && (
                    <div className="border-t border-indigo-700 p-4 bg-indigo-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <UserRound className="h-5 w-5" />
                        <span className="font-medium">{user?.FullName}</span>
                      </div>
                      <div className="space-y-3">
                        <Link
                          to="/details"
                          className="flex items-center space-x-2 text-sm text-indigo-200 hover:text-white"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          <span>Orders</span>
                        </Link>
                        <button
                          onClick={logoutUser}
                          className="flex items-center space-x-2 text-sm text-red-400 hover:text-red-300"
                        >
                          <Power className="h-4 w-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex-shrink-0">
              <img className="h-8 w-auto" src={logo?.LogoLink} alt="logo" />
            </Link>

            <div className="flex items-center space-x-3">
              <button
                className="p-2 text-white hover:bg-indigo-500/30 rounded-full"
                onClick={() => setModalPath({ modal: 'search' })}
              >
                <Search className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button
                className="p-2 text-white hover:bg-indigo-500/30 rounded-full relative"
                onClick={() => setModalPath({ modal: 'cart' })}
              >
                <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
                {cart && cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-medium rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                    {totalCartQuantity}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const CategoryComponent: React.FC<{
  category: CategoryType;
  isMobile: boolean;
}> = ({ category, isMobile }) => {
  const { data: subCategoriesResponse } = useQuery({
    queryKey: ['getSubCategory', category.Id],
    queryFn: () => getSubCategories(category.Id),
    enabled: !!category.Id,
  });

  const subCategories = subCategoriesResponse?.Data;

  if (!isMobile) {
    return (
      <div>
        {subCategories && subCategories.length > 0 ? (
          <HoverCard openDelay={0}>
            <HoverCardTrigger>
              <Link
                to={'/category/' + category.Name}
                className="flex items-center gap-1.5 text-white hover:text-indigo-200 transition-colors"
              >
                <span className="font-medium">{category.Name}</span>
                <ChevronDown className="h-4 w-4" />
              </Link>
            </HoverCardTrigger>
            <HoverCardContent
              align="start"
              className="w-56 p-2 bg-indigo-900 border-indigo-700"
            >
              <div className="grid gap-1">
                {subCategories?.map((s) => (
                  <Link
                    key={s.Id.toString()}
                    to={'/category/' + s.Name}
                    className="block px-3 py-2 text-sm text-indigo-200 hover:text-white hover:bg-indigo-800 rounded-md transition-colors"
                  >
                    {s.Name}
                  </Link>
                ))}
              </div>
            </HoverCardContent>
          </HoverCard>
        ) : (
          <Link
            to={'/category/' + category.Name}
            className="text-white hover:text-indigo-200 transition-colors font-medium"
          >
            {category.Name}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      {subCategories && subCategories.length > 0 && (
        <div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem
              value="item-1"
              className="border-b border-indigo-700"
            >
              <AccordionTrigger className="flex justify-between items-center w-full py-3 px-4 text-left hover:bg-indigo-800">
                <Link
                  key={category.Id.toString()}
                  to={'/category/' + category.Name}
                  className="text-lg font-medium text-white"
                >
                  {category.Name}
                </Link>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 bg-indigo-800/50">
                <div className="space-y-2">
                  {subCategories?.map((s) => (
                    <Link
                      key={s.Id.toString()}
                      to={'/category/' + s.Name}
                      className="block py-2 text-indigo-200 hover:text-white transition-colors"
                    >
                      {s.Name}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
      {subCategories?.length === 0 && (
        <Link
          key={category.Id.toString()}
          to={'/category/' + category.Name}
          className="block py-3 px-4 text-lg text-white hover:bg-indigo-800 transition-colors"
        >
          {category.Name}
        </Link>
      )}
    </div>
  );
};

export default NavBar;
