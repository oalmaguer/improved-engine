import { NextResponse } from "next/server";

const MODEL_URLS = {
  "flux-dev": "black-forest-labs/flux-dev",
  "flux-schnell": "black-forest-labs/flux-schnell",
  "flux-1.1-pro-ultra": "black-forest-labs/flux-1.1-pro-ultra",
  "recraft-v3": "recraft-ai/recraft-v3",
  "imagen-3": "google/imagen-3",
} as const;

// Model-specific configurations
const MODEL_CONFIGS = {
  "flux-schnell": {
    input: {
      prompt: "",
      negative_prompt:
        "blurry, low quality, distorted, deformed, ugly, bad anatomy",
      aspect_ratio: "3:2",
      num_outputs: 1,
      num_inference_steps: 4,
      output_format: "jpg",
      guidance_scale: 9.0,
      prompt_strength: 0.8,
    },
  },
  "flux-dev": {
    input: {
      prompt: "",
      go_fast: false,
      guidance: 9.5,
      megapixels: "1",
      num_outputs: 1,
      aspect_ratio: "3:2",
      output_format: "jpg",
      output_quality: 90,
      prompt_strength: 0.8,
      num_inference_steps: 30,
      negative_prompt:
        "blurry, low quality, distorted, deformed, ugly, bad anatomy, unrealistic lighting, oversaturated, undersaturated",
    },
  },
  "flux-1.1-pro-ultra": {
    input: {
      prompt: "",

      num_inference_steps: 50,
      num_outputs: 1,
      guidance_scale: 7.5,
      output_format: "jpg",
      prompt_strength: 0.1,
      aspect_ratio: "3:2",
      negative_prompt:
        " blurry, low quality, distorted, deformed, ugly, bad anatomy, unrealistic lighting, oversaturated, undersaturated",
    },
  },
  "recraft-v3": {
    input: {
      prompt: "",
      negative_prompt:
        "blurry, low quality, distorted, deformed, ugly, bad anatomy, unrealistic lighting, oversaturated, undersaturated",
      width: 768,
      height: 512,
      num_outputs: 1,
      scheduler: "DPMSolverMultistep",
      num_inference_steps: 30,
      guidance_scale: 7.5,
      seed: null,
    },
  },
  "imagen-3": {
    input: {
      prompt: "",
      negative_prompt:
        "blurry, low quality, distorted layout, wrong perspective, bad architecture, ugly, deformed, disfigured, watermark, text, signature, duplicate, multiple images, split image",
    },
  },
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("API Request body:", body);

    const { prompt, model } = body;
    if (!prompt || !model) {
      console.error("Missing required fields:", { prompt, model });
      return NextResponse.json(
        { error: "Prompt and model are required" },
        { status: 400 }
      );
    }

    const modelUrl = MODEL_URLS[model as keyof typeof MODEL_URLS];
    if (!modelUrl) {
      console.error("Invalid model specified:", model);
      return NextResponse.json(
        { error: "Invalid model specified" },
        { status: 400 }
      );
    }

    // Get the model-specific configuration
    const modelConfig = MODEL_CONFIGS[model as keyof typeof MODEL_CONFIGS];
    if (!modelConfig) {
      console.error("No configuration found for model:", model);
      return NextResponse.json(
        { error: "Model configuration not found" },
        { status: 400 }
      );
    }

    // Clone the configuration and update the prompt
    const config = JSON.parse(JSON.stringify(modelConfig));
    config.input.prompt = prompt;

    // Make the API request
    const response = await fetch(
      `https://api.replicate.com/v1/models/${modelUrl}/predictions`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          Prefer: model === "imagen-3" ? "wait" : "",
        },
        body: JSON.stringify(config),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Replicate API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `Replicate API error: ${response.status} ${response.statusText}`
      );
    }

    let prediction = await response.json();
    console.log("Initial prediction:", prediction);

    // Poll for the result
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      console.log("Polling prediction status:", prediction.status);
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
        });
        throw new Error("Failed to poll for prediction result");
      }

      prediction = await pollResponse.json();
    }

    console.log("Final prediction status:", prediction.status);
    console.log("Prediction output:", prediction.output);
    let imageUrl: any;
    if (prediction.status === "succeeded") {
      console.log("Prediction output type:", typeof prediction.output);
      if (typeof prediction.output === "string") {
        imageUrl = [prediction.output];
      } else {
        imageUrl = prediction.output;
      }
      console.log("Generation successful, output:", imageUrl);
      return NextResponse.json({ imageUrl: imageUrl });
    } else {
      console.error("Generation failed:", prediction.error);
      throw new Error("Image generation failed");
    }
  } catch (error) {
    console.error("Detailed error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to generate image", details: error.message },
      { status: 500 }
    );
  }
}
