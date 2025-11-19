import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/preview-email?bike=bike-one&day=2025-01-15&email=gsgs@stanford.edu
// Returns the HTML email preview
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bike = searchParams.get("bike") || "bike-one";
  const day = searchParams.get("day") || new Date().toISOString().slice(0, 10);
  const email = searchParams.get("email") || "user@stanford.edu";
  
  // Extract username from email (everything before @)
  const username = email.split("@")[0] || "there";

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 16px;
            line-height: 1.6;
            color: #000000;
            margin: 0;
            padding: 20px;
            background-color: #d6eaff;
            min-height: 100vh;
          }
          p {
            margin: 10px 0;
          }
          ul {
            margin: 10px 0;
            padding-left: 20px;
          }
        </style>
      </head>
      <body>
        <p>Hi ${username}, your booking for the <strong>${bike}</strong> on <strong>${day}</strong> has been recorded!</p>
        <p style="margin-top: 20px;"><u>Where to pick up your bike</u></p>
      </body>
    </html>
  `;

  return new NextResponse(htmlBody, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}

