import { useAnalytics } from '../hooks/useAnalytics'
import '../styles/counter.css'

export const BeadCounter = () => {
  const { value, loading } = useAnalytics('total_beads_strung')

  const displayValue = value !== null
    ? value.toLocaleString('en-US')
    : '—'

  return (
    <section className="counter">
      <div className="container">
        <div className="counter__inner">
          <div className={`counter__number ${loading ? 'loading' : ''}`}>
            {displayValue}
          </div>
          <p className="counter__label">Over {displayValue} moments of focus shared.</p>
        </div>
      </div>
    </section>
  )
}
