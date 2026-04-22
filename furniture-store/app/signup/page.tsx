'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../data/AuthContext';
import { useLanguage } from '../../data/LanguageContext';
import Link from 'next/link';

type Step = 'credentials' | 'profile';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { isRtl } = useLanguage();

  const [step, setStep] = useState<Step>('credentials');

  // Step 1 — credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [credErr, setCredErr] = useState('');
  const [credLoading, setCredLoading] = useState(false);

  // Step 2 — profile + address (all optional)
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Step 1 — only validates credentials and email availability. No DB write
  // happens until the user reaches step 2 (Done OR Skip).
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredLoading(true);
    setCredErr('');

    try {
      const checkRes = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email.trim())}`);
      const checkJson = await checkRes.json().catch(() => ({}));
      if (!checkRes.ok) {
        setCredErr(checkJson.error || `Error ${checkRes.status}`);
        return;
      }
      if (checkJson.exists) {
        setCredErr('An account with this email already exists.');
        return;
      }
      // Email is free + creds look fine → slide to profile step. Still no DB row.
      setStep('profile');
    } catch (err) {
      setCredErr('An error occurred while checking your email.');
    } finally {
      setCredLoading(false);
    }
  };

  /**
   * Single shared submit for step 2. Both Done and Skip route through this
   * — Done sends the profile fields, Skip omits them. Either way, this is
   * where the user row is finally created.
   */
  const submitSignup = async (includeProfile: boolean) => {
    if (profileLoading) return;
    setProfileErr('');
    setProfileLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          ...(includeProfile && {
            fullName: fullName || null,
            phoneNumber: phoneNumber || null,
            address: {
              houseNo: houseNo || null,
              street: street || null,
              area: area || null,
              city: city || null,
              province: province || null,
              zipCode: zipCode || null,
              country: 'Kuwait',
            },
          }),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 207) {
        setProfileErr(data.error || `Error ${res.status}`);
        return;
      }
      if (data.user) login(data.user);
      router.push('/shop');
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSignup(true);
  };

  const handleSkip = () => {
    submitSignup(false);
  };

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} className="auth-page" style={{ background: 'var(--bg-main)' }}>
      <div className="auth-page-bg" aria-hidden="true" />
      <div className="auth-page-scrim" aria-hidden="true" />

      <div className="auth-page-scroll">
      {/* Two-step stack — both steps live in the same container so they can slide.
          The data-step attribute drives the stack height per step (compact for
          credentials, taller for the profile form) so neither has wasted space
          AND the page itself never scrolls. */}
      <div className={`auth-step-stack auth-step-stack-${step}`}>
        {/* Step 1 — credentials */}
        <div className={`auth-card auth-step ${step === 'credentials' ? 'is-active' : 'is-out-right'}`}>
          <h1 className="smartwood-title" style={{ fontSize: '1.85rem', textAlign: 'center', margin: '0 auto 6px' }}>
            {isRtl ? 'إنشاء حساب' : 'Create Account'}
          </h1>
          <p style={{ color: 'var(--text-soft)', textAlign: 'center', margin: '0 auto 22px', fontSize: '0.92rem' }}>
            {isRtl ? 'انضم إلى مجموعة سمارت وود' : 'Join the Smartwood Collection'}
          </p>

          {credErr && <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', padding: '10px', borderRadius: '8px', marginBottom: '14px', textAlign: 'center', fontSize: '0.88rem' }}>{credErr}</div>}

          <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-soft)', fontSize: '0.85rem' }}>{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--line-soft)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                placeholder={isRtl ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-soft)', fontSize: '0.85rem' }}>{isRtl ? 'كلمة المرور' : 'Password'}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--line-soft)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                placeholder={isRtl ? 'إنشاء كلمة مرور' : 'Create a password'}
              />
            </div>
            <button type="submit" disabled={credLoading} className="hero-primary-btn" style={{ width: '100%', padding: '14px', marginTop: '4px' }}>
              {credLoading ? (isRtl ? 'إنشاء حساب...' : 'Creating...') : (isRtl ? 'متابعة' : 'Continue')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '16px', marginBottom: 0, color: 'var(--text-soft)', fontSize: '0.9rem' }}>
            {isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
            <Link href="/login" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
              {isRtl ? 'تسجيل الدخول' : 'Log In'}
            </Link>
          </p>
        </div>

        {/* Step 2 — profile + address (all optional) */}
        <div className={`auth-card auth-step ${step === 'profile' ? 'is-active' : 'is-out-left'}`}>
          <h1 className="smartwood-title" style={{ fontSize: '1.9rem', textAlign: 'center', margin: '0 auto 8px' }}>
            {isRtl ? 'أكمل ملفك الشخصي' : 'Complete your profile'}
          </h1>
          <p style={{ color: 'var(--text-soft)', textAlign: 'center', margin: '0 auto 24px', fontSize: '0.92rem' }}>
            {isRtl ? 'كل الحقول اختيارية. يمكنك التخطي وإكمالها لاحقاً.' : 'All fields are optional — you can skip and fill them in later.'}
          </p>

          {profileErr && <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{profileErr}</div>}

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="auth-step-label">{isRtl ? 'الاسم الكامل' : 'Full name'}</label>
              <input type="text" className="auth-step-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={isRtl ? 'اسمك' : 'Your name'} maxLength={120} />
            </div>
            <div>
              <label className="auth-step-label">{isRtl ? 'رقم الهاتف' : 'Phone number'}</label>
              <input type="tel" className="auth-step-input" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+965 ..." maxLength={40} />
            </div>

            <div className="auth-step-divider">{isRtl ? 'العنوان' : 'Address'}</div>

            <div className="row g-2">
              <div className="col-4">
                <label className="auth-step-label">{isRtl ? 'رقم المنزل' : 'House #'}</label>
                <input type="text" className="auth-step-input" value={houseNo} onChange={(e) => setHouseNo(e.target.value)} maxLength={40} />
              </div>
              <div className="col-8">
                <label className="auth-step-label">{isRtl ? 'الشارع' : 'Street'}</label>
                <input type="text" className="auth-step-input" value={street} onChange={(e) => setStreet(e.target.value)} maxLength={200} />
              </div>
              <div className="col-6">
                <label className="auth-step-label">{isRtl ? 'المنطقة' : 'Area'}</label>
                <input type="text" className="auth-step-input" value={area} onChange={(e) => setArea(e.target.value)} maxLength={120} />
              </div>
              <div className="col-6">
                <label className="auth-step-label">{isRtl ? 'المدينة' : 'City'}</label>
                <input type="text" className="auth-step-input" value={city} onChange={(e) => setCity(e.target.value)} maxLength={120} />
              </div>
              <div className="col-6">
                <label className="auth-step-label">{isRtl ? 'المحافظة' : 'Province'}</label>
                <input type="text" className="auth-step-input" value={province} onChange={(e) => setProvince(e.target.value)} maxLength={120} />
              </div>
              <div className="col-6">
                <label className="auth-step-label">{isRtl ? 'الرمز البريدي' : 'Zip code'}</label>
                <input type="text" className="auth-step-input" value={zipCode} onChange={(e) => setZipCode(e.target.value)} maxLength={30} />
              </div>
              <div className="col-12">
                <label className="auth-step-label">{isRtl ? 'البلد' : 'Country'}</label>
                <input type="text" className="auth-step-input" value="Kuwait" disabled />
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button type="button" onClick={handleSkip} className="hero-secondary-btn" style={{ flex: '1', padding: '14px', cursor: 'pointer' }}>
                {isRtl ? 'تخطّي الآن' : 'Skip for now'}
              </button>
              <button type="submit" disabled={profileLoading} className="hero-primary-btn" style={{ flex: '1', padding: '14px' }}>
                {profileLoading ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'تم' : 'Done')}
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </main>
  );
}
