import { forwardRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { REMOTE } from '../api';

const email = z.string().trim().email('Enter a valid email address');
const loginSchema = z.object({ email, password: z.string().min(1, 'Enter your password') });
const registerSchema = z.object({
  name: z.string().trim().min(2, 'Tell us what to call you'),
  email,
  password: z.string().min(8, 'Use at least 8 characters'),
});

const inputClass = (error) =>
  `w-full h-11 px-3.5 rounded-lg bg-background border text-[15px] text-foreground placeholder:text-muted
   transition-shadow focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-soft)]
   ${error ? 'border-category-coral' : 'border-border'}`;

const Field = forwardRef(function Field({ label, error, hint, type = 'text', ...props }, ref) {
  const [shown, setShown] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label htmlFor={props.name} className="block text-[13px] font-medium text-foreground mb-1.5">{label}</label>
      <div className="relative">
        <input
          ref={ref}
          id={props.name}
          type={isPassword && shown ? 'text' : type}
          aria-invalid={Boolean(error)}
          className={`${inputClass(error)} ${isPassword ? 'pr-11' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((v) => !v)}
            aria-label={shown ? 'Hide password' : 'Show password'}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-foreground"
          >
            {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-category-coral">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
});

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const status = useAuth((s) => s.status);
  const login = useAuth((s) => s.login);
  const registerUser = useAuth((s) => s.register);
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  if (!REMOTE || status === 'in') return <Navigate to="/" replace />;

  const onSubmit = async (data) => {
    setBusy(true);
    setFormError('');
    try {
      await (isLogin ? login(data) : registerUser(data));
      navigate('/', { replace: true });
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="flex items-center gap-2.5 mb-7">
        <div className="w-9 h-9 rounded-[10px] bg-primary flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7C2 7 4 3 7 3C10 3 12 7 12 7C12 7 10 11 7 11C4 11 2 7 2 7Z" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="7" cy="7" r="1.4" fill="white" />
          </svg>
        </div>
        <span className="font-serif text-[26px] leading-none text-foreground">Tempo</span>
      </div>

      <div className="w-full max-w-[400px] rounded-xl border border-border bg-surface p-8 shadow-card">
        <h1 className="font-serif text-[30px] leading-tight text-foreground">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-sm text-muted mt-1.5 mb-7">
          {isLogin ? 'Sign in to continue with your habits.' : 'Start tracking habits and focus time.'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {!isLogin && <Field label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />}
          <Field label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <Field
            label="Password"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            hint={isLogin ? undefined : 'At least 8 characters.'}
            error={errors.password?.message}
            {...register('password')}
          />
          {formError && (
            <p
              role="alert"
              className="rounded-lg px-3 py-2.5 text-sm"
              style={{ color: 'var(--color-coral)', background: 'color-mix(in srgb, var(--color-coral) 10%, transparent)' }}
            >
              {formError}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full h-11 rounded-lg bg-primary text-white text-[15px] font-medium hover:bg-primary-hover disabled:opacity-60 transition-colors"
          >
            {busy ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm text-muted">
        {isLogin ? 'New to Tempo? ' : 'Already have an account? '}
        <Link to={isLogin ? '/register' : '/login'} className="text-primary font-medium hover:underline">
          {isLogin ? 'Create an account' : 'Sign in'}
        </Link>
      </p>
    </div>
  );
}
