import { withX402 } from "@x402/nextjs"

async function handler(req: Request) {
  const { prompt } = await req.json()

  // Simulate streaming AI response
  const stream = new ReadableStream({
    async start(controller) {
      const words = `This is a simulated AI response to: "${prompt}". `.split(" ")
      for (const word of words) {
        controller.enqueue(new TextEncoder().encode(word + " "))
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  })
}

export const POST = withX402(handler, {
  signingKey: process.env.X402_SIGNING_KEY!,
  priceAmount: 100,
  priceCurrency: "sats",
})
