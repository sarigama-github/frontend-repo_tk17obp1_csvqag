import { useEffect, useState } from 'react'

export default function PortfolioSummary() {
  const [period, setPeriod] = useState('today')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/summary?period=${period}`)
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [period])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['today','yesterday','week','month','year','ytd'].map(p => (
          <button key={p} onClick={() => setPeriod(p)} className={`chip ${period===p?'chip-active':''}`}>{p.toUpperCase()}</button>
        ))}
      </div>
      {loading && <p>Cargando...</p>}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Kpi label="Valor actual" value={fmt(data.value_now, data.base_currency)} />
          <Kpi label="Valor al inicio" value={fmt(data.value_then, data.base_currency)} />
          <Kpi label="Ganancia" value={fmt(data.pnl_abs, data.base_currency)} positive={data.pnl_abs>=0} />
          <Kpi label="Rentabilidad" value={`${(data.pnl_pct*100).toFixed(2)}%`} positive={data.pnl_pct>=0} />
        </div>
      )}
    </div>
  )
}

function Kpi({ label, value, positive }) {
  return (
    <div className={`p-4 rounded-lg border ${positive===true?'border-green-300 bg-green-50':positive===false?'border-red-300 bg-red-50':'border-gray-200 bg-white'}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  )
}

function fmt(v, ccy){
  if (v==null) return '-'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: ccy || 'EUR' }).format(v)
}
