import { useState } from 'react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { Check, FileText, X } from 'lucide-react'

export default function ThesisView({ requests, onDecision }) {
  const { t } = useTranslation()
  const [noteById, setNoteById] = useState({})

  return (
    <div className="p-6 space-y-4">
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <FileText size={32} className="mx-auto text-slate-700 mb-3" />
          <p className="text-sm font-semibold text-slate-400">{t('professor.thesis.noRequests')}</p>
          <p className="text-xs text-slate-700 mt-1">{t('professor.thesis.noRequestsHint')}</p>
        </div>
      ) : (
        requests.map(request => (
          <article key={request.id} className="premium-card p-5">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Left: student info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-300">
                    {request.studentName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <h3 className="font-bold text-white">{request.studentName}</h3>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold text-slate-400">
                    {request.facultyName || 'FMIM'}
                  </span>
                  <span className={clsx(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                    request.status === 'pending' ? 'bg-amber-500/15 text-amber-300'
                      : request.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-red-500/15 text-red-300',
                  )}>
                    {t(`thesis.status.${request.status}`, { defaultValue: request.status })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4 ml-10">{request.studentEmail}</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/[0.05] bg-[#070b14]/60 p-3">
                    <p className="section-label mb-2">{t('professor.thesis.ideaLabel')}</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{request.idea}</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.05] bg-[#070b14]/60 p-3">
                    <p className="section-label mb-2">{t('professor.thesis.motivationLabel')}</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{request.motivation}</p>
                  </div>
                </div>

                {request.file && (
                  <p className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
                    <FileText size={12} />
                    {request.file.name} · {(request.file.size / 1024).toFixed(0)} KB
                  </p>
                )}
              </div>

              {/* Right: action or response */}
              {request.status === 'pending' ? (
                <div className="lg:w-72 space-y-2.5">
                  <textarea
                    value={noteById[request.id] || ''}
                    onChange={e => setNoteById(prev => ({ ...prev, [request.id]: e.target.value }))}
                    placeholder={t('professor.thesis.optionalNote')}
                    rows={3}
                    className="input-base w-full resize-none text-sm focus:border-amber-500/40"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onDecision(request.id, 'accepted', noteById[request.id] || t('professor.thesis.defaultAcceptNote'))}
                      className="h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-600/30 hover:-translate-y-px transition-all duration-150"
                    >
                      <Check size={13} />
                      {t('professor.thesis.accept')}
                    </button>
                    <button
                      onClick={() => onDecision(request.id, 'rejected', noteById[request.id] || t('professor.thesis.defaultRejectNote'))}
                      className="h-10 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-600/30 hover:-translate-y-px transition-all duration-150"
                    >
                      <X size={13} />
                      {t('professor.thesis.reject')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="lg:w-72 rounded-xl border border-white/[0.05] bg-[#070b14]/60 p-3">
                  <p className="section-label mb-2">{t('professor.thesis.responseLabel')}</p>
                  <p className="text-sm text-slate-300">{request.professorNote || t('professor.thesis.noNote')}</p>
                </div>
              )}
            </div>
          </article>
        ))
      )}
    </div>
  )
}
