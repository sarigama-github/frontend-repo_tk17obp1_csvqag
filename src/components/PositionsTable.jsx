import { useEffect, useState } from 'react'

export default function PositionsTable({ refreshKey }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/portfolio`)
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [refreshKey])

  return (
    <div className="overflow-x-auto">
      {loading && <p>Cargando...</p>}
      {data && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Símbolo</th>
              <th>Qty</th>
              <th>Precio</th>
              <th>Moneda</th>
              <th>FX→{data.base_currency}</th>
              <th>Valor</th>
              <th>Coste</th>
              <th>PnL €</th>
              <th>PnL %</th>
            </tr>
          </thead>
          <tbody>
            {data.positions?.map((p) => (
              <tr key={p.symbol} className="border-b">
                <td className="py-2 font-medium">{p.name || p.symbol}</td>
                <td>{fmtNum(p.quantity)}</td>
                <td>{fmtNum(p.price)}</td>
                <td>{p.price_ccy}</td>
                <td>{fmtNum(p.fx)}</td>
                <td>{fmtCcy(p.value_base, data.base_currency)}</td>
                <td>{fmtCcy(p.cost_base, data.base_currency)}</td>
                <td className={p.pnl_abs>=0? 'text-green-600' : 'text-red-600'}>{fmtCcy(p.pnl_abs, data.base_currency)}</td>
                <td className={p.pnl_pct>=0? 'text-green-600' : 'text-red-600'}>{(p.pnl_pct*100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function fmtCcy(v, c) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: c || 'EUR' }).format(v||0)
}
function fmtNum(v){
  return Number(v||0).toLocaleString('es-ES', { maximumFractionDigits: 6 })
}
