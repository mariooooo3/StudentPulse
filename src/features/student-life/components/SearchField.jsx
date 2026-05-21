import { Search } from 'lucide-react'

export default function SearchField({ value, onChange, placeholder }) {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">{placeholder}</span>
      <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" strokeWidth={1.75} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base h-10 pl-9"
      />
    </label>
  )
}
