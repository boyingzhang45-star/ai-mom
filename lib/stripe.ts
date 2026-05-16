import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-04-22.dahlia",
})

export const PRO_PRICE_ID = process.env.STRIPE_PRICE_ID || "price_monthly_19cny"
