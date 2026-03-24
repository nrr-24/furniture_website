'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../data/AuthContext';
import { useLanguage } from '../../../data/LanguageContext';
import { User, Role } from '../../../data/AuthContext';

export default function AdminUsersPage() {
  const { isAdmin, isCustomer } = useAuth(); // Wait, wait. Is there a redirect needed?
  const { isRtl } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Basic protection (would normally use middleware too)
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

  if (loading) {
    return (
      <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: '80px', flex: 1, color: 'white', textAlign: 'center' }}>
        Loading Users...
      </main>
    );
  }

  // Prevent flash if not admin
  if (!isAdmin) return null;

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: '40px 60px', flex: 1, overflowY: 'auto' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 className="section-title mb-4">
          {isRtl ? 'إدارة المستخدمين' : 'User Management'}
        </h1>
        <p style={{ color: 'var(--text-soft)', marginBottom: '40px' }}>
          {isRtl ? 'لوحة تحكم المشرف لإدارة الأدوار والصلاحيات.' : 'Admin dashboard to manage roles and access permissions.'}
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

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
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '20px', verticalAlign: 'middle', color: 'var(--text-soft)' }}>{user.id}</td>
                  <td style={{ padding: '20px', verticalAlign: 'middle' }}>{user.email}</td>
                  <td style={{ padding: '20px', verticalAlign: 'middle' }}>
                    <select 
                      className="form-select bg-dark text-white border-secondary" 
                      style={{ width: 'auto' }}
                      value={user.role} 
                      onChange={(e) => handleUpdateRole(user.id, e.target.value as Role)}
                    >
                      <option value="customer">Viewer / Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '20px', verticalAlign: 'middle', textAlign: isRtl ? 'left' : 'right' }}>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      {isRtl ? 'حذف' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-soft)' }}>
                    No users found.
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
