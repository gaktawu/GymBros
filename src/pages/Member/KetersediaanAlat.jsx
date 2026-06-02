import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://api.npoint.io/71404f7b687ef9416db6';

const CATEGORIES     = ['Kardio', 'Beban', 'Mesin', 'Aksesoris'];
const STATUSES       = ['baik', 'perawatan', 'rusak'];
const CATEGORY_ICONS = { Kardio: '🏃', Beban: '🏋️', Mesin: '⚙️', Aksesoris: '🎽' };

const STATUS_CFG = {
  baik:      { label: 'Baik',      color: '#4ADE80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.25)'  },
  perawatan: { label: 'Perawatan', color: '#C2A676', bg: 'rgba(194,166,118,0.08)', border: 'rgba(194,166,118,0.25)' },
  rusak:     { label: 'Rusak',     color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' },
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.baik;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
      borderRadius: 999, background: cfg.bg, border: `1px solid ${cfg.border}`,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cfg.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
};

const StatCard = ({ label, value, color, icon, loading }) => (
  <div style={{
    background: '#16181A', border: '1px solid #252830', borderRadius: 16,
    padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12, background: `${color}15`,
      border: `1px solid ${color}30`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 20, flexShrink: 0,
    }}>{icon}</div>
    <div>
      {loading
        ? <div style={{ width: 36, height: 28, background: '#252830', borderRadius: 6, marginBottom: 6, animation: 'pulse 1.4s ease infinite' }} />
        : <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      }
      <div style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
        {label}
      </div>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div style={{
    background: '#0D0F10', border: '1px solid #252830', borderRadius: 16,
    padding: '18px 20px', animation: 'pulse 1.4s ease infinite',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: '#1A1C1E' }} />
      <div style={{ width: 80, height: 24, borderRadius: 999, background: '#1A1C1E' }} />
    </div>
    <div style={{ width: '70%', height: 16, borderRadius: 6, background: '#1A1C1E', marginBottom: 8 }} />
    <div style={{ width: '45%', height: 12, borderRadius: 6, background: '#1A1C1E', marginBottom: 14 }} />
    <div style={{ height: 3, borderRadius: 999, background: '#1A1C1E' }} />
    <div style={{ width: '55%', height: 11, borderRadius: 6, background: '#1A1C1E', marginTop: 8 }} />
  </div>
);

export default function KetersediaanAlatMember() {
  const [equipment, setEquipment] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [filterCat, setFilterCat] = useState('Semua');
  const [filterSts, setFilterSts] = useState('Semua');
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.equipment;
        setEquipment(data || []);
      })
      .catch(err => setError(`Gagal memuat data: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  const filtered = equipment.filter(e => {
    const matchCat = filterCat === 'Semua' || e.category === filterCat;
    const matchSts = filterSts === 'Semua' || e.status   === filterSts;
    const matchQ   = e.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSts && matchQ;
  });

  const totalBaik      = equipment.filter(e => e.status === 'baik').length;
  const totalPerawatan = equipment.filter(e => e.status === 'perawatan').length;
  const totalRusak     = equipment.filter(e => e.status === 'rusak').length;

  const inputSt = {
    background: '#0D0F10', border: '1px solid #252830', borderRadius: 10,
    color: '#E0E0E0', padding: '9px 14px', fontSize: 13, outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box', fontFamily: 'inherit',
  };

  return (
    <div style={{ color: '#E0E0E0', fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');
        select option { background: #16181A; color: #E0E0E0; }
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:#2A2D30; border-radius:4px; }
      `}</style>

      <div style={{ marginBottom: 28, animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'rgba(74,222,128,0.12)',
            border: '1px solid rgba(74,222,128,0.25)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 15,
          }}>🔍</div>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#4ADE80' }}>
            Status Real-Time
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
              Ketersediaan Alat
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#666', lineHeight: 1.6 }}>
              Cek kondisi terkini seluruh peralatan gym sebelum kamu datang latihan.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          marginBottom: 20, padding: '14px 18px', borderRadius: 14,
          background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.25)',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 18 }}>❌</span>
          <span style={{ fontSize: 13, color: '#F87171', flex: 1, lineHeight: 1.5 }}>{error}</span>
          <button onClick={fetchEquipment}
            style={{
              padding: '7px 16px', borderRadius: 8, border: '1px solid #F87171',
              background: 'transparent', color: '#F87171',
              fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}>
            Coba Lagi
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Siap Digunakan"   value={totalBaik}      color="#4ADE80" icon="✅" loading={loading} />
        <StatCard label="Sedang Perawatan" value={totalPerawatan} color="#C2A676" icon="🔧" loading={loading} />
        <StatCard label="Tidak Tersedia"   value={totalRusak}     color="#F87171" icon="⚠️" loading={loading} />
      </div>

      <div style={{
        marginBottom: 20, padding: '13px 18px', borderRadius: 14,
        background: 'rgba(194,166,118,0.05)', border: '1px solid rgba(194,166,118,0.18)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <span style={{ fontSize: 13, color: '#C2A676', lineHeight: 1.6 }}>
          Alat dengan status <strong>Perawatan</strong> sedang tidak dapat digunakan.
          Hubungi staff jika ada pertanyaan tentang jadwal perbaikan.
        </span>
      </div>

      <div style={{ background: '#16181A', border: '1px solid #252830', borderRadius: 20, overflow: 'hidden' }}>

        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #252830',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 160, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#555' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama alat..."
              style={{ ...inputSt, width: '100%', paddingLeft: 36 }}
              onFocus={e => e.target.style.borderColor = '#4ADE80'}
              onBlur={e => e.target.style.borderColor = '#252830'} />
          </div>

          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            style={{ ...inputSt, width: 'auto', cursor: 'pointer' }}>
            <option value="Semua">Semua Kategori</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
          </select>

          <select value={filterSts} onChange={e => setFilterSts(e.target.value)}
            style={{ ...inputSt, width: 'auto', cursor: 'pointer' }}>
            <option value="Semua">Semua Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
          </select>

          <span style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#C2A676', fontWeight: 700 }}>{loading ? '...' : filtered.length}</span> alat
          </span>
        </div>

        <div style={{
          padding: 20, display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14,
        }}>
          {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {!loading && filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#444' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Tidak ada alat ditemukan</div>
              <div style={{ fontSize: 12, color: '#333', marginTop: 4 }}>Coba ubah filter atau kata kunci pencarian</div>
            </div>
          )}

          {!loading && filtered.map((item, i) => {
            const cfg = STATUS_CFG[item.status] || STATUS_CFG.baik;
            return (
              <div key={item.id}
                style={{
                  background: '#0D0F10', border: `1px solid ${cfg.border}`, borderRadius: 16,
                  padding: '18px 20px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
                  animation: `fadeUp 0.35s ease ${Math.min(i * 0.05, 0.4)}s both`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${cfg.color}18`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `${cfg.color}10`, border: `1px solid ${cfg.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>
                    {CATEGORY_ICONS[item.category] || '🏋️'}
                  </div>
                  <StatusPill status={item.status} />
                </div>

                <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 12, color: '#555', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>{CATEGORY_ICONS[item.category] || '🏋️'}</span>
                  <span>{item.category}</span>
                  <span style={{ color: '#2A2D30' }}>·</span>
                  <span style={{ color: '#3A3D42', fontSize: 11 }}>{item.id}</span>
                </div>

                <div style={{ marginTop: 14, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 999, background: cfg.color,
                    width: item.status === 'baik' ? '100%' : item.status === 'perawatan' ? '40%' : '0%',
                    transition: 'width 0.8s ease',
                  }} />
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: '#555' }}>
                  {item.status === 'baik' ? 'Tersedia sekarang'
                    : item.status === 'perawatan' ? 'Sedang dalam perawatan'
                    : 'Tidak dapat digunakan'}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          padding: '13px 20px', borderTop: '1px solid #252830',
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
        }}>
          <button
            onClick={() => { setFilterCat('Semua'); setFilterSts('Semua'); setSearch(''); }}
            style={{
              fontSize: 11, color: '#555', background: 'transparent', border: 'none',
              cursor: 'pointer', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = '#C2A676'}
            onMouseLeave={e => e.target.style.color = '#555'}>
            Reset Filter
          </button>
        </div>
      </div>

      <div style={{
        marginTop: 20, padding: '14px 20px', background: '#16181A',
        border: '1px solid #252830', borderRadius: 14,
        display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Keterangan:
        </span>
        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: '#888' }}>{cfg.label}</span>
          </div>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#333' }}>
          Total: {equipment.length} alat terdaftar
        </span>
      </div>
    </div>
  );
}