import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);
  try {
    const { prompt } = await request.json();
    console.log("Prompt:", prompt);

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
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
    return NextResponse.json(
      { error: "Failed to enhance prompt" },
      { status: 500 }
    );
  }
}
