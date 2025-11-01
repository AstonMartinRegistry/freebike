import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";
export const runtime = "nodejs";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Math.min(200, Number(searchParams.get("limit")) || 50));
  const year = searchParams.get("year");
  const month = searchParams.get("month"); // 1-12

  let p_month: string | null = null;
  if (year && month) {
    const y = Number(year);
    const m = Number(month);
    if (Number.isFinite(y) && Number.isFinite(m) && m >= 1 && m <= 12) {
      p_month = new Date(Date.UTC(y, m - 1, 1)).toISOString().slice(0, 10);
    }
  }

  // Prefer calling the SQL function if present
  const { data, error } = await supabaseServer.rpc("get_top_bikers", {
    p_limit: limit,
    p_month,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ topBikers: data || [] });
}


