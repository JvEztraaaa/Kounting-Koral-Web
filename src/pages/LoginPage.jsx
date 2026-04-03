import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../lib/validation.js';
import { useAuth } from '../features/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      await signIn(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <p className="page-header-title text-3xl text-slate-900 dark:text-slate-100">Kounting Koral</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">A calmer way to track shifts and earnings</p>
        </div>
        <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mb-4">
            <span className="text-3xl">🐚</span>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your Kounting Koral account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-[var(--color-primary-dark)] hover:text-[var(--color-primary)]"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] font-semibold"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
