import { useState } from 'react'
import { ArrowLeftRight, Plus, Users, Calendar, Check, Zap } from 'lucide-react'
import { getGroupSessions, getSkillSwapUsers } from '../../shared/data/facultyCatalog'
import clsx from 'clsx'

function SkillSwapTab({ users }) {
  const [contacted, setContacted] = useState({})

  return (
    <div className="space-y-4">
      {/* My profile */}
      <div className="glass-card p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Profilul tău de Skill Swap</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-emerald-400 font-semibold mb-2 flex items-center gap-1">
              <span>✓</span> Ce știi bine
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button className="px-2.5 py-1 rounded-full text-xs bg-slate-700 border border-slate-600 text-slate-400 hover:bg-slate-600 transition-colors flex items-center gap-1">
                <Plus size={10} /> Adaugă skill
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-indigo-400 font-semibold mb-2 flex items-center gap-1">
              <span>→</span> Ce vrei să înveți
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button className="px-2.5 py-1 rounded-full text-xs bg-slate-700 border border-slate-600 text-slate-400 hover:bg-slate-600 transition-colors flex items-center gap-1">
                <Plus size={10} /> Adaugă
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Matches */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap size={12} className="text-amber-400" /> Match-uri compatibile
        </p>
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className={clsx('glass-card p-4 flex items-center gap-4', u.match && 'border-indigo-500/20 bg-indigo-500/5')}>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                {u.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-200">{u.name}</p>
                  {u.match && <span className="badge-blue text-[9px] py-0 px-1.5">Match</span>}
                  {u.online && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-400">Predă: {u.teaches}</span>
                  <ArrowLeftRight size={10} className="text-slate-600" />
                  <span className="text-indigo-400">Învață: {u.learns}</span>
                </div>
              </div>
              {contacted[u.id] ? (
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold shrink-0">
                  <Check size={13} /> Contactat
                </div>
              ) : (
                <button
                  onClick={() => setContacted(p => ({ ...p, [u.id]: true }))}
                  className="btn-secondary text-xs shrink-0"
                >
                  Contactează
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GroupSessionsTab({ sessions }) {
  const [joined, setJoined] = useState({})

  return (
    <div className="space-y-4">
      <button className="btn-primary flex items-center gap-2 text-sm">
        <Plus size={15} /> Creează sesiune de grup
      </button>

      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sesiuni disponibile</p>

      {sessions.map(s => (
        <div key={s.id} className="glass-card p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full', s.type === 'teach' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400')}>
                  {s.type === 'teach' ? '👨‍🏫 Predare' : '📖 Grup studiu'}
                </span>
              </div>
              <p className="font-semibold text-white text-sm">{s.topic}</p>
              <p className="text-xs text-slate-500">Organizat de {s.host}</p>
            </div>
            {joined[s.id] ? (
              <span className="badge-green shrink-0 text-xs"><Check size={11} /> Înscris</span>
            ) : s.spots === 0 ? (
              <span className="badge-red shrink-0 text-xs">Complet</span>
            ) : (
              <span className="badge-amber shrink-0 text-xs">{s.spots} locuri</span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1"><Calendar size={11} /> {s.date}</span>
            <span>{s.time}</span>
            <span className="flex items-center gap-1"><Users size={11} /> {s.totalSpots - s.spots}/{s.totalSpots}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {s.tags.map(t => <span key={t} className="tag text-[10px] py-0.5">{t}</span>)}
          </div>

          {!joined[s.id] && s.spots > 0 && (
            <button
              onClick={() => setJoined(p => ({ ...p, [s.id]: true }))}
              className="btn-primary w-full text-xs py-2"
            >
              Înscrie-te la sesiune
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default function SkillSwap({ profile }) {
  const users = getSkillSwapUsers(profile)
  const sessions = getGroupSessions(profile)

  const [tab, setTab] = useState(0)

  return (
    <div>
      <div className="flex gap-1 bg-slate-800 p-1 rounded-xl mb-4 w-fit">
        {['Skill Swap 1-la-1', 'Sesiuni de grup'].map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', tab === i ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200')}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 0 ? <SkillSwapTab users={users} /> : <GroupSessionsTab sessions={sessions} />}
    </div>
  )
}
