import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viewsPath = path.join(__dirname, "../views");
const layoutsPath = path.join(
  __dirname,
  "../views/layouts"
);

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_TRAP_HOST,
  port: Number(process.env.MAIL_TRAP_PORT),
  secure:
    process.env.MAIL_TRAP_SECURE === "true" ||
    Number(process.env.MAIL_TRAP_PORT) === 465,
  auth: {
    user: process.env.MAIL_TRAP_USER,
    pass: process.env.MAIL_TRAP_PASS,
  },
});

// Register Handlebars
transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extname: ".handlebars",
      layoutsDir: layoutsPath,
      defaultLayout: "main",
      partialsDir: viewsPath,
    },
    viewPath: viewsPath,
    extName: ".handlebars",
  })
);

const sendEmail = async (arg1, arg2, arg3) => {
  try {
    let to;
    let subject;
    let html;
    let template;
    let context;

    // Old style:
    // sendEmail(to, subject, html)
    if (
      typeof arg1 === "string"
    ) {
      to = arg1;
      subject = arg2;
      html = arg3;
    }
    // New style:
    // sendEmail({to,subject,template,context})
    else {
      ({
        to,
        subject,
        template,
        context,
      } = arg1);
    }

    if (!to) {
      throw new Error(
        "Recipient email is required"
      );
    }

    const mailOptions = {
      from: `"TourBook" <${process.env.EMAIL_USER}>`,
      to,
      subject,
    };

    // Template email
    if (template) {
      mailOptions.template = template;

      mailOptions.context = {
        ...(context || {}),
        currentYear:
          new Date().getFullYear(),
        websiteLink:
          process.env.FRONTEND_URL ||
          "http://localhost:3000",
      };
    }

    // Raw HTML email
    if (html) {
      mailOptions.html = html;
    }

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      "✅ Email sent:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "❌ Email sending failed:",
      error
    );
    throw error;
  }
};

export default sendEmail;