import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import React from 'react';
import { verifyEmailCode } from '../../api/verify';
import { Button } from '@/components/ui';

const VerifyCode = () => {
  const { code } = useParams({ strict: false }) as { code: string };

  const { isSuccess } = useQuery({
    queryKey: ['verifyEmail'],
    queryFn: () => verifyEmailCode(code),
    enabled: !!code,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Email Verification
          </h1>
          <p className="text-gray-600 mt-2">Verifying your email address...</p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-xl border-0 p-6">
          {isSuccess ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Verified Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your email has been verified. You can now login to your account.
              </p>
              <Button
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2.5"
                variant="clean"
              >
                <Link to="/login">Continue to Login</Link>
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600">
                Unable to verify your email. Please try again or contact support
                if the issue persists.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
