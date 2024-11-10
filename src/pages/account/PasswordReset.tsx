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
} from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { resetPassword } from '@/api/auth';
import { Turnstile } from '@marsidev/react-turnstile';
import useTurnStileHook from '@/hooks/turnstile';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

const formSchema = z
  .object({
    Password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(32, 'Password must not exceed 32 characters')
      .regex(/^(?=.*\d).{8,}$/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.Password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const PasswordReset = () => {
  const { code } = useParams({ strict: false }) as { code: string };
  const navigate = useNavigate();
  const [siteKey, turnstileLoaded, resetTurnstile] = useTurnStileHook();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { mutate: handleResetPassword, isPending } = useMutation({
    mutationFn: (data: { Password: string; 'cf-turnstile-response': string }) =>
      resetPassword({
        Code: code,
        Password: data.Password,
        'cf-turnstile-response': data['cf-turnstile-response'],
      }),
    onSuccess: () => {
      toast.success('Password has been reset successfully');
      navigate({ to: '/login' });
    },
    onError: (error: any) => {
      if (error?.response?.status === 400) {
        resetTurnstile();
      }
      toast.error(error?.response?.data?.Message || 'Something went wrong');
    },
  });

  const handleFormWrapper = (e: any) => {
    e.preventDefault();
    try {
      const tRes = e.target['cf-turnstile-response'].value;
      if (!tRes) return;

      form.handleSubmit((values) =>
        handleResetPassword({
          Password: values.Password,
          'cf-turnstile-response': tRes,
        })
      )(e);
    } catch (error) {
      resetTurnstile();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-[450px]">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-gray-600 mt-2">
            Please enter your new password below
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <Form {...form}>
            <form onSubmit={handleFormWrapper}>
              <CardContent className="space-y-6 pt-6">
                <FormField
                  control={form.control}
                  name="Password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          className="h-11 bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          className="h-11 bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                {siteKey && (
                  <div className="flex justify-center">
                    <Turnstile siteKey={siteKey} options={{ size: 'normal' }} />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pb-6">
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
                  disabled={!turnstileLoaded || isPending}
                >
                  {isPending ? (
                    <>
                      <ReloadIcon className="mr-2 h-5 w-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
                <Link
                  to="/login"
                  className="text-sm text-center text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  ← Back to login
                </Link>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default PasswordReset;
