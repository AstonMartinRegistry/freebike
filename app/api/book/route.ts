import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";
import { sendBookingEmail } from "../../../lib/mailer";
export const runtime = "nodejs";

function isStanfordEmail(email: string): boolean {
  // Allow subdomains like cs.stanford.edu, alumni.stanford.edu, etc.
  return /@(?:[a-z0-9-]+\.)*stanford\.edu$/i.test(email.trim());
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const bike = String(body?.bike || "bike-one").toLowerCase();
  const email = String(body?.email || "").trim();
  const day = String(body?.day || ""); // ISO YYYY-MM-DD

  if (!email || !day) {
    return NextResponse.json({ error: "Missing email or day" }, { status: 400 });
  }
  if (!isStanfordEmail(email)) {
    return NextResponse.json({ error: "Email must be a stanford.edu address" }, { status: 400 });
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return NextResponse.json({ error: "Invalid day format" }, { status: 400 });
  }
  const d = new Date(day + "T00:00:00Z");
  if (isNaN(d.getTime())) {
    return NextResponse.json({ error: "Invalid day" }, { status: 400 });
  }

  // Availability is implicit: a day is available unless already booked.

  // Enforce max 3 days per month per person (across all bikes)
  // Skip limit check for unlimited users
  const UNLIMITED_EMAILS = ["dkiss@stanford.edu"];
  const hasUnlimitedSlots = UNLIMITED_EMAILS.includes(email.toLowerCase());
  
  if (!hasUnlimitedSlots) {
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const start = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
    const end = new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10);

    const { count, error: cntErr } = await supabaseServer
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("day", start)
      .lte("day", end);
    if (cntErr) {
      return NextResponse.json({ error: cntErr.message }, { status: 500 });
    }
    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: "Monthly booking limit reached (3)" }, { status: 400 });
    }
  }

  // Prevent double booking of the same day for a given bike
  const { data: existing, error: existErr } = await supabaseServer
    .from("bookings")
    .select("id")
    .eq("bike", bike)
    .eq("day", day)
    .maybeSingle();
  if (existErr) {
    return NextResponse.json({ error: existErr.message }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json({ error: "That day is already booked" }, { status: 409 });
  }

  // Create booking
  const { error: insErr } = await supabaseServer
    .from("bookings")
    .insert({ bike, day, email });
  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  // Try to send an email notification; don't fail booking if email fails
  try {
    await sendBookingEmail({ bike, day, email, to: email });
  } catch {
    // swallow email errors
  }

  return NextResponse.json({ ok: true });
}


