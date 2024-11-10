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
    <div className="flex flex-col-reverse md:flex-row gap-4 p-6">
      {/* Thumbnail Carousel */}
      <div className="w-full md:w-24 h-24 md:h-[600px] flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto scrollbar-hide">
        <Carousel
          className="w-full"
          orientation="vertical"
          opts={{
            align: 'start',
            containScroll: 'trimSnaps',
          }}
        >
          <CarouselContent className="-mt-1 md:h-[540px]">
            {Images.map((image, index) => (
              <CarouselItem key={index} className="pt-1 basis-1/5 md:basis-1/4">
                <div
                  onClick={() => setSelectedImage(image.ImageUrl)}
                  className={cn(
                    'cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200',
                    selectedImage === image.ImageUrl
                      ? 'border-indigo-600 shadow-md'
                      : 'border-transparent hover:border-gray-300'
                  )}
                >
                  <ImagePreview
                    className="w-full aspect-square object-cover"
                    src={image.ImageUrl}
                    alt={`Product thumbnail ${index + 1}`}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="relative left-1/2 -translate-x-1/2 top-0" />
            <CarouselNext className="relative left-1/2 -translate-x-1/2 bottom-0" />
          </div>
        </Carousel>
      </div>

      {/* Main Image */}
      <div className="flex-1 relative group">
        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
          <ImagePreview
            alt="Product main image"
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            src={selectedImage}
          />
        </div>

        {/* Optional: Zoom hint */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Hover to zoom
        </div>
      </div>
    </div>
  );
};

export default ProductImages;
