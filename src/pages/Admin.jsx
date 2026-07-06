import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useOrders } from '../hooks/useOrders'
import { supabase } from '../utils/supabase'
import '../styles/admin.css'

const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`

/* ---------- Image Upload Component ---------- */
const ImageUpload = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const uploadFile = async (file) => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)

      onUpload(publicUrl)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    uploadFile(e.dataTransfer.files[0])
  }

  return (
    <div
      className={`upload-zone ${dragOver ? 'dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload-input"
        onChange={(e) => uploadFile(e.target.files[0])}
      />
      <label htmlFor="image-upload-input" style={{ cursor: 'pointer', display: 'block' }}>
        <div className="upload-zone__icon">+</div>
        <p className="upload-zone__text">
          {uploading ? 'Uploading...' : 'Drop an image here or click to select'}
        </p>
        <p className="upload-zone__hint">Supports PNG, JPG, WebP</p>
      </label>
      {error && <p className="upload-error">{error}</p>}
    </div>
  )
}

/* ---------- Inventory Form ---------- */
const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock_quantity: '',
  category: 'Single',
  image_url: '',
  beads_per_unit: '6',
}

const InventoryForm = ({ editing, onSaved, onCancel }) => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description,
        price: String(editing.price),
        stock_quantity: String(editing.stock_quantity),
        category: editing.category,
        image_url: editing.image_url,
        beads_per_unit: String(editing.beads_per_unit || 6),
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [editing])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload = {
      name: form.name,
      description: form.description,
      price: parseInt(form.price, 10),
      stock_quantity: parseInt(form.stock_quantity, 10) || 0,
      category: form.category,
      image_url: form.image_url,
      beads_per_unit: parseInt(form.beads_per_unit, 10) || 6,
    }

    try {
      if (editing) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
      }
      onSaved()
      setForm(EMPTY_FORM)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2 className="admin-form__title">
        {editing ? 'Edit Product' : 'Add New Product'}
      </h2>

      <div className="admin-form__group full">
        <label className="admin-form__label">Image</label>
        <ImageUpload onUpload={(url) => setForm((prev) => ({ ...prev, image_url: url }))} />
        {form.image_url && (
          <img
            src={form.image_url}
            alt="Preview"
            className="upload-preview"
          />
        )}
      </div>

      <div className="admin-form__group">
        <label className="admin-form__label" htmlFor="name">Name</label>
        <input id="name" name="name" className="admin-form__input" value={form.name} onChange={handleChange} required />
      </div>

      <div className="admin-form__group">
        <label className="admin-form__label" htmlFor="category">Category</label>
        <select id="category" name="category" className="admin-form__input" value={form.category} onChange={handleChange}>
          <option value="Single">Single</option>
          <option value="Milestone Stack">Milestone Stack</option>
          <option value="Rhythm Series">Rhythm Series</option>
        </select>
      </div>

      <div className="admin-form__group">
        <label className="admin-form__label" htmlFor="price">Price (cents)</label>
        <input id="price" name="price" type="number" min="1" className="admin-form__input" value={form.price} onChange={handleChange} required />
      </div>

      <div className="admin-form__group">
        <label className="admin-form__label" htmlFor="stock_quantity">Stock</label>
        <input id="stock_quantity" name="stock_quantity" type="number" min="0" className="admin-form__input" value={form.stock_quantity} onChange={handleChange} />
      </div>

      <div className="admin-form__group">
        <label className="admin-form__label" htmlFor="beads_per_unit">Beads / Bracelet</label>
        <input id="beads_per_unit" name="beads_per_unit" type="number" min="1" className="admin-form__input" value={form.beads_per_unit} onChange={handleChange} />
      </div>

      <div className="admin-form__group full">
        <label className="admin-form__label" htmlFor="description">Description</label>
        <textarea id="description" name="description" className="admin-form__input" rows="3" value={form.description} onChange={handleChange} />
      </div>

      {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', gridColumn: '1 / -1' }}>{error}</p>}

      <div className="admin-form__actions">
        <button className="admin-btn primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
        </button>
        {editing && (
          <button className="admin-btn" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

/* ---------- Main Admin Dashboard ---------- */
export const Admin = () => {
  const { user, loading: authLoading, signOut } = useAuth()
  const { orders } = useOrders()
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [tab, setTab] = useState('inventory')
  const [counterValue, setCounterValue] = useState('')
  const [counterUpdating, setCounterUpdating] = useState(false)
  const [counterCurrent, setCounterCurrent] = useState(null)

  // Fetch products
  const fetchProducts = async () => {
    setProductsLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data)
    setProductsLoading(false)
  }

  // Fetch current counter
  const fetchCounter = async () => {
    const { data } = await supabase
      .from('analytics')
      .select('metric_value')
      .eq('metric_name', 'total_beads_strung')
      .single()
    if (data) {
      setCounterCurrent(data.metric_value)
      setCounterValue(String(data.metric_value))
    }
  }

  useEffect(() => {
    if (user) {
      fetchProducts()
      fetchCounter()
    }
  }, [user])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleCounterUpdate = async () => {
    setCounterUpdating(true)
    const val = parseInt(counterValue, 10)
    if (isNaN(val) || val < 0) {
      setCounterUpdating(false)
      return
    }
    await supabase
      .from('analytics')
      .update({ metric_value: val, updated_at: new Date().toISOString() })
      .eq('metric_name', 'total_beads_strung')
    setCounterCurrent(val)
    setCounterUpdating(false)
  }

  if (authLoading) {
    return <main className="admin-page"><div className="container"><p>Loading...</p></div></main>
  }

  if (!user) {
    return null // protected by routing, but safety net
  }

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <h1 className="admin-page__title">Admin Dashboard</h1>
          <button className="admin-logout" onClick={signOut}>Sign Out</button>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${tab === 'inventory' ? 'active' : ''}`}
            onClick={() => setTab('inventory')}
          >
            Inventory
          </button>
          <button
            className={`admin-tab ${tab === 'orders' ? 'active' : ''}`}
            onClick={() => setTab('orders')}
          >
            Orders
          </button>
          <button
            className={`admin-tab ${tab === 'analytics' ? 'active' : ''}`}
            onClick={() => setTab('analytics')}
          >
            Analytics
          </button>
        </div>

        {/* -------- Inventory Tab -------- */}
        {tab === 'inventory' && (
          <>
            <InventoryForm
              editing={editing}
              onSaved={() => { setEditing(null); fetchProducts() }}
              onCancel={() => setEditing(null)}
            />

            {productsLoading ? (
              <p style={{ color: 'var(--mid-gray)' }}>Loading products...</p>
            ) : products.length === 0 ? (
              <p style={{ color: 'var(--mid-gray)' }}>No products yet. Add one above.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Beads</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td style={{ color: 'var(--mid-gray)' }}>{p.category}</td>
                        <td style={{ color: 'var(--soft-gold)' }}>{formatPrice(p.price)}</td>
                        <td>{p.stock_quantity}</td>
                        <td style={{ color: 'var(--mid-gray)' }}>{p.beads_per_unit}</td>
                        <td>
                          <div className="admin-table__actions">
                            <button className="admin-btn" onClick={() => setEditing(p)}>Edit</button>
                            <button className="admin-btn danger" onClick={() => handleDelete(p.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* -------- Orders Tab -------- */}
        {tab === 'orders' && (
          <>
            {orders.length === 0 ? (
              <p style={{ color: 'var(--mid-gray)' }}>No orders yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.customer_email}</td>
                        <td style={{ color: 'var(--soft-gold)' }}>{formatPrice(o.total_amount)}</td>
                        <td>
                          <span style={{
                            color: o.status === 'completed' ? 'var(--success)' :
                                   o.status === 'refunded' ? 'var(--error)' : 'var(--mid-gray)'
                          }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--mid-gray)', fontSize: '0.8125rem' }}>
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* -------- Analytics Tab -------- */}
        {tab === 'analytics' && (
          <div className="counter-modifier">
            <span className="counter-modifier__label">Meditative Counter</span>
            <span className="counter-modifier__current">
              Current: {counterCurrent !== null ? counterCurrent.toLocaleString() : '—'}
            </span>
            <input
              className="counter-modifier__input"
              type="number"
              min="0"
              value={counterValue}
              onChange={(e) => setCounterValue(e.target.value)}
            />
            <button
              className="admin-btn primary"
              onClick={handleCounterUpdate}
              disabled={counterUpdating}
            >
              {counterUpdating ? 'Updating...' : 'Update'}
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--mid-gray)', width: '100%' }}>
              This counter is automatically updated when orders are completed via the database trigger.
              Use this field for manual overrides.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
