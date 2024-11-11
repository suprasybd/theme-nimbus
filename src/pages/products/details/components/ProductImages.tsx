import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui';
import { ProductImagesTypes } from '../../../../api/products/types';
import ImagePreview from '@/components/Image/ImagePreview';
import { cn } from '@/lib/utils';

interface ProductImagesPropTypes {
  Images: ProductImagesTypes[];
}

const ProductImages: React.FC<ProductImagesPropTypes> = ({ Images }) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    Images[0].ImageUrl
  );

  return (
    <div className="flex flex-col-reverse lg:flex-col gap-4 p-2 sm:p-4 lg:p-6">
      {/* Main Image */}
      <div className="relative group w-full">
        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
          <ImagePreview
            alt="Product main image"
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            src={selectedImage}
          />
        </div>

        {/* Optional: Zoom hint - Hide on mobile */}
        <div className="hidden sm:block absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Hover to zoom
        </div>
      </div>

      {/* Thumbnail Carousel */}
      <div className="relative w-full h-20 sm:h-24 lg:h-28">
        <Carousel
          className="w-full"
          orientation="horizontal"
          opts={{
            align: 'start',
            containScroll: 'trimSnaps',
          }}
        >
          <CarouselContent className="-ml-2 h-full">
            {Images.map((image, index) => (
              <CarouselItem
                key={index}
                className="pl-2 basis-1/4 sm:basis-1/5 lg:basis-1/4"
              >
                <div
                  onClick={() => setSelectedImage(image.ImageUrl)}
                  className={cn(
                    'cursor-pointer h-full rounded-lg overflow-hidden border-2 transition-all duration-200',
                    selectedImage === image.ImageUrl
                      ? 'border-indigo-600 shadow-md'
                      : 'border-transparent hover:border-gray-300'
                  )}
                >
                  <ImagePreview
                    className="w-full h-full object-cover"
                    src={image.ImageUrl}
                    alt={`Product thumbnail ${index + 1}`}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-3 lg:-left-4" />
          <CarouselNext className="hidden sm:flex -right-3 lg:-right-4" />
        </Carousel>
      </div>
    </div>
  );
};

export default ProductImages;
