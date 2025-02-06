import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const prompt = formData.get("prompt") as string;

    if (!imageFile || !prompt) {
      return NextResponse.json(
        { error: "Image and prompt are required" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // Verify API token
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN is not set");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // Log request details (without sensitive data)
    console.log("Making request to Replicate API with prompt:", prompt);

    // Call Replicate API
    const response = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-dev/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            prompt,
            image: `data:image/jpeg;base64,${base64Image}`,
            go_fast: false,
            guidance: 7.5,
            megapixels: "1",
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "webp",
            output_quality: 90,
            prompt_strength: 0.63,
            num_inference_steps: 40,
            negative_prompt: "blurry, low quality, distorted layout, wrong perspective, bad architecture",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Replicate API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return NextResponse.json(
        { error: errorData.detail || "Failed to generate image" },
        { status: response.status }
      );
    }

    let prediction = await response.json();
    console.log("Replicate API initial response:", prediction);

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
    console.error("Error details:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
