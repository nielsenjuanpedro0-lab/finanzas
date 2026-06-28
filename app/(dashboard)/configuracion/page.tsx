export const dynamic = 'force-dynamic'
import { getProfile } from '@/app/actions/profile'
import { getFixedExpenses } from '@/app/actions/fixed-expenses'
import { getWallets } from '@/app/actions/wallets'
import { ProfileForm } from '@/components/profile-form'
import { FixedExpensesList } from '@/components/fixed-expenses-list'
import { WalletManager } from '@/components/wallet-manager'

export default async function ConfiguracionPage() {
  const [profile, fixedExpenses, wallets] = await Promise.all([
    getProfile(),
    getFixedExpenses(),
    getWallets(),
  ])

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">Tu base financiera mensual</p>
      </div>

      <div className="border border-gray-200 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Ingresos mensuales</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Ingresá lo que cobrás fijo cada mes. Los ingresos variables (freelance, ventas) los cargás en Movimientos cuando los recibís.
          </p>
        </div>
        <ProfileForm profile={profile} />
      </div>

      <div className="border border-gray-200 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Mis billeteras</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Tus cuentas y billeteras actuales. El saldo se actualiza automáticamente cuando cargás movimientos.
          </p>
        </div>
        <WalletManager wallets={wallets} />
      </div>

      <div className="border border-gray-200 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Gastos fijos mensuales</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Alquiler, servicios, suscripciones — lo que pagás todos los meses sin falta.
          </p>
        </div>
        <FixedExpensesList expenses={fixedExpenses} />
      </div>
    </div>
  )
}
