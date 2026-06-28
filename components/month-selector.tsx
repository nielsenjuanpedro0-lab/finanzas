'use client'

import { useRouter, usePathname } from 'next/navigation'

const MONTH_LABELS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function getLast6Months() {
  const months = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`
    months.push({ value, label })
  }
  return months
}

export function MonthSelector({ currentMonth }: { currentMonth: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const months = getLast6Months()

  return (
    <select
      value={currentMonth}
      onChange={(e) => router.push(`${pathname}?mes=${e.target.value}`)}
      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white"
    >
      {months.map(m => (
        <option key={m.value} value={m.value}>{m.label}</option>
      ))}
    </select>
  )
}
