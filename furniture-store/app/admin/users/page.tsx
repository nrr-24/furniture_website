'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../data/AuthContext';
import { useLanguage } from '../../../data/LanguageContext';
import { User, Role } from '../../../data/AuthContext';

export default function AdminUsersPage() {
  const { isAdmin, isCustomer } = useAuth();
  const { isRtl } = useLanguage();
  
  const [users, setUsers] = useState<User[]>([]);
  const [masterAdminId, setMasterAdminId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New User Form State
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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
    if (userId === masterAdminId) return; // Prevent modifying master admin
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
    if (userId === masterAdminId) return; // Prevent deleting master admin
    if (!window.confirm('Are you absolutely sure you want to permanently delete this user?')) return;

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
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (err) {
      alert('An error occurred while creating user');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: '80px', flex: 1, color: 'white', textAlign: 'center' }}>
        Loading Users...
      </main>
    );
  }

  if (!isAdmin) return null;

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.role.includes(searchQuery.toLowerCase()));

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: '40px 60px', flex: 1, overflowY: 'auto' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 className="section-title mb-2">
          {isRtl ? 'إدارة المستخدمين' : 'User Management'}
        </h1>
        <p style={{ color: 'var(--text-soft)', marginBottom: '40px' }}>
          {isRtl ? 'لوحة تحكم المشرف لإدارة الأدوار والصلاحيات.' : 'Admin dashboard to manage roles and access permissions.'}
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row mb-5">
          {/* Create User Form Section */}
          <div className="col-md-5">
            <div className="furniture-card p-4 h-100" style={{ background: 'var(--bg-panel)' }}>
              <h4 style={{ marginBottom: '20px' }}>{isRtl ? 'إنشاء حساب جديد' : 'Create New User'}</h4>
              <form onSubmit={handleCreateUser} className="d-flex flex-column gap-3">
                <input 
                  type="email" 
                  className="form-control bg-dark text-white border-secondary" 
                  placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
                <input 
                  type="password" 
                  className="form-control bg-dark text-white border-secondary" 
                  placeholder={isRtl ? 'كلمة المرور' : 'Password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="submit" disabled={isCreating} className="hero-primary-btn" style={{ padding: '12px' }}>
                  {isCreating ? (isRtl ? 'جاري الإنشاء...' : 'Creating...') : (isRtl ? 'إضافة مستخدم' : 'Add User')}
                </button>
              </form>
            </div>
          </div>

          {/* Search Bar Section */}
          <div className="col-md-7 d-flex align-items-end">
             <div className="w-100">
                <label style={{ color: 'var(--text-soft)', marginBottom: '8px', display: 'block' }}>
                  {isRtl ? 'البحث عن مستخدمين' : 'Search Users'}
                </label>
                <input 
                  type="text" 
                  className="form-control bg-dark text-white border-secondary" 
                  placeholder={isRtl ? 'البحث بالبريد الإلكتروني...' : 'Search by email or role...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '14px' }}
                />
             </div>
          </div>
        </div>

        <div className="furniture-card p-0" style={{ overflow: 'hidden' }}>
          <table className="table table-dark table-hover mb-0" style={{ background: 'var(--bg-panel)' }}>
            <thead>
              <tr>
                <th style={{ padding: '20px' }}>ID</th>
                <th style={{ padding: '20px' }}>{isRtl ? 'البريد الإلكتروني' : 'Email'}</th>
                <th style={{ padding: '20px' }}>{isRtl ? 'الدور' : 'Role'}</th>
                <th style={{ padding: '20px', textAlign: isRtl ? 'left' : 'right' }}>{isRtl ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const isMaster = user.id === masterAdminId;
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '20px', verticalAlign: 'middle', color: 'var(--text-soft)' }}>
                      {user.id} {isMaster && <span className="badge bg-primary ms-2">Master</span>}
                    </td>
                    <td style={{ padding: '20px', verticalAlign: 'middle' }}>{user.email}</td>
                    <td style={{ padding: '20px', verticalAlign: 'middle' }}>
                      {isMaster ? (
                        <span style={{ color: 'var(--text-main)', opacity: 0.8 }}>Admin (Protected)</span>
                      ) : (
                        <select 
                          className="form-select bg-dark text-white border-secondary" 
                          style={{ width: 'auto' }}
                          value={user.role} 
                          onChange={(e) => handleUpdateRole(user.id, e.target.value as Role)}
                        >
                          <option value="customer">Viewer / Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td style={{ padding: '20px', verticalAlign: 'middle', textAlign: isRtl ? 'left' : 'right' }}>
                      {!isMaster && (
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          {isRtl ? 'حذف' : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-soft)' }}>
                    {users.length === 0 ? 'No users found.' : 'No users match your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
