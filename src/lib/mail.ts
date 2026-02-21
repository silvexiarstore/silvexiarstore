import nodemailer from "nodemailer";

// إعداد السيرفر (SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"Silvexiar Vault" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
};