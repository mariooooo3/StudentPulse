import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Users, Plus, X, Loader2, AlertCircle, Trash2 } from 'lucide-react'
import { useAuth } from '../../../app/providers/AuthContext'
import { SECTION_ACCENTS } from '../constants/sectionConfig'
import { roommatesApi } from './roommatesService'

const accent = SECTION_ACCENTS.community

function formatExpiry(expiresAt) {
  const diff = new Date(expiresAt) - Date.now()
  if (diff <= 0) return 'Expirat'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `Expiră în ${h}h ${m}m`
  return `Expiră în ${m}m`
}

function RoommateCard({ r, onDelete }) {
  const initials = r.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="premium-card p-5 overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
           style={{ background: `linear-gradient(90deg,transparent,${accent.color}60,transparent)` }} />

      <div className="flex items-start gap-3 mb-3">
        <div
          className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ background: `linear-gradient(135deg, ${accent.color}, #8b5cf6)` }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">{r.name}</p>
          <p className="text-xs text-slate-500">
            {r.faculty ? `${r.faculty} · ` : ''}{r.year ? `An ${r.year}` : ''}
          </p>
        </div>
        <span className="text-[10px] text-slate-600 shrink-0">{formatExpiry(r.expires_at)}</span>
      </div>

      {r.bio && (
        <p className="text-xs text-slate-400 leading-relaxed mb-3">{r.bio}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {r.zone    && <span className="tag">{r.zone}</span>}
        {r.budget  && <span className="tag">{r.budget}</span>}
        {r.schedule && <span className="tag">{r.schedule}</span>}
        {!r.smoking && <span className="tag">Non-fumător</span>}
        {!!r.pets   && <span className="tag">Animale ok</span>}
      </div>

      <div className="gradient-separator mb-4" />

      <div className="flex items-center gap-2">
        <button
          onClick={() => window.open(`https://t.me/${r.contact.replace('@', '')}`, '_blank', 'noopener,noreferrer')}
          className="flex-1 h-9 rounded-xl text-xs font-bold transition-all active:scale-[0.97]"
          style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
        >
          Contactează {r.contact}
        </button>
        {r.isOwn && (
          <button
            onClick={() => onDelete(r.id)}
            className="h-9 px-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] text-rose-400 text-xs font-bold hover:bg-rose-400/[0.14] transition-all active:scale-[0.97] flex items-center gap-1 shrink-0"
          >
            <Trash2 size={12} /> Șterge
          </button>
        )}
      </div>
    </motion.div>
  )
}

function PostRoommateModal({ onClose, onPosted, userId, userName, lifeProfile }) {
  const [form, setForm] = useState({
    budget: '', zone: '', smoking: false, pets: false,
    schedule: 'Flexibil', bio: '', contact: '',
    year: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await roommatesApi.post({
        userId,
        name:    userName,
        faculty: lifeProfile?.facultyCode || lifeProfile?.faculty || '',
        year:    form.year ? Number(form.year) : null,
        budget:  form.budget,
        zone:    form.zone,
        smoking: form.smoking,
        pets:    form.pets,
        schedule: form.schedule,
        bio:     form.bio,
        contact: form.contact,
      })
      onPosted(data.roommate)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="relative w-full max-w-lg"
      >
        <div className="p-[1px] rounded-2xl"
             style={{ background: `linear-gradient(to bottom, ${accent.color}30, rgba(255,255,255,0.03))` }}>
          <div className="rounded-[calc(1rem-1px)] bg-[#0b1020] border border-white/[0.06] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.95)] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                     style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
                  <Users size={15} style={{ color: accent.color }} />
                </div>
                <p className="text-[14px] font-bold text-white">Postează anunț coleg de cameră</p>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-colors">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs">An de studiu</label>
                  <select className="input-base w-full mt-1" value={form.year} onChange={e => set('year', e.target.value)}>
                    <option value="">-</option>
                    {[1,2,3,4].map(y => <option key={y} value={y}>An {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-xs">Program preferat</label>
                  <select className="input-base w-full mt-1" value={form.schedule} onChange={e => set('schedule', e.target.value)}>
                    {['Matinal', 'Variabil', 'Nocturn', 'Flexibil'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label-xs">Zonă preferată *</label>
                <input className="input-base w-full mt-1" placeholder="ex: Tătărași, Copou, Tudor Vladimirescu"
                  value={form.zone} onChange={e => set('zone', e.target.value)} required />
              </div>

              <div>
                <label className="label-xs">Buget lunar</label>
                <input className="input-base w-full mt-1" placeholder="ex: 600-800 RON/lună"
                  value={form.budget} onChange={e => set('budget', e.target.value)} />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.smoking}
                    onChange={e => set('smoking', e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-500"
                  />
                  <span className="text-xs text-slate-400">Fumător</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.pets}
                    onChange={e => set('pets', e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-500"
                  />
                  <span className="text-xs text-slate-400">Animale de companie ok</span>
                </label>
              </div>

              <div>
                <label className="label-xs">Despre tine</label>
                <textarea
                  className="input-base resize-none w-full mt-1"
                  rows={3}
                  placeholder="ex: Student liniștit, prefer să studiez seara..."
                  value={form.bio}
                  onChange={e => set('bio', e.target.value)}
                />
              </div>

              <div>
                <label className="label-xs">Contact Telegram *</label>
                <input className="input-base w-full mt-1" placeholder="ex: @username"
                  value={form.contact} onChange={e => set('contact', e.target.value)} required />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-3 py-2">
                  <AlertCircle size={13} className="text-rose-400 shrink-0" />
                  <p className="text-xs text-rose-300">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
              >
                {loading
                  ? <><Loader2 size={14} className="animate-spin" /> Se postează...</>
                  : <><Users size={14} /> Postează anunțul</>}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function RoommateTab({ lifeProfile }) {
  const { session } = useAuth()
  const userId   = session?.userId || ''
  const userName = session?.name || session?.email?.split('@')[0] || 'Student'

  const [roommates, setRoommates] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [query,     setQuery]     = useState('')
  const [showPost,  setShowPost]  = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await roommatesApi.getAll({ userId })
      setRoommates(data.roommates || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const filtered = roommates.filter(r =>
    !query ||
    r.zone?.toLowerCase().includes(query.toLowerCase()) ||
    r.faculty?.toLowerCase().includes(query.toLowerCase()) ||
    r.name?.toLowerCase().includes(query.toLowerCase())
  )

  async function handleDelete(id) {
    try {
      await roommatesApi.delete(id, userId)
      setRoommates(prev => prev.filter(r => r.id !== id))
    } catch (e) { alert(e.message) }
  }

  function handlePosted(roommate) {
    setShowPost(false)
    setRoommates(prev => [{ ...roommate, isOwn: true }, ...prev])
  }

  return (
    <div className="space-y-4">
      {/* Search + post button */}
      <div className="flex items-center gap-3">
        <input
          className="input-base flex-1 py-2 text-xs"
          placeholder="Caută zonă, facultate, nume..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          onClick={() => setShowPost(true)}
          className="h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-[0.97] shrink-0"
          style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
        >
          <Plus size={13} /> Postează
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={22} className="animate-spin" style={{ color: accent.color }} />
            <p className="text-sm text-slate-500">Se încarcă anunțurile...</p>
          </motion.div>
        ) : error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.07] p-6 text-center">
            <p className="text-sm text-rose-300">{error}</p>
            <button onClick={load} className="mt-3 text-xs text-rose-400 underline">Încearcă din nou</button>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center space-y-3">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <Users size={20} className="text-slate-600" />
            </div>
            <p className="text-sm font-bold text-white">
              {roommates.length === 0 ? 'Niciun anunț de coleg de cameră' : 'Niciun rezultat'}
            </p>
            <p className="text-xs text-slate-500">
              {roommates.length === 0
                ? 'Fii primul care postează un anunț!'
                : 'Încearcă altă zonă sau facultate.'}
            </p>
            {roommates.length === 0 && (
              <button
                onClick={() => setShowPost(true)}
                className="mt-1 h-9 px-5 rounded-xl text-xs font-bold transition-all active:scale-[0.97]"
                style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
              >
                Postează anunț
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {filtered.map(r => (
                <RoommateCard key={r.id} r={r} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPost && (
          <PostRoommateModal
            key="post"
            userId={userId}
            userName={userName}
            lifeProfile={lifeProfile}
            onClose={() => setShowPost(false)}
            onPosted={handlePosted}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
