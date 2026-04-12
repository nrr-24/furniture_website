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
  const { deleteItem, addItem, updateItem } = useFurniture();
  const { t, isRtl } = useLanguage();

  const [formData, setFormData] = useState<Omit<FurnitureItem, 'id'>>({
    name: initialItem?.name || '',
    nameAr: initialItem?.nameAr || '',
    description: initialItem?.description || '',
    descriptionAr: initialItem?.descriptionAr || '',
    image: initialItem?.image || '',
    price: initialItem?.price || 0,
    category: initialItem?.category || 'sofas'
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
      image: formData.image.trim() || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
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
      <div className="furniture-card p-4 mb-5" style={{ background: 'var(--bg-main)' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ fontSize: '1.8rem', margin: 0 }}>
            {initialItem ? (isRtl ? 'تعديل المنتج' : 'Edit Item') : (isRtl ? 'إضافة منتج' : 'Add Item')}
          </h2>
          {initialItem && (
            <button
              className="hero-secondary-btn border-danger text-danger"
              onClick={handleDelete}
              type="button"
              style={{ padding: '8px 16px' }}
            >
              <i className="bi bi-trash"></i> {isRtl ? 'حذف المنتج' : 'Delete'}
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name (EN)</label>
              <input
                type="text" className="form-control bg-dark text-white border-secondary"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">الاسم (AR)</label>
              <input
                type="text" className="form-control bg-dark text-white border-secondary"
                value={formData.nameAr} onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Description (EN)</label>
              <textarea
                className="form-control bg-dark text-white border-secondary"
                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required
              />
            </div>
            <div className="col-12">
              <label className="form-label">الوصف (AR)</label>
              <textarea
                className="form-control bg-dark text-white border-secondary"
                value={formData.descriptionAr} onChange={e => setFormData({ ...formData, descriptionAr: e.target.value })} required
              />
            </div>
            <div className="col-md-5">
              <label className="form-label">Image</label>
              <div className="d-flex gap-2">
                <input
                  type="text" className="form-control bg-dark text-white border-secondary"
                  value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}
                  placeholder="URL"
                />
                <input
                  type="file" accept="image/*" className="d-none"
                  id={`imageUpload-${initialItem?.id || 'new'}`} onChange={handleImageUpload}
                />
                <label htmlFor={`imageUpload-${initialItem?.id || 'new'}`} className="btn hero-secondary-btn d-flex align-items-center mb-0" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {uploading ? (isRtl ? 'جاري الرفع...' : 'Uploading...') : (isRtl ? 'رفع صورة' : 'Upload')}
                </label>
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label">Price</label>
              <input
                type="number" step="0.01" min="0" className="form-control bg-dark text-white border-secondary"
                value={formData.price ?? 0} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select
                className="form-select bg-dark text-white border-secondary"
                value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              >
                <option value="sofas">Sofas</option>
                <option value="bedrooms">Bedrooms</option>
                <option value="dining">Dining</option>
                <option value="accents">Accents</option>
              </select>
            </div>
            <div className="col-12 mt-4 d-flex gap-3">
              <button type="submit" className="hero-primary-btn flex-grow-1">
                {initialItem ? (isRtl ? 'تحديث' : 'Update Item') : (isRtl ? 'حفظ' : 'Save Item')}
              </button>
              {onClose && (
                <button type="button" className="hero-secondary-btn" onClick={onClose}>
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
