import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const response = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: { prompt,
                 "go_fast": true,
      "megapixels": "1",
      "num_outputs": 1,
      "aspect_ratio": "1:1",
      "output_format": "webp",
      "output_quality": 80,
      "num_inference_steps": 4
            },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
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
      throw new Error('Image generation failed');
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}