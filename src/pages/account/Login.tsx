import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
// import { login } from './api';
import { ReloadIcon, SizeIcon } from '@radix-ui/react-icons';

// import logo from './assets/lg-full-blacks.png';

import { Turnstile } from '@marsidev/react-turnstile';
import useTurnStileHook from '@/hooks/turnstile';
import { login } from '../../api/account';

export const loginSchema = z.object({
  Email: z.string().email(),
  Password: z.string().min(3),
});

const Login: React.FC = () => {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { Password: '', Email: '' },
  });

  const { toast } = useToast();
  const formErrors = form.formState;

  const [siteKey, turnstileLoaded, resetTurnstile] = useTurnStileHook();
  const navigate = useNavigate();
  const search = useSearch({ from: '/login' });

  const {
    mutate: loginMutation,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // After successful login, redirect back to checkout if that's where user came from
      if (search && 'redirect' in search && search.redirect === '/checkout') {
        navigate({ to: '/checkout' });
      } else {
        navigate({ to: '/' });
      }
    },
    onError: (response: {
      response: { data: { Message: string }; status: number };
    }) => {
      if (response.response.status === 400) {
        resetTurnstile();
      }
      toast({
        title: 'Login',
        description: response.response.data.Message,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(
    values: z.infer<typeof loginSchema>,
    turnstileResponse: string | null
  ) {
    loginMutation({
      ...values,
      'cf-turnstile-response': turnstileResponse,
    } as z.infer<typeof loginSchema>);
  }

  const forceUpdate = () => {
    window.location.reload();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormWrapper = (e: any) => {
    e.preventDefault();
    try {
      const tRes = e.target['cf-turnstile-response'].value;

      if (!tRes) return;

      form.handleSubmit((values: z.infer<typeof loginSchema>) =>
        onSubmit(values, tRes)
      )(e);
    } catch (error) {
      resetTurnstile();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50/30 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 rounded-md">
      <Card className="w-full max-w-md overflow-hidden border-0 shadow-xl">
        <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600" />
        <CardHeader className="space-y-2 pb-6 pt-8">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-gray-500">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={handleFormWrapper}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="Email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
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
                    <FormLabel className="text-gray-700">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {siteKey && (
                <div className="flex justify-center">
                  <Turnstile siteKey={siteKey} options={{ size: 'normal' }} />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 pb-8">
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg"
                disabled={!turnstileLoaded || isPending}
              >
                {isPending ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              <div className="flex flex-col items-center gap-3 text-sm">
                <Link
                  to="/request-password-reset"
                  className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
                <div className="flex items-center gap-2 text-gray-500">
                  <span>Don't have an account?</span>
                  <Link
                    to="/register"
                    className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
