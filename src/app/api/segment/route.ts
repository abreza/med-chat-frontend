import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const backendResponse = await fetch(`${process.env.BACKEND_URL}/segment`, {
      method: "POST",
      body: formData,
    });

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.text();
      console.error(
        `Backend responded with ${backendResponse.status}: ${errorBody}`
      );
      return NextResponse.json(
        {
          error:
            `Backend Error: ${errorBody}` || "Failed to perform segmentation",
        },
        { status: backendResponse.status }
      );
    }

    const segmentationData = await backendResponse.json();

    return NextResponse.json(segmentationData);
  } catch (error) {
    console.error("Segmentation API route error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
