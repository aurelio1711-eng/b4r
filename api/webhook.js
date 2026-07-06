import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: {
    bodyParser: false,
  },
}

const getRawBody = (req) =>
  new Promise((resolve) => {
    let chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
  })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseKey) {
    console.error('Missing env vars for webhook')
    return res.status(500).json({ error: 'Missing configuration' })
  }

  const stripe = new Stripe(stripeSecretKey)
  const supabase = createClient(supabaseUrl, supabaseKey)

  const rawBody = await getRawBody(req)
  const signature = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    const items = session.metadata?.items
      ? JSON.parse(session.metadata.items)
      : []

    const { error } = await supabase.from('orders').insert({
      stripe_session_id: session.id,
      customer_email: session.customer_details?.email || '',
      total_amount: session.amount_total || 0,
      status: 'completed',
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit_amount: i.unit_amount,
        beads_per_unit: i.beads_per_unit || 6,
      })),
    })

    if (error) {
      console.error('Failed to create order:', error.message)
      return res.status(500).json({ error: 'Failed to create order' })
    }
  }

  res.status(200).json({ received: true })
}
