import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";

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

export async function DELETE(request: NextRequest, { params }: Context) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM contents WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
