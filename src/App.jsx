import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { useAuth } from './hooks/useAuth'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Landing } from './pages/Landing'
import { Products } from './pages/Products'
import { Cart } from './pages/Cart'
import { Login } from './pages/Login'
import { Admin } from './pages/Admin'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--mid-gray)' }}>Loading...</div>
  if (!user) return <Navigate to="/admin/login" replace />
  return children
}

const PublicLayout = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
)

const AdminLayout = ({ children }) => (
  <>
    <Header />
    {children}
  </>
)

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
          <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
          <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />

          {/* Admin login */}
          <Route path="/admin/login" element={<AdminLayout><Login /></AdminLayout>} />

          {/* Admin dashboard (protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout><Admin /></AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
