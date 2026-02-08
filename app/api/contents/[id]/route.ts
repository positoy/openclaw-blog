import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Helper to extract params from the route context
// In Next.js 15+, params is a Promise, but in 16 it might be async/await pattern
// We need to define the type for context
type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, content, created_at, modified_at FROM contents WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
