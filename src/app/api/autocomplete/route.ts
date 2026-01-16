import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text input" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful writing assistant. Continue the user's text naturally and concisely. Return only the continuation, no extra explanation.",
        },
        { role: "user", content: text },
      ],
      max_tokens: 30,
      temperature: 0.7,
      stream: false,
    });

    const suggestion = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error("Groq autocomplete error:", err);
    return NextResponse.json({ error: "Failed to fetch suggestion" }, { status: 500 });
  }
}
