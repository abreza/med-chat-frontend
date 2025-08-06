import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const backendResponse = await fetch(`${process.env.BACKEND_URL}/segment`, {
      method: "POST",
      body: formData,
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with ${backendResponse.status}`);
    }

    const segmentedFile = await backendResponse.blob();
    const patientId = backendResponse.headers.get("X-Patient-ID");

    return new NextResponse(segmentedFile, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${patientId}_segmentation.nii.gz"`,
        "X-Patient-ID": patientId || "unknown",
      },
    });
  } catch (error) {
    console.error("Segmentation error:", error);
    return NextResponse.json(
      { error: "Failed to perform segmentation" },
      { status: 500 }
    );
  }
}
