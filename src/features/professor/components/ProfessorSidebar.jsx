import clsx from 'clsx'
import { LogOut } from 'lucide-react'
import { NAV } from '../constants/nav'

export default function ProfessorSidebar({ current, onNavigate, onLogout, profile }) {
  return (
    <aside className="hidden sm:flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#070b14]">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-200 font-bold text-base shadow-[0_0_16px_rgba(245,158,11,0.15)]">
              {profile.avatar}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-[#070b14]" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white truncate">Portal Profesor</p>
            <p className="text-[11px] text-slate-600 truncate">AC · TUIASI</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={clsx(
              'w-full h-10 rounded-xl px-3 flex items-center gap-3 text-[13px] font-semibold transition-all duration-150 text-left',
              current === id
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]',
            )}
          >
            <Icon size={15} className={current === id ? 'text-amber-400' : ''} />
            {label}
          </button>
        ))}
      </nav>

      {/* Profile card */}
      <div className="p-3">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
          <p className="text-[13px] font-semibold text-slate-200 truncate">{profile.name}</p>
          <p className="text-[11px] text-slate-600 truncate mt-0.5">{profile.email}</p>
          <div className="gradient-separator mt-3 mb-3" />
          <button
            onClick={onLogout}
            className="h-8 w-full rounded-lg border border-white/[0.07] bg-white/[0.03] text-[12px] font-semibold text-slate-500 hover:text-white hover:bg-white/[0.06] flex items-center justify-center gap-2 transition-all duration-150"
          >
            <LogOut size={12} />
            Iesire
          </button>
        </div>
      </div>
    </aside>
  )
}
