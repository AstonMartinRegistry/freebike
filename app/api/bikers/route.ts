import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

export const runtime = "nodejs";

// GET /api/bikers?limit=20&month=2025-10-01
// Calls Postgres function public.get_top_bikers to return masked emails
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get("limit"));
  const monthParam = searchParams.get("month"); // e.g., YYYY-MM-01

  const p_limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 200) : undefined;
  const p_month = monthParam && /\d{4}-\d{2}-\d{2}/.test(monthParam) ? monthParam : undefined;

  const { data, error } = await supabaseServer.rpc("get_top_bikers", {
    ...(p_limit ? { p_limit } : {}),
    ...(p_month ? { p_month } : {}),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Expect rows: { email, favourite_bike, booking_count }
  const topBikers = Array.isArray(data) ? data : [];
  return NextResponse.json({ topBikers });
}


