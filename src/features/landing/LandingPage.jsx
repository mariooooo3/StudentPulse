import { Compass, Map, Calendar, BookOpen, Users, ArrowRight, Sparkles, Shield, MessageSquare, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { UNIVERSITIES } from '../../shared/config/universities'

const FEATURES = [
  { icon: Map,          label: 'Campus Navigator', desc: 'Găsești orice sală în câteva secunde',          color: '#6366f1' },
  { icon: Calendar,     label: 'Schedule Hub',     desc: 'Orar, recuperări și transfer de grupă',          color: '#10b981' },
  { icon: BookOpen,     label: 'Thesis Finder',    desc: 'Profesori disponibili pentru licență, live',     color: '#f59e0b' },
  { icon: Users,        label: 'Peer Tutoring',    desc: 'Colegii care te ajută să treci examenele',       color: '#f43f5e' },
  { icon: MessageSquare,label: 'Mesaje',           desc: 'Comunicare directă cu profesori și colegi',      color: '#3b82f6' },
  { icon: MapPin,       label: 'Viața în Oraș',    desc: 'Sconturi, transport, zone sigure, housing',      color: '#a855f7' },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:  { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 18 } },
}

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-[#050810] text-slate-100 flex flex-col overflow-hidden relative">

      {/* ── Fundal orbs ─────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[140px] opacity-[0.15]"
          style={{ background: 'radial-gradient(circle, #6366f1, #a855f7)' }}
        />
        <div className="absolute bottom-0 left-[-5%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.08]" style={{ background: '#10b981' }} />
        <div className="absolute bottom-0 right-[-5%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.08]" style={{ background: '#f59e0b' }} />
        {/* Grilă subtilă */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="p-[1.5px] rounded-[0.75rem] bg-gradient-to-b from-white/20 to-white/[0.04]">
            <div className="w-8 h-8 rounded-[calc(0.75rem-1.5px)] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Compass size={15} className="text-white" strokeWidth={2} />
            </div>
          </div>
          <span className="font-bold text-white text-[14px] tracking-tight">StudentCompass</span>
        </div>

        <button
          onClick={onStart}
          className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[13px] font-semibold text-slate-300 hover:bg-white/[0.1] hover:text-white transition-all duration-200"
        >
          Intră în cont
        </button>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 65, damping: 18 }}
          className="flex flex-col items-center"
        >
          {/* Badge universități */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[11px] font-semibold mb-8 tracking-wide">
            <Sparkles size={11} strokeWidth={2.5} />
            Disponibil pentru {UNIVERSITIES.length} universități din România
          </div>

          {/* Logo mare */}
          <div className="p-[2px] rounded-[1.4rem] bg-gradient-to-b from-white/25 to-white/[0.04] w-fit mx-auto mb-8 shadow-[0_0_60px_rgba(99,102,241,0.25)]">
            <div className="w-24 h-24 rounded-[calc(1.4rem-2px)] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
              <Compass size={44} className="text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* Titlu */}
          <h1 className="text-[3.2rem] sm:text-[4rem] font-bold text-white tracking-tight leading-none mb-4">
            Student<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Compass</span>
          </h1>

          <p className="text-lg text-slate-400 font-medium mb-3">De la pierdut, la acasă.</p>

          <p className="text-[13px] text-slate-600 max-w-md mx-auto mb-10 leading-relaxed">
            Platforma academică personalizată pentru studenții din România.
            Orar, licență, tutoring, navigare campus — totul într-un singur loc,
            adaptat pe facultatea și nevoile tale.
          </p>

          {/* CTA principal */}
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[15px] transition-colors duration-200 shadow-[0_0_0_1px_rgba(99,102,241,0.5),0_8px_40px_rgba(99,102,241,0.4)]"
          >
            Începe acum
            <ArrowRight size={18} strokeWidth={2.5} />
          </motion.button>

          <p className="text-[11px] text-slate-700 mt-4 flex items-center gap-1.5 justify-center">
            <Shield size={10} strokeWidth={1.75} />
            Acces exclusiv prin email instituțional
          </p>
        </motion.div>

        {/* ── Features grid ──────────────────────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-16 max-w-2xl w-full"
        >
          {FEATURES.map(({ icon: Icon, label, desc, color }) => (
            <motion.div
              key={label}
              variants={itemVariants}
              className="p-4 text-left rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                style={{ background: color + '20' }}
              >
                <Icon size={16} strokeWidth={1.75} style={{ color }} />
              </div>
              <p className="text-[13px] font-semibold text-slate-200 mb-1 leading-tight">{label}</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 text-center py-5 text-[11px] text-slate-800 border-t border-white/[0.03]">
        StudentCompass v2.0 &middot; Prototip academic
      </footer>
    </div>
  )
}
