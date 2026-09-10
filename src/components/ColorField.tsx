interface Props {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}

export function ColorField({ id, label, value, onChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs uppercase text-slate-500 dark:text-slate-400">
          {value}
        </span>
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border border-slate-300 bg-transparent p-0.5 dark:border-slate-700"
        />
      </div>
    </div>
  )
}
