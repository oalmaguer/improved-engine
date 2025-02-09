import { NextResponse } from "next/server";

const MODEL_URLS = {
  "flux-dev": "black-forest-labs/flux-dev",
  "flux-schnell": "black-forest-labs/flux-schnell",
  "flux-1.1-pro-ultra": "black-forest-labs/flux-1.1-pro-ultra",
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
      go_fast: true,
      guidance: 7.5,
      megapixels: "1",
      num_outputs: 1,
      aspect_ratio: "3:2",
      output_format: "jpg",
      output_quality: 80,
      prompt_strength: 0.9,
      num_inference_steps: 28,
      negative_prompt:
        "blurry, low quality, distorted, deformed, ugly, bad anatomy",
    },
  },
  "flux-1.1-pro-ultra": {
    input: {
      prompt: "",
      negative_prompt:
        "blurry, low quality, distorted, deformed, ugly, bad anatomy",
      num_inference_steps: 50,
      num_outputs: 1,
      guidance_scale: 10.0,
      output_format: "jpg",
      prompt_strength: 0.8,
      aspect_ratio: "3:2",
      scheduler: "DPMSolverMultistep",
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

    // Get model config and set prompt
    const config = { ...MODEL_CONFIGS[model as keyof typeof MODEL_CONFIGS] };

    // Enhance the prompt based on the model
    let enhancedPrompt = prompt;
    if (model === "flux-1.1-pro-ultra") {
      enhancedPrompt = `${prompt}, masterpiece, best quality, extremely detailed`;
    }

    config.input.prompt = enhancedPrompt;

    console.log("Final config:", config);

    const response = await fetch(
      `https://api.replicate.com/v1/models/${modelUrl}/predictions`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
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
