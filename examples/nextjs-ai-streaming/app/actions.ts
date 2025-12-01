"use server"

export async function streamingChat(prompt: string): Promise<ReadableStream> {
  const response = await fetch("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    if (response.status === 402) {
      const problem = await response.json()
      throw { status: 402, quote: problem.quote }
    }
    throw new Error("Failed to generate response")
  }

  return response.body!
}
