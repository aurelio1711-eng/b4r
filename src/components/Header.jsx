import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import '../styles/header.css'

export const Header = () => {
  const { totalItems } = useCart()

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo">B4R</Link>
        <nav className="header__nav">
          <Link to="/" className="header__link">Home</Link>
          <Link to="/products" className="header__link">Bracelets</Link>
          <Link to="/cart" className="header__cart">
            Cart
            {totalItems > 0 && (
              <span className="header__cart-count">{totalItems}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}
