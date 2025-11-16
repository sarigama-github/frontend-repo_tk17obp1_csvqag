import { useState } from 'react'

const initial = { symbol: '', name: '', isin: '', asset_type: 'stock', quantity: '', price: '', trade_currency: 'EUR', trade_date: '' }

export default function PortfolioForm({ onAdded }) {
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/holdings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: parseFloat(form.quantity), price: parseFloat(form.price) })
      })
      if (!res.ok) throw new Error('No se pudo guardar la operación')
      setForm(initial)
      onAdded?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input name="symbol" value={form.symbol} onChange={handleChange} placeholder="Ticker / Símbolo" className="input" required />
        <input name="isin" value={form.isin} onChange={handleChange} placeholder="ISIN (opcional)" className="input" />
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre (opcional)" className="input" />
        <select name="asset_type" value={form.asset_type} onChange={handleChange} className="input">
          <option value="stock">Acción</option>
          <option value="etf">ETF</option>
          <option value="fund">Fondo</option>
          <option value="crypto">Cripto</option>
          <option value="other">Otro</option>
        </select>
        <input name="quantity" value={form.quantity} onChange={handleChange} placeholder="Cantidad" type="number" step="any" className="input" required />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Precio" type="number" step="any" className="input" required />
        <select name="trade_currency" value={form.trade_currency} onChange={handleChange} className="input">
          <option>EUR</option>
          <option>USD</option>
          <option>GBP</option>
          <option>CHF</option>
        </select>
        <input name="trade_date" value={form.trade_date} onChange={handleChange} type="date" className="input" required />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button disabled={loading} className="btn-primary w-full md:w-auto">{loading ? 'Guardando...' : 'Añadir operación'}</button>
    </form>
  )
}
