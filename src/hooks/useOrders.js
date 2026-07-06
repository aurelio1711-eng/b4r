import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export const useOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) setOrders(data || [])
      setLoading(false)
    }
    fetch()

    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => {
          if (payload.eventType === 'INSERT') return [payload.new, ...prev]
          if (payload.eventType === 'UPDATE') return prev.map((o) => (o.id === payload.new.id ? payload.new : o))
          if (payload.eventType === 'DELETE') return prev.filter((o) => o.id !== payload.old.id)
          return prev
        })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return { orders, loading }
}
