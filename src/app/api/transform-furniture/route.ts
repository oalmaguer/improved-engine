import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const prompt = formData.get("prompt") as string;
    const style = formData.get("style") as string;

    if (!imageFile || !style) {
      return NextResponse.json(
        { error: "Image and style are required" },
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

    // Call Replicate API with the Flux model
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
            image: `data:image/jpeg;base64,${base64Image}`,
            prompt: `Transform this room into ${style} style, maintain the same layout and furniture placement, ${
              prompt || ""
            }`,
            go_fast: true,
            guidance: 8.5,
            megapixels: "1",
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "jpg",
            output_quality: 90,
            prompt_strength: 0.65,
            num_inference_steps: 30,
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
