import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const emails = JSON.parse(formData.get("emails"));
    const subject = formData.get("subject");
    const message = formData.get("message");
    const attachmentFiles = formData.getAll("attachments");
    const emailTemplate = formData.get("emailTemplate");

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "Invalid email list" },
        { status: 400 }
      );
    }

    let htmlContent = message;
    if (emailTemplate) {
      const templateText = await emailTemplate.text();
      htmlContent = templateText.replace("{{message}}", message);
    }

    const attachments = await Promise.all(
      attachmentFiles.map(async (file) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()),
      }))
    );

    let successCount = 0;
    const totalEmails = emails.length;

    // Send emails one by one to track progress
    for (const email of emails) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: subject,
          text: message,
          html: htmlContent,
          attachments: attachments,
        };

        await transporter.sendMail(mailOptions);
        successCount++;
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
      }
    }

    return NextResponse.json({
      message: `Successfully sent ${successCount} out of ${totalEmails} emails`,
      progress: { current: successCount, total: totalEmails },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
