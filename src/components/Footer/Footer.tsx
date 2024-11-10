import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { getFooter, getPages } from './api';
import { SuprasyRender } from 'suprasy-render-react';

const Footer = () => {
  const { data: footerResponse } = useQuery({
    queryKey: ['getFooter'],
    queryFn: getFooter,
  });

  const { data: pagesResponse } = useQuery({
    queryKey: ['getPages'],
    queryFn: getPages,
  });

  const footer = footerResponse?.Data;
  const pages = pagesResponse?.Data;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-12">
          {/* Footer Description */}
          {footer?.Description && (
            <div>
              <div className="prose prose-invert prose-sm max-w-3xl mx-auto text-white/90">
                <SuprasyRender initialVal={footer.Description} />
              </div>
            </div>
          )}

          {/* Quick Links */}
          {pages && pages.length > 0 && (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-6 text-white">
                Quick Links
              </h3>
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                {pages.map((page) => (
                  <a
                    key={page.Url}
                    href={`/page/${page.Url}`}
                    className="text-white/80 hover:text-white transition-all duration-200 hover:underline underline-offset-4"
                  >
                    {page.Url}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Copyright Notice */}
          <div className="border-t border-white/10 mt-8 pt-8">
            <p className="text-sm text-center text-white/70">
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
