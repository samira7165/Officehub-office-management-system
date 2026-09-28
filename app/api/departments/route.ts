import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { departments, employees } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select({
      id: departments.id,
      name: departments.name,
      description: departments.description,
      color: departments.color,
      headcount: sql<number>`count(${employees.id})`.mapWith(Number),
    })
    .from(departments)
    .leftJoin(employees, eq(employees.departmentId, departments.id))
    .groupBy(departments.id, departments.name, departments.description, departments.color);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "Department name is required" }, { status: 400 });
  const [{ id }] = await db.insert(departments).values({
    name: body.name,
    description: body.description || "",
    color: body.color || "#6C5DD3",
  }).$returningId();
  const [created] = await db.select().from(departments).where(eq(departments.id, id));
  return NextResponse.json(created, { status: 201 });
}
