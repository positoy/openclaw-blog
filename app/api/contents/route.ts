import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateId } from "@/lib/ulid";
import { isAuthenticated } from "@/lib/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const id = generateId();
    await db.query("INSERT INTO contents (id, content) VALUES (?, ?)", [
      id,
      content,
    ]);

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const offset = (page - 1) * limit;

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, content, created_at, modified_at FROM contents ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset],
    );

    const [countResult] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM contents",
    );
    const total = countResult[0].total;

    // Convert Date objects to ISO strings for JSON serialization
    // DB stores UTC timestamps; API returns UTC ISO strings
    const formattedRows = rows.map((row) => ({
      ...row,
      created_at: row.created_at
        ? new Date(row.created_at + " UTC").toISOString()
        : null,
      modified_at: row.modified_at
        ? new Date(row.modified_at + " UTC").toISOString()
        : null,
    }));

    return NextResponse.json({
      data: formattedRows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contents:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
