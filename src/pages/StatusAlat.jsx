import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://api.npoint.io/71404f7b687ef9416db6';

const CATEGORIES = ['Kardio', 'Beban', 'Mesin', 'Aksesoris'];
const STATUSES = ['baik', 'perawatan', 'rusak'];
const CAT_ICONS = { Kardio: '🏃', Beban: '🏋️', Mesin: '⚙️', Aksesoris: '🎽' };

const STATUS_CFG = {
  baik: { label: 'Baik', color: '#4ADE80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)' },
  perawatan: { label: 'Perawatan', color: '#C2A676', bg: 'rgba(194,166,118,0.08)', border: 'rgba(194,166,118,0.25)' },
  rusak: { label: 'Rusak', color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' },
};

const inputSt = {
  width: '100%', background: '#0D0F10', border: '1px solid #252830', borderRadius: 10,
  color: '#E0E0E0', padding: '11px 14px', fontSize: 13, outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box', fontFamily: 'inherit',
};

const labelSt = {
  display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em',
  textTransform: 'uppercase', color: '#666', marginBottom: 7
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.baik;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
      borderRadius: 999, background: cfg.bg, border: `1px solid ${cfg.border}`,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cfg.color
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />{cfg.label}
    </span>
  );
};

const StatCard = ({ label, value, color, icon }) => (
  <div style={{
    background: '#16181A', border: '1px solid #252830', borderRadius: 16,
    padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12, background: `${color}15`,
      border: `1px solid ${color}30`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 20, flexShrink: 0
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{
        fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: '0.1em',
        textTransform: 'uppercase', marginTop: 4
      }}>{label}</div>
    </div>
  </div>
);

const generateNextId = (list) => {
  if (list.length === 0) return 'EQ001';
  const nums = list.map(e => parseInt(e.id.replace('EQ', ''), 10));
  return `EQ${String(Math.max(...nums) + 1).padStart(3, '0')}`;
};

export default function KelolaAlatAdmin() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', status: '' });
  const [filterCat, setFilterCat] = useState('Semua');
  const [filterSts, setFilterSts] = useState('Semua');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [delConfirm, setDelConfirm] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(API_URL);
        const data = response.data;
        const list = Array.isArray(data)
          ? data
          : data.equipment || data.data || [];
        setEquipment(list);
      } catch (err) {
        setError('Gagal memuat data. Periksa koneksi Anda.');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelect = (item) => {
    setSelected(item);
    setForm({ name: item.name, category: item.category, status: item.status });
    setDelConfirm(false);
    setShowForm(true);
  };

  const handleNew = () => {
    setSelected(null);
    setForm({ name: '', category: '', status: '' });
    setDelConfirm(false);
    setShowForm(true);
  };

  const handleReset = () => {
    setSelected(null);
    setForm({ name: '', category: '', status: '' });
    setDelConfirm(false);
    setShowForm(false);
  };

  const handleSimpan = () => {
    if (!form.name.trim() || !form.category || !form.status) {
      showToast('Semua field wajib diisi!', 'error'); 
      return;
    }
    if (selected) {
      setEquipment(prev => prev.map(e => e.id === selected.id ? { ...e, ...form } : e));
      showToast(`Alat "${form.name}" berhasil diperbarui.`);
    } else {
      setEquipment(prev => [...prev, { id: generateNextId(prev), ...form }]);
      showToast(`Alat "${form.name}" berhasil ditambahkan.`);
    }
    handleReset();
  };

  const handleHapus = () => {
    if (!selected) { 
      showToast('Pilih alat dulu!', 'error'); 
      return; 
    }
    if (!delConfirm) { 
      setDelConfirm(true); 
      return; 
    }
    setEquipment(prev => prev.filter(e => e.id !== selected.id));
    showToast(`Alat "${selected.name}" dihapus.`, 'error');
    handleReset();
  };

  const filtered = useMemo(() => equipment.filter(e => {
    const matchCat = filterCat === 'Semua' || e.category === filterCat;
    const matchSts = filterSts === 'Semua' || e.status === filterSts;
    const matchQ = e.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSts && matchQ;
  }), [equipment, filterCat, filterSts, search]);

  const { totalBaik, totalPerawatan, totalRusak } = useMemo(() => {
    let baik = 0, perawatan = 0, rusak = 0;
    equipment.forEach(e => {
      if (e.status === 'baik') baik++;
      else if (e.status === 'perawatan') perawatan++;
      else if (e.status === 'rusak') rusak++;
    });
    return { totalBaik: baik, totalPerawatan: perawatan, totalRusak: rusak };
  }, [equipment]);

  return (
    <div style={{
      background: '#0D0F10', color: '#E0E0E0',
      fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: '100vh', paddingTop: 96
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');
        html,body,#root{background:#0D0F10!important;margin:0!important;padding:0!important;}
        *,*::before,*::after{box-sizing:border-box;}
        select option{background:#16181A;color:#E0E0E0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:#2A2D30;border-radius:4px;}
      `}</style>

      {loading && (
        <div style={{
          position: 'fixed', inset: 0, background: '#0D0F10',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', zIndex: 9998, gap: 16
        }}>
          <div style={{
            width: 44, height: 44, border: '3px solid #252830',
            borderTop: '3px solid #C2A676', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span style={{ color: '#666', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em' }}>
            Memuat data...
          </span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {error && (
        <div style={{
          position: 'fixed', top: 90, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: 'rgba(248,113,113,0.12)',
          border: '1px solid rgba(248,113,113,0.4)', color: '#F87171',
          padding: '12px 24px', borderRadius: 12, fontWeight: 700,
          fontSize: 13, display: 'flex', alignItems: 'center', gap: 10,
          backdropFilter: 'blur(12px)', animation: 'slideIn 0.3s ease'
        }}>
          ✕ {error}
          <button
            onClick={() => { setError(null); setLoading(true); axios.get(API_URL).then(r => { const d = r.data; setEquipment(Array.isArray(d) ? d : d.equipment || d.data || []); }).catch(() => setError('Gagal memuat data.')).finally(() => setLoading(false)); }}
            style={{
              background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.4)',
              color: '#F87171', borderRadius: 6, padding: '3px 10px',
              fontSize: 11, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.08em'
            }}>
            Coba Lagi
          </button>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', top: 90, right: 24, zIndex: 9999,
          background: toast.type === 'success' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}`,
          color: toast.type === 'success' ? '#4ADE80' : '#F87171',
          padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13,
          animation: 'slideIn 0.3s ease', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 32px 60px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16, marginBottom: 32, animation: 'fadeUp 0.4s ease both'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: 'rgba(194,166,118,0.15)',
                border: '1px solid rgba(194,166,118,0.3)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 15
              }}>🛠️</div>
              <span style={{
                fontSize: 11, fontWeight: 800, letterSpacing: '0.25em',
                textTransform: 'uppercase', color: '#C2A676'
              }}>Admin Panel</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
              Kelola Inventaris Alat
            </h1>
          </div>
          <button onClick={handleNew}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px',
              background: '#C2A676', color: '#111315', border: 'none', borderRadius: 12,
              fontWeight: 900, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(194,166,118,0.25)'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#D4B87F'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(194,166,118,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C2A676'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(194,166,118,0.25)'; }}>
            <span style={{ fontSize: 16 }}>+</span> Tambah Alat Baru
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard label="Total Alat" value={equipment.length} color="#888" icon="📦" />
          <StatCard label="Kondisi Baik" value={totalBaik} color="#4ADE80" icon="✅" />
          <StatCard label="Perawatan" value={totalPerawatan} color="#C2A676" icon="🔧" />
          <StatCard label="Rusak" value={totalRusak} color="#F87171" icon="⚠️" />
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: showForm ? '1fr 370px' : '1fr',
          gap: 20, alignItems: 'start'
        }}>
          <div style={{
            background: '#16181A', border: '1px solid #252830',
            borderRadius: 20, overflow: 'hidden', animation: 'fadeUp 0.4s ease 0.05s both'
          }}>
            <div style={{
              padding: '18px 22px', borderBottom: '1px solid #252830',
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
            }}>
              <h2 style={{
                margin: 0, fontSize: 14, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: '#fff', flexShrink: 0
              }}>Daftar Inventaris</h2>
              <span style={{
                padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                background: 'rgba(194,166,118,0.12)', color: '#C2A676',
                border: '1px solid rgba(194,166,118,0.25)'
              }}>{filtered.length} alat</span>
              <div style={{ flex: 1 }} />
              <div style={{ position: 'relative', minWidth: 180 }}>
                <span style={{
                  position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 13, color: '#555'
                }}>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari alat..."
                  style={{ ...inputSt, width: 180, padding: '8px 12px 8px 32px' }}
                  onFocus={e => e.target.style.borderColor = '#C2A676'}
                  onBlur={e => e.target.style.borderColor = '#252830'} />
              </div>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                style={{ ...inputSt, width: 'auto', padding: '8px 12px', fontSize: 12, cursor: 'pointer' }}>
                <option value="Semua">Semua Kategori</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
              </select>
              <select value={filterSts} onChange={e => setFilterSts(e.target.value)}
                style={{ ...inputSt, width: 'auto', padding: '8px 12px', fontSize: 12, cursor: 'pointer' }}>
                <option value="Semua">Semua Status</option>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
              </select>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0D0F10' }}>
                    {['ID Alat', 'Nama Alat', 'Kategori', 'Status', 'Aksi'].map(h => (
                      <th key={h} style={{
                        padding: '11px 20px', textAlign: 'left', fontSize: 10,
                        fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
                        color: '#555', borderBottom: '1px solid #252830'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 60, color: '#444' }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                      Tidak ada alat ditemukan.
                    </td></tr>
                  ) : filtered.map((item) => {
                    const isSel = selected?.id === item.id;
                    return (
                      <tr key={item.id}
                        style={{
                          background: isSel ? 'rgba(194,166,118,0.07)' : 'transparent',
                          borderLeft: isSel ? '3px solid #C2A676' : '3px solid transparent',
                          transition: 'all 0.15s'
                        }}>
                        <td style={{
                          padding: '13px 20px', fontSize: 11, fontWeight: 700,
                          color: '#555', letterSpacing: '0.08em', borderBottom: '1px solid #1A1C1E'
                        }}>{item.id}</td>
                        <td style={{
                          padding: '13px 20px', fontSize: 14, fontWeight: 600,
                          color: isSel ? '#C2A676' : '#E0E0E0', borderBottom: '1px solid #1A1C1E'
                        }}>{item.name}</td>
                        <td style={{ padding: '13px 20px', borderBottom: '1px solid #1A1C1E' }}>
                          <span style={{ fontSize: 12, color: '#999' }}>{CAT_ICONS[item.category]} {item.category}</span>
                        </td>
                        <td style={{ padding: '13px 20px', borderBottom: '1px solid #1A1C1E' }}>
                          <StatusPill status={item.status} />
                        </td>
                        <td style={{ padding: '13px 20px', borderBottom: '1px solid #1A1C1E' }}>
                          <button onClick={() => handleSelect(item)}
                            style={{
                              padding: '5px 14px', borderRadius: 8, border: '1px solid rgba(194,166,118,0.3)',
                              background: 'rgba(194,166,118,0.08)', color: '#C2A676',
                              fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(194,166,118,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(194,166,118,0.08)'}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{
              padding: '13px 22px', borderTop: '1px solid #252830',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontSize: 12, color: '#444' }}>
                Menampilkan <span style={{ color: '#C2A676', fontWeight: 700 }}>{filtered.length}</span> dari {equipment.length} alat
              </span>
              {selected && (
                <span style={{ fontSize: 12, color: '#C2A676', fontWeight: 600 }}>
                  ✏️ Mode edit: {selected.name}
                </span>
              )}
            </div>
          </div>

          {showForm && (
            <div style={{
              background: '#16181A',
              border: selected ? '1px solid rgba(194,166,118,0.4)' : '1px solid #252830',
              borderRadius: 20, padding: 24, position: 'sticky', top: 90,
              transition: 'border-color 0.3s', animation: 'fadeUp 0.3s ease both',
              boxShadow: selected ? '0 20px 60px rgba(194,166,118,0.08)' : 'none'
            }}>
              <div style={{
                marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #252830',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: '#C2A676', marginBottom: 4
                  }}>
                    {selected ? `Edit — ${selected.id}` : 'Tambah Baru'}
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
                    {selected ? 'Edit Detail Alat' : 'Alat Baru'}
                  </h3>
                </div>
                <button onClick={handleReset}
                  style={{
                    background: 'none', border: 'none', color: '#555', cursor: 'pointer',
                    fontSize: 18, lineHeight: 1, padding: '2px 6px', borderRadius: 4, transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = '#555'}>✕</button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>Nama Alat</label>
                <input name="name" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="cth. Smith Machine" style={inputSt}
                  onFocus={e => { e.target.style.borderColor = '#C2A676'; e.target.style.boxShadow = '0 0 0 3px rgba(194,166,118,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#252830'; e.target.style.boxShadow = 'none'; }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>Kategori</label>
                <select name="category" value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  style={{ ...inputSt, cursor: 'pointer' }}
                  onFocus={e => { e.target.style.borderColor = '#C2A676'; }}
                  onBlur={e => { e.target.style.borderColor = '#252830'; }}>
                  <option value="">— Pilih Kategori —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={labelSt}>Kondisi / Status</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {STATUSES.map(s => {
                    const cfg = STATUS_CFG[s];
                    const isActive = form.status === s;
                    return (
                      <button key={s} onClick={() => setForm(p => ({ ...p, status: s }))}
                        style={{
                          flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                          border: isActive ? `1px solid ${cfg.color}60` : '1px solid #252830',
                          background: isActive ? cfg.bg : 'transparent',
                          color: isActive ? cfg.color : '#555',
                          fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                          transition: 'all 0.2s', display: 'flex', flexDirection: 'column',
                          alignItems: 'center', gap: 4
                        }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: isActive ? cfg.color : '#333', display: 'inline-block', transition: 'background 0.2s'
                        }} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button onClick={handleSimpan}
                style={{
                  width: '100%', padding: 13, background: '#C2A676', color: '#111315',
                  border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 12,
                  letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'all 0.2s', marginBottom: 10,
                  boxShadow: '0 4px 20px rgba(194,166,118,0.2)'
                }}
                onMouseEnter={e => { e.target.style.background = '#D4B87F'; e.target.style.boxShadow = '0 6px 28px rgba(194,166,118,0.35)'; }}
                onMouseLeave={e => { e.target.style.background = '#C2A676'; e.target.style.boxShadow = '0 4px 20px rgba(194,166,118,0.2)'; }}>
                {selected ? '↑ Update Alat' : '+ Simpan Alat'}
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button onClick={handleHapus}
                  style={{
                    padding: 11, borderRadius: 10, cursor: 'pointer', fontWeight: 800,
                    fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s',
                    background: delConfirm ? 'rgba(248,113,113,0.2)' : 'transparent', color: '#F87171',
                    border: delConfirm ? '1px solid rgba(248,113,113,0.5)' : '1px solid rgba(248,113,113,0.2)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.5)'; }}
                  onMouseLeave={e => { if (!delConfirm) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)'; } }}>
                  {delConfirm ? '⚠ Yakin?' : '🗑 Hapus'}
                </button>
                <button onClick={handleReset}
                  style={{
                    padding: 11, borderRadius: 10, cursor: 'pointer', fontWeight: 800,
                    fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s',
                    background: 'transparent', color: '#555', border: '1px solid #252830'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#252830'; e.currentTarget.style.color = '#555'; }}>
                  Batal
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}