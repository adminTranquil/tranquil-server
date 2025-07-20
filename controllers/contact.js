import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter error:", error);
  } else {
    console.log("Server is ready to send email", success);
  }
});

const createHtmlTemplate = (data) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
      .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
      .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #0056b3; }
      .header img { width: 150px; }
      .content { padding: 20px 0; }
      .content h2 { color: #333333; }
      .info-grid { display: grid; grid-template-columns: 100px 1fr; gap: 10px; margin-top: 20px; }
      .info-grid strong { color: #0056b3; }
      .message-box { background-color: #f9f9f9; border-left: 4px solid #0056b3; padding: 15px; margin-top: 20px; font-style: italic; }
      .footer { text-align: center; font-size: 12px; color: #777777; padding-top: 20px; border-top: 1px solid #eeeeee; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="cid:logo" alt="Tranquil Hospital Logo">
      </div>
      <div class="content">
        <h2>New Inquiry Received</h2>
        <p>You have received a new message from the website contact form.</p>
        <div class="info-grid">
          <strong>From:</strong>       <span>${data.name}</span>
          <strong>Email:</strong>      <span>${data.email}</span>
          <strong>Phone:</strong>      <span>${
            data.phone || "Not provided"
          }</span>
          <strong>Subject:</strong>    <span>${data.subject}</span>
        </div>
        <div class="message-box">
          <p><strong>Message:</strong></p>
          <p>${data.message}</p>
        </div>
      </div>
      <div class="footer">
        <p>This email was sent from the contact form on thetranquilhospitalsltd.co.ke</p>
        <p>&copy; ${new Date().getFullYear()} The Tranquil Hospitals Ltd. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;

export const sendContactEmail = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, Email, Subject, and Message are required.",
    });
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
        path: path.join(__dirname, "../assets/logo.png"),
        cid: "logo",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message:
        "Thank you for your message! Message has been sent successfully. We will contact you soon",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "There was an error sending your message. Please try again.",
    });
  }
};
