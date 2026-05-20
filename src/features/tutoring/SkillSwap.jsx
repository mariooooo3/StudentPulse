import { useState } from 'react'
import { ArrowLeftRight, Plus, Users, Calendar, Check, Zap, Repeat2, BookOpen, Sparkles } from 'lucide-react'
import { getGroupSessions, getSkillSwapUsers } from '../../shared/data/facultyCatalog'
import clsx from 'clsx'
import { useToast } from '../../shared/components/Toast'
import { motion, AnimatePresence } from 'framer-motion'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 90, damping: 20 },
  },
}

/* ─── Skill Swap 1-la-1 ─── */
function SkillSwapTab({ users }) {
  const [contacted, setContacted] = useState({})
  const [skills, setSkills] = useState(() => JSON.parse(localStorage.getItem('sc_swap_skills') || '[]'))
  const [wants, setWants] = useState(() => JSON.parse(localStorage.getItem('sc_swap_wants') || '[]'))
  const toast = useToast()

  function addSkill(type) {
    const suggestions = type === 'skill'
      ? ['React', 'Algoritmica', 'Baze de date', 'Python']
      : ['Machine Learning', 'UI Design', 'Docker', 'Statistica']
    const current = type === 'skill' ? skills : wants
    const nextItem = suggestions.find(item => !current.includes(item)) || `Skill ${current.length + 1}`
    const next = [...current, nextItem]
    if (type === 'skill') {
      setSkills(next)
      localStorage.setItem('sc_swap_skills', JSON.stringify(next))
    } else {
      setWants(next)
      localStorage.setItem('sc_swap_wants', JSON.stringify(next))
    }
    toast({ type: 'success', title: 'Profil actualizat', message: `${nextItem} a fost adaugat in profilul de Skill Swap.` })
  }

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="premium-card p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600/30 to-violet-600/20 border border-indigo-500/25 flex items-center justify-center shrink-0">
            <Repeat2 size={16} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Skill Swap</p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Schimbă cunoștințe cu colegi — tu predai ce știi, ei te învață ce vrei.
            </p>
          </div>
        </div>

        {/* My profile card */}
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/[0.05]">
            <p className="section-label">Profilul tău de Skill Swap</p>
          </div>
          <div className="grid grid-cols-2 divide-x divide-white/[0.05]">
            {/* Offers */}
            <div className="p-4">
              <p className="text-[11px] text-emerald-400 font-semibold mb-2.5 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Check size={9} className="text-emerald-400" />
                </span>
                Oferi
              </p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map(skill => (
                  <span key={skill} className="tag text-[10px] py-0.5 border-emerald-500/20 text-emerald-300/80">{skill}</span>
                ))}
                <button
                  onClick={() => addSkill('skill')}
                  className="px-2 py-1 rounded-full text-[10px] bg-white/[0.04] border border-dashed border-white/[0.12] text-slate-500 hover:text-slate-300 hover:border-white/[0.2] transition-colors flex items-center gap-1"
                >
                  <Plus size={9} /> Adaugă skill
                </button>
              </div>
            </div>

            {/* Wants */}
            <div className="p-4">
              <p className="text-[11px] text-indigo-400 font-semibold mb-2.5 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <BookOpen size={8} className="text-indigo-400" />
                </span>
                Primești
              </p>
              <div className="flex flex-wrap gap-1.5">
                {wants.map(skill => (
                  <span key={skill} className="tag text-[10px] py-0.5 border-indigo-500/20 text-indigo-300/80">{skill}</span>
                ))}
                <button
                  onClick={() => addSkill('want')}
                  className="px-2 py-1 rounded-full text-[10px] bg-white/[0.04] border border-dashed border-white/[0.12] text-slate-500 hover:text-slate-300 hover:border-white/[0.2] transition-colors flex items-center gap-1"
                >
                  <Plus size={9} /> Adaugă
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Match list */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={13} className="text-amber-400" />
          <p className="text-xs font-bold text-white">Match-uri compatibile</p>
          {users.filter(u => u.match).length > 0 && (
            <span className="badge-amber text-[9px] py-0 px-1.5">{users.filter(u => u.match).length} top match</span>
          )}
        </div>

        {users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card p-8 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
              <Users size={24} className="text-slate-700" strokeWidth={1.25} />
            </div>
            <p className="text-slate-400 text-sm font-semibold mb-1">Niciun match găsit</p>
            <p className="text-slate-700 text-xs mb-4">Adaugă skill-uri la profilul tău pentru a găsi parteneri</p>
            <button onClick={() => addSkill('skill')} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
              <Plus size={12} /> Adaugă skill
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {users.map(u => (
              <motion.div
                key={u.id}
                variants={itemVariants}
                whileHover={{ y: -1 }}
                className={clsx(
                  'premium-card p-4 transition-all',
                  u.match && 'border-indigo-500/20',
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/[0.07] shadow-md">
                      {u.avatar}
                    </div>
                    {u.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#080e1c]" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white">{u.name}</p>
                      {u.match && <span className="badge-violet text-[9px] py-0 px-1.5"><Sparkles size={8} className="inline mr-0.5" />Match</span>}
                    </div>

                    {/* Skill exchange visualization */}
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="section-label text-emerald-600 text-[9px]">Oferă</span>
                        <span className="tag text-[10px] py-0.5 border-emerald-500/20 text-emerald-300/80">{u.teaches}</span>
                      </div>
                      <ArrowLeftRight size={11} className="text-slate-600 shrink-0" />
                      <div className="flex items-center gap-1.5">
                        <span className="section-label text-indigo-600 text-[9px]">Primește</span>
                        <span className="tag text-[10px] py-0.5 border-indigo-500/20 text-indigo-300/80">{u.learns}</span>
                      </div>
                    </div>

                    {/* Compatibility bar */}
                    {u.match && (
                      <div className="mt-3 flex items-center gap-2">
                        <p className="text-[10px] text-slate-600 shrink-0">Compatibilitate</p>
                        <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${u.compatibility ?? 82}%` }}
                            transition={{ type: 'spring', stiffness: 60, damping: 20, delay: 0.2 }}
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-400 shrink-0">{u.compatibility ?? 82}%</span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    {contacted[u.id] ? (
                      <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-2.5 py-1.5">
                        <Check size={11} /> Trimis
                      </div>
                    ) : (
                      <button
                        onClick={() => setContacted(p => ({ ...p, [u.id]: true }))}
                        className="btn-primary text-[11px] px-3 py-1.5 flex items-center gap-1.5"
                      >
                        <Repeat2 size={11} /> Propune swap
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

/* ─── Group Sessions ─── */
function GroupSessionsTab({ sessions }) {
  const [joined, setJoined] = useState({})
  const [created, setCreated] = useState([])
  const toast = useToast()

  function createSession() {
    const id = `local-${Date.now()}`
    const session = {
      id,
      type: 'study',
      topic: 'Sesiune noua de recapitulare',
      host: 'Tu',
      date: 'Saptamana aceasta',
      time: '18:00',
      totalSpots: 6,
      spots: 5,
      tags: ['recapitulare', 'peer learning'],
    }
    setCreated(prev => [session, ...prev])
    setJoined(prev => ({ ...prev, [id]: true }))
    toast({ type: 'success', title: 'Sesiune creata', message: 'Noua sesiune apare acum in lista si esti inscris ca organizator.' })
  }

  const visibleSessions = [...created, ...sessions]

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="premium-card p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/30 to-indigo-600/20 border border-blue-500/25 flex items-center justify-center shrink-0">
            <Users size={15} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white leading-tight">Sesiuni de grup</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Alătură-te sau creează sesiuni de studiu colaborativ cu colegi.</p>
          </div>
        </div>
        <button onClick={createSession} className="btn-primary flex items-center gap-2 text-xs py-2.5 w-full justify-center">
          <Plus size={13} /> Creează sesiune de grup
        </button>
      </div>

      {visibleSessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-10 flex flex-col items-center text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
            <Users size={24} className="text-slate-700" strokeWidth={1.25} />
          </div>
          <p className="text-slate-400 text-sm font-semibold mb-1">Nicio sesiune disponibilă</p>
          <p className="text-slate-700 text-xs">Fii primul care creează o sesiune de grup</p>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <p className="section-label">Sesiuni disponibile</p>
            <span className="badge-blue text-[9px] py-0 px-1.5">{visibleSessions.length}</span>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {visibleSessions.map(s => (
              <motion.div
                key={s.id}
                variants={itemVariants}
                whileHover={{ y: -1 }}
                className="premium-card p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={clsx(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        s.type === 'teach'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
                      )}>
                        {s.type === 'teach' ? 'Predare' : 'Grup studiu'}
                      </span>
                    </div>
                    <p className="font-bold text-white text-sm leading-tight">{s.topic}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">Organizat de <span className="text-slate-400">{s.host}</span></p>
                  </div>

                  {joined[s.id] ? (
                    <span className="badge-green shrink-0 text-[10px] flex items-center gap-1">
                      <Check size={10} /> Înscris
                    </span>
                  ) : s.spots === 0 ? (
                    <span className="badge-red shrink-0 text-[10px]">Complet</span>
                  ) : (
                    <span className="badge-amber shrink-0 text-[10px]">{s.spots} locuri</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-600 mb-3">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Calendar size={10} className="text-slate-600" /> {s.date}
                  </span>
                  <span className="text-slate-500">{s.time}</span>
                  <span className="flex items-center gap-1">
                    <Users size={10} className="text-slate-600" />
                    <span className="text-slate-500">{s.totalSpots - s.spots}</span>
                    <span className="text-slate-700">/{s.totalSpots}</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {s.tags.map(t => (
                    <span key={t} className="tag text-[10px] py-0.5">{t}</span>
                  ))}
                </div>

                {!joined[s.id] && s.spots > 0 && (
                  <button
                    onClick={() => setJoined(p => ({ ...p, [s.id]: true }))}
                    className="btn-primary w-full text-xs py-2.5"
                  >
                    Înscrie-te la sesiune
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  )
}

/* ─── Root export ─── */
export default function SkillSwap({ profile }) {
  const users = getSkillSwapUsers(profile)
  const sessions = getGroupSessions(profile)

  const [tab, setTab] = useState(0)

  const tabs = [
    { label: 'Skill Swap 1-la-1', icon: <Repeat2 size={11} /> },
    { label: 'Sesiuni de grup', icon: <Users size={11} /> },
  ]

  return (
    <div>
      {/* Inner tab switcher */}
      <div className="flex gap-1 bg-white/[0.04] border border-white/[0.06] p-1 rounded-xl mb-5 w-fit">
        {tabs.map(({ label, icon }, i) => (
          <button
            key={label}
            onClick={() => setTab(i)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5',
              tab === i
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-500 hover:text-slate-300',
            )}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
        >
          {tab === 0
            ? <SkillSwapTab users={users} />
            : <GroupSessionsTab sessions={sessions} />
          }
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
