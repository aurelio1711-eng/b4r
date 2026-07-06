import { useState } from 'react'
import { useCart } from '../context/CartContext'

const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`

export const ProductCard = ({ product }) => {
  const { addItem, items } = useCart()
  const [added, setAdded] = useState(false)

  const inCart = items.find((i) => i.id === product.id)
  const outOfStock = product.stock_quantity <= 0

  const handleAdd = () => {
    if (outOfStock) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const btnClass = [
    'product-card__add',
    added && 'added',
  ].filter(Boolean).join(' ')

  return (
    <article className="product-card">
      {product.image_url ? (
        <img
          className="product-card__image"
          src={product.image_url}
          alt={product.name}
          loading="lazy"
        />
      ) : (
        <div className="product-card__placeholder">No image</div>
      )}
      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__desc">{product.description}</p>
      </div>
      <div className="product-card__footer">
        <span className="product-card__price">{formatPrice(product.price)}</span>
        {inCart ? (
          <span className="product-card__stock">{inCart.quantity} in cart</span>
        ) : outOfStock ? (
          <span className="product-card__stock">Out of stock</span>
        ) : null}
        <button
          className={btnClass}
          onClick={handleAdd}
          disabled={outOfStock}
        >
          {added ? 'Added' : outOfStock ? 'Sold' : 'Add'}
        </button>
      </div>
    </article>
  )
}
