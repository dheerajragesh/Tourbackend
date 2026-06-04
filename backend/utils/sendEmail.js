import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

// Ensure env file is loaded from repo root regardless of cwd
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const requiredEnv = [
  "MAIL_TRAP_HOST",
  "MAIL_TRAP_PORT",
  "MAIL_TRAP_USER",
  "MAIL_TRAP_PASS",
  "EMAIL_USER",
];

function getEnv(name) {
  return process.env[name];
}

function getMissingEnv() {
  return requiredEnv.filter((k) => {
    const v = getEnv(k);
    return v === undefined || v === null || String(v).trim() === "";
  });
}

function getSecureFromPort(portStr) {
  const override = process.env.MAIL_TRAP_SECURE;
  if (override !== undefined) {
    return override === "true" || override === "1";
  }

  // Common convention: 465 => implicit TLS
  return String(portStr) === "465";
}

function createTransporter() {
  const missing = getMissingEnv();
  if (missing.length) {
    throw new Error(
      `Email not configured. Missing env vars: ${missing.join(", ")}`
    );
  }

  const portNum = Number(process.env.MAIL_TRAP_PORT);
  if (!Number.isFinite(portNum)) {
    throw new Error(
      `Invalid MAIL_TRAP_PORT: ${process.env.MAIL_TRAP_PORT}`
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_TRAP_HOST,
    port: portNum,
    auth: {
      user: process.env.MAIL_TRAP_USER,
      pass: process.env.MAIL_TRAP_PASS,
    },
    secure: getSecureFromPort(process.env.MAIL_TRAP_PORT),
  });

  return transporter;
}

const sendEmail = async (arg1, arg2, arg3) => {
  try {
    const transporter = createTransporter();

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

    if (!to) {
      throw new Error("Missing 'to' email address");
    }

    const mailOptions = {
      from: `"TourBook" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      ...(html ? { html } : {}),
      // Template rendering requires nodemailer-express-handlebars compile middleware.
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
    // Improve debuggability: show nodemailer + config-related info
    console.error(
      "Email sending failed:",
      {
        message: error?.message || String(error),
        code: error?.code,
        response: error?.response,
        stack: error?.stack,
        // Avoid logging passwords; include only host/user/port presence
        env: {
          MAIL_TRAP_HOST: process.env.MAIL_TRAP_HOST ? "***" : undefined,
          MAIL_TRAP_PORT: process.env.MAIL_TRAP_PORT,
          MAIL_TRAP_USER: process.env.MAIL_TRAP_USER ? "***" : undefined,
          EMAIL_USER: process.env.EMAIL_USER ? "***" : undefined,
        },
      }
    );
    throw error;
  }
};

export default sendEmail;

