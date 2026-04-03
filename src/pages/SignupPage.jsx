import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../lib/validation.js';
import { useAuth } from '../features/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui';

function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      await signUp(data.email, data.password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4">
              <span className="text-3xl">✉️</span>
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a confirmation link. Please check your email to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Back to login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <p className="page-header-title text-3xl text-slate-900 dark:text-slate-100">Kounting Koral</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Get set up in less than a minute</p>
        </div>
        <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <span className="text-3xl">🐚</span>
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Start tracking your work shifts and earnings</CardDescription>
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
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] font-semibold"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SignupPage;
