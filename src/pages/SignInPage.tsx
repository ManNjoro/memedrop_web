import { useState } from 'react';
import { Link, useNavigate, type To } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth, useSignIn } from '@clerk/react';
import { AuthInput } from '@/components/ui/AuthInput';
import { PrimaryButton } from '@/components/ui/Button';
import { signInSchema, type SignInFormValues } from '@/lib/validation/authSchemas';

export function SignInPage() {
  const navigate = useNavigate();
  const { isLoaded } = useAuth();
  const { signIn } = useSignIn();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({ resolver: zodResolver(signInSchema) });

  const onSubmit = async (values: SignInFormValues) => {
    if (!isLoaded || !signIn) return;
    setFormError(null);
    setLoading(true);
    try {
      // "identifier" (not "emailAddress") since this Clerk instance accepts
      // both email and username as sign-in identifiers.
      const { error } = await signIn.password({ identifier: values.identifier, password: values.password });
      if (error) {
        setFormError(error.message ?? 'Couldn\u2019t sign you in. Check your details and try again.');
        return;
      }
      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: async ({ session, decorateUrl }) => {
            // Pending session task (e.g. org selection) — let Clerk's own
            // session-task handling take over instead of redirecting.
            if (session?.currentTask) return;
            const url = decorateUrl('/') as To;
            if (typeof url === 'string' && url.startsWith('http')) {
              window.location.href = url;
            } else {
              navigate(url);
            }
          },
        });
      } else {
        setFormError('Additional verification is required for this account.');
      }
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center">
      <h1 className="text-3xl font-extrabold text-text-primary-light dark:text-text-primary">
        Meme<span className="text-primary">Drop</span>
      </h1>
      <p className="mb-8 mt-1 text-text-secondary-light dark:text-text-secondary">MemeDrop is better with you.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthInput
          label="Email or Username"
          placeholder="you@example.com or username"
          autoComplete="username"
          error={errors.identifier?.message}
          {...register('identifier')}
        />
        <AuthInput
          label="Password"
          placeholder="••••••••"
          isPassword
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {!!formError && (
          <div className="mb-4 rounded-lg border border-danger bg-danger/10 px-4 py-3">
            <p className="text-sm text-danger">{formError}</p>
          </div>
        )}

        <PrimaryButton type="submit" loading={loading} className="w-full">
          Sign In
        </PrimaryButton>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary-light dark:text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link to="/sign-up" className="font-bold text-primary">
          Sign Up
        </Link>
      </p>
    </div>
  );
}