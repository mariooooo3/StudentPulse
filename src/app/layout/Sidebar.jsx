import {
  BookOpen,
  Briefcase,
  Calendar,
  Compass,
  Heart,
  Home,
  LogOut,
  Map,
  MapPin,
  MessageSquare,
  Radio,
  Sparkles,
  Tag,
  Users,
  Wrench,
  X,
  Edit3,
  Save,
  GraduationCap,
  ChevronRight,
  Lock,
  Github,
  Linkedin,
  Hash,
} from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'
import { useAuth } from '../providers/AuthContext'
import { getUniversityTheme } from '../../shared/utils/theme'

const NAV_BY_MODE = {
  academic: [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'navigator', label: 'Campus Navigator', icon: Map },
    { id: 'schedule', label: 'Schedule Hub', icon: Calendar },
    { id: 'thesis', label: 'Thesis Finder', icon: BookOpen },
    { id: 'tutoring', label: 'Peer Tutoring', icon: Users },
    { id: 'messages', label: 'Mesaje', icon: MessageSquare },
  ],
  life: [
    { id: 'pulse', label: 'Campus Pulse', icon: Radio },
    { id: 'discounts', label: 'Reduceri & Beneficii', icon: Tag },
    { id: 'career', label: 'Carieră & Internship-uri', icon: Briefcase },
    { id: 'community', label: 'Comunitate', icon: Users },
    { id: 'events', label: 'Evenimente', icon: Calendar },
    { id: 'wellness', label: 'Focus', icon: Heart },
    { id: 'tools', label: 'Unelte Studențești', icon: Wrench },
    { id: 'citylife', label: 'Viața în Oraș', icon: MapPin },
  ],
}

const MODE_COPY = {
  academic: { name: 'StudentCompass', subtitle: 'Academic', label: 'Academic', icon: Compass },
  life: { name: 'StudentCompass', subtitle: 'Viața Studențească', label: 'Viața Studențească', icon: Sparkles },
}

const IT_FACULTY_TYPES = new Set(['CS', 'ENGINEERING_CS', 'MATH_CS'])

function isItFaculty(profile, session) {
  const type = profile?.facultyType || session?.detectedFaculty?.type || ''
  return IT_FACULTY_TYPES.has(type)
}

function ProfileModal({ profile, session, theme, initials, onClose }) {
  const { updateProfile } = useAuth()
  const displayName = profile?.name || session?.email?.split('@')[0] || 'Student'
  const showSocialLinks = isItFaculty(profile, session)
  const [interests, setInterests] = useState((profile?.interests || []).join(', '))
  const [group, setGroup] = useState(profile?.group || '')
  const [github, setGithub] = useState(profile?.github || '')
  const [linkedin, setLinkedin] = useState(profile?.linkedin || '')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    const patch = {
      interests: interests.split(',').map(item => item.trim()).filter(Boolean),
      group: group.trim(),
    }
    if (showSocialLinks) {
      patch.github = github.trim()
      patch.linkedin = linkedin.trim()
    }
    updateProfile(patch)
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="p-[1px] rounded-2xl bg-gradient-to-b from-white/[0.12] to-white/[0.03]">
          <div className="rounded-[calc(1rem-1px)] bg-[#0b1020] border border-white/[0.06] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.95)] overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-[14px] font-semibold text-white">Profilul meu</p>
              <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-white/[0.05]">
                <X size={15} strokeWidth={1.75} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-lg"
                  style={{ background: `linear-gradient(140deg, ${theme.accent}dd, ${theme.accentStrong || theme.accent}88)`, boxShadow: `0 4px 20px ${theme.accent}30` }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-200 truncate">{session?.email || ''}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                    {profile?.faculty || session?.detectedFaculty?.name || '—'}
                  </p>
                  {session?.university && (
                    <span
                      className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                      style={{ color: theme.accent, background: theme.accentSoft, borderColor: theme.accentBorder }}
                    >
                      <span>{session.university.avatar}</span>
                      {session.university.shortName}
                    </span>
                  )}
                </div>
              </div>

              {/* Name — read-only */}
              <div>
                <label className="text-[10px] text-slate-600 uppercase font-semibold tracking-wide block mb-1.5">Nume</label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/[0.04] bg-white/[0.02] text-slate-400 text-[13px] select-none">
                  <span className="flex-1 truncate">{displayName}</span>
                  <Lock size={11} className="text-slate-700 shrink-0" />
                </div>
              </div>

              {/* Group */}
              <div>
                <label className="text-[10px] text-slate-600 uppercase font-semibold tracking-wide block mb-1.5">Grupă</label>
                <div className="relative">
                  <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                  <input
                    value={group}
                    onChange={e => setGroup(e.target.value)}
                    className="input-base pl-8"
                    placeholder="ex: B1, B3, C2..."
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="text-[10px] text-slate-600 uppercase font-semibold tracking-wide block mb-1.5">Interese (virgulă)</label>
                <input
                  value={interests}
                  onChange={e => setInterests(e.target.value)}
                  className="input-base"
                  placeholder="ex: AI, web dev, mobile..."
                />
              </div>

              {/* GitHub + LinkedIn — only for IT faculties */}
              {showSocialLinks && (
                <>
                  <div>
                    <label className="text-[10px] text-slate-600 uppercase font-semibold tracking-wide block mb-1.5">GitHub</label>
                    <div className="relative">
                      <Github size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                      <input
                        value={github}
                        onChange={e => setGithub(e.target.value)}
                        className="input-base pl-8"
                        placeholder="username sau link..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-600 uppercase font-semibold tracking-wide block mb-1.5">LinkedIn</label>
                    <div className="relative">
                      <Linkedin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                      <input
                        value={linkedin}
                        onChange={e => setLinkedin(e.target.value)}
                        className="input-base pl-8"
                        placeholder="username sau link..."
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Save */}
              <button
                onClick={handleSave}
                className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
              >
                {saved ? (
                  <><GraduationCap size={14} /> Salvat!</>
                ) : (
                  <><Save size={14} /> Salvează modificările</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ platformMode = 'academic', currentView, onNavigate, profile, session, open, onClose, onlineCount = 0 }) {
  const { logout } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const university = session?.university
  const theme = getUniversityTheme(university)
  const nav = NAV_BY_MODE[platformMode] || NAV_BY_MODE.academic
  const modeCopy = MODE_COPY[platformMode] || MODE_COPY.academic
  const ModeIcon = modeCopy.icon
  const displayName = profile?.name || session?.email?.split('@')[0] || 'Student'
  const facultyLabel = profile?.faculty || session?.detectedFaculty?.name || university?.shortName || 'FII'
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const sidebarContent = (
    <aside
      className="w-60 flex flex-col h-full shrink-0 border-r border-white/[0.05]"
      style={{
        background: 'linear-gradient(180deg, #070c18 0%, #060a14 100%)',
      }}
    >

      {/* Brand */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-[1.5px] rounded-[0.85rem] bg-gradient-to-b from-white/15 to-white/[0.03]">
            <div
              className="w-9 h-9 rounded-[0.75rem] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
              style={{
                background: `linear-gradient(140deg, ${theme.accent}ee, ${theme.accentStrong || theme.accent}aa)`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px ${theme.accent}30`,
              }}
            >
              <ModeIcon size={16} className="text-white" strokeWidth={2} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-[13px] leading-tight tracking-tight">{modeCopy.name}</p>
            <p className="text-[11px] text-slate-600 font-medium">{modeCopy.subtitle}</p>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="sm:hidden w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-all"
          >
            <X size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* University pill */}
      {university && (
        <div className="px-4 pb-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-semibold"
            style={{
              background: university.color + '0c',
              borderColor: university.color + '22',
              color: university.color,
            }}
          >
            <span className="text-xs leading-none">{university.avatar}</span>
            <span className="truncate">{university.shortName}</span>
          </div>
        </div>
      )}

      {/* Gradient separator */}
      <div className="mx-4 mb-4">
        <div className="gradient-separator" />
      </div>

      {/* Nav */}
      <nav key={platformMode} className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <p className="section-label px-3 pb-3">{modeCopy.label}</p>

        {nav.map(({ id, label, icon: Icon }, i) => {
          const badge = id === 'messages' && onlineCount > 0 ? onlineCount : null
          const active = currentView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{ animationDelay: `${i * 40}ms` }}
              className={clsx(
                'nav-item group',
                active && 'nav-item-active',
              )}
            >
              {active && (
                <>
                  {/* Left accent bar */}
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ background: theme.accent }}
                  />
                  {/* Glow behind icon */}
                  <span
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg blur-md opacity-20"
                    style={{ background: theme.accent }}
                  />
                </>
              )}
              <Icon
                size={16}
                strokeWidth={active ? 2 : 1.75}
                className={clsx(
                  'relative transition-colors',
                  active ? 'text-white' : 'text-slate-600 group-hover:text-slate-400',
                )}
                style={active ? { color: theme.accent } : undefined}
              />
              <span className="flex-1 text-left text-[13px] relative">{label}</span>
              {badge && (
                <span
                  className="min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ background: theme.accent }}
                >
                  {badge}
                </span>
              )}
              {!active && !badge && (
                <ChevronRight size={12} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Gradient separator */}
      <div className="mx-4 mt-2">
        <div className="gradient-separator" />
      </div>

      {/* User card */}
      <div className="p-3 pt-2">
        <div
          className="rounded-xl p-3"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowProfile(true)}
              className="relative w-8 h-8 rounded-[0.6rem] flex items-center justify-center text-white text-[11px] font-bold shrink-0 hover:opacity-80 transition-opacity group"
              style={{
                background: `linear-gradient(140deg, ${theme.accent}dd, ${theme.accentStrong || theme.accent}88)`,
                boxShadow: `0 2px 8px ${theme.accent}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
              }}
              title="Editează profilul"
            >
              {initials}
              <span className="absolute inset-0 rounded-[0.6rem] flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 size={10} className="text-white" />
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-slate-200 truncate leading-tight">{displayName}</p>
              <p className="text-[11px] text-slate-600 truncate mt-0.5">{facultyLabel}</p>
            </div>

            <button
              onClick={logout}
              title="Deconectare"
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 hover:text-red-400 hover:bg-red-400/[0.08] transition-all duration-200"
            >
              <LogOut size={13} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden sm:block h-full shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile: overlay drawer */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <div className="relative animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}

      {showProfile && (
        <ProfileModal
          profile={profile}
          session={session}
          theme={theme}
          initials={initials}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  )
}
