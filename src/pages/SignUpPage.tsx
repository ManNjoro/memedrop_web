import { useState } from 'react';
import { Link, useNavigate, type To } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth, useSignUp } from '@clerk/react';
import { AuthInput } from '@/components/ui/AuthInput';
import { PrimaryButton } from '@/components/ui/Button';
import {
  signUpSchema,
  verifyCodeSchema,
  type SignUpFormValues,
  type VerifyCodeFormValues,
} from '@/lib/validation/authSchemas';
import { syncUser } from '@/lib/api/users';

export function SignUpPage() {
  const navigate = useNavigate();
  const { isLoaded } = useAuth();
  const { signUp } = useSignUp();

  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signUpForm = useForm<SignUpFormValues>({ resolver: zodResolver(signUpSchema) });
  const verifyForm = useForm<VerifyCodeFormValues>({ resolver: zodResolver(verifyCodeSchema) });

  const onCreateAccount = async (values: SignUpFormValues) => {
    if (!isLoaded || !signUp) return;
    setFormError(null);
    setLoading(true);
    try {
      const { error } = await signUp.password({
        emailAddress: values.email,
        password: values.password,
        username: values.username,
      });
      if (error) {
        setFormError(error.message ?? 'Couldn\u2019t create your account. Try again.');
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setFormError(sendError.message ?? 'Couldn\u2019t send a verification code. Try again.');
        return;
      }
      setEmail(values.email);
      setIsVerifying(true);
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async (values: VerifyCodeFormValues) => {
    if (!isLoaded || !signUp) return;
    setFormError(null);
    setLoading(true);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code: values.code });
      if (error) {
        setFormError(error.message ?? 'That code didn\u2019t work. Double-check and try again.');
        return;
      }

      await signUp.finalize({
        navigate: async ({ session, decorateUrl }) => {
          if (session?.currentTask) return;

          // Same reasoning as the mobile app: the Clerk webhook eventually
          // creates this user's Neon row too, but it's async and can lag —
          // sync explicitly here so the row exists the instant they land
          // on their own Profile page. Non-fatal on failure; the webhook
          // is the fallback. (No manual token needed here — the axios
          // interceptor from ClerkAuthSync attaches a fresh one per request.)
          try {
            await syncUser();
          } catch {
            // swallow — see comment above
          }

          const url = decorateUrl('/') as To;
          if (typeof url === 'string' && url.startsWith('http')) {
            window.location.href = url;
          } else {
            navigate(url);
          }
        },
      });
    } catch {
      setFormError('Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center">
        <h1 className="text-2xl font-extrabold text-text-primary-light dark:text-text-primary">Check your email</h1>
        <p className="mb-8 mt-1 text-text-secondary-light dark:text-text-secondary">
          We sent a code to {email}. Enter it below to finish setting up your account.
        </p>
        <form onSubmit={verifyForm.handleSubmit(onVerify)} noValidate>
          <AuthInput
            label="Verification code"
            placeholder="123456"
            inputMode="numeric"
            error={verifyForm.formState.errors.code?.message}
            {...verifyForm.register('code')}
          />
          {!!formError && (
            <div className="mb-4 rounded-lg border border-danger bg-danger/10 px-4 py-3">
              <p className="text-sm text-danger">{formError}</p>
            </div>
          )}
          <PrimaryButton type="submit" loading={loading} className="w-full">
            Verify & Continue
          </PrimaryButton>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center">
      <h1 className="text-3xl font-extrabold text-text-primary-light dark:text-text-primary">
        Meme<span className="text-primary">Drop</span>
      </h1>
      <p className="mb-8 mt-1 text-text-secondary-light dark:text-text-secondary">Join the chaos.</p>

      <form onSubmit={signUpForm.handleSubmit(onCreateAccount)} noValidate>
        <AuthInput
          label="Username"
          placeholder="yourusername"
          autoComplete="username"
          error={signUpForm.formState.errors.username?.message}
          {...signUpForm.register('username')}
        />
        <AuthInput
          label="Email"
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          error={signUpForm.formState.errors.email?.message}
          {...signUpForm.register('email')}
        />
        <AuthInput
          label="Password"
          placeholder="••••••••"
          isPassword
          autoComplete="new-password"
          error={signUpForm.formState.errors.password?.message}
          {...signUpForm.register('password')}
        />

        {!!formError && (
          <div className="mb-4 rounded-lg border border-danger bg-danger/10 px-4 py-3">
            <p className="text-sm text-danger">{formError}</p>
          </div>
        )}

        <PrimaryButton type="submit" loading={loading} className="w-full">
          Create Account
        </PrimaryButton>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary-light dark:text-text-secondary">
        Already have an account?{' '}
        <Link to="/sign-in" className="font-bold text-primary">
          Sign In
        </Link>
      </p>

      {/* Required for the CAPTCHA challenge on Clerk web sign-ups. */}
      <div id="clerk-captcha" />
    </div>
  );
}