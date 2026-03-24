'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../data/AuthContext';
import { useLanguage } from '../../data/LanguageContext';
import Link from 'next/link';

export default function SignupPage() {
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
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        login(data.user); // Automatically log them in after signup
        router.push('/shop');
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (err) {
      setError('An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-main)' }}>
      <div style={{ maxWidth: '400px', width: '100%', background: 'var(--bg-panel)', padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow-main)' }}>
        <h1 className="smartwood-title" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '8px' }}>
          {isRtl ? 'إنشاء حساب' : 'Create Account'}
        </h1>
        <p style={{ color: 'var(--text-soft)', textAlign: 'center', marginBottom: '32px' }}>
          {isRtl ? 'انضم إلى مجموعة سمارت وود' : 'Join the Smartwood Collection'}
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
              placeholder={isRtl ? 'إنشاء كلمة مرور' : 'Create a password'}
            />
          </div>

          <button type="submit" disabled={loading} className="hero-primary-btn" style={{ width: '100%', padding: '16px', marginTop: '10px' }}>
            {loading ? (isRtl ? 'إنشاء حساب...' : 'Creating...') : (isRtl ? 'سجل الآن' : 'Sign Up')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-soft)' }}>
          {isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'} <Link href="/login" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{isRtl ? 'تسجيل الدخول' : 'Log In'}</Link>
        </p>
      </div>
    </main>
  );
}
