import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getStripe } from '../utils/stripe'
import '../styles/cart.css'

const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`

export const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart()
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState(null)

  const handleCheckout = async () => {
    setCheckingOut(true)
    setError(null)
    try {
      const lineItems = items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.name },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      }))

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: lineItems }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Checkout request failed')
      }

      const { sessionId } = await res.json()

      const stripe = await getStripe()
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId })
      if (stripeError) throw stripeError
    } catch (err) {
      setError(err.message)
    } finally {
      setCheckingOut(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <div className="container">
          <h1 className="cart-page__title">Cart</h1>
          <div className="cart-empty">
            <div className="cart-empty__icon">—</div>
            <p className="cart-empty__text">Your cart is empty.</p>
            <Link to="/products" className="hero__cta" style={{ margin: '0 auto' }}>
              Browse bracelets
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="cart-page">
      <div className="container">
        <h1 className="cart-page__title">Cart</h1>

        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              {item.image_url ? (
                <img className="cart-item__image" src={item.image_url} alt={item.name} />
              ) : (
                <div className="cart-item__image" style={{ background: 'var(--charcoal)' }} />
              )}
              <div className="cart-item__info">
                <span className="cart-item__name">{item.name}</span>
                <span className="cart-item__price">{formatPrice(item.price)}</span>
                <div className="cart-item__qty">
                  <button
                    className="cart-item__qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="cart-item__qty-value">{item.quantity}</span>
                  <button
                    className="cart-item__qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="cart-item__remove"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
              <div className="cart-item__total">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="cart-summary__total">
            Total <span>{formatPrice(totalPrice)}</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button className="cart-checkout-btn" onClick={handleCheckout} disabled={checkingOut}>
              {checkingOut ? 'Redirecting...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--error)', marginTop: 'var(--space-md)', fontSize: '0.875rem' }}>
            {error}
          </p>
        )}
      </div>
    </main>
  )
}
