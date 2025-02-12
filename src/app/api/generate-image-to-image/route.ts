import { NextResponse } from "next/server";

// Update the model URL to use Google Imagen-3
const MODEL_URL = "black-forest-labs/flux-dev";

const MODEL_CONFIG = {
  input: {
    prompt: "",
    image: "",
    num_inference_steps: 28,
    num_outputs: 1,
    guidance_scale: 3.5,
    output_format: "jpg",
    prompt_strength: 0.8,
    output_quality: 80,
    negative_prompt:
      "blurry, low quality, distorted layout, wrong perspective, bad architecture, ugly, deformed, disfigured, watermark, text, signature",
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const prompt = formData.get("prompt") as string;
    const styles = formData.getAll("styles") as string[];

    if (!image) {
      return NextResponse.json(
        { error: "Image and prompt are required" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");

    // Combine prompt with styles
    const combinedPrompt = [prompt, ...styles].join(", ");

    // Verify API token
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN is not set");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // Log request details (without sensitive data)
    console.log("Making request to Replicate API with prompt:", combinedPrompt);

    console.log("prompt", combinedPrompt);
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
            prompt: combinedPrompt,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Replicate API Error Response:", errorData); // Log full error response
      console.error("Replicate API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        prompt: combinedPrompt, // Include prompt in error log
        modelUrl: MODEL_URL, // Include model URL
        config: MODEL_CONFIG, // Include config
      });
      return NextResponse.json(
        {
          error:
            errorData.detail ||
            `Failed to generate image. Status: ${response.status}, ${response.statusText}`,
        }, // More informative error message
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
      console.log(
        "Polling prediction status:",
        prediction.status,
        prediction.id
      ); // Log polling status and prediction ID
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          },
        }
      );

      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        console.error("Polling error:", {
          status: pollResponse.status,
          statusText: pollResponse.statusText,
          body: errorText,
          predictionId: prediction.id, // Include prediction ID in polling error
        });
        throw new Error(
          `Failed to poll for prediction result: ${pollResponse.status} ${pollResponse.statusText}`
        );
      }
      prediction = await pollResponse.json();
    }

    if (prediction.status === "succeeded") {
      console.log("Image generation succeeded. Prediction:", prediction); // Log successful prediction
      return NextResponse.json({ imageUrl: prediction.output });
    } else {
      console.error("Replicate Prediction Failed:", prediction); // Log full prediction object on failure
      return NextResponse.json(
        {
          error: prediction.error || "Image generation failed after polling",
          details: prediction,
        }, // Include prediction details in error response
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("General error in image generation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json(
      { error: errorMessage, details: error },
      { status: 500 }
    ); // Include error details in response
  }
}
