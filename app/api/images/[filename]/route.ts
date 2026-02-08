import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// We need to install mime-types or similar, or just map common ones.
// I'll stick to basic mapping to avoid dependency if possible, or assume user installs it.
// Actually, I'll install `mime-types` to be safe, or just use a simple map.

const VOLUME_PATH = process.env.VOLUME_PATH || "./public/uploads";

type Context = {
  params: Promise<{ filename: string }>;
};

function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { filename } = await params;
    const filePath = path.join(VOLUME_PATH, filename);

    // Prevent directory traversal
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const contentType = getContentType(filename);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
