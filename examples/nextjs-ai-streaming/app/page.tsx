"use client"

import type React from "react"

import { useState } from "react"
import { streamingChat } from "./actions"

export default function Page() {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [streaming, setStreaming] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStreaming(true)
    setResponse("")

    try {
      const stream = await streamingChat(prompt)
      const reader = stream.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setResponse((prev) => prev + chunk)
      }
    } catch (error: any) {
      if (error.status === 402) {
        alert("Payment required: " + error.quote?.price?.amount + " sats")
      } else {
        alert("Error: " + error.message)
      }
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">AI Chat (Pay-per-use)</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask me anything..."
            className="w-full h-32 p-4 border rounded-lg"
            disabled={streaming}
          />
          <button
            type="submit"
            disabled={streaming || !prompt}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {streaming ? "Generating..." : "Send (100 sats)"}
          </button>
        </form>
        {response && (
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </div>
    </div>
  )
}
