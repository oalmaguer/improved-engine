import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY?.trim(),
  baseURL: "https://api.openai.com/v1",
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY?.trim()) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a creative prompt engineer specializing in image generation. 
          Your task is to enhance user prompts by:
          1. Adding more descriptive details
          2. Incorporating artistic elements (lighting, style, mood)
          3. Improving composition and focus
          4. Maintaining the original intent while making it more vivid
          5. Do not exceed 40 words.
          
          Respond only with the enhanced prompt, no explanations or additional text.`,
        },
        {
          role: "user",
          content: `Enhance this image generation prompt: "${prompt}"`,
        },
      ],
      temperature: 1,
      max_tokens: 200,
    });

    const enhancedPrompt = completion.choices[0].message.content;

    return NextResponse.json({ enhancedPrompt });
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to enhance prompt";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
