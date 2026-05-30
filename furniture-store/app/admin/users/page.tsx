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

  // UI State
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // New User Form State
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Detail View State (for the expanded user)
  const [detailName, setDetailName] = useState('');
  const [detailPhone, setDetailPhone] = useState('');
  const [detailRole, setDetailRole] = useState<Role>('customer');
  const [detailOrders, setDetailOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (isCustomer && !isAdmin) {
      window.location.href = '/';
      return;
    }

    fetchUsers();
  }, [isAdmin, isCustomer]);

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

  const handleExpand = async (user: User) => {
    if (expandedUserId === user.id) {
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId(user.id);
    setDetailName(user.full_name || '');
    setDetailPhone(user.phone_number || '');
    setDetailRole(user.role);
    setDetailOrders([]);
    
    // Fetch History
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders?userId=${user.id}`);
      const data = await res.json();
      if (data.orders) setDetailOrders(data.orders);
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expandedUserId) return;
    setIsSaving(true);
    try {
      // 1. Update Info
      const resInfo = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'updateInfo', 
          userId: expandedUserId, 
          full_name: detailName, 
          phone_number: detailPhone 
        }),
      });

      // 2. Update Role (if changed)
      const targetUser = users.find(u => u.id === expandedUserId);
      if (targetUser && detailRole !== targetUser.role && expandedUserId !== masterAdminId) {
        await fetch('/api/auth/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'updateRole', 
            userId: expandedUserId, 
            role: detailRole 
          }),
        });
      }

      if (resInfo.ok) {
        // Refresh local list
        setUsers(users.map(u => u.id === expandedUserId ? { ...u, full_name: detailName, phone_number: detailPhone, role: detailRole } : u));
        setExpandedUserId(null);
      } else {
        alert('Failed to update user details');
      }
    } catch {
      alert('Error communicating with database');
    } finally {
      setIsSaving(false);
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

  const getInitials = (email: string) => email.substring(0, 2).toUpperCase();

  if (loading) {
    return (
      <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: '80px', flex: 1, color: 'var(--text-main)', textAlign: 'center' }}>
        <div className="spinner-border text-info mb-3"></div>
        <p>{isRtl ? 'جاري تحميل المستخدمين...' : 'Loading access control...'}</p>
      </main>
    );
  }

  if (!isAdmin) return null;

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.includes(searchQuery.toLowerCase())
  );

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: 'clamp(24px, 5vw, 40px) clamp(16px, 5vw, 60px)', flex: 1, overflowY: 'auto', background: 'var(--bg-main)' }}>
      <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto' }}>

        {/* Header Section */}
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="section-kicker" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>{isRtl ? 'نظام التحكم' : 'ACCESS CONTROL'}</span>
            <h1 className="smartwood-title" style={{ fontSize: 'clamp(1.8rem, 6vw, 3rem)', margin: 0 }}>
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
          <div className="furniture-card p-4 mb-5" style={{ background: 'var(--bg-panel)', border: '1px solid var(--line-soft)' }}>
            <h4 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>{isRtl ? 'إضافة مستخدم جديد للنظام' : 'Provision New System Access'}</h4>
            <form onSubmit={handleCreateUser} className="row g-3">
              <div className="col-md-5">
                <input
                  type="email"
                  className="form-control"
                  placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{ borderRadius: '10px', height: '48px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--line-soft)' }}
                  required
                />
              </div>
              <div className="col-md-5">
                <input
                  type="password"
                  className="form-control"
                  placeholder={isRtl ? 'كلمة المرور' : 'Secure Password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ borderRadius: '10px', height: '48px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--line-soft)' }}
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
            className="form-control"
            style={{
              background: 'var(--bg-panel)',
              color: 'var(--text-main)',
              border: '1px solid var(--line-soft)',
              padding: '16px 20px 16px 50px',
              borderRadius: '16px',
              fontSize: '1rem',
            }}
            placeholder={isRtl ? 'تصفية حسب البريد أو الاسم أو الدور...' : 'Filter by email, name or role...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-danger" style={{ borderRadius: '12px' }}>{error}</div>}

        {/* Users List */}
        <div className="d-flex flex-column gap-3">
          {filteredUsers.map(user => {
            const isMaster = user.id === masterAdminId;
            const isExpanded = expandedUserId === user.id;

            return (
              <div
                key={user.id}
                className={`user-card transition-all ${isExpanded ? 'active' : ''}`}
                style={{
                  background: 'var(--bg-panel)',
                  borderRadius: '24px',
                  border: isExpanded ? '1px solid var(--blue-main)' : '1px solid var(--line-soft)',
                  overflow: 'hidden',
                  boxShadow: isExpanded ? '0 15px 40px rgba(0,0,0,0.4)' : 'none'
                }}
              >
                {/* Header/Summary Row */}
                <div 
                  onClick={() => handleExpand(user)}
                  style={{
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: isMaster ? 'linear-gradient(45deg, #FFD700, #FFA500)' : 'linear-gradient(45deg, var(--blue-deep), var(--blue-accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.8rem', color: isMaster ? '#000' : '#fff',
                    flexShrink: 0
                  }}>
                    {getInitials(user.email)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '2px' }}>
                      {user.full_name || user.email}
                      {user.full_name && <span style={{ marginLeft: '10px', fontSize: '0.8rem', fontWeight: 400, opacity: 0.5 }}>({user.email})</span>}
                    </div>
                    <div className="d-flex gap-3">
                       <span style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>{user.role}</span>
                       <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="expanded-indicator" style={{ transition: '0.3s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                    <i className="bi bi-chevron-down" style={{ fontSize: '1.2rem', opacity: 0.4 }}></i>
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div style={{ padding: '0 24px 30px', borderTop: '1px solid var(--line-soft)', background: 'var(--bg-main)' }}>
                    <div className="row g-4 mt-2">
                      {/* Left Side: Profile Edit */}
                      <div className="col-md-6">
                        <h5 style={{ fontSize: '0.9rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '1px' }}>MANAGEMENT & INFO</h5>
                        <form onSubmit={handleUpdateUser}>
                          <div className="mb-3">
                            <label className="admin-label">Full Name</label>
                            <input type="text" className="admin-input" value={detailName} onChange={(e) => setDetailName(e.target.value)} />
                          </div>
                          {!isMaster && (
                            <div className="mb-3">
                              <label className="admin-label">Phone Number</label>
                              <input type="text" className="admin-input" value={detailPhone} onChange={(e) => setDetailPhone(e.target.value)} />
                            </div>
                          )}
                          {!isMaster && (
                            <div className="mb-4">
                              <label className="admin-label">User Role</label>
                              <select className="admin-input" value={detailRole} onChange={(e) => setDetailRole(e.target.value as Role)}>
                                <option value="customer">Customer</option>
                                <option value="admin">Administrator</option>
                              </select>
                            </div>
                          )}
                          <div className="d-flex gap-2">
                             <button type="submit" disabled={isSaving} className="hero-primary-btn" style={{ flex: 1, minHeight: '44px', border: 'none' }}>
                               {isSaving ? 'Saving...' : 'Save Profile'}
                             </button>
                             {!isMaster && (
                               <button type="button" onClick={() => handleDeleteUser(user.id)} style={{ background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d', borderRadius: '12px', padding: '0 15px' }}>
                                 <i className="bi bi-trash"></i>
                               </button>
                             )}
                          </div>
                        </form>
                      </div>

                      {/* Right Side: Order History */}
                      <div className="col-md-6" style={{ borderLeft: '1px solid var(--line-soft)' }}>
                        <h5 style={{ fontSize: '0.9rem', opacity: 0.5, marginBottom: '20px', letterSpacing: '1px' }}>TRANSACTION LOGS</h5>
                        <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                          {loadingOrders ? (
                            <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-info"></div></div>
                          ) : detailOrders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.3 }}>No history found.</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {detailOrders.map(order => (
                                <div key={order.id} style={{ padding: '12px 16px', background: 'var(--bg-panel)', borderRadius: '14px', border: '1px solid var(--line-soft)', fontSize: '0.85rem' }}>
                                  <div className="d-flex justify-content-between mb-2">
                                    <span style={{ fontWeight: 700 }}>#{order.id.substring(0,8)}</span>
                                    <span style={{ opacity: 0.6 }}>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</span>
                                  </div>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span style={{ color: 'var(--blue-main)', fontWeight: 700 }}>{order.order_items?.reduce((s: number, i: any) => s + (i.price * i.quantity), 0) || order.total_amount} {t('currency')}</span>
                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-main)', color: 'var(--text-soft)' }}>{order.status}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
        .user-card:hover {
          border-color: var(--blue-accent) !important;
        }
        .transition-all {
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        input::placeholder {
          color: var(--text-soft) !important;
          opacity: 1 !important;
        }
        .admin-label {
          display: block;
          margin-bottom: 6px;
          font-size: 0.8rem;
          color: var(--text-soft);
          font-weight: 600;
        }
        .admin-input {
          width: 100%;
          background: var(--bg-main);
          border: 1px solid var(--line-soft);
          border-radius: 10px;
          padding: 10px 14px;
          color: var(--text-main);
          font-size: 0.9rem;
          transition: 0.2s;
        }
        .admin-input:focus {
          border-color: var(--text-main);
          outline: none;
        }
        .admin-input::placeholder {
           color: var(--text-soft);
        }
        @media (max-width: 767px) {
          .user-card .col-md-6 {
            border-left: none !important;
            border-top: 1px solid var(--line-soft);
            padding-top: 24px;
          }
          .user-card .col-md-6:first-child {
            border-top: none;
            padding-top: 0;
          }
        }
      `}</style>
    </main>
  );
}
