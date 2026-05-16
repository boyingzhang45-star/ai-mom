import { stripe, PRO_PRICE_ID } from "@/lib/stripe"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    if (!userId) {
      return Response.json({ error: "缺少 userId" }, { status: 400 })
    }

    let user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      user = await prisma.user.create({ data: { id: userId } })
    }

    // 创建或获取 Stripe Customer
    let customerId = user.stripeCustId
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { userId },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustId: customerId },
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL || "https://ai-mom.co.in"}/?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || "https://ai-mom.co.in"}/?upgrade=cancelled`,
      metadata: { userId },
      subscription_data: {
        metadata: { userId },
      },
      payment_method_types: ["card"],
      billing_address_collection: "auto",
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return Response.json(
      { error: "创建支付会话失败" },
      { status: 500 }
    )
  }
}
