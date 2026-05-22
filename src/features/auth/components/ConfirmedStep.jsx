import { ArrowRight, Check } from 'lucide-react'

export default function ConfirmedStep({ university, onContinue, isReturning }) {
  return (
    <div className="text-center space-y-5">
      <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto">
        <Check size={24} className="text-emerald-400" strokeWidth={2} />
      </div>
      <div>
        <p className="text-[17px] font-bold text-white mb-3">
          {isReturning ? 'Bun venit Ã®napoi!' : 'Bun venit la StudentCompass!'}
        </p>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[12px] font-semibold"
          style={{ background: university.color + '12', borderColor: university.color + '35', color: university.color }}
        >
          <span>{university.shortName}</span>
        </div>
      </div>
      <p className="text-[13px] text-slate-500 leading-relaxed">
        {isReturning
          ? 'Am gÄƒsit profilul tÄƒu. Totul e gata â€” poÈ›i intra direct Ã®n cont.'
          : 'Am detectat profilul tÄƒu universitar. UrmeazÄƒ cÃ¢teva Ã®ntrebÄƒri rapide ca sÄƒ personalizÄƒm experienÈ›a Ã®n funcÈ›ie de facultatea È™i nevoile tale.'}
      </p>
      <button
        onClick={onContinue}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-[13px] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_0_1px_rgba(99,102,241,0.3)]"
      >
        {isReturning ? 'IntrÄƒ Ã®n cont' : 'ÃŽncepe setup-ul profilului'} <ArrowRight size={15} />
      </button>
    </div>
  )
}
