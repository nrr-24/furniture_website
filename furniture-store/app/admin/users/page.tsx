'use client';

import { useState, useEffect } from 'react';
import { useAuth, User, Role } from '../../../data/AuthContext';
import { useLanguage } from '../../../data/LanguageContext';

export default function AdminUsersPage() {
  const { isAdmin, isCustomer } = useAuth();
  const { isRtl, t } = useLanguage();

  const [users, setUsers] = useState<User[]>([]);
  const [masterAdminId, setMasterAdminId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New User Form State
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    if (isCustomer && !isAdmin) {
      window.location.href = '/';
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/auth/users', { cache: 'no-store' });
        const data = await res.json();
        if (data.users) {
          setUsers(data.users);
          if (data.users.length > 0) {
            setMasterAdminId(data.users[0].id);
          }
        } else {
          setError(data.error || 'Failed to load users');
        }
      } catch (err) {
        setError('Error fetching users from database.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin, isCustomer]);

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    if (userId === masterAdminId) return;
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateRole', userId, role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert('Failed to update user role');
      }
    } catch {
      alert('Error communicating with database');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === masterAdminId) return;
    if (!window.confirm(isRtl ? 'هل أنت متأكد من حذف هذا المستخدم نهائياً؟' : 'Are you absolutely sure you want to permanently delete this user?')) return;

    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userId }),
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert('Failed to delete user');
      }
    } catch {
      alert('Error communicating with database');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;
    setIsCreating(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setUsers([...users, data.user]);
        setNewEmail('');
        setNewPassword('');
        setIsFormVisible(false);
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (err) {
      alert('An error occurred while creating user');
    } finally {
      setIsCreating(false);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  }

  if (loading) {
    return (
      <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: '80px', flex: 1, color: 'var(--text-main)', textAlign: 'center' }}>
        <div className="spinner-border text-info mb-3"></div>
        <p>{isRtl ? 'جاري تحميل المستخدمين...' : 'Loading access control...'}</p>
      </main>
    );
  }

  if (!isAdmin) return null;

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.role.includes(searchQuery.toLowerCase()));

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: '40px 60px', flex: 1, overflowY: 'auto', background: 'var(--bg-main)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header Section */}
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="section-kicker" style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '2px' }}>{isRtl ? 'نظام التحكم' : 'ACCESS CONTROL'}</span>
            <h1 className="smartwood-title" style={{ fontSize: '3rem', margin: 0 }}>
              {isRtl ? 'إدارة المستخدمين' : 'User Base'}
            </h1>
          </div>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="hero-primary-btn"
            style={{ minHeight: '48px', padding: '0 24px', borderRadius: '12px', gap: '8px', border: 'none' }}
          >
            <i className={`bi ${isFormVisible ? 'bi-dash-lg' : 'bi-plus-lg'}`}></i>
            {isRtl ? 'حساب جديد' : 'Invite User'}
          </button>
        </header>

        {/* Floating Create User Form */}
        {isFormVisible && (
          <div className="furniture-card p-4 mb-5" style={{ background: 'var(--bg-panel)', border: '1px solid var(--blue-deep)' }}>
            <h4 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>{isRtl ? 'إضافة مستخدم جديد للنظام' : 'Provision New System Access'}</h4>
            <form onSubmit={handleCreateUser} className="row g-3">
              <div className="col-md-5">
                <input
                  type="email"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{ borderRadius: '10px' }}
                  required
                />
              </div>
              <div className="col-md-5">
                <input
                  type="password"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder={isRtl ? 'كلمة المرور' : 'Secure Password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ borderRadius: '10px' }}
                  required
                />
              </div>
              <div className="col-md-2">
                <button type="submit" disabled={isCreating} className="hero-primary-btn w-100" style={{ border: 'none', height: '48px' }}>
                  {isCreating ? '...' : (isRtl ? 'حفظ' : 'Grant')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '30px' }}>
          <i className="bi bi-search" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}></i>
          <input
            type="text"
            className="form-control border-0"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              padding: '16px 20px 16px 50px',
              borderRadius: '16px',
              fontSize: '1rem',
              backdropFilter: 'blur(10px)'
            }}
            placeholder={isRtl ? 'تصفية حسب البريد أو الدور...' : 'Filter by email, role or permalink...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <style jsx>{`
            input::placeholder {
              color: rgba(255, 255, 255, 0.4) !important;
            }
          `}</style>
        </div>

        {error && <div className="alert alert-danger" style={{ borderRadius: '12px' }}>{error}</div>}

        {/* Users List */}
        <div className="d-flex flex-column gap-2">
          {filteredUsers.map(user => {
            const isMaster = user.id === masterAdminId;
            return (
              <div
                key={user.id}
                className="user-row transition-all"
                style={{
                  background: 'var(--bg-panel)',
                  borderRadius: '16px',
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  border: '1px solid var(--line-soft)',
                }}
              >
                {/* Avatar Icon */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: isMaster ? 'linear-gradient(45deg, #FFD700, #FFA500)' : 'linear-gradient(45deg, var(--blue-deep), var(--blue-accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.8rem', color: isMaster ? '#000' : '#fff'
                }}>
                  {getInitials(user.email)}
                </div>

                {/* Email & Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '2px' }}>{user.email}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', fontVariant: 'small-caps' }}>ID: {user.id}</div>
                </div>

                {/* Role Badge / Switch */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {isMaster ? (
                    <span style={{
                      background: 'rgba(255, 215, 0, 0.15)', color: '#FFD700', padding: '6px 14px',
                      borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase'
                    }}>
                      Master Admin
                    </span>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <select
                        className="form-select-sm"
                        style={{
                          background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)',
                          border: '1px solid var(--line-soft)', borderRadius: '10px',
                          padding: '6px 30px 6px 12px', cursor: 'pointer', appearance: 'none',
                          fontSize: '0.85rem'
                        }}
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value as Role)}
                      >
                        <option value="customer">{isRtl ? 'عميل' : 'Customer'}</option>
                        <option value="admin">{isRtl ? 'مدير' : 'Administrator'}</option>
                      </select>
                      <i className="bi bi-chevron-down" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', pointerEvents: 'none' }}></i>
                    </div>
                  )}

                  {!isMaster && (
                    <button
                      className="btn-trash-sleek"
                      onClick={() => handleDeleteUser(user.id)}
                      style={{
                        background: 'rgba(255, 77, 77, 0.1)', border: 'none', color: '#ff4d4d',
                        width: '36px', height: '36px', borderRadius: '10px', transition: '0.2s'
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-soft)', border: '1px dashed var(--line-soft)', borderRadius: '24px' }}>
              <i className="bi bi-people" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '15px', opacity: 0.3 }}></i>
              {users.length === 0 ? 'No active user accounts found.' : 'No users matching your specific filter.'}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .user-row:hover {
          background: rgba(255,255,255,0.03) !important;
          border-color: var(--blue-deep) !important;
        }
        .btn-trash-sleek:hover {
          background: #ff4d4d !important;
          color: white !important;
        }
      `}</style>
    </main>
  );
}
