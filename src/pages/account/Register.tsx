import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  useToast,
} from '@/components/ui';
import { useMutation } from '@tanstack/react-query';
import { register } from '../../api/account';
import { ReloadIcon } from '@radix-ui/react-icons';

// import logo from '../login/assets/lg-full-blacks.png';

import { Turnstile } from '@marsidev/react-turnstile';
import useTurnStileHook from '@/hooks/turnstile';

export const registerSchema = z.object({
  FullName: z.string().min(1),

  Email: z.string().email(),
  Password: z
    .string()
    .min(8)
    .refine((val) => /.*[0-9].*/.test(val ?? ''), 'At least put one number!'),
});

const Register: React.FC = () => {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { Password: '', Email: '' },
  });

  const { toast } = useToast();
  const formErrors = form.formState;

  const {
    mutate: registerMutation,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      toast({
        title: 'Registration succecssfull',
        description: 'We have sent you an verification email!',
        variant: 'default',
      });
    },
    onError: (response: {
      response: { data: { Message: string }; status: number };
    }) => {
      if (response.response.status === 400) {
        resetTurnstile();
      }
      toast({
        title: 'Register',
        description: response.response.data.Message,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(
    values: z.infer<typeof registerSchema>,
    turnstileResponse: string | null
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerMutation({
      ...values,
      'cf-turnstile-response': turnstileResponse,
    } as any);
  }

  const usersEmail = form.watch('Email');

  const [siteKey, turnstileLoaded, resetTurnstile] = useTurnStileHook();

  const handleFormWrapper = (e: any) => {
    e.preventDefault();
    try {
      const tRes = e.target['cf-turnstile-response'].value;
      if (!tRes) return;

      form.handleSubmit((values: z.infer<typeof registerSchema>) =>
        onSubmit(values, tRes)
      )(e);
    } catch (error) {
      resetTurnstile();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 px-4 py-12 rounded-md">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-8">
          {!isSuccess && (
            <div>
              <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Create an account
                </h2>
                <p className="mt-2 text-gray-600">
                  Register an account by filling the form below
                </p>
              </div>

              <div className="mt-8">
                <Form {...form}>
                  <form onSubmit={handleFormWrapper} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="FullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="h-12 bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              FormError={!!formErrors.errors.FullName}
                              placeholder="Enter your full name"
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
                        <FormItem>
                          <FormLabel className="text-gray-700">Email</FormLabel>
                          <FormControl>
                            <Input
                              className="h-12 bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              FormError={!!formErrors.errors.Email}
                              placeholder="Enter your email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="Password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="h-12 bg-white/50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              FormError={!!formErrors.errors.Password}
                              type="password"
                              placeholder="Create a password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {siteKey && (
                      <div className="flex justify-center">
                        <Turnstile
                          options={{ size: 'auto' }}
                          siteKey={siteKey}
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
                      disabled={!turnstileLoaded}
                    >
                      {!turnstileLoaded && (
                        <>
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                          Please wait...
                        </>
                      )}

                      {turnstileLoaded && (
                        <>
                          {isPending && (
                            <>
                              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          )}
                          {!isPending && <>Create Account</>}
                        </>
                      )}
                    </Button>

                    <p className="text-center text-gray-600">
                      Already registered?{' '}
                      <Link
                        to="/login"
                        className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                      >
                        Sign in to your account
                      </Link>
                    </p>
                  </form>
                </Form>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Verification Email Sent
              </h2>
              <p className="text-gray-600 mb-8">
                Welcome aboard! We've sent a verification link to{' '}
                <span className="font-medium text-indigo-600">
                  {usersEmail}
                </span>
              </p>

              <Link
                to="/login"
                className="inline-block w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 text-center"
              >
                Continue to Login →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
