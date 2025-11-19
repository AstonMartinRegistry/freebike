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
  
  // Convert bike ID to friendly name
  function getBikeName(bikeId: string): string {
    const key = String(bikeId || "").toLowerCase();
    if (key === "bike-one" || key === "1") return "beige city bike";
    if (key === "bike-two" || key === "2") return "blue mountain bike";
    if (key === "bike-three" || key === "3") return "grey city bike";
    return bikeId;
  }
  
  // Get bike-specific location address
  function getBikeLocation(bikeId: string): string {
    const key = String(bikeId || "").toLowerCase();
    if (key === "bike-one" || key === "1") return "123 Main Street, Stanford, CA 94305";
    if (key === "bike-two" || key === "2") return "456 University Avenue, Palo Alto, CA 94301";
    if (key === "bike-three" || key === "3") return "789 Campus Drive, Stanford, CA 94305";
    return "Location TBD";
  }
  
  const bikeName = getBikeName(params.bike);
  const bikeLocation = getBikeLocation(params.bike);
  
  // Format dates for booking period
  const bookingDate = new Date(params.day + "T00:00:00Z");
  const nextDate = new Date(bookingDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  const bookingDateStr = bookingDate.toISOString().slice(0, 10); // YYYY-MM-DD
  const nextDateStr = nextDate.toISOString().slice(0, 10); // YYYY-MM-DD
  
  const textBody = [
    `Hi ${username},`,
    `Your booking for the ${bikeName} on ${params.day} has been recorded! We are excited to have you riding with us :D`,
    "",
    "Some rules",
    "- please check brakes and tires before riding",
    "- always lock bike when unattended",
    `- bike must be returned to the same location (your booking is valid from 6am on ${bookingDateStr} to 6am on ${nextDateStr}. Please be timely, others depend on you)`,
    "",
    "Where to pick up your bike",
    "",
    `Your bike is located at ${bikeLocation}`,
    "",
    "Need to cancel?",
    "To cancel your reservation, just reply with \"cancel\"",
    "",
    "Questions or Concerns?",
    "If anything comes up, feel free to text or call (650) 555-1234, happy to help!",
    "",
    "I thought of that while riding my bicyle",
    "- Albert Einstein",
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
          .location {
            margin: 15px 0;
          }
          .location-image {
            max-width: 100%;
            height: auto;
            margin: 10px 0;
            border-radius: 8px;
          }
          .quote {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(0,0,0,0.1);
          }
          .quote-author {
            text-align: center;
            font-style: normal;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <p>Hi ${username},</p>
        <p>Your booking for the <strong>${bikeName}</strong> on <strong>${params.day}</strong> has been recorded! We are excited to have you riding with us :D</p>
        <p style=\"margin-top: 20px;\"><u>Some rules</u></p>
        <ul>
          <li>please check brakes and tires before riding</li>
          <li>always lock bike when unattended</li>
          <li>bike must be returned to the same location (your booking is valid from 6am on ${bookingDateStr} to 6am on ${nextDateStr}. Please be timely, others depend on you)</li>
        </ul>
        <p style=\"margin-top: 20px;\"><u>Where to pick up your bike</u></p>
        <p>Your bike is located at ${bikeLocation}</p>
        <div class=\"location\">
          <img src=\"https://via.placeholder.com/400x200?text=Bike+Location+1\" alt=\"Bike Location 1\" class=\"location-image\" />
          <img src=\"https://via.placeholder.com/400x200?text=Bike+Location+2\" alt=\"Bike Location 2\" class=\"location-image\" />
        </div>
        <p style=\"margin-top: 20px;\"><u>Need to cancel?</u></p>
        <p>To cancel your reservation, just reply with "cancel"</p>
        <p style=\"margin-top: 20px;\"><u>Questions or Concerns?</u></p>
        <p>If anything comes up, feel free to text or call <strong>(650) 555-1234</strong>, happy to help!</p>
        <div class=\"quote\">
          <p style=\"text-align: center; font-style: italic; margin: 0;\">I thought of that while riding my bicyle</p>
          <p class=\"quote-author\" style=\"margin-top: 8px; margin-bottom: 0;\">- Albert Einstein</p>
        </div>
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


