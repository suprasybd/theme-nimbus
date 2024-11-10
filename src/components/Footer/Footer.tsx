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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 ">
        {/* Footer Description */}
        {footer?.Description && (
          <div>
            <div className="prose prose-invert prose-sm max-w-3xl mx-auto text-slate-300">
              <SuprasyRender initialVal={footer.Description} />
            </div>
          </div>
        )}

        {/* Quick Links */}
        {pages && pages.length > 0 && (
          <div className="text-center">
            <h3 className="text-slate-200 font-semibold mb-6">Quick Links</h3>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              {pages.map((page) => (
                <a
                  key={page.Url}
                  href={`/page/${page.Url}`}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {page.Url}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Copyright Notice */}
        <div className="border-t border-slate-800 mt-8 pt-8">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
