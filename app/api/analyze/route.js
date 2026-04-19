import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf");
    if (!file) return NextResponse.json({ error: "PDF bulunamadi" }, { status: 400 });
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const { default: PDFParser } = await import("pdf2json");
    const cvText = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        const text = pdfData.Pages.map((page) =>
          page.Texts.map((t) => decodeURIComponent(t.R[0].T)).join(" ")
        ).join("\n");
        resolve(text);
      });
      pdfParser.on("pdfParser_dataError", reject);
      pdfParser.parseBuffer(buffer);
    });
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: "CV analiz et Turkce:\n1. Guclu yonler\n2. Zayif yonler\n3. Oneriler\n4. Puan (100 uzerinden)\n\n" + cvText,
          },
        ],
      }),
    });
    const data = await response.json();
    if (!data.choices) return NextResponse.json({ error: JSON.stringify(data) }, { status: 500 });
    return NextResponse.json({ analysis: data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Hata olustu" }, { status: 500 });
  }
}
