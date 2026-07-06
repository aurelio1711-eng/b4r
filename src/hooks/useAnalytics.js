import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export const useAnalytics = (metricName = 'total_beads_strung') => {
  const [value, setValue] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let subscribed = true
    const fetchMetric = async () => {
      const { data, error } = await supabase
        .from('analytics')
        .select('metric_value')
        .eq('metric_name', metricName)
        .single()
      if (!error && data && subscribed) {
        setValue(data.metric_value)
      }
      if (subscribed) setLoading(false)
    }
    fetchMetric()

    const channel = supabase
      .channel('analytics-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'analytics', filter: `metric_name=eq.${metricName}` },
        (payload) => {
          if (subscribed) setValue(payload.new.metric_value)
        }
      )
      .subscribe()

    return () => {
      subscribed = false
      supabase.removeChannel(channel)
    }
  }, [metricName])

  return { value, loading }
}
