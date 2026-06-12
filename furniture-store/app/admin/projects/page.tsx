'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../data/AuthContext';
import { useLanguage } from '../../../data/LanguageContext';
import Footer from '../../../components/layout/Footer';

interface MediaItem { type: 'image' | 'video'; url: string; }

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
  media: MediaItem[];
  sort_order: number;
}

const EMPTY_FORM = {
  title_en: '', title_ar: '', year: '',
  location_en: '', location_ar: '',
  desc_en: '', desc_ar: '', image_url: '',
  media: [] as MediaItem[],
};

export default function AdminProjectsPage() {
  const { isAdmin, isCustomer } = useAuth();
  const { isRtl } = useLanguage();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [uploading, setUploading] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);

  // pending media URL/type before adding to list
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

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
    setForm({ ...EMPTY_FORM, media: [] });
    setMediaUrl('');
    setFormOpen(true);
  }

  function openEdit(p: Project) {
    setEditingId(p.id);
    setForm({
      title_en: p.title_en, title_ar: p.title_ar,
      year: p.year, location_en: p.location_en, location_ar: p.location_ar,
      desc_en: p.desc_en, desc_ar: p.desc_ar, image_url: p.image_url,
      media: p.media || [],
    });
    setMediaUrl('');
    setFormOpen(true);
  }

  async function uploadFile(file: File): Promise<string | null> {
    const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST', body: file, credentials: 'include',
    });
    const json = await res.json();
    return json.url || null;
  }

  async function handleCoverUpload(file: File) {
    setUploading(true);
    try {
      const url = await uploadFile(file);
      if (url) setForm((f) => ({ ...f, image_url: url }));
      else setError('Cover upload failed');
    } finally { setUploading(false); }
  }

  async function handleMediaUpload(file: File) {
    setUploading(true);
    try {
      const url = await uploadFile(file);
      if (url) {
        const type: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
        setForm((f) => ({ ...f, media: [...f.media, { type, url }] }));
      } else setError('Media upload failed');
    } finally { setUploading(false); }
  }

  function addMediaUrl() {
    if (!mediaUrl.trim()) return;
    setForm((f) => ({ ...f, media: [...f.media, { type: mediaType, url: mediaUrl.trim() }] }));
    setMediaUrl('');
  }

  function removeMedia(idx: number) {
    setForm((f) => ({ ...f, media: f.media.filter((_, i) => i !== idx) }));
  }

  async function handleSave() {
    if (!form.title_en.trim()) { setError('English title is required'); return; }
    setSaving(true); setError('');
    try {
      if (editingId) {
        const res = await fetch('/api/projects', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ id: editingId, updates: form }),
        });
        const json = await res.json();
        if (json.error) { setError(json.error); return; }
      } else {
        const res = await fetch('/api/projects', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ ...form, sort_order: projects.length }),
        });
        const json = await res.json();
        if (json.error) { setError(json.error); return; }
      }
      setFormOpen(false);
      await load();
    } finally { setSaving(false); }
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
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify(reordered.map((p) => ({ id: p.id, sort_order: p.sort_order }))),
    });
  }

  const inp = (label: string, key: keyof typeof EMPTY_FORM, multiline = false) => (
    <div style={{ marginBottom: 14 }}>
      <label className="admin-label">{label}</label>
      {multiline ? (
        <textarea className="admin-input" rows={3} value={form[key] as string}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} style={{ resize: 'vertical' }} />
      ) : (
        <input className="admin-input" value={form[key] as string}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
      )}
    </div>
  );

  return (
    <main className="app-content" dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: '40px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', margin: 0 }}>Projects</h1>
        <button onClick={openNew} style={primaryBtn}>+ Add Project</button>
      </div>

      {error && <div style={errorBox}>{error}</div>}

      {/* ── Form modal ── */}
      {formOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--bg-panel)', borderRadius: 'var(--r-card)', padding: 32, width: '100%', maxWidth: 660, maxHeight: '92vh', overflowY: 'auto' }}>
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

            {/* Cover image */}
            <div style={{ marginBottom: 20 }}>
              <label className="admin-label">Cover Image</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input className="admin-input" value={form.image_url} placeholder="URL or upload"
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} style={{ flex: 1 }} />
                <button type="button" onClick={() => coverRef.current?.click()} disabled={uploading} style={ghostBtn}>
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
                <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }} />
              </div>
              {form.image_url && (
                <img src={form.image_url} alt="" style={{ marginTop: 8, height: 72, borderRadius: 8, objectFit: 'cover' }} />
              )}
            </div>

            {/* Media gallery */}
            <div style={{ marginBottom: 20 }}>
              <label className="admin-label">Media Gallery (images & videos)</label>

              {/* Add by URL */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <select value={mediaType} onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
                  style={{ ...ghostBtn, padding: '10px 12px', cursor: 'pointer' }}>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <input className="admin-input" value={mediaUrl} placeholder="Paste URL…"
                  onChange={(e) => setMediaUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMediaUrl()}
                  style={{ flex: 1 }} />
                <button type="button" onClick={addMediaUrl} style={ghostBtn}>Add</button>
              </div>

              {/* Or upload file */}
              <div style={{ marginBottom: 12 }}>
                <button type="button" onClick={() => mediaRef.current?.click()} disabled={uploading}
                  style={{ ...ghostBtn, width: '100%', justifyContent: 'center' }}>
                  <i className="bi bi-cloud-upload" style={{ marginRight: 6 }} />
                  {uploading ? 'Uploading…' : 'Upload image or video file'}
                </button>
                <input ref={mediaRef} type="file" accept="image/*,video/*" style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMediaUpload(f); }} />
              </div>

              {/* Media list */}
              {form.media.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {form.media.map((m, i) => (
                    <div key={i} style={{ position: 'relative', width: 88, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line-soft)', background: 'var(--surface-soft)' }}>
                      {m.type === 'image' ? (
                        <img src={m.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <i className="bi bi-play-circle" style={{ fontSize: '1.6rem', color: 'var(--text-soft)' }} />
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-soft)' }}>video</span>
                        </div>
                      )}
                      <button onClick={() => removeMedia(i)}
                        style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', color: '#fff', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-x" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p style={{ color: '#b91c1c', fontSize: '0.85rem', margin: '0 0 12px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => { setFormOpen(false); setError(''); }} style={ghostBtn}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={primaryBtn}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Projects list ── */}
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
              <div style={{ width: 72, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--surface-soft)' }}>
                {p.image_url && <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>{p.title_en}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                  {p.year}{p.location_en ? ` • ${p.location_en}` : ''}
                  {p.media?.length ? ` • ${p.media.length} media` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button onClick={() => move(idx, -1)} disabled={idx === 0} style={arrowBtn} title="Move up"><i className="bi bi-chevron-up" /></button>
                <button onClick={() => move(idx, 1)} disabled={idx === projects.length - 1} style={arrowBtn} title="Move down"><i className="bi bi-chevron-down" /></button>
              </div>
              <button onClick={() => openEdit(p)} style={actionBtn}><i className="bi bi-pencil" /> Edit</button>
              <button onClick={() => handleDelete(p.id)} style={{ ...actionBtn, color: '#b91c1c', borderColor: '#fca5a5' }}><i className="bi bi-trash" /> Delete</button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .admin-label { display: block; margin-bottom: 6px; font-size: 0.8rem; color: var(--text-soft); font-weight: 600; }
        .admin-input { width: 100%; background: var(--bg-main); border: 1px solid var(--line-soft); border-radius: 10px; padding: 10px 14px; color: var(--text-main); font-size: 0.9rem; box-sizing: border-box; font-family: inherit; }
        .admin-input:focus { border-color: var(--text-main); outline: none; }
      `}</style>

      <Footer />
    </main>
  );
}

const primaryBtn: React.CSSProperties = { background: 'var(--text-main)', color: 'var(--bg-main)', border: 'none', borderRadius: 'var(--r-pill)', padding: '10px 22px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' };
const ghostBtn: React.CSSProperties = { background: 'var(--bg-main)', border: '1px solid var(--line-soft)', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center' };
const arrowBtn: React.CSSProperties = { background: 'var(--bg-main)', border: '1px solid var(--line-soft)', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', fontSize: '0.75rem' };
const actionBtn: React.CSSProperties = { background: 'transparent', border: '1px solid var(--line-soft)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' };
const errorBox: React.CSSProperties = { background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: '0.9rem' };
