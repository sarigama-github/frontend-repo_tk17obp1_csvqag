import { useEffect, useMemo, useRef, useState } from 'react'

const initial = { symbol: '', name: '', isin: '', asset_type: 'stock', quantity: '', price: '', trade_currency: 'EUR', trade_date: '' }

export default function PortfolioForm({ onAdded }) {
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSug, setShowSug] = useState(false)
  const abortRef = useRef()
  const containerRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setShowSug(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  // Debounced autocomplete for symbol
  useEffect(() => {
    const q = form.symbol?.trim()
    if (!q) { setSuggestions([]); return }
    const t = setTimeout(async () => {
      try {
        abortRef.current?.abort?.()
        const ctrl = new AbortController()
        abortRef.current = ctrl
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/suggest?q=${encodeURIComponent(q)}&limit=8`, { signal: ctrl.signal })
        if (!res.ok) return
        const json = await res.json()
        setSuggestions(json.results || [])
        setShowSug(true)
      } catch (e) {
        // ignore
      }
    }, 250)
    return () => clearTimeout(t)
  }, [form.symbol])

  const pickSuggestion = (sug) => {
    setForm(f => ({
      ...f,
      symbol: sug.symbol || f.symbol,
      name: sug.shortname || f.name,
      trade_currency: (sug.currency || f.trade_currency || 'EUR')
    }))
    setShowSug(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Validate ticker first to give clearer feedback
      const sym = (form.symbol || '').trim()
      if (!sym) throw new Error('Indica un ticker válido')
      const v = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/validate-ticker?symbol=${encodeURIComponent(sym)}`)
      if (!v.ok) {
        const j = await v.json().catch(()=>({}))
        throw new Error(j.detail || 'Ticker no válido o sin datos')
      }

      const body = { ...form, quantity: parseFloat(form.quantity), price: parseFloat(form.price) }
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/holdings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const j = await res.json().catch(()=>({}))
        throw new Error(j.detail || 'No se pudo guardar la operación')
      }
      setForm(initial)
      onAdded?.()
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3" ref={containerRef}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative">
          <input name="symbol" value={form.symbol} onChange={handleChange} onFocus={()=> setShowSug(suggestions.length>0)} placeholder="Ticker / Símbolo" className="input w-full" required />
          {showSug && suggestions.length>0 && (
            <div className="absolute z-20 mt-1 w-full max-h-64 overflow-auto bg-white border rounded shadow">
              {suggestions.map((s) => (
                <button type="button" key={s.symbol} onClick={()=>pickSuggestion(s)} className="w-full text-left px-3 py-2 hover:bg-slate-50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{s.symbol}</span>
                    <span className="text-xs text-gray-500">{s.exchange}</span>
                  </div>
                  <div className="text-xs text-gray-600 truncate">{s.shortname}</div>
                  {s.currency && <div className="text-[10px] text-gray-400">Moneda: {s.currency}</div>}
                </button>
              ))}
            </div>
          )}
        </div>
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
      <p className="text-xs text-gray-500">Consejo: prueba con tickers como AAPL, MSFT, SAN.MC, NXT.MC. Usa el autocompletar para evitar errores.</p>
    </form>
  )
}
