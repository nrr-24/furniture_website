'use client';

import React, { useState } from 'react';
import { FurnitureItem } from '../data/furnitureData';
import { useFurniture } from '../data/FurnitureContext';
import { useLanguage } from '../data/LanguageContext';

interface FurnitureManagerProps {
  initialItem?: FurnitureItem;
  onClose?: () => void;
}

export default function FurnitureManager({ initialItem, onClose }: FurnitureManagerProps) {
  const { deleteItem, addItem, updateItem, categories } = useFurniture();
  const { t, isRtl } = useLanguage();

  const [formData, setFormData] = useState<Omit<FurnitureItem, 'id'>>({
    name: initialItem?.name || '',
    nameAr: initialItem?.nameAr || '',
    description: initialItem?.description || '',
    descriptionAr: initialItem?.descriptionAr || '',
    image: initialItem?.image || '',
    price: initialItem?.price || 0,
    categoryId: initialItem?.categoryId || (categories.length > 0 ? categories[0].id : ''),
    sortOrder: initialItem?.sortOrder || 0
  });

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const file = e.target.files[0];
    try {
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload API Error:', response.status, errorText);
        alert(`Upload failed (${response.status}): ${errorText.substring(0, 100)}...`);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        alert('Unexpected server response. Please check the logs.');
        return;
      }

      const newBlob = await response.json();
      if (newBlob.url) {
        setFormData({ ...formData, image: newBlob.url });
      } else {
        alert(newBlob.error || 'Failed to upload image.');
      }
    } catch (error) {
      console.error('Upload Exception:', error);
      alert('Network or processing error during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Inject Fallbacks for missing required user data
    const finalData = {
      ...formData,
      name: formData.name.trim() || 'Unnamed Item',
      nameAr: formData.nameAr.trim() || 'منتج غير مسمى',
      image: formData.image.trim() || '/images/no-image.png',
    };

    if (initialItem) {
      updateItem(initialItem.id, finalData);
    } else {
      addItem(finalData);
    }
    if (onClose) onClose();
  };

  const handleDelete = () => {
    if (initialItem && window.confirm('Are you sure you want to delete this item?')) {
      deleteItem(initialItem.id);
      if (onClose) onClose();
    }
  };

  return (
    <div className="container py-0" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="furniture-card p-3 p-md-4 mb-2" style={{ background: 'var(--bg-main)', border: '1px solid var(--line-soft)', borderRadius: '16px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>
            {initialItem ? (isRtl ? 'تعديل المنتج' : 'Edit Item') : (isRtl ? 'إضافة منتج' : 'Add Item')}
          </h2>
          {initialItem && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleDelete}
              type="button"
              style={{ padding: '6px 12px', borderRadius: '8px' }}
            >
              <i className="bi bi-trash"></i> {isRtl ? 'حذف' : 'Delete'}
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label small opacity-75">Name (EN)</label>
              <input
                type="text" className="form-control bg-dark text-white border-secondary form-control-sm"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small opacity-75">الاسم (AR)</label>
              <input
                type="text" className="form-control bg-dark text-white border-secondary form-control-sm"
                value={formData.nameAr} onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small opacity-75">Description (EN)</label>
              <textarea
                className="form-control bg-dark text-white border-secondary form-control-sm" rows={2}
                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small opacity-75">الوصف (AR)</label>
              <textarea
                className="form-control bg-dark text-white border-secondary form-control-sm" rows={2}
                value={formData.descriptionAr} onChange={e => setFormData({ ...formData, descriptionAr: e.target.value })} required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small opacity-75">Image URL</label>
              <div className="d-flex gap-2">
                <input
                  type="text" className="form-control bg-dark text-white border-secondary form-control-sm"
                  value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}
                  placeholder="URL"
                />
                <input
                  type="file" accept="image/*" className="d-none"
                  id={`imageUpload-${initialItem?.id || 'new'}`} onChange={handleImageUpload}
                />
                <label htmlFor={`imageUpload-${initialItem?.id || 'new'}`} className="btn btn-sm hero-secondary-btn py-1 px-3 d-flex align-items-center mb-0" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {uploading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-upload me-2"></i>}
                  {uploading ? (isRtl ? 'جاري...' : 'Up...') : (isRtl ? 'رفع' : 'Upload')}
                </label>
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label small opacity-75">Price</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-dark border-secondary text-white">$</span>
                <input
                  type="number" step="0.01" min="0" className="form-control bg-dark text-white border-secondary"
                  value={formData.price} 
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  onFocus={(e) => { if(formData.price === 0) e.target.value = ''; }}
                  required
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label small opacity-75">{isRtl ? 'الفئة' : 'Category'}</label>
              <select
                className="form-select bg-dark text-white border-secondary form-select-sm"
                value={formData.categoryId} 
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                <option value="" disabled>{isRtl ? 'اختر' : 'Select'}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {isRtl ? cat.nameAr : cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 mt-3 d-flex gap-2">
              <button type="submit" className="hero-primary-btn flex-grow-1 py-2" style={{ borderRadius: '8px', border: 'none' }}>
                {initialItem ? (isRtl ? 'تحديث' : 'Update Item') : (isRtl ? 'حفظ' : 'Save Item')}
              </button>
              {onClose && (
                <button type="button" className="hero-secondary-btn px-4 py-2" style={{ borderRadius: '8px', border: 'none' }} onClick={onClose}>
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
