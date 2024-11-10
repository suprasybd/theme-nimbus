import { useModalStore } from '@/store/modalStore';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/components/ui';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductsList } from '@/api/products';
import { activeFilters } from '@/libs/helpers/filters';
import { useDebounce } from 'use-debounce';
import ProductCardSmall from '@/components/ProductCard/ProductCardSmall';
import { Search } from 'lucide-react';

const SearchModal: React.FC = () => {
  const { modal, clearModalPath } = useModalStore((state) => state);
  const modalName = modal.modal;
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    if (modalName === 'search') {
      setModalOpen(true);
    }
  }, [modalName]);

  const [dSearch] = useDebounce(search, 1000);

  const { data: productsResponse } = useQuery({
    queryKey: ['searchProduct', dSearch],
    queryFn: () =>
      getProductsList({
        Limit: 5,
        Page: 1,
        ...activeFilters([
          {
            key: 'Title',
            value: dSearch || '',
            isActive: true,
          },
        ]),
      }),
  });

  const products = productsResponse?.Data;

  const closeModal = () => {
    setModalOpen(false);
    clearModalPath();
  };

  return (
    <div>
      <Dialog
        open={modalOpen}
        onOpenChange={(data) => {
          if (!data) {
            closeModal();
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] gap-6 bg-gradient-to-br from-slate-50 to-purple-50/30 border-0">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Search Products
            </DialogTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-4 w-4" />
              <Input
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                placeholder="Search for products..."
                className="pl-10 h-11 bg-white/70 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-colors"
              />
            </div>
          </DialogHeader>

          <div className="relative min-h-[200px] bg-white/80 rounded-lg p-4">
            {!dSearch && (
              <div className="text-center text-gray-500 py-8">
                <Search className="h-12 w-12 mx-auto mb-3 text-indigo-200" />
                <p className="text-indigo-600/70">
                  Start typing to search for products
                </p>
              </div>
            )}

            {dSearch && !products?.length && (
              <div className="text-center text-gray-500 py-8">
                <p className="text-indigo-600/70">
                  No products found for "
                  <span className="font-medium text-indigo-700">{dSearch}</span>
                  "
                </p>
              </div>
            )}

            {products && products.length > 0 && (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
                {products.map((product) => (
                  <ProductCardSmall
                    key={product.Id}
                    ProductId={product.Id}
                    setModal={setModalOpen}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => closeModal()}
              className="min-w-[100px] border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchModal;
