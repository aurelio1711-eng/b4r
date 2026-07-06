import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    return res.status(500).json({ error: 'Stripe secret key not configured' })
  }

  const stripe = new Stripe(stripeSecretKey)

  try {
    const { items } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: items,
      success_url: `${req.headers.origin}/cart?success=true`,
      cancel_url: `${req.headers.origin}/cart?canceled=true`,
      metadata: {
        items: JSON.stringify(items.map((i) => ({
          name: i.price_data?.product_data?.name,
          quantity: i.quantity,
          unit_amount: i.unit_amount,
        }))),
      },
    })

    res.status(200).json({ sessionId: session.id, url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    res.status(500).json({ error: err.message })
  }
}
