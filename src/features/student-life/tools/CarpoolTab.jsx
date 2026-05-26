import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Car, ChevronRight, Clock, MapPin, Plus, Users,
  X, Check, Loader2, AlertCircle, Phone, RotateCcw,
  Navigation, CheckCircle2, XCircle, Inbox,
} from 'lucide-react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../app/providers/AuthContext'
import { SECTION_ACCENTS } from '../constants/sectionConfig'
import { carpoolApi } from './carpoolService'

const accent = SECTION_ACCENTS.tools

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}.${m}.${y}`
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const STATUS_BADGE_CLS = {
  active:    'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  full:      'border-amber-400/30 bg-amber-400/10 text-amber-300',
  cancelled: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  pending:   'border-amber-400/30 bg-amber-400/10 text-amber-300',
  accepted:  'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  rejected:  'border-rose-400/30 bg-rose-400/10 text-rose-300',
}

function Badge({ status }) {
  const { t } = useTranslation()
  const cls = STATUS_BADGE_CLS[status] || STATUS_BADGE_CLS.pending
  return (
    <span className={clsx('rounded-full border px-2.5 py-0.5 text-[10px] font-bold', cls)}>
      {t(`carpoolTab.status.${status || 'pending'}`)}
    </span>
  )
}

// ─── RideCard ────────────────────────────────────────────────────────────────
function RideCard({ ride, onJoin, onCancel, onAccept, onReject }) {
  const { t } = useTranslation()
  const canJoin = !ride.isOwn && !ride.myRequest && ride.status === 'active' && ride.seatsLeft > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="premium-card p-4 overflow-hidden"
    >
      {/* Accent line */}
      <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
           style={{ background: `linear-gradient(90deg,transparent,${accent.color}60,transparent)` }} />

      {/* Route */}
      <div className="flex items-center gap-2 mb-3">
        <Navigation size={14} style={{ color: accent.color }} className="shrink-0" />
        <span className="text-sm font-black text-white">{ride.from_city}</span>
        {ride.from_detail && <span className="text-xs text-slate-500">({ride.from_detail})</span>}
        <ChevronRight size={13} className="text-slate-600 shrink-0" />
        <span className="text-sm font-black text-white">{ride.to_city}</span>
        {ride.to_detail && <span className="text-xs text-slate-500">({ride.to_detail})</span>}
        <div className="ml-auto shrink-0">
          <Badge status={ride.status} />
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <Clock size={11} /> {formatDate(ride.date)} · {ride.time}
        </span>
        <span className="flex items-center gap-1">
          <Users size={11} />
          {ride.seatsLeft > 0
            ? t('carpoolTab.seatsLeft', { count: ride.seatsLeft })
            : t('carpoolTab.full')}
        </span>
        <span className="flex items-center gap-1">
          <Car size={11} /> {ride.driver_name}
        </span>
        {ride.price_per_person > 0 && (
          <span className="font-mono font-bold" style={{ color: accent.color }}>
            {ride.price_per_person} {t('carpoolTab.perPerson')}
          </span>
        )}
        {ride.price_per_person === 0 && (
          <span className="font-bold text-emerald-400">{t('carpoolTab.free')}</span>
        )}
      </div>

      {ride.notes && (
        <p className="text-xs text-slate-500 italic mb-3 leading-relaxed">"{ride.notes}"</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">

        {/* Contact (always visible) */}
        {ride.contact && (
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Phone size={11} /> {ride.contact}
          </span>
        )}

        <div className="flex items-center gap-2 ml-auto">

          {/* Own ride — cancel button */}
          {ride.isOwn && ride.status !== 'cancelled' && (
            <button
              onClick={() => onCancel(ride.id)}
              className="h-8 px-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] text-rose-400 text-xs font-bold hover:bg-rose-400/[0.14] transition-all active:scale-[0.97]"
            >
              {t('carpoolTab.cancel')}
            </button>
          )}

          {/* My request status */}
          {ride.myRequest && (
            <Badge status={ride.myRequest.status} />
          )}

          {/* Join button */}
          {canJoin && (
            <button
              onClick={() => onJoin(ride)}
              className="h-8 px-4 rounded-xl text-xs font-bold transition-all active:scale-[0.97]"
              style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
            >
              {t('carpoolTab.join')}
            </button>
          )}

          {!canJoin && !ride.isOwn && !ride.myRequest && ride.status === 'full' && (
            <span className="text-xs text-slate-600">{t('carpoolTab.full')}</span>
          )}
        </div>
      </div>

      {/* Requests received (driver view) */}
      {ride.isOwn && ride.requests?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
            {t('carpoolTab.requestsReceived', { count: ride.requests.length })}
          </p>
          {ride.requests.map(r => (
            <div key={r.id} className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">{r.passengerName}</p>
                {r.message && <p className="text-[11px] text-slate-500 truncate">{r.message}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {r.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => onAccept(r.id, ride.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-all"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => onReject(r.id, ride.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-400/30 bg-rose-400/10 text-rose-400 hover:bg-rose-400/20 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <Badge status={r.status} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ─── PostRideModal ────────────────────────────────────────────────────────────
function PostRideModal({ onClose, onPosted, userName, userId }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    fromCity: '', fromDetail: '', toCity: '', toDetail: '',
    date: todayStr(), time: '08:00', seats: 2, pricePerPerson: 0,
    notes: '', contact: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await carpoolApi.postRide({ userId, userName, ...form, seats: Number(form.seats), pricePerPerson: Number(form.pricePerPerson) })
      onPosted(data.ride)
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

            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                     style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
                  <Car size={15} style={{ color: accent.color }} />
                </div>
                <p className="text-[14px] font-bold text-white">{t('carpoolTab.postTitle')}</p>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-colors">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs">{t('carpoolTab.form.fromCity')}</label>
                  <input className="input-base w-full mt-1" placeholder={t('carpoolTab.form.fromCityPlaceholder')} value={form.fromCity}
                    onChange={e => set('fromCity', e.target.value)} required />
                </div>
                <div>
                  <label className="label-xs">{t('carpoolTab.form.fromDetail')}</label>
                  <input className="input-base w-full mt-1" placeholder={t('carpoolTab.form.fromDetailPlaceholder')} value={form.fromDetail}
                    onChange={e => set('fromDetail', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs">{t('carpoolTab.form.toCity')}</label>
                  <input className="input-base w-full mt-1" placeholder={t('carpoolTab.form.toCityPlaceholder')} value={form.toCity}
                    onChange={e => set('toCity', e.target.value)} required />
                </div>
                <div>
                  <label className="label-xs">{t('carpoolTab.form.toDetail')}</label>
                  <input className="input-base w-full mt-1" placeholder={t('carpoolTab.form.toDetailPlaceholder')} value={form.toDetail}
                    onChange={e => set('toDetail', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs">{t('carpoolTab.form.date')}</label>
                  <input type="date" className="input-base w-full mt-1" value={form.date} min={todayStr()}
                    onChange={e => set('date', e.target.value)} required />
                </div>
                <div>
                  <label className="label-xs">{t('carpoolTab.form.time')}</label>
                  <input type="time" className="input-base w-full mt-1" value={form.time}
                    onChange={e => set('time', e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs">{t('carpoolTab.form.seats')}</label>
                  <input type="number" min="1" max="8" className="input-base w-full mt-1"
                    value={form.seats} onChange={e => set('seats', e.target.value)} required />
                </div>
                <div>
                  <label className="label-xs">{t('carpoolTab.form.price')}</label>
                  <input type="number" min="0" className="input-base w-full mt-1" placeholder={t('carpoolTab.form.pricePlaceholder')}
                    value={form.pricePerPerson} onChange={e => set('pricePerPerson', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label-xs">{t('carpoolTab.form.contact')}</label>
                <input className="input-base w-full mt-1" placeholder={t('carpoolTab.form.contactPlaceholder')}
                  value={form.contact} onChange={e => set('contact', e.target.value)} required />
              </div>

              <div>
                <label className="label-xs">{t('carpoolTab.form.notes')}</label>
                <input className="input-base w-full mt-1" placeholder={t('carpoolTab.form.notesPlaceholder')}
                  value={form.notes} onChange={e => set('notes', e.target.value)} />
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
                  ? <><Loader2 size={14} className="animate-spin" /> {t('carpoolTab.form.posting')}</>
                  : <><Car size={14} /> {t('carpoolTab.form.postBtn')}</>
                }
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── JoinModal ────────────────────────────────────────────────────────────────
function JoinModal({ ride, onClose, onJoined, userName, userId }) {
  const { t } = useTranslation()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await carpoolApi.joinRide(ride.id, { userId, userName, message })
      onJoined(ride.id)
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
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="relative w-full max-w-sm"
      >
        <div className="p-[1px] rounded-2xl"
             style={{ background: `linear-gradient(to bottom, ${accent.color}30, rgba(255,255,255,0.03))` }}>
          <div className="rounded-[calc(1rem-1px)] bg-[#0b1020] border border-white/[0.06] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-sm font-bold text-white">{t('carpoolTab.joinTitle')}</p>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.05]">
                <X size={14} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <Navigation size={11} style={{ color: accent.color }} />
                  {ride.from_city} → {ride.to_city}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {formatDate(ride.date)} · {ride.time} · {t('carpoolTab.driver')} {ride.driver_name}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="label-xs">{t('carpoolTab.joinMessageLabel')}</label>
                  <textarea
                    className="input-base resize-none w-full mt-1"
                    rows={3}
                    placeholder={t('carpoolTab.joinMessagePlaceholder')}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
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
                    ? <><Loader2 size={14} className="animate-spin" /> {t('carpoolTab.sending')}</>
                    : <><Check size={14} /> {t('carpoolTab.sendRequest')}</>
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main CarpoolTab ──────────────────────────────────────────────────────────
const TAB_IDS = ['browse', 'my-rides', 'requests']
const TAB_ICONS = [Car, Navigation, Inbox]

export default function CarpoolTab() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId   = session?.userId || ''
  const userName = session?.name || session?.email?.split('@')[0] || 'Student'

  const [activeTab, setActiveTab] = useState('browse')
  const [rides,     setRides]     = useState([])
  const [myRides,   setMyRides]   = useState([])
  const [myReqs,    setMyReqs]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo,   setFilterTo]   = useState('')

  const [showPost, setShowPost]   = useState(false)
  const [joinRide, setJoinRide]   = useState(null)

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true); setError('')
    try {
      const [r, mr, mreq] = await Promise.all([
        carpoolApi.getRides({ userId }),
        carpoolApi.getMyRides(userId),
        carpoolApi.getMyRequests(userId),
      ])
      setRides(r.rides || [])
      setMyRides(mr.rides || [])
      setMyReqs(mreq.requests || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const filteredRides = rides.filter(r => {
    const f = filterFrom.toLowerCase()
    const to = filterTo.toLowerCase()
    return (!f || r.from_city.toLowerCase().includes(f)) &&
           (!to || r.to_city.toLowerCase().includes(to))
  })

  async function handleCancel(rideId) {
    try {
      await carpoolApi.cancelRide(rideId, userId)
      load()
    } catch (e) { alert(e.message) }
  }

  async function handleAccept(reqId) {
    try {
      await carpoolApi.acceptRequest(reqId, userId)
      load()
    } catch (e) { alert(e.message) }
  }

  async function handleReject(reqId) {
    try {
      await carpoolApi.rejectRequest(reqId, userId)
      load()
    } catch (e) { alert(e.message) }
  }

  function handlePosted(ride) {
    setShowPost(false)
    setMyRides(prev => [{ ...ride, isOwn: true, myRequest: null, requests: [], seatsLeft: ride.seats }, ...prev])
    setRides(prev => [{ ...ride, isOwn: true, myRequest: null, requests: [], seatsLeft: ride.seats }, ...prev])
    setActiveTab('my-rides')
  }

  function handleJoined(rideId) {
    setJoinRide(null)
    setRides(prev => prev.map(r => r.id === rideId
      ? { ...r, myRequest: { id: '', status: 'pending' } }
      : r
    ))
  }

  return (
    <div className="space-y-4">

      {/* Tab bar + Post button */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-1">
          {TAB_IDS.map((id, i) => {
            const Icon = TAB_ICONS[i]
            const active = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition-all',
                  active ? 'bg-white/[0.07] text-white' : 'text-slate-500 hover:text-slate-300',
                )}
                style={active ? { color: accent.color } : undefined}
              >
                <Icon size={12} strokeWidth={active ? 2.2 : 1.75} />
                <span className="hidden sm:inline">{t(`carpoolTab.tabs.${id.replace('-', '')}`)}</span>
              </button>
            )
          })}
        </div>
        <button
          onClick={() => setShowPost(true)}
          className="h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-[0.97] shrink-0"
          style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
        >
          <Plus size={13} /> {t('carpoolTab.post')}
        </button>
      </div>

      {/* Filters (browse tab) */}
      {activeTab === 'browse' && (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              className="input-base w-full pl-8 py-2 text-xs"
              placeholder={t('carpoolTab.filterFrom')}
              value={filterFrom}
              onChange={e => setFilterFrom(e.target.value)}
            />
          </div>
          <div className="flex-1 relative">
            <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              className="input-base w-full pl-8 py-2 text-xs"
              placeholder={t('carpoolTab.filterTo')}
              value={filterTo}
              onChange={e => setFilterTo(e.target.value)}
            />
          </div>
          <button
            onClick={load}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={22} className="animate-spin" style={{ color: accent.color }} />
            <p className="text-sm text-slate-500">{t('carpoolTab.loading')}</p>
          </motion.div>
        ) : error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.07] p-6 text-center">
            <p className="text-sm text-rose-300">{error}</p>
            <button onClick={load} className="mt-3 text-xs text-rose-400 underline">{t('carpoolTab.retry')}</button>
          </motion.div>
        ) : (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                      className="space-y-3">

            {/* Browse */}
            {activeTab === 'browse' && (
              filteredRides.length === 0 ? (
                <EmptyState
                  icon={Car}
                  title={t('carpoolTab.empty.noRides')}
                  desc={filterFrom || filterTo
                    ? t('carpoolTab.empty.noRidesFilter')
                    : t('carpoolTab.empty.beFirst')}
                  action={{ label: t('carpoolTab.postTitle'), onClick: () => setShowPost(true) }}
                />
              ) : (
                <AnimatePresence>
                  {filteredRides.map(r => (
                    <RideCard key={r.id} ride={r}
                      onJoin={setJoinRide}
                      onCancel={handleCancel}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  ))}
                </AnimatePresence>
              )
            )}

            {/* My rides */}
            {activeTab === 'my-rides' && (
              myRides.length === 0 ? (
                <EmptyState
                  icon={Navigation}
                  title={t('carpoolTab.empty.noMyRides')}
                  desc={t('carpoolTab.empty.noMyRidesDesc')}
                  action={{ label: t('carpoolTab.empty.postNow'), onClick: () => setShowPost(true) }}
                />
              ) : (
                <AnimatePresence>
                  {myRides.map(r => (
                    <RideCard key={r.id} ride={r}
                      onJoin={setJoinRide}
                      onCancel={handleCancel}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  ))}
                </AnimatePresence>
              )
            )}

            {/* My requests */}
            {activeTab === 'requests' && (
              myReqs.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title={t('carpoolTab.empty.noRequests')}
                  desc={t('carpoolTab.empty.noRequestsDesc')}
                  action={{ label: t('carpoolTab.tabs.browse'), onClick: () => setActiveTab('browse') }}
                />
              ) : (
                <AnimatePresence>
                  {myReqs.map(r => (
                    <motion.div
                      key={r.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="premium-card p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white flex items-center gap-2">
                            <Navigation size={12} style={{ color: accent.color }} />
                            {r.from_city} → {r.to_city}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDate(r.date)} · {r.time} · {t('carpoolTab.driver')} {r.driver_name}
                          </p>
                          {r.price_per_person > 0 && (
                            <p className="text-xs font-bold mt-1" style={{ color: accent.color }}>
                              {r.price_per_person} {t('carpoolTab.perPersonFull')}
                            </p>
                          )}
                        </div>
                        <Badge status={r.status} />
                      </div>
                      {r.message && (
                        <p className="mt-2 text-xs text-slate-500 italic">"{r.message}"</p>
                      )}
                      {r.status === 'accepted' && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 size={12} /> {t('carpoolTab.acceptedMsg')}
                        </div>
                      )}
                      {r.status === 'rejected' && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                          <XCircle size={12} /> {t('carpoolTab.rejectedMsg')}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showPost && (
          <PostRideModal
            key="post"
            userId={userId}
            userName={userName}
            onClose={() => setShowPost(false)}
            onPosted={handlePosted}
          />
        )}
        {joinRide && (
          <JoinModal
            key="join"
            ride={joinRide}
            userId={userId}
            userName={userName}
            onClose={() => setJoinRide(null)}
            onJoined={handleJoined}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function EmptyState({ icon: Icon, title, desc, action }) {
  const accent = SECTION_ACCENTS.tools
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center space-y-3">
      <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <Icon size={20} className="text-slate-600" />
      </div>
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 h-9 px-5 rounded-xl text-xs font-bold transition-all active:scale-[0.97]"
          style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}
