import { getStripe } from "@/lib/stripe"
import { activatePro, cancelPro } from "@/lib/subscription"

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature") || ""

  const stripe = getStripe()

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    )
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 })
  }

  const subscription = event.data.object as { metadata?: { userId?: string } }
  const userId = subscription.metadata?.userId

  if (!userId) {
    return Response.json({ received: true })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      // 支付成功后开通 Pro
      const session = event.data.object as { subscription?: string; metadata?: { userId?: string } }
      const subId = session.subscription as string
      const uid = session.metadata?.userId || userId
      if (subId) await activatePro(uid, subId)
      break
    }
    case "customer.subscription.deleted": {
      await cancelPro(userId)
      break
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as { status?: string }
      if (sub.status === "canceled" || sub.status === "unpaid") {
        await cancelPro(userId)
      }
      break
    }
  }

  return Response.json({ received: true })
}
