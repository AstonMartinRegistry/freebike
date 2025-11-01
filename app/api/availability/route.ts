import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";
export const runtime = "nodejs";

// GET /api/availability?bike=bike-one&year=2025&month=10
// Returns days that are already booked for the month (bookedDays)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bike = (searchParams.get("bike") || "bike-one").toLowerCase();
  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  const month = Number(searchParams.get("month")) || new Date().getMonth() + 1; // 1-12

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Invalid year/month" }, { status: 400 });
  }

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0)); // last day of month

  const { data, error } = await supabaseServer
    .from("bookings")
    .select("day")
    .eq("bike", bike)
    .gte("day", start.toISOString().slice(0, 10))
    .lte("day", end.toISOString().slice(0, 10));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bookedDays = (data || []).map((d: any) => d.day);
  return NextResponse.json({ bike, year, month, bookedDays });
}


