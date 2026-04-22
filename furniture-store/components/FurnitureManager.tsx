'use client';

import React, { useState } from 'react';
import { FurnitureItem } from '../data/furnitureData';
import { useFurniture } from '../data/FurnitureContext';
import { useLanguage } from '../data/LanguageContext';
import { authHeaders } from '../lib/authClient';

// Upload guards — mirror Next App Router's default body size (4 MB) and
// reject non-image files before hitting the network.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ACCEPTED_MIME_RE = /^image\/(jpeg|jpg|png|gif|webp|avif|heic|heif|svg\+xml)$/;
const ACCEPTED_EXT_RE = /\.(jpe?g|png|gif|webp|avif|heic|heif|svg)$/i;

function validateImageFile(file: File): string | null {
  // Some environments/browsers leave file.type empty for uncommon formats,
  // so accept either a known MIME or a known extension.
  const typeOk = file.type ? ACCEPTED_MIME_RE.test(file.type) : true;
  const extOk = ACCEPTED_EXT_RE.test(file.name);
  if (!typeOk && !extOk) {
    return `unsupported file type (${file.type || 'unknown'})`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `too large (${mb} MB, max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB)`;
  }
  if (file.size === 0) {
    return 'file is empty';
  }
  return null;
}

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
    sortOrder: initialItem?.sortOrder || 0,
    originalPrice: initialItem?.originalPrice ?? null,
    salePrice: initialItem?.salePrice ?? null,
    colors: initialItem?.colors || [],
    types: initialItem?.types || [],
    gallery: initialItem?.gallery || [],
    isFeatured: initialItem?.isFeatured ?? false,
  });

  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  /**
   * Unified images list — the first entry is the product's main image
   * (persisted to `products.image_url`), everything after is the gallery
   * (persisted to `products.gallery`). We derive this from formData so
   * there's no duplicate state to keep in sync, and we split back on save
   * via setAllImages().
   */
  const allImages = ((): string[] => {
    const main = formData.image ? [formData.image] : [];
    const rest = (formData.gallery || []).filter(g => g && g !== formData.image);
    return [...main, ...rest];
  })();

  const setAllImages = (list: string[]) => {
    const cleaned = Array.from(new Set(list.filter(Boolean)));
    setFormData(prev => ({
      ...prev,
      image: cleaned[0] || '',
      gallery: cleaned.slice(1),
    }));
  };

  const setMainImage = (idx: number) => {
    if (idx === 0) return;
    const next = [...allImages];
    const [moved] = next.splice(idx, 1);
    next.unshift(moved);
    setAllImages(next);
  };

  const removeImageAt = (idx: number) => {
    setAllImages(allImages.filter((_, i) => i !== idx));
  };

  const addUrlImage = () => {
    const v = urlInput.trim();
    if (!v) return;
    if (allImages.includes(v)) { setUrlInput(''); return; }
    setAllImages([...allImages, v]);
    setUrlInput('');
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setUploading(true);

    // Split up-front into files that pass the pre-flight checks and ones
    // that get rejected locally so we never hit the network for obviously
    // bad inputs (and the admin gets a specific reason instead of a 413/
    // mime-rejection).
    const preflightFailed: { name: string; error: string }[] = [];
    const okFiles: File[] = [];
    for (const file of files) {
      const err = validateImageFile(file);
      if (err) preflightFailed.push({ name: file.name || '(unnamed)', error: err });
      else okFiles.push(file);
    }

    const uploadOne = async (
      file: File
    ): Promise<{ url?: string; error?: string; name: string }> => {
      try {
        const response = await fetch(
          `/api/upload?filename=${encodeURIComponent(file.name)}`,
          { method: 'POST', body: file, headers: authHeaders() }
        );
        const text = await response.text();
        let json: any = {};
        try { json = JSON.parse(text); } catch { /* non-JSON response */ }
        if (!response.ok) {
          const msg =
            json.error ||
            json.detail ||
            `${response.status}: ${text.slice(0, 160) || response.statusText}`;
          return { error: msg, name: file.name };
        }
        if (!json.url) return { error: 'Response missing url field', name: file.name };
        return { url: json.url, name: file.name };
      } catch (err) {
        return { error: err instanceof Error ? err.message : String(err), name: file.name };
      }
    };

    try {
      const results = await Promise.all(okFiles.map(uploadOne));
      const succeeded = results.filter(r => r.url).map(r => r.url as string);
      const failed = [
        ...preflightFailed,
        ...results
          .filter(r => r.error)
          .map(r => ({ name: r.name, error: r.error as string })),
      ];

      // Use the functional updater so we append to the CURRENT images
      // list, not a stale snapshot captured when the upload started.
      if (succeeded.length > 0) {
        setFormData(prev => {
          const cur = [prev.image, ...((prev.gallery || []).filter(g => g && g !== prev.image))].filter(Boolean) as string[];
          const next = Array.from(new Set([...cur, ...succeeded]));
          return { ...prev, image: next[0] || '', gallery: next.slice(1) };
        });
      }

      if (failed.length > 0) {
        // console.warn so Next's dev overlay doesn't flag our handled failures.
        console.warn('Image upload failures:', failed);
        const msg = failed.map(f => `• ${f.name}: ${f.error}`).join('\n');
        alert(`${succeeded.length}/${files.length} uploaded.\n\nFailed:\n${msg}`);
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Upload failed unexpectedly — see console.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addColor = (hex: string) => {
    const v = hex.trim();
    if (!v || (formData.colors || []).includes(v)) return;
    setFormData(prev => ({ ...prev, colors: [...(prev.colors || []), v] }));
  };
  const removeColor = (c: string) => {
    setFormData(prev => ({ ...prev, colors: (prev.colors || []).filter(x => x !== c) }));
  };

  const addType = (name: string) => {
    const v = name.trim();
    if (!v || (formData.types || []).includes(v)) return;
    setFormData(prev => ({ ...prev, types: [...(prev.types || []), v] }));
  };
  const removeType = (type: string) => {
    setFormData(prev => ({ ...prev, types: (prev.types || []).filter(x => x !== type) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Inject Fallbacks for missing required user data
    const finalData = {
      ...formData,
      name: formData.name.trim() || 'Unnamed Item',
      nameAr: formData.nameAr.trim() || 'منتج غير مسمى',
      image: formData.image.trim() || '/images/LOGO/image.png',
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
              <label className="form-label small opacity-75">
                {isRtl ? 'صور المنتج (الأولى هي الصورة الرئيسية)' : 'Product Images (first = main preview)'}
              </label>
              <div className="d-flex flex-wrap gap-2 mb-2" style={{ alignItems: 'flex-start' }}>
                {allImages.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    style={{
                      position: 'relative',
                      width: '68px',
                      height: '68px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: idx === 0 ? '2px solid #ffd700' : '1px solid var(--line-soft)',
                      boxShadow: idx === 0 ? '0 2px 8px rgba(255,215,0,0.25)' : 'none',
                    }}
                  >
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {idx === 0 && (
                      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,215,0,0.9)', color: '#1a1a1a', fontSize: '0.55rem', fontWeight: 800, textAlign: 'center', padding: '1px 0', letterSpacing: '0.08em' }}>
                        {isRtl ? 'رئيسية' : 'MAIN'}
                      </span>
                    )}
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => setMainImage(idx)}
                        title={isRtl ? 'تعيين كصورة رئيسية' : 'Set as main'}
                        style={{ position: 'absolute', bottom: '2px', left: '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,215,0,0.92)', color: '#1a1a1a', border: 'none', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                      >
                        <i className="bi bi-star-fill" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImageAt(idx)}
                      title={isRtl ? 'حذف' : 'Remove'}
                      style={{ position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,77,77,0.95)', color: 'white', border: 'none', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    >×</button>
                  </div>
                ))}
                <input
                  type="file" accept="image/*" multiple className="d-none"
                  id={`imagesUpload-${initialItem?.id || 'new'}`} onChange={handleImagesUpload}
                />
                <label
                  htmlFor={`imagesUpload-${initialItem?.id || 'new'}`}
                  style={{ width: '68px', height: '68px', borderRadius: '10px', border: '1px dashed var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-soft)' }}
                  title={isRtl ? 'رفع صور' : 'Upload images'}
                >
                  {uploading ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-plus-lg" />}
                </label>
              </div>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary form-control-sm"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUrlImage(); } }}
                  placeholder={isRtl ? 'أو الصق رابط صورة' : 'Or paste an image URL'}
                />
                <button
                  type="button"
                  onClick={addUrlImage}
                  className="btn btn-sm hero-secondary-btn py-1 px-3 d-flex align-items-center mb-0"
                  style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  <i className="bi bi-plus-lg" />
                </button>
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

            <div className="col-md-6">
              <label className="form-label small opacity-75">Original Price (optional)</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-dark border-secondary text-white">$</span>
                <input
                  type="number" step="0.01" min="0" className="form-control bg-dark text-white border-secondary"
                  value={formData.originalPrice ?? ''}
                  onChange={e => setFormData({ ...formData, originalPrice: e.target.value === '' ? null : parseFloat(e.target.value) })}
                  placeholder="Leave blank if same as Price"
                />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label small opacity-75">Sale Price (optional)</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-dark border-secondary text-white">$</span>
                <input
                  type="number" step="0.01" min="0" className="form-control bg-dark text-white border-secondary"
                  value={formData.salePrice ?? ''}
                  onChange={e => setFormData({ ...formData, salePrice: e.target.value === '' ? null : parseFloat(e.target.value) })}
                  placeholder="Leave blank if not on sale"
                />
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small opacity-75">Colors (hex or css color)</label>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {(formData.colors || []).map(c => (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '8px' }}>
                    <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: c, border: '1px solid var(--line-soft)' }} />
                    <span style={{ fontSize: '0.8rem' }}>{c}</span>
                    <button type="button" onClick={() => removeColor(c)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: 0, fontSize: '1rem' }}>×</button>
                  </div>
                ))}
              </div>
              <div className="d-flex gap-2">
                <input
                  type="color"
                  className="form-control form-control-color form-control-sm"
                  onChange={e => addColor(e.target.value)}
                  style={{ width: '44px', padding: 0 }}
                  title="Pick color"
                />
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary form-control-sm"
                  placeholder="#FFD700 or 'burlywood' — press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addColor((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small opacity-75">Types / Variants</label>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {(formData.types || []).map(type => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <span>{type}</span>
                    <button type="button" onClick={() => removeType(type)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: 0, fontSize: '1rem' }}>×</button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary form-control-sm"
                placeholder="e.g. Oak, Walnut — press Enter to add"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addType((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>

            <div className="col-12">
              <label
                className="d-inline-flex align-items-center gap-2"
                style={{ cursor: 'pointer', padding: '8px 14px', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: '10px' }}
              >
                <input
                  type="checkbox"
                  checked={!!formData.isFeatured}
                  onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <i className={`bi ${formData.isFeatured ? 'bi-star-fill' : 'bi-star'}`} style={{ color: '#ffd700', fontSize: '1rem' }}></i>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {isRtl ? 'عرض كمنتج مميّز على صفحة المجموعات' : 'Featured on Collections page'}
                </span>
              </label>
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
