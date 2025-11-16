import { useState } from 'react'
import PortfolioForm from './components/PortfolioForm'
import PortfolioSummary from './components/PortfolioSummary'
import PositionsTable from './components/PositionsTable'

function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey(k => k+1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="px-6 py-4 border-b bg-white/70 backdrop-blur sticky top-0">
        <h1 className="text-2xl font-bold">Mi Portfolio</h1>
        <p className="text-sm text-gray-600">Moneda base: EUR (conversión automática de USD/EUR)</p>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <section className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-semibold mb-3">Añadir operación</h2>
          <PortfolioForm onAdded={refresh} />
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-semibold mb-3">Resumen</h2>
          <PortfolioSummary />
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-semibold mb-3">Posiciones</h2>
          <PositionsTable refreshKey={refreshKey} />
        </section>
      </main>
    </div>
  )
}

export default App