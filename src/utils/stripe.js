import { loadStripe } from '@stripe/stripe-js'

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripeKey) {
  console.error(
    'Stripe publishable key is undefined. ' +
    'Set VITE_STRIPE_PUBLISHABLE_KEY in your environment variables ' +
    'and ensure it is available during build time.'
  )
}

let stripePromise = null

export const getStripe = () => {
  if (!stripeKey) return null
  if (!stripePromise) {
    stripePromise = loadStripe(stripeKey)
  }
  return stripePromise
}
