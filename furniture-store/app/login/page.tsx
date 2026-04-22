'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../data/AuthContext';
import { useLanguage } from '../../data/LanguageContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { isRtl } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        login(data.user);
        router.push('/shop');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} className="auth-page" style={{ background: 'var(--bg-main)' }}>
      <div className="auth-page-bg" aria-hidden="true" />
      <div className="auth-page-scrim" aria-hidden="true" />
      <div className="auth-page-scroll">
      <div className="auth-card" style={{ maxWidth: '400px', width: '100%', padding: '40px', borderRadius: '24px', margin: 'auto' }}>
        <h1 className="smartwood-title" style={{ fontSize: '2rem', textAlign: 'center', margin: '0 auto 8px' }}>
          {isRtl ? 'تسجيل الدخول' : 'Log In'}
        </h1>
        <p style={{ color: 'var(--text-soft)', textAlign: 'center', margin: '0 auto 32px' }}>
          {isRtl ? 'مرحباً بعودتك إلى سمارت وود' : 'Welcome back to Smartwood'}
        </p>

        {error && <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-soft)' }}>{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--line-soft)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              placeholder={isRtl ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-soft)' }}>{isRtl ? 'كلمة المرور' : 'Password'}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--line-soft)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              placeholder={isRtl ? 'أدخل كلمة المرور' : 'Enter your password'}
            />
          </div>

          <button type="submit" disabled={loading} className="hero-primary-btn" style={{ width: '100%', padding: '16px', marginTop: '10px' }}>
            {loading ? (isRtl ? 'جاري التحقق...' : 'Verifying...') : (isRtl ? 'تسجيل الدخول' : 'Log In')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-soft)' }}>
          {isRtl ? 'ليس لديك حساب؟' : 'Don\'t have an account?'} <Link href="/signup" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{isRtl ? 'سجل هنا' : 'Sign Up'}</Link>
        </p>
      </div>
      </div>
    </main>
  );
}
