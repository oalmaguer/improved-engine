import { NextResponse } from "next/server";

const MODEL_ENDPOINTS = {
  schnell: "black-forest-labs/flux-schnell",
  flux: "black-forest-labs/flux-dev",
  pro: "black-forest-labs/flux-1.1-pro",
  lightning: "bytedance/sdxl-lightning-4step",
};

const MODEL_CONFIGS = {
  flux: {
    go_fast: true,
    megapixels: "1",
    num_outputs: 1,
    aspect_ratio: "1:1",
    output_format: "webp",
    output_quality: 80,
    num_inference_steps: 30,
  },
  pro: {
    num_outputs: 1,
    scheduler: "K_EULER",
    num_inference_steps: 50,
    guidance_scale: 7.5,
    width: 1024,
    height: 1024,
  },
  schnell: {
    go_fast: true,
    megapixels: "1",
    num_outputs: 1,
    aspect_ratio: "1:1",
    output_format: "webp",
    output_quality: 80,
    num_inference_steps: 4,
  },
  lightning: {
    prompt_strength: 7.5,
    num_inference_steps: 4,
    width: 1024,
    height: 1024,
    refine: "expert_ensemble_refiner",
    scheduler: "K_EULER",
    guidance_scale: 7.5,
    apply_watermark: false,
    high_noise_frac: 0.8,
    negative_prompt: "",
  },
};

export async function POST(request: Request) {
  try {
    const { prompt, model } = await request.json();

    if (!prompt || !model) {
      return NextResponse.json(
        { error: "Missing prompt or model" },
        { status: 400 }
      );
    }

    const modelEndpoint = MODEL_ENDPOINTS[model];
    console.log("modelEndpoint", modelEndpoint);
    const url = `https://api.replicate.com/v1/models/${modelEndpoint}/predictions`;
    const bytedanceurl = "https://api.replicate.com/v1/predictions";
    const response = await fetch(
      `https://api.replicate.com/v1/models/${modelEndpoint}/predictions`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          //if bytedanceurl is true, use the bytedanceurl
          input: {
            ...MODEL_CONFIGS[model],
            prompt,
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
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
