import { createContext, useContext, useReducer, useEffect, useRef } from 'react'

const CartContext = createContext(null)

const CART_STORAGE_KEY = 'b4r_cart'

const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveCart = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find((i) => i.id === action.product.id)
      if (existing) {
        return state.map((i) =>
          i.id === action.product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, action.product.stock_quantity) }
            : i
        )
      }
      return [...state, { ...action.product, quantity: 1 }]
    }
    case 'REMOVE_ITEM':
      return state.filter((i) => i.id !== action.id)
    case 'UPDATE_QUANTITY':
      return state.map((i) =>
        i.id === action.id
          ? { ...i, quantity: Math.min(Math.max(1, action.quantity), i.stock_quantity) }
          : i
      )
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const [items, dispatch] = useReducer(cartReducer, null, loadCart)
  const isInitial = useRef(true)

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false
      return
    }
    saveCart(items)
  }, [items])

  const addItem = (product) => dispatch({ type: 'ADD_ITEM', product })
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', id })
  const updateQuantity = (id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', id, quantity })
  const clearCart = () => dispatch({ type: 'CLEAR' })

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
