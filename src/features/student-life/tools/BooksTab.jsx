import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Plus, X, Loader2, AlertCircle, Trash2, Phone } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../../app/providers/AuthContext'
import { SECTION_ACCENTS } from '../constants/sectionConfig'
import { booksApi } from './booksService'

const accent = SECTION_ACCENTS.discounts

function formatExpiry(expiresAt) {
  const diff = new Date(expiresAt) - Date.now()
  if (diff <= 0) return 'Expirat'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `Expiră în ${h}h ${m}m`
  return `Expiră în ${m}m`
}

function BookCard({ book, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="premium-card p-4 overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
           style={{ background: `linear-gradient(90deg,transparent,${accent.color}60,transparent)` }} />
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
             style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
          <BookOpen size={16} style={{ color: accent.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{book.title}</p>
          {book.author && <p className="text-xs text-slate-500">{book.author}</p>}
          <p className="text-xs text-slate-500">
            {book.subject}
            {book.year_needed ? ` · An ${book.year_needed}` : ''}
            {book.condition ? ` · ${book.condition}` : ''}
          </p>
          <p className="font-mono text-xs text-slate-600 mt-0.5">Oferit de {book.user_name}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={clsx('font-mono text-sm font-bold', book.price === 0 ? 'text-emerald-400' : 'text-white')}>
            {book.price === 0 ? 'Gratuit' : `${book.price} RON`}
          </p>
          <span className={clsx(
            'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold',
            book.type === 'donez'
              ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/12 text-amber-400 border border-amber-500/20',
          )}>
            {book.type === 'donez' ? 'Donez' : 'Vând'}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[10px] text-slate-600">{formatExpiry(book.expires_at)}</span>
        <div className="flex items-center gap-2 flex-wrap">
          {book.contact && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Phone size={11} /> {book.contact}
            </span>
          )}
          {book.isOwn && (
            <button
              onClick={() => onDelete(book.id)}
              className="h-7 px-2.5 rounded-lg border border-rose-400/20 bg-rose-400/[0.07] text-rose-400 text-xs font-bold hover:bg-rose-400/[0.14] transition-all active:scale-[0.97] flex items-center gap-1"
            >
              <Trash2 size={11} /> Șterge
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function PostBookModal({ onClose, onPosted, userId, userName, lifeProfile }) {
  const [form, setForm] = useState({
    title: '', author: '', subject: '', yearNeeded: '',
    condition: '', price: 0, type: 'vând', contact: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await booksApi.post({
        userId, userName,
        ...form,
        price:   form.type === 'donez' ? 0 : Number(form.price),
        faculty: lifeProfile?.facultyCode || '',
      })
      onPosted(data.book)
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
                  <BookOpen size={15} style={{ color: accent.color }} />
                </div>
                <p className="text-[14px] font-bold text-white">Postează carte</p>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-colors">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="label-xs">Titlu *</label>
                <input className="input-base w-full mt-1" placeholder="ex: Analiză matematică vol. 1"
                  value={form.title} onChange={e => set('title', e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs">Autor</label>
                  <input className="input-base w-full mt-1" placeholder="ex: Ion Popescu"
                    value={form.author} onChange={e => set('author', e.target.value)} />
                </div>
                <div>
                  <label className="label-xs">Materie *</label>
                  <input className="input-base w-full mt-1" placeholder="ex: Matematică"
                    value={form.subject} onChange={e => set('subject', e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs">An necesar</label>
                  <select className="input-base w-full mt-1" value={form.yearNeeded} onChange={e => set('yearNeeded', e.target.value)}>
                    <option value="">Orice an</option>
                    {[1,2,3,4].map(y => <option key={y} value={y}>An {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-xs">Stare</label>
                  <select className="input-base w-full mt-1" value={form.condition} onChange={e => set('condition', e.target.value)}>
                    <option value="">-</option>
                    {['Nouă', 'Foarte bună', 'Bună', 'Uzată'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs">Tip *</label>
                  <select className="input-base w-full mt-1" value={form.type} onChange={e => set('type', e.target.value)}>
                    <option value="vând">Vând</option>
                    <option value="donez">Donez</option>
                  </select>
                </div>
                <div>
                  <label className="label-xs">Preț (RON)</label>
                  <input type="number" min="0" className="input-base w-full mt-1"
                    placeholder="0 = gratuit"
                    value={form.type === 'donez' ? 0 : form.price}
                    onChange={e => set('price', e.target.value)}
                    disabled={form.type === 'donez'} />
                </div>
              </div>

              <div>
                <label className="label-xs">Contact *</label>
                <input className="input-base w-full mt-1" placeholder="ex: 0712345678 sau @telegram"
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
                  : <><BookOpen size={14} /> Postează cartea</>}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function BooksTab({ lifeProfile }) {
  const { session } = useAuth()
  const userId   = session?.userId || ''
  const userName = session?.name || session?.email?.split('@')[0] || 'Student'

  const [books,    setBooks]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [query,    setQuery]    = useState('')
  const [type,     setType]     = useState('Toate')
  const [showPost, setShowPost] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await booksApi.getAll({ userId })
      setBooks(data.books || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const filtered = books.filter(b =>
    (type === 'Toate' || b.type === type) &&
    (!query ||
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.subject.toLowerCase().includes(query.toLowerCase()))
  )

  async function handleDelete(id) {
    try {
      await booksApi.delete(id, userId)
      setBooks(prev => prev.filter(b => b.id !== id))
    } catch (e) { alert(e.message) }
  }

  function handlePosted(book) {
    setShowPost(false)
    setBooks(prev => [{ ...book, isOwn: true }, ...prev])
  }

  return (
    <div className="space-y-4">
      {/* Search + filter + post button */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex gap-2">
          <input
            className="input-base flex-1 py-2 text-xs"
            placeholder="Caută titlu, materie..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.025] p-1 shrink-0">
            {['Toate', 'donez', 'vând'].map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                  type === t ? 'bg-white/[0.07] text-white' : 'text-slate-500 hover:text-slate-300',
                )}
                style={type === t ? { color: accent.color } : undefined}
              >
                {t === 'donez' ? 'Donez' : t === 'vând' ? 'Vând' : 'Toate'}
              </button>
            ))}
          </div>
        </div>
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
            <p className="text-sm text-slate-500">Se încarcă cărțile...</p>
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
              <BookOpen size={20} className="text-slate-600" />
            </div>
            <p className="text-sm font-bold text-white">
              {books.length === 0 ? 'Nicio carte listată' : 'Nicio carte găsită'}
            </p>
            <p className="text-xs text-slate-500">
              {books.length === 0
                ? 'Fii primul care postează o carte!'
                : 'Încearcă alt titlu sau categorie.'}
            </p>
            {books.length === 0 && (
              <button
                onClick={() => setShowPost(true)}
                className="mt-1 h-9 px-5 rounded-xl text-xs font-bold transition-all active:scale-[0.97]"
                style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
              >
                Postează carte
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                      className="space-y-3">
            <AnimatePresence>
              {filtered.map(b => (
                <BookCard key={b.id} book={b} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPost && (
          <PostBookModal
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
