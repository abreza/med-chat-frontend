import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/annotate-segment`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with ${backendResponse.status}`);
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Annotation segmentation error:", error);
    return NextResponse.json(
      { error: "Failed to perform annotation-based segmentation" },
      { status: 500 }
    );
  }
}
