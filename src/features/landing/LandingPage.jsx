import { Compass, Map, Calendar, BookOpen, Users, ArrowRight, Sparkles, Shield, MessageSquare, MapPin, GraduationCap, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { UNIVERSITIES } from '../../shared/config/universities'

const FEATURES = [
  { icon: Map,           label: 'Campus Navigator',  desc: 'Găsești orice sală în câteva secunde cu hartă live și AI chat.',  color: '#6366f1', num: '01' },
  { icon: Calendar,      label: 'Schedule Hub',      desc: 'Orar personalizat, recuperări și transfer de grupă automat.',      color: '#10b981', num: '02' },
  { icon: BookOpen,      label: 'Thesis Finder',     desc: 'Profesori disponibili pentru licență, cu locuri în timp real.',    color: '#f59e0b', num: '03' },
  { icon: Users,         label: 'Peer Tutoring',     desc: 'Sesiuni 1-la-1 și Skill Swap cu colegii care te ajută.',          color: '#f43f5e', num: '04' },
  { icon: MessageSquare, label: 'Mesaje',            desc: 'Comunicare directă și securizată cu profesori și colegi.',         color: '#3b82f6', num: '05' },
  { icon: MapPin,        label: 'Viața în Oraș',     desc: 'Sconturi, transport, zone sigure și ghid complet de housing.',     color: '#a855f7', num: '06' },
]

const STATS = [
  { val: UNIVERSITIES.length + '+', label: 'Universități' },
  { val: '6',   label: 'Module' },
  { val: '100%', label: 'Gratuit' },
  { val: 'Live', label: 'Real-time' },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 18 } },
}

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-[#050810] text-slate-100 flex flex-col overflow-hidden relative">

      {/* ── Background ────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary glow */}
        <div
          className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full blur-[180px] animate-glow-pulse"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.5) 0%, rgba(139,92,246,0.25) 40%, transparent 70%)' }}
        />
        {/* Side orbs */}
        <div
          className="absolute top-[45%] -left-[15%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.08]"
          style={{ background: '#10b981' }}
        />
        <div
          className="absolute top-[55%] -right-[15%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.08]"
          style={{ background: '#6366f1' }}
        />
        {/* Grid lines */}
        <div className="absolute inset-0 grid-lines" />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-60" />
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 inset-x-0 h-64"
          style={{ background: 'linear-gradient(to top, #050810 0%, transparent 100%)' }}
        />
        {/* Top vignette */}
        <div
          className="absolute top-0 inset-x-0 h-32"
          style={{ background: 'linear-gradient(to bottom, rgba(5,8,16,0.6) 0%, transparent 100%)' }}
        />
      </div>

      {/* ── Header ────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="p-[1.5px] rounded-[0.75rem] bg-gradient-to-b from-white/25 to-white/[0.04]">
            <div className="w-8 h-8 rounded-[calc(0.75rem-1.5px)] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.15)]">
              <Compass size={15} className="text-white" strokeWidth={2} />
            </div>
          </div>
          <span className="font-bold text-white text-[14px] tracking-tight">StudentCompass</span>
        </div>

        <button
          onClick={onStart}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] font-semibold text-slate-400 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.14] transition-all duration-200"
        >
          Intră în cont
          <ArrowRight size={13} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 120, damping: 20 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/[0.07] text-indigo-300 text-[11px] font-semibold mb-10 tracking-wide"
          >
            <Sparkles size={10} strokeWidth={2.5} className="text-indigo-400" />
            Disponibil pentru {UNIVERSITIES.length} universități din România
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse-slow ml-0.5" />
          </motion.div>

          {/* Logo with float animation */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative mb-10"
          >
            <div
              className="absolute inset-0 rounded-[1.7rem] blur-2xl opacity-60"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6), rgba(139,92,246,0.3))' }}
            />
            <div className="relative p-[2px] rounded-[1.6rem] bg-gradient-to-b from-white/30 to-white/[0.04]">
              <div className="w-28 h-28 rounded-[calc(1.6rem-2px)] bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-[inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-2px_0_rgba(0,0,0,0.2)]">
                <Compass size={52} className="text-white drop-shadow-lg" strokeWidth={1.5} />
              </div>
            </div>
          </motion.div>

          {/* Main heading */}
          <h1 className="text-[3.8rem] sm:text-[5.5rem] font-bold tracking-[-0.03em] leading-none mb-5 text-balance">
            <span className="text-white">Student</span>
            <span className="text-gradient-indigo">Compass</span>
          </h1>

          {/* Tagline */}
          <p className="text-[1.4rem] sm:text-[1.75rem] font-bold tracking-tight mb-4">
            <span className="text-gradient-white">De la pierdut, la </span>
            <span
              className="italic"
              style={{
                background: 'linear-gradient(90deg, #818cf8, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              acasă.
            </span>
          </p>

          {/* Description */}
          <p className="text-[14px] text-slate-500 max-w-sm mx-auto mb-10 leading-relaxed font-medium">
            Platforma academică personalizată pentru studenții din România.
            Orar, licență, tutoring și navigare campus — totul într-un loc.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4">
            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative inline-flex items-center gap-3 px-9 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[15px] transition-colors duration-200 overflow-hidden group"
              style={{
                boxShadow: '0 0 0 1px rgba(99,102,241,0.5), 0 8px 40px rgba(99,102,241,0.45), 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              {/* Shimmer */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s linear infinite',
                }}
              />
              <Zap size={16} strokeWidth={2.5} className="relative" />
              <span className="relative">Începe acum</span>
              <ArrowRight size={18} strokeWidth={2.5} className="relative group-hover:translate-x-0.5 transition-transform duration-200" />
            </motion.button>

            <p className="text-[11px] text-slate-700 flex items-center gap-2 justify-center flex-wrap">
              <Shield size={10} strokeWidth={1.75} />
              Email instituțional
              <span className="text-slate-800">·</span>
              <GraduationCap size={10} strokeWidth={1.75} />
              100% gratuit
              <span className="text-slate-800">·</span>
              <Sparkles size={10} strokeWidth={1.75} />
              AI-powered
            </p>
          </div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 80, damping: 18 }}
            className="flex items-center gap-6 mt-12 mb-2"
          >
            {STATS.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="font-mono text-[1.4rem] font-bold text-white leading-none">{s.val}</span>
                <span className="text-[10px] text-slate-600 font-semibold mt-1 tracking-wide">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Features grid ───────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-16 max-w-3xl w-full"
        >
          {FEATURES.map(({ icon: Icon, label, desc, color, num }) => (
            <motion.div
              key={label}
              variants={itemVariants}
              className="group relative p-5 text-left rounded-2xl border border-white/[0.05] bg-white/[0.015] hover:border-white/[0.11] hover:bg-white/[0.04] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden cursor-default"
            >
              {/* Number */}
              <span className="absolute top-3.5 right-4 text-[10px] font-bold font-mono text-slate-800 tabular-nums select-none">{num}</span>

              {/* Radial glow on hover */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse at 20% 20%, ${color}14, transparent 70%)` }}
              />

              {/* Colored top border */}
              <div
                className="absolute top-0 left-4 right-4 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
              />

              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                style={{
                  background: color + '16',
                  border: `1px solid ${color}28`,
                }}
              >
                <Icon size={16} strokeWidth={1.75} style={{ color }} />
              </div>

              <p className="text-[13px] font-bold text-slate-200 mb-1.5 leading-tight">{label}</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── University strip ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-16 w-full max-w-3xl"
        >
          <p className="section-label mb-5 text-center">Universități partenere</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {UNIVERSITIES.map(u => (
              <div
                key={u.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.025] border border-white/[0.05] text-[11px] font-semibold hover:bg-white/[0.05] hover:border-white/[0.09] transition-all duration-200 cursor-default"
                style={{ color: u.color }}
              >
                <span className="text-xs leading-none">{u.avatar}</span>
                <span className="text-slate-400">{u.shortName}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="relative z-10 py-6 border-t border-white/[0.04]">
        <div className="gradient-separator mb-5" />
        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-800">
          <span>StudentCompass v2.0</span>
          <span className="opacity-40">·</span>
          <span>Prototip academic</span>
          <span className="opacity-40">·</span>
          <span>România 🇷🇴</span>
        </div>
      </footer>
    </div>
  )
}
