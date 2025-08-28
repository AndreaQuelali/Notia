import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openia";
export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Eres un asistente útil que responde claramente." },
        { role: "user", content: message },
      ],
    });

    return NextResponse.json({
      reply: response.choices[0].message?.content || "Sin respuesta",
    });
  } catch (error) {
    console.error("Error en API /chat:", error);
    return NextResponse.json({ error: "Error en la IA" }, { status: 500 });
  }
}
