import path from "path";
import { fileURLToPath } from "url";

import nodemailer from "nodemailer";
// NOTE: nodemailer-express-handlebars is not installed in package.json.
// This file sends either raw HTML (positional signature) or plain text.
// If you later install 'nodemailer-express-handlebars', you can re-enable template rendering.


import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_TRAP_HOST,
  port: Number(process.env.MAIL_TRAP_PORT),
  auth: {
    user: process.env.MAIL_TRAP_USER,
    pass: process.env.MAIL_TRAP_PASS,
  },
  secure: false,
});

const handlebarOptions = {
  viewEngine: {
    extname: ".handlebars",

    layoutsDir: path.join(
      process.cwd(),
      "views",
      "layouts"
    ),

    defaultLayout: "main",
  },

  viewPath: path.join(
    process.cwd(),
    "views"
  ),

  extName: ".handlebars",
};

// transporter.use("compile", hbs(handlebarOptions));
// Disabled because nodemailer-express-handlebars is not installed.
// Current controllers already pass raw HTML strings as the 3rd argument to sendEmail.


const sendEmail = async (arg1, arg2, arg3) => {
  try {
    // Backward-compatible signature:
    // - sendEmail(to, subject, htmlOrTemplate)
    // - sendEmail({to, subject, template, context})
    const { to, subject, template, context } =
      typeof arg1 === "object" && arg1 !== null
        ? arg1
        : { to: arg1, subject: arg2, template: null, context: null };

    let html = undefined;
    let mailTemplate = template;

    if (typeof arg1 !== "object" && arg1 !== null) {
      // third argument is raw HTML in your current controllers
      html = arg3;
    } else {
      // object signature
      if (template) {
        mailTemplate = template;
      }
    }

    const mailOptions = {
      from: `"TourBook" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      ...(html ? { html } : {}),
      ...(mailTemplate ? { template: mailTemplate } : {}),
      ...(context || !mailTemplate
        ? {
            context: {
              ...(context || {}),
              currentYear: new Date().getFullYear(),
              websiteLink:
                process.env.FRONTEND_URL ||
                "http://localhost:3000",
            },
          }
        : {}),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

export default sendEmail;