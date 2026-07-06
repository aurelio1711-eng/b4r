import { useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import { ProductCard } from '../components/ProductCard'
import '../styles/products.css'

const CATEGORIES = [
  { label: 'All', value: null },
  { label: 'Singles', value: 'Single' },
  { label: 'Milestone Stacks', value: 'Milestone Stack' },
  { label: 'Rhythm Series', value: 'Rhythm Series' },
]

export const Products = () => {
  const [activeCategory, setActiveCategory] = useState(null)
  const { products, loading } = useProducts(activeCategory)

  return (
    <main className="products-page">
      <div className="container">
        <div className="products-page__header">
          <h1 className="products-page__title">Bracelets</h1>
          <p className="products-page__sub">
            Each piece is handmade to order. Choose from singles, milestone stacks,
            or rhythmic series — every bead carries intention.
          </p>
        </div>

        <div className="products-page__filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              className={`filter-btn ${activeCategory === cat.value ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p style={{ color: 'var(--mid-gray)', textAlign: 'center', padding: '3rem 0' }}>
            No products found.
          </p>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
