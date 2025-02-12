import { NextResponse } from "next/server";

// Update the model URL to use Google Imagen-3
const MODEL_URL = "black-forest-labs/flux-dev";

const MODEL_CONFIG = {
  input: {
    prompt: `Highly detailed, cinematic, ultra-realistic, immersive jungle-inspired interior, dynamic lighting. 
      Detect the furniture and add details based on the style requested. Make sure to change the lighting and time of day to match the style requested.`,
    image: "",
    num_inference_steps: 35,
    num_outputs: 1,
    guidance_scale: 3,
    output_format: "jpg",
    prompt_strength: 0.7,
    output_quality: 90,
    negative_prompt:
      "blurry, low quality, distorted layout, wrong perspective, bad architecture, ugly, deformed, disfigured, watermark, text, signature",
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const prompt = formData.get("prompt") as string;

    if (!image || !prompt) {
      return NextResponse.json(
        { error: "Image and prompt are required" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");

    // Verify API token
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN is not set");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // Call Replicate API with updated configuration
    const response = await fetch(
      `https://api.replicate.com/v1/models/${MODEL_URL}/predictions`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          Prefer: "wait", // Add this header for Imagen-3
        },
        body: JSON.stringify({
          input: {
            ...MODEL_CONFIG.input,
            image: `data:image/jpeg;base64,${base64Image}`,
            prompt: `Transform this room into ${prompt} style, maintain the same layout and furniture placement, make sure the style is clearly visible and noticeable.`,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate image");
    }

    let prediction = await response.json();

    // Poll for the result
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          },
        }
      );
      prediction = await pollResponse.json();
    }

    if (prediction.status === "succeeded") {
      return NextResponse.json({ imageUrl: prediction.output });
    } else {
      throw new Error("Image generation failed");
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to transform furniture" },
      { status: 500 }
    );
  }
}
