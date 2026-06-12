'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../data/AuthContext';
import { useLanguage } from '../../../data/LanguageContext';
import Footer from '../../../components/layout/Footer';

interface Project {
  id: string;
  title_en: string;
  title_ar: string;
  year: string;
  location_en: string;
  location_ar: string;
  desc_en: string;
  desc_ar: string;
  image_url: string;
  sort_order: number;
}

const EMPTY: Omit<Project, 'id' | 'sort_order'> = {
  title_en: '', title_ar: '', year: '',
  location_en: '', location_ar: '',
  desc_en: '', desc_ar: '', image_url: '',
};

export default function AdminProjectsPage() {
  const { isAdmin, isCustomer } = useAuth();
  const { isRtl } = useLanguage();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  // image upload
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCustomer && !isAdmin) { window.location.href = '/'; return; }
    load();
  }, [isAdmin, isCustomer]);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/projects');
    const { data } = await res.json();
    setProjects(data || []);
    setLoading(false);
  }

  function openNew() {
    setEditingId(null);
    setForm({ ...EMPTY });
    setFormOpen(true);
  }

  function openEdit(p: Project) {
    setEditingId(p.id);
    setForm({
      title_en: p.title_en, title_ar: p.title_ar,
      year: p.year, location_en: p.location_en, location_ar: p.location_ar,
      desc_en: p.desc_en, desc_ar: p.desc_ar, image_url: p.image_url,
    });
    setFormOpen(true);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
        credentials: 'include',
      });
      const json = await res.json();
      if (json.url) setForm((f) => ({ ...f, image_url: json.url }));
      else setError(json.error || 'Upload failed');
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.title_en.trim()) { setError('English title is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        const res = await fetch('/api/projects', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: editingId, updates: form }),
        });
        const json = await res.json();
        if (json.error) { setError(json.error); return; }
      } else {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...form, sort_order: projects.length }),
        });
        const json = await res.json();
        if (json.error) { setError(json.error); return; }
      }
      setFormOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/projects?id=${id}`, { method: 'DELETE', credentials: 'include' });
    await load();
  }

  async function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= projects.length) return;
    const updated = [...projects];
    [updated[index], updated[next]] = [updated[next], updated[index]];
    const reordered = updated.map((p, i) => ({ ...p, sort_order: i }));
    setProjects(reordered);
    await fetch('/api/projects', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(reordered.map((p) => ({ id: p.id, sort_order: p.sort_order }))),
    });
  }

  const inp = (label: string, key: keyof typeof form, multiline = false) => (
    <div style={{ marginBottom: 14 }}>
      <label className="admin-label">{label}</label>
      {multiline ? (
        <textarea
          className="admin-input"
          rows={3}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          style={{ resize: 'vertical' }}
        />
      ) : (
        <input
          className="admin-input"
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        />
      )}
    </div>
  );

  return (
    <main className="app-content" dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: '40px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', margin: 0 }}>Projects</h1>
        <button
          onClick={openNew}
          style={{ background: 'var(--text-main)', color: 'var(--bg-main)', border: 'none', borderRadius: 'var(--r-pill)', padding: '10px 22px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          + Add Project
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Form modal */}
      {formOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--bg-panel)', borderRadius: 'var(--r-card)', padding: 32, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: '0 0 24px' }}>
              {editingId ? 'Edit Project' : 'New Project'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <div>{inp('Title (EN)', 'title_en')}</div>
              <div>{inp('Title (AR)', 'title_ar')}</div>
              <div>{inp('Year', 'year')}</div>
              <div />
              <div>{inp('Location (EN)', 'location_en')}</div>
              <div>{inp('Location (AR)', 'location_ar')}</div>
              <div style={{ gridColumn: '1/-1' }}>{inp('Description (EN)', 'desc_en', true)}</div>
              <div style={{ gridColumn: '1/-1' }}>{inp('Description (AR)', 'desc_ar', true)}</div>
            </div>

            {/* Image */}
            <div style={{ marginBottom: 14 }}>
              <label className="admin-label">Image</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  className="admin-input"
                  value={form.image_url}
                  placeholder="URL or upload below"
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{ whiteSpace: 'nowrap', background: 'var(--bg-main)', border: '1px solid var(--line-soft)', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.82rem' }}
                >
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
              </div>
              {form.image_url && (
                <img src={form.image_url} alt="" style={{ marginTop: 10, height: 80, borderRadius: 8, objectFit: 'cover' }} />
              )}
            </div>

            {error && <p style={{ color: '#b91c1c', fontSize: '0.85rem', margin: '0 0 12px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={() => { setFormOpen(false); setError(''); }}
                style={{ background: 'transparent', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-pill)', padding: '10px 20px', cursor: 'pointer', color: 'var(--text-main)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ background: 'var(--text-main)', color: 'var(--bg-main)', border: 'none', borderRadius: 'var(--r-pill)', padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects list */}
      {loading ? (
        <p style={{ color: 'var(--text-soft)', textAlign: 'center', padding: '40px 0' }}>Loading…</p>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-soft)', border: '1px dashed var(--line-soft)', borderRadius: 'var(--r-card)' }}>
          <i className="bi bi-images" style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12, opacity: 0.3 }} />
          No projects yet. Click "Add Project" to get started.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {projects.map((p, idx) => (
            <div key={p.id} style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--bg-panel)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-card)', padding: '16px 20px' }}>
              {/* Thumbnail */}
              <div style={{ width: 72, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--surface-soft)' }}>
                {p.image_url && <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>{p.title_en}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>{p.year}{p.location_en ? ` • ${p.location_en}` : ''}</div>
              </div>

              {/* Order buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button onClick={() => move(idx, -1)} disabled={idx === 0} title="Move up" style={arrowBtn}>
                  <i className="bi bi-chevron-up" />
                </button>
                <button onClick={() => move(idx, 1)} disabled={idx === projects.length - 1} title="Move down" style={arrowBtn}>
                  <i className="bi bi-chevron-down" />
                </button>
              </div>

              {/* Actions */}
              <button onClick={() => openEdit(p)} style={actionBtn}>
                <i className="bi bi-pencil" /> Edit
              </button>
              <button onClick={() => handleDelete(p.id)} style={{ ...actionBtn, color: '#b91c1c', borderColor: '#fca5a5' }}>
                <i className="bi bi-trash" /> Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .admin-label { display: block; margin-bottom: 6px; font-size: 0.8rem; color: var(--text-soft); font-weight: 600; }
        .admin-input { width: 100%; background: var(--bg-main); border: 1px solid var(--line-soft); border-radius: 10px; padding: 10px 14px; color: var(--text-main); font-size: 0.9rem; box-sizing: border-box; }
        .admin-input:focus { border-color: var(--text-main); outline: none; }
      `}</style>

      <Footer />
    </main>
  );
}

const arrowBtn: React.CSSProperties = {
  background: 'var(--bg-main)',
  border: '1px solid var(--line-soft)',
  borderRadius: 6,
  width: 28,
  height: 28,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-main)',
  fontSize: '0.75rem',
};

const actionBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--line-soft)',
  borderRadius: 8,
  padding: '6px 14px',
  cursor: 'pointer',
  color: 'var(--text-main)',
  fontSize: '0.8rem',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  whiteSpace: 'nowrap',
};
