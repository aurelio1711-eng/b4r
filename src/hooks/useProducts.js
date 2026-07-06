import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export const useProducts = (category = null) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        let query = supabase.from('products').select('*').order('created_at', { ascending: false })
        if (category) {
          query = query.eq('category', category)
        }
        const { data, error } = await query
        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [category])

  return { products, loading, error }
}
