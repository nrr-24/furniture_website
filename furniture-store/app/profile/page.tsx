'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../data/AuthContext';
import { useLanguage } from '../../data/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, updateUser, logout, isAdmin } = useAuth();
  const { isRtl, language, t } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab ] = useState<'info' | 'addresses' | 'history'>('info');
  const [saveMessage, setSaveMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form State
  const [editName, setEditName] = useState(user?.full_name || '');
  const [editPhone, setEditPhone] = useState(user?.phone_number || '');

  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    house_no: '', street: '', area: '', city: '', province: '', country: 'Kuwait', is_default: false
  });

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Delete Account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAccount = async () => {
    if (!user || isDeleting) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/auth/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteError(data.error || `Error ${res.status}`);
        return;
      }
      // Wipe local session and bounce to home — user no longer exists.
      logout();
      router.push('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      router.push('/admin/users');
    }
  }, [isAdmin, router]);

  useEffect(() => {
    if (user) {
      setEditName(user.full_name || '');
      setEditPhone(user.phone_number || '');
      fetchAddresses();
      fetchOrders();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    setIsLoadingAddresses(true);
    try {
      const res = await fetch(`/api/addresses?userId=${user.id}`);
      const data = await res.json();
      if (data.addresses) setAddresses(data.addresses);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders?userId=${user.id}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateUser({
      full_name: editName,
      phone_number: editPhone
    });
    if (success) {
      setSaveStatus('success');
      setSaveMessage(isRtl ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully');
      setTimeout(() => {
        setSaveMessage('');
        setSaveStatus(null);
      }, 3000);
    } else {
      setSaveStatus('error');
      setSaveMessage(isRtl ? 'فشل الحفظ' : 'Save failed');
    }
    setIsSaving(false);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          addressData: newAddress
        }),
      });
      if (res.ok) {
        setIsAddingAddress(false);
        setNewAddress({ house_no: '', street: '', area: '', city: '', province: '', country: 'Kuwait', is_default: false });
        fetchAddresses();
      }
    } catch (err) {
      console.error('Error adding address:', err);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, action: 'delete', addressId: id }),
      });
      fetchAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  // Mathematical correction for order totals
  const calculateTotal = (order: any) => {
    if (!order.order_items || order.order_items.length === 0) return order.total_amount || 0;
    return order.order_items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  };

  if (!user) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <p>{isRtl ? 'يرجى تسجيل الدخول لعرض هذه الصفحة' : 'Please log in to view this page'}</p>
      </main>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ background: 'var(--bg-main)', height: '100%', color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      <main className="profile-main" style={{ maxWidth: '1300px', width: '100%', margin: '0 auto', display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* Sidebar Navigation - Separately scrollable if needed */}
        <aside className="profile-aside" style={{ width: '320px', flexShrink: 0, padding: '40px 20px', borderRight: '1px solid var(--line-soft)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
           <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ 
                 width: '100px', height: '100px', borderRadius: '50%', 
                 background: 'linear-gradient(135deg, var(--blue-main), var(--blue-deep))', 
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 margin: '0 auto 20px', fontSize: '2.5rem', color: 'white',
                 boxShadow: '0 15px 35px rgba(0,0,0,0.3)'
              }}>
                 <i className="bi bi-person"></i>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{user.full_name || user.email.split('@')[0]}</h2>
              <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '6px' }}>{user.email}</p>
           </div>

           <div className="profile-tabs" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => setActiveTab('info')} className={`profile-tab-btn ${activeTab === 'info' ? 'active' : ''}`}>
                 <i className="bi bi-person-lines-fill"></i> {isRtl ? 'المعلومات الشخصية' : 'Personal Info'}
              </button>
              <button onClick={() => setActiveTab('addresses')} className={`profile-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}>
                 <i className="bi bi-geo-alt"></i> {isRtl ? 'عنوان الشحن' : 'Shipping Addresses'}
              </button>
              <button onClick={() => setActiveTab('history')} className={`profile-tab-btn ${activeTab === 'history' ? 'active' : ''}`}>
                 <i className="bi bi-clock-history"></i> {isRtl ? 'سجل الطلبات' : 'Order History'}
              </button>
              
              <div style={{ margin: 'auto 0 40px' }}>
                 <button onClick={logout} className="profile-tab-btn" style={{ color: '#ff6b6b', width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', borderRadius: 0 }}>
                    <i className="bi bi-box-arrow-right"></i> {isRtl ? 'تسجيل الخروج' : 'Logout'}
                 </button>
                 <button onClick={() => setShowDeleteConfirm(true)} className="profile-tab-btn" style={{ color: '#ff4d4d', width: '100%', opacity: 0.85, fontSize: '0.85rem' }}>
                    <i className="bi bi-trash3"></i> {isRtl ? 'حذف الحساب' : 'Delete Account'}
                 </button>
              </div>
           </div>
        </aside>

        {/* Content Area - Independent Scrolling */}
        <section className="profile-content" style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
           <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '120px' }}>
             
             {/* Info Tab */}
             {activeTab === 'info' && (
                <div className="furniture-card" style={{ padding: '40px', background: 'var(--bg-panel)', borderRadius: '30px', border: '1px solid var(--line-soft)' }}>
                   <h3 style={{ marginBottom: '30px' }}>{isRtl ? 'تعديل الملف الشخصي' : 'Edit Profile'}</h3>
                   <form onSubmit={handleSaveProfile}>
                       <div className="row g-4">
                          <div className="col-md-6">
                             <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', opacity: 0.6 }}>{isRtl ? 'الاسم الكامل' : 'Full Name'}</label>
                             <input 
                                type="text"
                                className="form-control"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line-soft)', color: 'white', borderRadius: '14px', height: '56px' }}
                             />
                          </div>
                          <div className="col-md-6">
                             <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', opacity: 0.6 }}>{isRtl ? 'رقم الهاتف' : 'Phone Number'}</label>
                             <input 
                                type="tel"
                                className="form-control"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line-soft)', color: 'white', borderRadius: '14px', height: '56px' }}
                             />
                          </div>
                       </div>

                       {saveMessage && (
                          <div style={{ 
                             marginTop: '20px', 
                             color: saveStatus === 'success' ? '#00b894' : '#ff6b6b', 
                             background: saveStatus === 'success' ? 'rgba(0,184,148,0.1)' : 'rgba(255,107,107,0.1)', 
                             padding: '12px', 
                             borderRadius: '10px', 
                             textAlign: 'center',
                             border: `1px solid ${saveStatus === 'success' ? 'rgba(0,184,148,0.2)' : 'rgba(255,107,107,0.2)'}`
                          }}>
                             {saveMessage}
                          </div>
                       )}

                       <button 
                          disabled={isSaving}
                          className="hero-primary-btn mt-5" 
                          style={{ border: 'none', minWidth: '200px' }}
                       >
                          {isSaving ? '...' : (isRtl ? 'حفظ التغييرات' : 'Save Changes')}
                       </button>
                   </form>
                </div>
             )}

             {/* Addresses Tab */}
             {activeTab === 'addresses' && (
                <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                      <h3 style={{ margin: 0 }}>{isRtl ? 'عناوين الشحن' : 'Shipping Addresses'}</h3>
                      <button 
                        onClick={() => setIsAddingAddress(!isAddingAddress)}
                        className="hero-primary-btn" 
                        style={{ border: 'none', height: '40px', fontSize: '0.85rem', padding: '0 20px' }}
                      >
                         {isAddingAddress ? (isRtl ? 'إلغاء' : 'Cancel') : (isRtl ? 'إضافة جديد' : 'Add New Address')}
                      </button>
                   </div>

                   {isAddingAddress && (
                      <form onSubmit={handleAddAddress} style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '24px', marginBottom: '30px', border: '1px solid var(--blue-deep)' }}>
                         <div className="row g-3">
                            <div className="col-md-4"><input type="text" className="form-control" placeholder={isRtl ? 'رقم المنزل' : 'House No.'} value={newAddress.house_no} onChange={(e) => setNewAddress({...newAddress, house_no: e.target.value})} /></div>
                            <div className="col-md-8"><input type="text" className="form-control" placeholder={isRtl ? 'الشارع' : 'Street'} value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} /></div>
                            <div className="col-md-6"><input type="text" className="form-control" placeholder={isRtl ? 'المنطقة' : 'Area'} value={newAddress.area} onChange={(e) => setNewAddress({...newAddress, area: e.target.value})} /></div>
                            <div className="col-md-6"><input type="text" className="form-control" placeholder={isRtl ? 'المدينة' : 'City'} value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} /></div>
                            <div className="col-12 d-flex align-items-center gap-2">
                               <input type="checkbox" id="isDefault" checked={newAddress.is_default} onChange={(e) => setNewAddress({...newAddress, is_default: e.target.checked})} />
                               <label htmlFor="isDefault" style={{ fontSize: '0.85rem' }}>{isRtl ? 'تعيين كافتراضي' : 'Set as default address'}</label>
                            </div>
                            <div className="col-12 mt-4">
                               <button className="hero-primary-btn" style={{ border: 'none', width: '100%' }}>{isRtl ? 'حفظ العنوان' : 'Save Address'}</button>
                            </div>
                         </div>
                      </form>
                   )}

                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                      {isLoadingAddresses ? (<p>Loading...</p>) : addresses.map(addr => (
                         <div key={addr.id} className="furniture-card" style={{ padding: '25px', position: 'relative', background: 'var(--bg-panel)', border: '1px solid var(--line-soft)' }}>
                            {addr.is_default && <span style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '0.65rem', background: 'var(--blue-deep)', color: 'white', padding: '4px 10px', borderRadius: '50px', letterSpacing: '1px' }}>DEFAULT</span>}
                            <h5 style={{ marginBottom: '15px' }}>{addr.city}, {addr.area}</h5>
                            <p style={{ margin: '0 0 5px', opacity: 0.6, fontSize: '0.9rem' }}>{addr.street}, House {addr.house_no}</p>
                            <p style={{ margin: '0', opacity: 0.6, fontSize: '0.9rem' }}>{addr.province || 'Kuwait'}</p>
                            
                            <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                               <button onClick={() => deleteAddress(addr.id)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', padding: 0, fontSize: '0.85rem' }}>Delete</button>
                            </div>
                         </div>
                      ))}
                      {addresses.length === 0 && !isAddingAddress && (
                         <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', opacity: 0.3, border: '1px dashed var(--line-soft)', borderRadius: '24px' }}>
                            <i className="bi bi-geo" style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}></i>
                            No addresses saved yet.
                         </div>
                      )}
                   </div>
                </div>
             )}

             {/* History Tab */}
             {activeTab === 'history' && (
                <div>
                   <h3 style={{ marginBottom: '30px' }}>{isRtl ? 'سجل الطلبات' : 'Order History'}</h3>
                   {isLoadingOrders ? (<p>Loading orders...</p>) : orders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '100px', opacity: 0.3, border: '1px dashed var(--line-soft)', borderRadius: '24px' }}>
                         <i className="bi bi-receipt" style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}></i>
                         No past orders found.
                      </div>
                   ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                         {orders.map(order => (
                            <div key={order.id} style={{ padding: '30px', background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--line-soft)' }}>
                               <div className="d-flex justify-content-between align-items-center mb-4">
                                  <div>
                                     <div style={{ fontSize: '0.85rem', opacity: 0.5 }}>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</div>
                                     <h4 style={{ margin: '5px 0 0', fontSize: '1.2rem' }}>Order #{order.id.substring(0,8)}</h4>
                                  </div>
                                  <span style={{ 
                                     padding: '6px 16px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700,
                                     background: order.status === 'delivered' ? 'rgba(0,184,148,0.1)' : 'rgba(255,165,0,0.1)',
                                     color: order.status === 'delivered' ? '#00b894' : '#ffa500',
                                     textTransform: 'uppercase'
                                  }}>
                                     {order.status}
                                  </span>
                               </div>

                               <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                  {order.order_items?.map((item: any) => (
                                     <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                           <img src={item.products?.image_url} style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }} />
                                           <div>
                                              <div style={{ fontWeight: 600 }}>{item.products?.name}</div>
                                              <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>x{item.quantity} @ {item.price} {t('currency')}</div>
                                           </div>
                                        </div>
                                        <div style={{ fontWeight: 600 }}>{item.price * item.quantity} {t('currency')}</div>
                                     </div>
                                  ))}
                               </div>

                               <div style={{ borderTop: '1px solid var(--line-soft)', marginTop: '20px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ opacity: 0.5 }}>Expected Total</span>
                                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue-main)' }}>
                                     {calculateTotal(order)} {t('currency')}
                                  </span>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             )}

           </div>
        </section>
      </main>

      {/* Delete account confirmation — requires typing the literal word
          DELETE so it's not triggerable by an accidental Enter press. */}
      {showDeleteConfirm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <div
            style={{ background: 'var(--bg-panel)', borderRadius: '24px', padding: '36px', maxWidth: '460px', width: '100%', textAlign: 'center', border: '1px solid rgba(255,77,77,0.4)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,77,77,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '1.8rem', color: '#ff4d4d' }} />
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.4rem', fontWeight: 700 }}>
              {isRtl ? 'حذف حسابك؟' : 'Delete your account?'}
            </h3>
            <p style={{ color: 'var(--text-soft)', margin: '0 auto 20px', fontSize: '0.92rem', lineHeight: 1.55, maxWidth: '380px' }}>
              {isRtl
                ? 'سيتم حذف حسابك وعنوانك وعربة التسوق وسجل الطلبات نهائياً. لا يمكن التراجع.'
                : "Your account, addresses, cart, and order history will be permanently deleted. This can't be undone."}
            </p>
            <p style={{ color: 'var(--text-soft)', margin: '0 0 8px', fontSize: '0.82rem', textAlign: isRtl ? 'right' : 'left' }}>
              {isRtl ? 'اكتب DELETE للتأكيد' : 'Type DELETE to confirm'}
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              autoFocus
              placeholder="DELETE"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,77,77,0.4)', background: 'rgba(0,0,0,0.25)', color: 'white', marginBottom: '16px', fontFamily: 'monospace', letterSpacing: '0.15em', textAlign: 'center', fontSize: '1rem' }}
            />
            {deleteError && (
              <div style={{ background: 'rgba(255,77,77,0.1)', color: '#ff6b6b', padding: '10px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>
                {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteError(''); }}
                disabled={isDeleting}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--line-soft)', color: 'white', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                style={{ flex: 1, padding: '12px', background: deleteConfirmText === 'DELETE' ? '#ff4d4d' : 'rgba(255,77,77,0.4)', border: 'none', color: 'white', borderRadius: '10px', fontWeight: 700, cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed', opacity: isDeleting ? 0.7 : 1 }}
              >
                {isDeleting ? (isRtl ? 'جاري الحذف...' : 'Deleting...') : (isRtl ? 'حذف نهائي' : 'Delete forever')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .profile-main { padding: 0 20px; }
        .profile-tab-btn {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 16px 24px;
          border: 1px solid transparent;
          background: transparent;
          color: white;
          border-radius: 16px;
          text-align: left;
          font-weight: 500;
          transition: 0.3s;
          cursor: pointer;
        }
        .profile-tab-btn:hover {
          background: rgba(255,255,255,0.03);
        }
        .profile-tab-btn.active {
          background: var(--blue-deep);
          border-color: var(--blue-main);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .form-control {
           background: rgba(255, 255, 255, 0.05) !important;
           border: 1px solid var(--line-soft) !important;
           color: white !important;
           border-radius: 12px !important;
        }
        .transition-all {
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        input::placeholder {
          color: white !important;
          opacity: 0.35 !important;
        }

        @media (max-width: 900px) {
          .profile-main { flex-direction: column !important; padding: 0 !important; overflow-y: auto !important; }
          .profile-aside {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid var(--line-soft);
            padding: 24px 16px !important;
            overflow-y: visible !important;
          }
          .profile-aside > div:first-child { margin-bottom: 20px !important; }
          .profile-aside .profile-tabs {
            flex-direction: row !important;
            overflow-x: auto;
            gap: 8px !important;
            padding-bottom: 4px;
            scrollbar-width: none;
          }
          .profile-aside .profile-tabs::-webkit-scrollbar { display: none; }
          .profile-aside .profile-tabs > button {
            flex-shrink: 0;
            padding: 10px 16px !important;
            font-size: 0.85rem;
          }
          .profile-aside .profile-tabs > div {
            margin: 0 !important;
            flex-shrink: 0;
          }
          .profile-aside .profile-tabs > div > button {
            border-top: none !important;
            padding-top: 10px !important;
          }
          .profile-content { padding: 24px 16px !important; overflow-y: visible !important; }
          .profile-content > div { padding-bottom: 40px !important; }
        }
        @media (max-width: 600px) {
          .profile-aside > div:first-child > div:first-child {
            width: 72px !important;
            height: 72px !important;
            font-size: 1.8rem !important;
          }
          .profile-aside h2 { font-size: 1.2rem !important; }
        }
      `}</style>
    </div>
  );
}
