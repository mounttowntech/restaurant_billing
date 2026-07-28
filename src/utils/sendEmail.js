const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  const info = await transporter.sendMail({
    from: `"Restaurant Billing" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log("Mail Sent:", info.messageId);
};

module.exports = sendEmail;