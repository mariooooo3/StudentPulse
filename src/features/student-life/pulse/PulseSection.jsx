import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import {
  Activity,
  AlertCircle,
  Check,
  Loader2,
  MapPin,
  Plus,
  Radio,
  Send,
  Zap,
} from 'lucide-react'
import { useNow } from '../../../shared/hooks/useNow'
import { socketService } from '../../../shared/services/socket.service'
import { useAuth } from '../../../app/providers/AuthContext'
import { useStreaks } from '../../../shared/hooks/useStreaks'
import { PULSE_TYPES, PULSE_LOCATIONS, PULSE_TONES, PULSE_LOCAL_KEY } from './pulseConstants'
import { pulseTypeMeta, minutesUntil, readLocalPulseEvents, writeLocalPulseEvents } from './pulseUtils'
import { SECTION_ACCENTS, SECTION_META } from '../constants/sectionConfig'
import { containerVariants, itemVariants } from '../utils/motionVariants'
import SectionHeader from '../components/SectionHeader'
import AccentLine from '../components/AccentLine'
import EmptyState from '../components/EmptyState'

export default function PulseSection({ lifeProfile }) {
  const { t } = useTranslation()
  const now = useNow()
  const accent = SECTION_ACCENTS.pulse
  const { session } = useAuth()
  const { pulseStreak, incrementPulse } = useStreaks(session?.userId)
  const [events, setEvents] = useState([])
  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [localMode, setLocalMode] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ type: 'quiet', location: PULSE_LOCATIONS[0], note: '' })

  const selectedType = pulseTypeMeta(form.type)
  const liveEvents = useMemo(() => {
    return events
      .filter(event => new Date(event.expiresAt).getTime() > now.getTime())
      .sort((a, b) => (b.confirmations || 0) - (a.confirmations || 0) || new Date(b.createdAt) - new Date(a.createdAt))
  }, [events, now])

  const topLocations = useMemo(() => {
    const counts = new Map()
    liveEvents.forEach(event => counts.set(event.location, (counts.get(event.location) || 0) + 1))
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
  }, [liveEvents])

  const loadPulse = useCallback(() => {
    setLoading(true)
    socketService.getPulseList()
      .then((response) => {
        setEvents(response.events || [])
        setChannel(response.channel)
        setError('')
      })
      .catch(() => {
        setEvents(readLocalPulseEvents())
        setChannel(null)
        setLocalMode(true)
        setError('')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadPulse()
    socketService.addEventListener('connect', loadPulse)
    socketService.addEventListener('auth', loadPulse)
    return () => {
      socketService.removeEventListener('connect', loadPulse)
      socketService.removeEventListener('auth', loadPulse)
    }
  }, [loadPulse])

  useEffect(() => {
    if (!channel) return undefined
    return socketService.subscribe(channel, (payload) => {
      if (payload?.kind === 'snapshot') setEvents(payload.events || [])
    })
  }, [channel])

  function submitPulse(event) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    socketService.createPulse({
      type: form.type,
      location: form.location,
      note: form.note.trim(),
      ttlMinutes: selectedType.ttl,
    })
      .then((response) => {
        setEvents(response.events || [])
        setChannel(response.channel)
        setForm(current => ({ ...current, note: '' }))
        setError('')
        incrementPulse()
      })
      .catch(() => {
        const createdAt = new Date()
        const localEvent = {
          id: `local-pulse-${createdAt.getTime()}`,
          type: form.type,
          location: form.location,
          note: form.note.trim(),
          createdAt: createdAt.toISOString(),
          expiresAt: new Date(createdAt.getTime() + selectedType.ttl * 60_000).toISOString(),
          authorName: lifeProfile.name || 'Student',
          confirmations: 1,
        }
        setEvents(current => writeLocalPulseEvents([localEvent, ...current]))
        setForm(current => ({ ...current, note: '' }))
        setLocalMode(true)
        setError('')
      })
      .finally(() => setSubmitting(false))
  }

  function confirmPulse(id) {
    if (localMode) {
      setEvents(current => writeLocalPulseEvents(current.map(item => (
        item.id === id ? { ...item, confirmations: (item.confirmations || 0) + 1 } : item
      ))))
      return
    }
    socketService.reactPulse(id, 'confirm')
      .then((response) => setEvents(response.events || []))
      .catch(() => {
        setEvents(current => writeLocalPulseEvents(current.map(item => (
          item.id === id ? { ...item, confirmations: (item.confirmations || 0) + 1 } : item
        ))))
        setLocalMode(true)
        setError('')
      })
  }

  return (
    <section className="space-y-5 pb-24 lg:pb-6">
      <SectionHeader section="pulse" accent={accent} meta={SECTION_META.pulse} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        {/* ── Live feed card ─────────────────────────────────────── */}
        <div className="premium-card overflow-hidden p-0">
          <AccentLine color={accent.color} />

          {/* Header */}
          <div className="border-b border-white/[0.06] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  {!localMode && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-40" />}
                  <span className={clsx('relative inline-flex h-2.5 w-2.5 rounded-full', localMode ? 'bg-amber-300' : 'bg-cyan-300')} />
                </span>
                <p className="section-label">{t('pulse.campusPulseLive')}</p>
                <span className={clsx(
                  'rounded-full border px-2 py-0.5 text-[10px] font-bold',
                  localMode ? 'border-amber-400/20 bg-amber-400/10 text-amber-200' : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
                )}>
                  {localMode ? t('pulse.localMode') : t('pulse.live')}
                </span>
              </div>
              <div className="grid w-full max-w-[300px] grid-cols-3 gap-1.5 rounded-2xl bg-white/[0.025] p-1.5 text-center">
                {[
                  { val: liveEvents.length, label: t('pulse.liveLabel') },
                  { val: liveEvents.reduce((s, e) => s + (e.confirmations || 0), 0), label: t('pulse.statsLabel') },
                  { val: topLocations.length, label: t('pulse.zonesLabel') },
                ].map(({ val, label }) => (
                  <div key={label} className="rounded-xl px-3 py-2">
                    <p className="font-mono text-lg font-black leading-none text-white">{val}</p>
                    <p className="mt-1 section-label">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feed */}
          {loading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.03]" />
              ))}
            </div>
          ) : liveEvents.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Radio} title={t('pulse.campusQuiet')} text={t('pulse.campusQuietText')} accent={accent} />
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-white/[0.05]"
            >
              {liveEvents.map((item) => {
                const meta = pulseTypeMeta(item.type)
                const Icon = meta.icon
                return (
                  <motion.article key={item.id} variants={itemVariants} className="p-5 transition-colors hover:bg-white/[0.02]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-3.5">
                        <span className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border', PULSE_TONES[meta.tone])}>
                          <Icon size={18} strokeWidth={1.9} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{t(`pulse.types.${item.type}`)}</h3>
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              <MapPin size={10} /> {item.location}
                            </span>
                          </div>
                          {item.note && <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.note}</p>}
                          <p className="mt-2 font-mono text-xs font-semibold text-slate-600">
                            {item.authorName || 'Student'} · {t('pulse.expiresIn', { min: minutesUntil(item.expiresAt, now) })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => confirmPulse(item.id)}
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 text-[11px] font-bold text-emerald-200 transition-all hover:bg-emerald-400/18 active:scale-[0.97]"
                      >
                        <Check size={13} /> {t('pulse.confirm')}
                        <span className="font-mono text-emerald-100">{item.confirmations || 0}</span>
                      </button>
                    </div>
                  </motion.article>
                )
              })}
            </motion.div>
          )}

          {/* Active zones footer */}
          <div className="border-t border-white/[0.06] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} style={{ color: accent.color }} />
              <p className="text-sm font-bold text-white">{t('pulse.activeZones')}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {topLocations.length === 0 ? (
                <p className="rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-3 text-xs leading-relaxed text-slate-400 sm:col-span-3">
                  {t('pulse.noZones')}
                </p>
              ) : topLocations.map(([location, count]) => (
                <div key={location} className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5">
                  <span className="block truncate text-xs font-bold text-slate-200">{location}</span>
                  <span className="mt-1 block font-mono text-xs font-bold text-slate-400">{t('pulse.signals', { count })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Post form ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <form onSubmit={submitPulse} className="premium-card p-5">
            <AccentLine color={accent.color} />
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: accent.bg, border: `1px solid ${accent.border}` }}>
                  <Plus size={16} style={{ color: accent.color }} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{t('pulse.addSignal')}</p>
                    {pulseStreak > 0 && (
                      <span className="inline-flex items-center gap-0.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                        <Zap size={9} /> {pulseStreak}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{localMode ? t('pulse.worksLocal') : t('pulse.appearsInstant')}</p>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl px-3 text-[12px] font-bold transition-all active:scale-[0.97] disabled:opacity-60"
                style={{ background: accent.bg, border: `1px solid ${accent.border}`, color: accent.color }}
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {t('pulse.publish')}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="section-label mb-2 block">{t('pulse.signalType')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {PULSE_TYPES.map((type) => {
                    const Icon = type.icon
                    const active = form.type === type.id
                    return (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => setForm(c => ({ ...c, type: type.id }))}
                        className={clsx(
                          'flex min-h-9 items-center gap-2 rounded-xl border px-2.5 text-left text-[11px] font-bold transition-all active:scale-[0.97]',
                          active ? PULSE_TONES[type.tone] : 'border-white/[0.06] bg-white/[0.02] text-slate-500 hover:text-slate-300',
                        )}
                      >
                        <Icon size={13} /> {t(`pulse.types.${type.id}`)}
                      </button>
                    )
                  })}
                </div>
              </div>

              <label className="block">
                <span className="section-label mb-2 block">{t('pulse.location')}</span>
                <select
                  value={form.location}
                  onChange={(e) => setForm(c => ({ ...c, location: e.target.value }))}
                  className="input-base h-9"
                >
                  {PULSE_LOCATIONS.map(loc => <option key={loc}>{loc}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="section-label mb-2 block">{t('pulse.optDetail')}</span>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm(c => ({ ...c, note: e.target.value }))}
                  maxLength={160}
                  rows={2}
                  placeholder={t('pulse.detailPlaceholder')}
                  className="input-base resize-none"
                />
              </label>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs font-semibold text-amber-200">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
