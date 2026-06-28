export const dynamic = 'force-dynamic'
import { getProfile } from '@/app/actions/profile'
import { getFixedExpenses } from '@/app/actions/fixed-expenses'
import { ProfileForm } from '@/components/profile-form'
import { FixedExpensesList } from '@/components/fixed-expenses-list'

export default async function ConfiguracionPage() {
  const [profile, fixedExpenses] = await Promise.all([
    getProfile(),
    getFixedExpenses(),
  ])

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">Sueldo, ingresos y gastos fijos</p>
      </div>

      <div className="border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Ingresos</h2>
        <ProfileForm profile={profile} />
      </div>

      <div className="border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Gastos fijos mensuales</h2>
        <FixedExpensesList expenses={fixedExpenses} />
      </div>
    </div>
  )
}
