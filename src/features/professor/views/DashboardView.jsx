import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { BookOpen, CalendarClock, Clock, MessageSquare, UserCheck } from 'lucide-react'
import { consultationHoursFor } from '../utils/professorUtils'

export default function DashboardView({ requests, recoveryRequests, threads, professor, onNavigate }) {
  const { t } = useTranslation()
  const pending = requests.filter(r => r.status === 'pending')
  const accepted = requests.filter(r => r.status === 'accepted')
  const pendingRecovery = recoveryRequests.filter(r => r.status === 'pending')

  return (
    <div className="p-6 space-y-5">
      {/* Welcome banner */}
      <section className="relative rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.09] to-amber-600/[0.04] p-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.12),transparent_60%)]" />
        <p className="section-label text-amber-400 mb-2">{t('professor.dashboard.greeting')}</p>
        <h2 className="text-2xl font-bold text-white tracking-tight">{professor.name}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{professor.domain}. {t('professor.dashboard.overviewNote')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {professor.research?.slice(0, 4).map(item => (
            <span key={item} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-300">
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('professor.dashboard.statNewRequests'), value: pending.length, Icon: BookOpen, target: 'thesis' },
          { label: t('professor.dashboard.statAccepted'), value: accepted.length, Icon: UserCheck, target: null },
          { label: t('professor.dashboard.statNewRecovery'), value: pendingRecovery.length, Icon: CalendarClock, target: 'recovery' },
          { label: t('professor.dashboard.statConversations'), value: threads.length, Icon: MessageSquare, target: 'messages' },
        ].map(({ label, value, Icon, target }) => (
          <button
            key={label}
            onClick={() => target && onNavigate(target)}
            className={clsx(
              'rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-left transition-all duration-150',
              target ? 'hover:border-amber-500/20 hover:bg-amber-500/[0.04] hover:-translate-y-px cursor-pointer' : 'cursor-default',
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Icon size={14} className="text-amber-400" />
              </div>
              {value > 0 && target && (
                <span className="badge-amber text-[9px]">{value} {t('professor.dashboard.statBadgeNew')}</span>
              )}
            </div>
            <p className="text-2xl font-bold text-white font-mono">{value}</p>
            <p className="text-[11px] text-slate-600 mt-1">{label}</p>
          </button>
        ))}
      </div>

      {/* Courses + Consultations */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
            <p className="text-sm font-bold text-white">{t('professor.dashboard.activeCourses')}</p>
            <button onClick={() => onNavigate('profile')} className="text-[12px] font-semibold text-amber-400 hover:text-amber-300 transition-colors">
              {t('professor.dashboard.editProfile')}
            </button>
          </div>
          {professor.courses?.map(course => (
            <div key={course.id} className="px-4 py-3 border-b border-white/[0.04] last:border-b-0 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <BookOpen size={14} className="text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-200 truncate">{course.name}</p>
                <p className="text-xs text-slate-600 truncate">{course.groups.join(', ')} · {course.room}</p>
              </div>
              <span className="text-xs text-slate-500 shrink-0">{course.next}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05]">
            <p className="text-sm font-bold text-white">{t('professor.dashboard.consultationSchedule')}</p>
          </div>
          {consultationHoursFor(professor).map(slot => (
            <div key={slot.id} className="px-4 py-3 border-b border-white/[0.04] last:border-b-0">
              <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Clock size={13} className="text-amber-400 shrink-0" />
                {slot.day}, {slot.time}
              </p>
              <p className="text-xs text-slate-600 mt-1 ml-5">{slot.place} · {slot.mode} · {t('professor.dashboard.seats', { count: slot.capacity })}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent requests */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
          <p className="text-sm font-bold text-white">{t('professor.dashboard.recentRequests')}</p>
          <button onClick={() => onNavigate('thesis')} className="text-[12px] font-semibold text-amber-400 hover:text-amber-300 transition-colors">
            {t('professor.dashboard.viewAll')}
          </button>
        </div>
        {requests.slice(0, 4).length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-600">{t('professor.dashboard.noRequests')}</div>
        ) : (
          requests.slice(0, 4).map(request => (
            <div key={request.id} className="px-4 py-3 border-b border-white/[0.04] last:border-b-0 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[11px] font-bold text-amber-300">
                {request.studentName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-200 truncate">{request.studentName}</p>
                <p className="text-xs text-slate-600 truncate">{request.idea}</p>
              </div>
              <span className={clsx(
                'rounded-full px-2.5 py-1 text-[10px] font-bold',
                request.status === 'pending' ? 'bg-amber-500/15 text-amber-300'
                  : request.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300'
                  : 'bg-red-500/15 text-red-300',
              )}>
                {t(`thesis.status.${request.status}`, { defaultValue: request.status })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
