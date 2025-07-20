import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter setup error:", error);
  } else {
    console.log("Transporter is ready to send emails");
  }
});

const createHtmlTemplate = ({ name, email, phone, subject, message }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
  <style> /* inline CSS omitted for brevity */ </style>
</head>
<body>
  <h2>New Inquiry Received</h2>
  <p><strong>From:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
  <p><strong>Subject:</strong> ${subject}</p>
  <div>${message}</div>
</body>
</html>
`;

export default async function handler({ req, res }) {
  if (req.method === "OPTIONS") {
    res.json({}, 200, {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return;
  }

  if (req.method !== "POST") {
    res.json({ success: false, message: "Method not allowed" }, 405, {
      "Access-Control-Allow-Origin": "http://localhost:3000",
    });
    return;
  }

  const { name, email, phone, subject, message } = req.payload || {};

  if (!name || !email || !subject || !message) {
    res.json(
      {
        success: false,
        message: "Name, email, subject, and message are required.",
      },
      400,
      { "Access-Control-Allow-Origin": "http://localhost:3000" }
    );
    return;
  }

  const mailOptions = {
    from: `"${name}" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    replyTo: email,
    subject: `New Inquiry: ${subject}`,
    html: createHtmlTemplate({ name, email, phone, subject, message }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "assets/logo.png"),
        cid: "logo",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json(
      { success: true, message: "Thank you! Your message has been sent." },
      200,
      { "Access-Control-Allow-Origin": "http://localhost:3000" }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    res.json(
      {
        success: false,
        message: "Failed to send message. Please try again later.",
      },
      500,
      { "Access-Control-Allow-Origin": "http://localhost:3000" }
    );
  }
}
