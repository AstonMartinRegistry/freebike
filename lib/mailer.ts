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
  const subject = `Bike Booking Confirmation`;
  
  // Extract username from email (everything before @)
  const username = params.email.split("@")[0] || "there";
  
  const textBody = [
    `Hi ${username}, your booking for the ${params.bike} on ${params.day} has been recorded!`,
    "",
    "Where to pick up your bike",
  ].join("\n");

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
        <p>Hi ${username}, your booking for the <strong>${params.bike}</strong> on <strong>${params.day}</strong> has been recorded!</p>
        <p style=\"margin-top: 20px;\"><u>Where to pick up your bike</u></p>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: SENDER_EMAIL,
    to: toAddress,
    bcc: [ADMIN_EMAIL, ADMIN_EMAIL_2].filter(Boolean).join(", ") || undefined,
    subject,
    text: textBody,
    html: htmlBody,
  });

  return { sent: true } as const;
}


