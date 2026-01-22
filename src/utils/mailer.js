import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.port === 465,
    auth: env.mail.user && env.mail.pass ? { user: env.mail.user, pass: env.mail.pass } : undefined
});

export const sendVerificationEmail = async ({ to, pinCode }) => {
    const subject = "Your CyCup verification PIN";
    const text = `Your verification PIN is: ${pinCode}\nThis PIN expires in 15 minutes.`;
    const html = `<p>Your verification PIN is: <strong>${pinCode}</strong></p><p>This PIN expires in 15 minutes.</p>`;

    await transporter.sendMail({
        from: env.mail.from,
        to,
        subject,
        text,
        html
    });
};

export const sendPasswordResetEmail = async ({ to, resetToken }) => {
    const subject = "Reset your CyCup password";
    const text = `Use this link to reset your password: ${env.frontend.url + '/password/reset/confirm?token=' + resetToken}\nIf you did not request a reset, you can ignore this email.`;
    const html = `<p>Use this link  to reset your password: <strong>${env.frontend.url + '/password/reset/confirm?token=' + resetToken}</strong></p><p>If you did not request a reset, you can ignore this email.</p>`;

    await transporter.sendMail({
        from: env.mail.from,
        to,
        subject,
        text,
        html
    });
};