import { ArrowRight, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ConfirmedStep({ university, onContinue, isReturning }) {
  const { t } = useTranslation()
  return (
    <div className="text-center space-y-5">
      <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto">
        <Check size={24} className="text-emerald-400" strokeWidth={2} />
      </div>
      <div>
        <p className="text-[17px] font-bold text-white mb-3">
          {isReturning ? t('auth.welcomeBack') : t('auth.welcomeNew')}
        </p>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[12px] font-semibold"
          style={{ background: university.color + '12', borderColor: university.color + '35', color: university.color }}
        >
          <span>{university.shortName}</span>
        </div>
      </div>
      <p className="text-[13px] text-slate-500 leading-relaxed">
        {isReturning ? t('auth.foundProfile') : t('auth.newUserProfile')}
      </p>
      <button
        onClick={onContinue}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-[13px] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_0_1px_rgba(99,102,241,0.3)]"
      >
        {isReturning ? t('auth.enterAccount') : t('auth.startSetup')} <ArrowRight size={15} />
      </button>
    </div>
  )
}
