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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialItem) {
      updateItem(initialItem.id, formData);
    } else {
      addItem(formData);
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
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">الاسم (AR)</label>
              <input 
                type="text" className="form-control bg-dark text-white border-secondary" 
                value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} required 
              />
            </div>
            <div className="col-12">
              <label className="form-label">Description (EN)</label>
              <textarea 
                className="form-control bg-dark text-white border-secondary" 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required 
              />
            </div>
            <div className="col-12">
              <label className="form-label">الوصف (AR)</label>
              <textarea 
                className="form-control bg-dark text-white border-secondary" 
                value={formData.descriptionAr} onChange={e => setFormData({...formData, descriptionAr: e.target.value})} required 
              />
            </div>
            <div className="col-md-5">
              <label className="form-label">Image URL</label>
              <input 
                type="text" className="form-control bg-dark text-white border-secondary" 
                value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} required 
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Price</label>
              <input 
                type="number" step="0.01" min="0" className="form-control bg-dark text-white border-secondary" 
                value={formData.price ?? 0} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} required 
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select 
                className="form-select bg-dark text-white border-secondary" 
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}
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
