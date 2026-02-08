import { NextRequest, NextResponse } from "next/server";
import { fileExists, getPresignedUrl } from "@/lib/storage";

type Context = {
  params: Promise<{ filename: string }>;
};

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { filename } = await params;

    // Prevent directory traversal
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const exists = await fileExists(filename);
    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Redirect to presigned URL — bucket egress is free on Railway
    const presignedUrl = await getPresignedUrl(filename, 86400); // 24 hours

    return NextResponse.redirect(presignedUrl, 302);
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
