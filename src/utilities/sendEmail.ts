import nodemailer from "nodemailer";
import config from "config";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const transporter = nodemailer.createTransport({
  host: config.get<string>("smtpHost"),
  port: config.get<number>("smtpPort"),
  auth: {
    user: config.get<string>("smtpEmail"),
    pass: config.get<string>("smtpPassword"),
  },
});

const sendEmail = async (options: EmailOptions) => {
  const fromName = config.get<string>("fromName");
  const fromEmail = config.get<string>("fromEmail");
  // send mail with defined transport object
  const message = {
    from: `${fromName} <${fromEmail}>`, // sender address
    to: options.email, // email receiver
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  };

  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
};

export default sendEmail;
