import { Compass, Map, Calendar, BookOpen, Users, ArrowRight, Sparkles, Shield, MessageSquare, GraduationCap, Zap, ChevronRight, Heart, Briefcase, Bell, Bot, ClipboardCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { UNIVERSITIES } from '../../shared/config/universities'

const FEATURES = [
  {
    icon: Map,
    label: 'Campus Navigator',
    desc: 'Hartă live, AI chat, routing pedestrian și recunoaștere vizuală a clădirilor.',
    color: '#6366f1',
    num: '01',
    span: 'sm:col-span-2',
    size: 'large',
  },
  {
    icon: Calendar,
    label: 'Schedule Hub',
    desc: 'Orar personal, recuperări și transfer de grupă în timp real.',
    color: '#10b981',
    num: '02',
  },
  {
    icon: BookOpen,
    label: 'Thesis Finder',
    desc: 'Profesori disponibili pentru licență, cu locuri și status live.',
    color: '#f59e0b',
    num: '03',
  },
  {
    icon: Users,
    label: 'Peer Tutoring',
    desc: 'Sesiuni 1-la-1, grupuri și Skill Swap automat cu colegii.',
    color: '#f43f5e',
    num: '04',
  },
  {
    icon: MessageSquare,
    label: 'Mesaje',
    desc: 'Chat direct cu profesori și colegi, canale de facultate live.',
    color: '#3b82f6',
    num: '05',
  },
  {
    icon: Heart,
    label: 'Focus & Tools',
    desc: 'Focus Forest, Pomodoro, Budget Tracker, Book Exchange si Carpool.',
    color: '#10b981',
    num: '06',
  },
  {
    icon: Briefcase,
    label: 'Carieră & Comunitate',
    desc: 'Internship-uri, evenimente studențești, cluburi și mentori.',
    color: '#8b5cf6',
    num: '07',
  },
  {
    icon: ClipboardCheck,
    label: 'Campus Pulse',
    desc: 'Noutati live din campus, aglomeratie, evenimente si recomandari pentru momentul zilei.',
    color: '#14b8a6',
    num: '08',
    span: 'sm:col-span-2',
  },
  {
    icon: Bot,
    label: 'Asistent AI',
    desc: 'Asistent virtual care navighează aplicația din comenzi în limbaj natural.',
    color: '#06b6d4',
    num: '09',
  },
  {
    icon: Bell,
    label: 'Notificări Live',
    desc: 'Push-uri instant pentru teze, swap-uri, mesaje și recuperări.',
    color: '#f59e0b',
    num: '10',
  },
]

const STATS = [
  { val: `${UNIVERSITIES.length}+`, label: 'Universități' },
  { val: '10+', label: 'Module' },
  { val: '100%', label: 'Gratuit' },
  { val: 'Live', label: 'Real-time' },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 80, damping: 18 } },
}

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-[#050810] text-slate-100 flex flex-col overflow-hidden relative">

      {/* ── Background ────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary orb */}
        <div
          className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full blur-[200px] animate-glow-pulse"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.45) 0%, rgba(139,92,246,0.2) 45%, transparent 72%)' }}
        />
        {/* Left accent */}
        <div
          className="absolute top-[40%] -left-[18%] w-[600px] h-[600px] rounded-full blur-[130px] opacity-[0.07]"
          style={{ background: '#10b981' }}
        />
        {/* Right accent */}
        <div
          className="absolute top-[50%] -right-[18%] w-[600px] h-[600px] rounded-full blur-[130px] opacity-[0.07]"
          style={{ background: '#6366f1' }}
        />
        {/* Grid lines */}
        <div className="absolute inset-0 grid-lines" />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-50" />
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 inset-x-0 h-80"
          style={{ background: 'linear-gradient(to top, #050810 0%, transparent 100%)' }}
        />
        {/* Top vignette */}
        <div
          className="absolute top-0 inset-x-0 h-40"
          style={{ background: 'linear-gradient(to bottom, rgba(5,8,16,0.7) 0%, transparent 100%)' }}
        />
      </div>

      {/* ── Header ────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="p-[1.5px] rounded-[0.85rem] bg-gradient-to-b from-white/30 to-white/[0.04]">
            <div
              className="w-9 h-9 rounded-[calc(0.85rem-1.5px)] flex items-center justify-center"
              style={{
                background: 'linear-gradient(140deg, #6366f1, #7c3aed)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15), 0 4px 12px rgba(99,102,241,0.4)',
              }}
            >
              <Compass size={17} className="text-white" strokeWidth={2} />
            </div>
          </div>
          <div>
            <span className="font-bold text-white text-[14px] tracking-tight leading-none block">StudentCompass</span>
            <span className="text-[10px] text-slate-600 font-medium leading-none">Academic Platform</span>
          </div>
        </div>

        <button
          onClick={onStart}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.09] text-[13px] font-semibold text-slate-400 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.16] transition-all duration-200"
        >
          Intră în cont
          <ChevronRight size={13} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center text-center px-6 pt-6 pb-28">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 55, damping: 18 }}
          className="flex flex-col items-center w-full max-w-4xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.08, type: 'spring', stiffness: 140, damping: 22 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/[0.07] text-indigo-300 text-[11px] font-semibold mb-12 tracking-wide"
          >
            <span className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                style={{ animation: 'pulse-dot 2s ease-in-out infinite' }}
              />
              Disponibil pentru {UNIVERSITIES.length} universități din România
            </span>
            <Sparkles size={10} strokeWidth={2.5} className="text-indigo-400 opacity-80" />
          </motion.div>

          {/* Logo */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="relative mb-12"
          >
            {/* ── Radar sweep ───────────────────────────────────── */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
              className="absolute pointer-events-none"
              style={{
                top: '50%', left: '50%',
                width: 210, height: 210,
                marginTop: -105, marginLeft: -105,
                borderRadius: '50%',
                background: 'conic-gradient(from 270deg, transparent 55%, rgba(99,102,241,0.55) 78%, rgba(139,92,246,0.12) 100%)',
              }}
            />

            {/* ── Sonar ping rings ──────────────────────────────── */}
            {[0, 1.0, 2.0].map((delay) => (
              <motion.div
                key={delay}
                animate={{ scale: [1, 2.4], opacity: [0.45, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut', delay }}
                className="absolute pointer-events-none rounded-[1.75rem] border border-indigo-500/40"
                style={{ top: '50%', left: '50%', width: 133, height: 133, marginTop: -66.5, marginLeft: -66.5 }}
              />
            ))}

            {/* ── Orbiting feature dots ─────────────────────────── */}
            {[
              { color: '#10b981', start: 0,   dur: 11, dir: 1  },
              { color: '#f59e0b', start: 90,  dur: 15, dir: -1 },
              { color: '#f43f5e', start: 180, dur: 9,  dir: 1  },
              { color: '#3b82f6', start: 270, dur: 13, dir: -1 },
            ].map(({ color, start, dur, dir }, i) => (
              <motion.div
                key={i}
                animate={{ rotate: [start, start + dir * 360] }}
                transition={{ duration: dur, repeat: Infinity, ease: 'linear' }}
                className="absolute pointer-events-none"
                style={{ top: '50%', left: '50%', width: 0, height: 0 }}
              >
                <div
                  style={{
                    position: 'absolute',
                    width: 9, height: 9,
                    borderRadius: '50%',
                    top: -88, left: -4.5,
                    background: color,
                    boxShadow: `0 0 14px ${color}cc, 0 0 5px ${color}`,
                  }}
                />
              </motion.div>
            ))}

            {/* ── Outer glow ────────────────────────────────────── */}
            <div
              className="absolute inset-[-12px] rounded-[2rem] blur-2xl animate-glow-pulse-fast pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.65), rgba(139,92,246,0.3), transparent 70%)' }}
            />

            {/* ── Bezel ─────────────────────────────────────────── */}
            <div className="relative p-[2.5px] rounded-[1.75rem] bg-gradient-to-b from-white/35 to-white/[0.03]">
              <div
                className="w-32 h-32 rounded-[calc(1.75rem-2.5px)] flex items-center justify-center"
                style={{
                  background: 'linear-gradient(140deg, #6366f1 0%, #4f46e5 40%, #7c3aed 100%)',
                  boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.25), 0 8px 32px rgba(99,102,241,0.5)',
                }}
              >
                {/* Needle-settle: overshoot, damp, lock — like a real compass finding north */}
                <motion.div
                  animate={{ rotate: [0, 22, -14, 8, -4, 1, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 4.5 }}
                >
                  <Compass size={56} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Heading */}
          <h1 className="text-[4rem] sm:text-[6rem] font-bold tracking-[-0.035em] leading-[0.92] mb-6 text-balance">
            <span className="text-white">Student</span>
            <span className="text-gradient-indigo">Compass</span>
          </h1>

          {/* Tagline */}
          <p className="text-[1.5rem] sm:text-[1.9rem] font-bold tracking-tight mb-5 leading-snug">
            <span className="text-gradient-white">De la pierdut,&nbsp;</span>
            <span
              className="italic"
              style={{
                background: 'linear-gradient(90deg, #818cf8 0%, #a855f7 50%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              la acasă.
            </span>
          </p>

          {/* Description */}
          <p className="text-[14px] text-slate-500 max-w-[360px] mx-auto mb-12 leading-relaxed font-medium">
            Platforma academică completă pentru studenții din România — orar, licență, tutoring și navigare campus, toate într-un singur loc.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 mb-14">
            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-[15px] overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%)',
                boxShadow: '0 0 0 1px rgba(99,102,241,0.5), 0 8px 48px rgba(99,102,241,0.5), 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.22)',
              }}
            >
              {/* Shimmer sweep */}
              <span
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.14) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                  animation: 'shine-sweep 2.5s ease-in-out infinite',
                }}
              />
              <Zap size={16} strokeWidth={2.5} className="relative" />
              <span className="relative">Începe acum — e gratuit</span>
              <ArrowRight size={17} strokeWidth={2.5} className="relative" />
            </motion.button>

            <div className="flex items-center gap-3 text-[11px] text-slate-700 flex-wrap justify-center">
              <span className="flex items-center gap-1.5">
                <Shield size={10} strokeWidth={1.75} />
                Email instituțional
              </span>
              <span className="text-slate-800">·</span>
              <span className="flex items-center gap-1.5">
                <GraduationCap size={10} strokeWidth={1.75} />
                100% gratuit
              </span>
              <span className="text-slate-800">·</span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={10} strokeWidth={1.75} />
                AI-powered
              </span>
            </div>
          </div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, type: 'spring', stiffness: 80, damping: 18 }}
            className="flex items-center gap-0 mb-20"
          >
            {STATS.map((s, i) => (
              <div key={s.label} className="flex items-center">
                <div className="flex flex-col items-center px-7 sm:px-10">
                  <span className="font-mono text-[1.6rem] sm:text-[1.8rem] font-bold text-white leading-none tracking-tight">{s.val}</span>
                  <span className="text-[10px] text-slate-600 font-semibold mt-1.5 tracking-[0.1em] uppercase">{s.label}</span>
                </div>
                {i < STATS.length - 1 && (
                  <div className="w-px h-10 bg-white/[0.07] shrink-0" />
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Bento Features grid ──────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl w-full"
        >
          {FEATURES.map(({ icon: Icon, label, desc, color, num, span, size }) => (
            <motion.div
              key={label}
              variants={itemVariants}
              className={`group relative p-5 text-left rounded-2xl border border-white/[0.05] bg-white/[0.015]
                hover:border-white/[0.11] hover:bg-white/[0.04]
                transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                overflow-hidden cursor-default
                ${span || ''} ${size === 'large' ? 'min-h-[140px]' : ''}`}
            >
              {/* Number */}
              <span className="absolute top-3.5 right-4 text-[10px] font-bold font-mono text-slate-800 tabular-nums select-none">{num}</span>

              {/* Radial hover glow */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse at 15% 15%, ${color}12, transparent 65%)` }}
              />

              {/* Top gradient line */}
              <div
                className="absolute top-0 left-6 right-6 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${color}70, transparent)` }}
              />

              {/* Left border accent */}
              <div
                className="absolute left-0 top-5 bottom-5 w-[2px] rounded-r-full opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                style={{ background: color }}
              />

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{
                  background: color + '18',
                  border: `1px solid ${color}30`,
                  boxShadow: `0 0 0 0 ${color}00`,
                }}
              >
                <Icon size={17} strokeWidth={1.75} style={{ color }} />
              </div>

              <p className="text-[13px] font-bold text-slate-200 mb-1.5 leading-tight">{label}</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">{desc}</p>

              {size === 'large' && (
                <div
                  className="flex items-center gap-1 mt-4 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200"
                  style={{ color }}
                >
                  Explorează <ArrowRight size={11} strokeWidth={2.5} />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* ── University strip ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="mt-20 w-full max-w-4xl"
        >
          <p className="section-label mb-6 text-center">Universități partenere</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {UNIVERSITIES.map(u => (
              <div
                key={u.id}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.025] border border-white/[0.05] text-[11px] font-semibold hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 cursor-default"
              >
                <span className="text-xs leading-none">{u.avatar}</span>
                <span className="text-slate-400">{u.shortName}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="relative z-10 py-8 border-t border-white/[0.04]">
        <div className="line-indigo mb-6 max-w-6xl mx-auto px-6" />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-[11px] text-slate-800">
          <div className="flex items-center gap-3">
            <span>StudentCompass v2.0</span>
            <span className="opacity-40">·</span>
            <span>Prototip academic</span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1">România <span>🇷🇴</span></span>
          </div>
          <span className="hidden sm:block opacity-40">·</span>
          <span className="text-slate-800">FiiPractic Hackathon 2026</span>
        </div>
      </footer>
    </div>
  )
}
