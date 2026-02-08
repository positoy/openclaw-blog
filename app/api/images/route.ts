import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { generateId } from "@/lib/ulid";
import { isAuthenticated } from "@/lib/auth";

const VOLUME_PATH = process.env.VOLUME_PATH || "./public/uploads";

// Ensure directory exists
async function ensureDir() {
  try {
    await fs.access(VOLUME_PATH);
  } catch {
    await fs.mkdir(VOLUME_PATH, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    await ensureDir();

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "bin";
    const filename = `${generateId()}.${ext}`;
    const filePath = path.join(VOLUME_PATH, filename);

    await fs.writeFile(filePath, buffer);

    // Construct URL
    // In production, this should differ relative to how it's hosted, but for this API it's the API route
    const url = `/api/images/${filename}`;

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
