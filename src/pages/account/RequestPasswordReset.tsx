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
import { Link, useNavigate } from '@tanstack/react-router';
import { requestPasswordReset } from '@/api/auth';
import { Turnstile } from '@marsidev/react-turnstile';
import useTurnStileHook from '@/hooks/turnstile';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email(),
});

const RequestPasswordReset = () => {
  const navigate = useNavigate();
  const [siteKey, turnstileLoaded, resetTurnstile] = useTurnStileHook();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { mutate: handleRequestReset, isPending } = useMutation({
    mutationFn: (data: { email: string; 'cf-turnstile-response': string }) =>
      requestPasswordReset(data),
    onSuccess: () => {
      toast.success('Password reset link has been sent to your email');
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
        handleRequestReset({
          email: values.email,
          'cf-turnstile-response': tRes,
        })
      )(e);
    } catch (error) {
      resetTurnstile();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50/30 py-10 px-4">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Reset Password
          </h1>
          <p className="text-gray-600 mt-2">
            Don't worry, we'll help you recover your account
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Password Recovery</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a password reset link
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={handleFormWrapper}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="h-11 bg-white/50"
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
              <CardFooter className="flex flex-col space-y-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                  disabled={!turnstileLoaded || isPending}
                >
                  {isPending ? (
                    <>
                      <ReloadIcon className="mr-2 h-5 w-5 animate-spin" />
                      Sending Recovery Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
                <Link
                  to="/login"
                  className="text-sm text-center text-gray-600 hover:text-indigo-600 transition-colors duration-200"
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

export default RequestPasswordReset;
