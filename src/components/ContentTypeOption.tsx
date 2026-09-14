import type { ReactNode } from 'react'

interface Props {
  label: string
  icon: ReactNode
  selected: boolean
  onSelect: () => void
}

export function ContentTypeOption({ label, icon, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={label}
      title={label}
      className={`flex flex-col items-center gap-1 rounded-lg border px-1.5 py-1 transition ${
        selected
          ? 'border-primary bg-primary/10 dark:border-primary-light dark:bg-primary/20'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800'
      }`}
    >
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center text-slate-600 dark:text-slate-300"
      >
        {icon}
      </span>
      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{label}</span>
    </button>
  )
}
