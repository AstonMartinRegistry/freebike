import nodemailer from "nodemailer";

function env(name: string): string | undefined {
  return process.env[name] || process.env[name.toLowerCase()];
}

const SENDER_EMAIL = env("SENDER_EMAIL");
const SENDER_PASSWORD = env("SENDER_PASSWORD");
// Optional admin copies
const ADMIN_EMAIL = env("RECEIVER_EMAIL");
const ADMIN_EMAIL_2 = env("RECEIVER_EMAIL_2");

export async function sendBookingEmail(params: {
  bike: string;
  day: string; // YYYY-MM-DD
  email: string; // user email (for context)
  to?: string; // recipient; defaults to user email
}) {
  if (!SENDER_EMAIL || !SENDER_PASSWORD) {
    return { sent: false, reason: "missing_config" } as const;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: SENDER_EMAIL,
      pass: SENDER_PASSWORD,
    },
  });

  const toAddress = (params.to || params.email).trim();
  const subject = `Booking Confirmation: ${params.bike} on ${params.day}`;
  const body = [
    `Your booking has been recorded:`,
    `- Bike: ${params.bike}`,
    `- Day: ${params.day}`,
    "",
    "Thanks for using the Stanford Free Bike Network.",
  ].join("\n");

  await transporter.sendMail({
    from: SENDER_EMAIL,
    to: toAddress,
    bcc: [ADMIN_EMAIL, ADMIN_EMAIL_2].filter(Boolean).join(", ") || undefined,
    subject,
    text: body,
  });

  return { sent: true } as const;
}


