import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
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

const INITIAL_FORM_STATE = { name: '', category: '', status: '' };

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');
html,body,#root{background:#0D0F10!important;margin:0!important;padding:0!important;font-family:'DM Sans','Segoe UI',sans-serif;}
*,*::before,*::after{box-sizing:border-box;}
select option{background:#16181A;color:#E0E0E0;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-thumb{background:#2A2D30;border-radius:4px;}

@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes spin{to{transform:rotate(360deg)}}

.admin-container{background:#0D0F10;color:#E0E0E0;min-height:100vh;padding-top:96px;font-family:inherit;}
.wrapper{max-width:1320px;margin:0 auto;padding:0 32px 60px;}
.header{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:32px;animation:fadeUp 0.4s ease both;}
.header-left{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
.header-badge{width:32px;height:32px;border-radius:8px;background:rgba(194,166,118,0.15);border:1px solid rgba(194,166,118,0.3);display:flex;align-items:center;justify-content:center;font-size:15px;}
.header-tag{font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;color:#C2A676;}
h1{font-size:32px;font-weight:900;color:#fff;margin:0;letter-spacing:-0.02em;line-height:1;}
.btn-primary{display:flex;align-items:center;gap:8px;padding:11px 22px;background:#C2A676;color:#111315;border:none;border-radius:12px;font-weight:900;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 20px rgba(194,166,118,0.25);}
.btn-primary:hover{background:#D4B87F;box-shadow:0 6px 28px rgba(194,166,118,0.4);}

.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;}
.stat-card{background:#16181A;border:1px solid #252830;border-radius:16px;padding:20px 22px;display:flex;align-items:center;gap:16px;}
.stat-icon{width:44px;height:44px;border-radius:12px;border:1px solid;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
.stat-value{font-size:26px;font-weight:900;line-height:1;}
.stat-label{font-size:11px;color:#666;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;}

.main-grid{display:grid;gap:20px;align-items:start;}
.main-grid.cols-2{grid-template-columns:1fr 370px;}
.main-grid.cols-1{grid-template-columns:1fr;}

.panel{background:#16181A;border:1px solid #252830;border-radius:20px;overflow:hidden;animation:fadeUp 0.4s ease 0.05s both;}
.panel-header{padding:18px 22px;border-bottom:1px solid #252830;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.panel-title{margin:0;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#fff;flex-shrink:0;}
.panel-count{padding:2px 10px;border-radius:999;font-size:11px;font-weight:700;background:rgba(194,166,118,0.12);color:#C2A676;border:1px solid rgba(194,166,118,0.25);}
.panel-spacer{flex:1;}
.search-wrap{position:relative;min-width:180px;}
.search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:13px;color:#555;}
.filter-select{background:#0D0F10;border:1px solid #252830;border-radius:10px;color:#E0E0E0;padding:8px 12px;font-size:12px;outline:none;cursor:pointer;font-family:inherit;transition:border-color 0.2s;width:auto;}
.filter-select:focus{border-color:#C2A676;}
.search-input{width:180px;padding:8px 12px 8px 32px;}

.table-wrap{overflow-x:auto;}
table{width:100%;border-collapse:collapse;}
th{padding:11px 20px;text-align:left;font-size:10px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#555;border-bottom:1px solid #252830;background:#0D0F10;}
td{padding:13px 20px;border-bottom:1px solid #1A1C1E;}
.cell-id{font-size:11px;font-weight:700;color:#555;letter-spacing:0.08em;}
.cell-name{font-size:14px;font-weight:600;}
.cat-text{font-size:12px;color:#999;}
.btn-edit{padding:5px 14px;border-radius:8px;border:1px solid rgba(194,166,118,0.3);background:rgba(194,166,118,0.08);color:#C2A676;font-size:11px;font-weight:700;cursor:pointer;transition:all 0.2s;}
.btn-edit:hover{background:rgba(194,166,118,0.2);}
.row-selected{background:rgba(194,166,118,0.07);border-left:3px solid #C2A676;}
.row-default{border-left:3px solid transparent;transition:all 0.15s;}
.empty{text-align:center;padding:60px;color:#444;}
.empty-icon{font-size:36px;margin-bottom:12px;}

.panel-footer{padding:13px 22px;border-top:1px solid #252830;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#444;}
.panel-footer .highlight{color:#C2A676;font-weight:700;}
.panel-footer .edit-mode{color:#C2A676;font-weight:600;}

.form-panel{background:#16181A;border-radius:20px;padding:24px;position:sticky;top:90px;transition:border-color 0.3s;animation:fadeUp 0.3s ease both;}
.form-panel.edit{border:1px solid rgba(194,166,118,0.4);box-shadow:0 20px 60px rgba(194,166,118,0.08);}
.form-panel.add{border:1px solid #252830;}
.form-header{margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #252830;display:flex;align-items:flex-start;justify-content:space-between;}
.form-sub{font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#C2A676;margin-bottom:4px;}
.form-title{margin:0;font-size:18px;font-weight:900;color:#fff;letter-spacing:-0.01em;}
.btn-close{background:none;border:none;color:#555;cursor:pointer;font-size:18px;line-height:1;padding:2px 6px;border-radius:4px;transition:color 0.2s;}
.btn-close:hover{color:#fff;}

.input-base{width:100%;background:#0D0F10;border:1px solid #252830;border-radius:10px;color:#E0E0E0;padding:11px 14px;font-size:13px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;box-sizing:border-box;font-family:inherit;}
.input-base:focus{border-color:#C2A676;box-shadow:0 0 0 3px rgba(194,166,118,0.1);}
.label{display:block;font-size:10px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#666;margin-bottom:7px;}
.form-group{margin-bottom:16px;}
.form-group:last-of-type{margin-bottom:22px;}

.status-grid{display:flex;gap:8px;}
.status-btn{flex:1;padding:10px 8px;border-radius:10px;cursor:pointer;font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;transition:all 0.2s;display:flex;flex-direction:column;align-items:center;gap:4px;background:transparent;border:1px solid #252830;color:#555;}
.status-btn.active{border-color:transparent;}
.status-dot{width:8px;height:8px;border-radius:50%;display:inline-block;transition:background 0.2s;}
.status-btn:not(.active) .status-dot{background:#333;}

.btn-save{width:100%;padding:13px;background:#C2A676;color:#111315;border:none;border-radius:10px;font-weight:900;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;margin-bottom:10px;box-shadow:0 4px 20px rgba(194,166,118,0.2);}
.btn-save:hover{background:#D4B87F;box-shadow:0 6px 28px rgba(194,166,118,0.35);}
.btn-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.btn-del{padding:11px;border-radius:10px;cursor:pointer;font-weight:800;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;transition:all 0.2s;background:transparent;color:#F87171;border:1px solid rgba(248,113,113,0.2);}
.btn-del:hover{background:rgba(248,113,113,0.15);border-color:rgba(248,113,113,0.5);}
.btn-del.confirm{background:rgba(248,113,113,0.2);border-color:rgba(248,113,113,0.5);}
.btn-cancel{padding:11px;border-radius:10px;cursor:pointer;font-weight:800;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;transition:all 0.2s;background:transparent;color:#555;border:1px solid #252830;}
.btn-cancel:hover{border-color:#555;color:#fff;}

.loader{position:fixed;inset:0;background:#0D0F10;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9998;gap:16px;}
.loader-spin{width:44px;height:44px;border:3px solid #252830;border-top:3px solid #C2A676;border-radius:50%;animation:spin 0.8s linear infinite;}
.loader-text{color:#666;font-size:13px;font-weight:600;letter-spacing:0.1em;}

.toast{position:fixed;top:90px;right:24px;z-index:9999;padding:12px 20px;border-radius:12px;font-weight:700;font-size:13px;animation:slideIn 0.3s ease;backdrop-filter:blur(12px);display:flex;align-items:center;gap:8px;}
.toast.success{background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.4);color:#4ADE80;}
.toast.error{background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.4);color:#F87171;}

.error-box{position:fixed;top:90px;left:50%;transform:translateX(-50%);z-index:9999;background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.4);color:#F87171;padding:12px 24px;border-radius:12px;font-weight:700;font-size:13px;display:flex;align-items:center;gap:10;backdrop-filter:blur(12px);animation:slideIn 0.3s ease;}
.btn-retry{background:rgba(248,113,113,0.2);border:1px solid rgba(248,113,113,0.4);color:#F87171;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:800;cursor:pointer;letter-spacing:0.08em;}
.btn-retry:hover{background:rgba(248,113,113,0.3);}

.status-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;border:1px solid;}
`;


const generateNextId = (list) => {
  if (!list.length) return 'EQ001';
  const ids = list.map(e => parseInt(e.id.replace('EQ', ''), 10));
  const max = Math.max(...ids);
  return `EQ${String(max + 1).padStart(3, '0')}`;
};


const StatusPill = memo(({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.baik;
  return (
    <span className="status-pill" style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
      <span className="status-dot" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
});

const StatCard = memo(({ label, value, color, icon }) => {
  const iconStyle = useMemo(() => ({
    background: `${color}15`,
    borderColor: `${color}30`
  }), [color]);

  return (
    <div className="stat-card">
      <div className="stat-icon" style={iconStyle}>
        {icon}
      </div>
      <div>
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
});

const TableRow = memo(({ item, selectedId, onSelect }) => {
  const isSel = selectedId === item.id;
  
  const handleEditClick = useCallback(() => {
    onSelect(item);
  }, [item, onSelect]);

  return (
    <tr className={isSel ? 'row-selected' : 'row-default'}>
      <td className="cell-id">{item.id}</td>
      <td className="cell-name" style={{ color: isSel ? '#C2A676' : '#E0E0E0' }}>{item.name}</td>
      <td className="cell-cat">
        <span className="cat-text">{CAT_ICONS[item.category]} {item.category}</span>
      </td>
      <td className="cell-status"><StatusPill status={item.status} /></td>
      <td className="cell-action">
        <button className="btn-edit" onClick={handleEditClick}>Edit</button>
      </td>
    </tr>
  );
});

export default function KelolaAlatAdmin() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [filterCat, setFilterCat] = useState('Semua');
  const [filterSts, setFilterSts] = useState('Semua');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [delConfirm, setDelConfirm] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(API_URL);
      setEquipment(Array.isArray(data) ? data : data.equipment || data.data || []);
    } catch {
      setError('Gagal memuat data. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSelect = useCallback((item) => {
    setSelected(item);
    setForm({ name: item.name, category: item.category, status: item.status });
    setDelConfirm(false);
    setShowForm(true);
  }, []);

  const handleNew = useCallback(() => {
    setSelected(null);
    setForm(INITIAL_FORM_STATE);
    setDelConfirm(false);
    setShowForm(true);
  }, []);

  const handleReset = useCallback(() => {
    setSelected(null);
    setForm(INITIAL_FORM_STATE);
    setDelConfirm(false);
    setShowForm(false);
  }, []);

  const handleClearForm = useCallback(() => {
    setForm(INITIAL_FORM_STATE);
    showToast('Form berhasil di-reset.', 'success');
  }, [showToast]);

  const handleSimpan = useCallback(() => {
    const trimmedName = form.name.trim();
    if (!trimmedName || !form.category || !form.status) {
      showToast('Semua field wajib diisi!', 'error');
      return;
    }

    if (selected) {
      setEquipment(prev => prev.map(e => e.id === selected.id ? { ...e, ...form, name: trimmedName } : e));
      showToast(`Alat "${trimmedName}" berhasil diperbarui.`);
    } else {
      setEquipment(prev => [...prev, { id: generateNextId(prev), ...form, name: trimmedName }]);
      showToast(`Alat "${trimmedName}" berhasil ditambahkan.`);
    }
    handleReset();
  }, [form, selected, showToast, handleReset]);

  const handleHapus = useCallback(() => {
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
  }, [selected, delConfirm, showToast, handleReset]);

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return equipment.filter(e => {
      const matchCat = filterCat === 'Semua' || e.category === filterCat;
      const matchSts = filterSts === 'Semua' || e.status === filterSts;
      const matchQ = e.name.toLowerCase().includes(lowerSearch);
      return matchCat && matchSts && matchQ;
    });
  }, [equipment, filterCat, filterSts, search]);

  const stats = useMemo(() => {
    let baik = 0, perawatan = 0, rusak = 0;
    for (let i = 0; i < equipment.length; i++) {
      const status = equipment[i].status;
      if (status === 'baik') baik++;
      else if (status === 'perawatan') perawatan++;
      else if (status === 'rusak') rusak++;
    }
    return { totalBaik: baik, totalPerawatan: perawatan, totalRusak: rusak };
  }, [equipment]);

  const handleInputChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="admin-container">
      <style>{GLOBAL_CSS}</style>

      {loading && (
        <div className="loader">
          <div className="loader-spin" />
          <span className="loader-text">Memuat data...</span>
        </div>
      )}

      {error && (
        <div className="error-box">
          ✕ {error}
          <button className="btn-retry" onClick={fetchData}>Coba Lagi</button>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      <div className="wrapper">
        <div className="header">
          <div>
            <div className="header-left">
              <div className="header-badge">🛠️</div>
              <span className="header-tag">Admin Panel</span>
            </div>
            <h1>Kelola Inventaris Alat</h1>
          </div>
          <button className="btn-primary" onClick={handleNew}>
            <span style={{ fontSize: 16 }}>+</span> Tambah Alat Baru
          </button>
        </div>

        <div className="stats-grid">
          <StatCard label="Total Alat" value={equipment.length} color="#888" icon="📦" />
          <StatCard label="Kondisi Baik" value={stats.totalBaik} color="#4ADE80" icon="✅" />
          <StatCard label="Perawatan" value={stats.totalPerawatan} color="#C2A676" icon="🔧" />
          <StatCard label="Rusak" value={stats.totalRusak} color="#F87171" icon="⚠️" />
        </div>

        <div className={`main-grid ${showForm ? 'cols-2' : 'cols-1'}`}>
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Daftar Inventaris</h2>
              <span className="panel-count">{filtered.length} alat</span>
              <div className="panel-spacer" />
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  className="input-base search-input"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari alat..."
                />
              </div>
              <select className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option value="Semua">Semua Kategori</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
              </select>
              <select className="filter-select" value={filterSts} onChange={e => setFilterSts(e.target.value)}>
                <option value="Semua">Semua Status</option>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
              </select>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID Alat</th>
                    <th>Nama Alat</th>
                    <th>Kategori</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty">
                        <div className="empty-icon">🔍</div>
                        Tidak ada alat ditemukan.
                      </td>
                    </tr>
                  ) : filtered.map(item => (
                    <TableRow 
                      key={item.id} 
                      item={item} 
                      selectedId={selected?.id} 
                      onSelect={handleSelect} 
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="panel-footer">
              <span>
                Menampilkan <span className="highlight">{filtered.length}</span> dari {equipment.length} alat
              </span>
              {selected && <span className="edit-mode">✏️ Mode edit: {selected.name}</span>}
            </div>
          </div>

          {showForm && (
            <div className={`form-panel ${selected ? 'edit' : 'add'}`}>
              <div className="form-header">
                <div>
                  <div className="form-sub">{selected ? `Edit — ${selected.id}` : 'Tambah Baru'}</div>
                  <h3 className="form-title">{selected ? 'Edit Detail Alat' : 'Alat Baru'}</h3>
                </div>
                <button className="btn-close" onClick={handleReset}>✕</button>
              </div>

              <div className="form-group">
                <label className="label">Nama Alat</label>
                <input
                  className="input-base"
                  value={form.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="cth. Smith Machine"
                />
              </div>

              <div className="form-group">
                <label className="label">Kategori</label>
                <select
                  className="input-base"
                  value={form.category}
                  onChange={e => handleInputChange('category', e.target.value)}
                >
                  <option value="">— Pilih Kategori —</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Kondisi / Status</label>
                <div className="status-grid">
                  {STATUSES.map(s => {
                    const cfg = STATUS_CFG[s];
                    const active = form.status === s;
                    return (
                      <button
                        key={s}
                        className={`status-btn ${active ? 'active' : ''}`}
                        style={active ? { borderColor: `${cfg.color}60`, background: cfg.bg, color: cfg.color } : {}}
                        onClick={() => handleInputChange('status', s)}
                      >
                        <span className="status-dot" style={active ? { background: cfg.color } : {}} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button className="btn-save" onClick={handleSimpan}>
                {selected ? '↑ Update Alat' : '+ Simpan Alat'}
              </button>

              <div className="btn-grid">
                {selected ? (
                  <button
                    className={`btn-del ${delConfirm ? 'confirm' : ''}`}
                    style={delConfirm ? { background: 'rgba(248,113,113,0.2)', borderColor: 'rgba(248,113,113,0.5)' } : {}}
                    onClick={handleHapus}
                  >
                    {delConfirm ? '⚠ Yakin?' : '🗑 Hapus'}
                  </button>
                ) : (
                  <button 
                    className="btn-cancel" 
                    onClick={handleClearForm}
                    style={{ borderColor: 'rgba(194,166,118,0.3)', color: '#C2A676' }}
                  >
                    🔄 Reset
                  </button>
                )}
                <button className="btn-cancel" onClick={handleReset}>Batal</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}