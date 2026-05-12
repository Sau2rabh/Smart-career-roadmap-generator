const { Resend } = require('resend');
const nodemailer = require('nodemailer');

/** Check if Resend API key is configured */
const hasResendKey = () => {
  const key = process.env.RESEND_API_KEY || '';
  return key.length > 0 && key !== 'your-resend-api-key';
};

/** Check if Google Apps Script URL is configured */
const hasGoogleScript = () => {
  const url = process.env.GOOGLE_SCRIPT_URL || '';
  return url.length > 0 && url.startsWith('https://script.google.com');
};

/** Check if real Gmail SMTP credentials are configured */
const hasGmailCredentials = () => {
  const user = process.env.EMAIL_USER || '';
  const pass = process.env.EMAIL_PASS || '';
  return (
    user.length > 0 && pass.length > 0 &&
    !user.includes('your-gmail') && !pass.includes('your-app-password')
  );
};

/** Print OTP to backend terminal (dev fallback) */
const logToConsole = (to, otp, purpose) => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  📧 OTP EMAIL — DEV CONSOLE MODE      ║');
  console.log('╠══════════════════════════════════════╣');
  console.log('║  To : ' + to.padEnd(32) + ' ║');
  console.log('║  Purpose : ' + purpose.padEnd(27) + ' ║');
  console.log('║  OTP Code : \x1b[33m\x1b[1m' + otp + '\x1b[0m' + '                           ║');
  console.log('╚══════════════════════════════════════╝\n');
};

const getEmailTemplate = (otp, purpose) => {
  const titleMap = { signup: 'Email Verification', forgot_password: 'Password Reset', login: 'Login Verification' };
  const descMap = {
    signup: 'Use the OTP below to verify your email and complete registration.',
    forgot_password: 'Use the OTP below to reset your password. It expires in 10 minutes.',
    login: 'Use the OTP below to verify your login. It expires in 10 minutes.',
  };

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f0f17;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:40px auto;background:#1a1a2e;border-radius:16px;overflow:hidden;">
    <tr>
      <td style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:32px;text-align:center;">
        <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">Career Roadmap AI</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Your AI-powered career journey</p>
      </td>
    </tr>
    <tr>
      <td style="padding:36px 40px;">
        <h2 style="margin:0 0 10px;font-size:22px;color:#fff;">${titleMap[purpose]}</h2>
        <p style="margin:0 0 28px;color:#a0a0b0;font-size:14px;line-height:1.6;">${descMap[purpose]}</p>
        <div style="background:#0f0f17;border:1px solid #333;border-radius:14px;padding:28px;text-align:center;margin-bottom:24px;">
          <p style="margin:0 0 12px;font-size:11px;color:#555;letter-spacing:0.2em;text-transform:uppercase;">Your One-Time Password</p>
          <div style="font-size:46px;font-weight:900;letter-spacing:14px;color:#a855f7;font-family:monospace;">${otp}</div>
          <p style="margin:14px 0 0;font-size:12px;color:#444;">Valid for <strong style="color:#666;">10 minutes</strong> · Do not share this code</p>
        </div>
        <p style="margin:0;font-size:12px;color:#444;text-align:center;">If you did not request this, you can safely ignore this email.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px;border-top:1px solid #1f1f2e;text-align:center;">
        <p style="margin:0;font-size:11px;color:#333;">© 2025 Career Roadmap AI · All rights reserved</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Send OTP email using Resend (primary), Gmail SMTP (fallback), or console (dev fallback).
 */
const sendOtpEmail = async (to, otp, purpose = 'signup') => {
  const subjectMap = {
    signup: 'Verify your email – Career Roadmap AI',
    forgot_password: 'Reset your password – Career Roadmap AI',
    login: 'Login Verification – Career Roadmap AI',
  };

  const html = getEmailTemplate(otp, purpose);

  // ─── Option 1: Google Apps Script (highest priority for domain-less setup) ──
  if (hasGoogleScript()) {
    try {
      const response = await fetch(process.env.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: to,
          subject: subjectMap[purpose],
          html: html,
        }),
      });

      if (response.ok) {
        console.log('✅ OTP sent via Google Script to ' + to);
        return;
      } else {
        const errText = await response.text();
        console.error(`⚠️ Google Script error (${response.status}):`, errText);
      }
    } catch (err) {
      console.error('⚠️ Google Script failed:', err.message);
    }
  }

  // ─── Option 2: Resend API (recommended for production with domain) ───────────
  if (hasResendKey()) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const { data, error } = await resend.emails.send({
        from: `Career Roadmap AI <${fromEmail}>`,
        to: [to],
        subject: subjectMap[purpose],
        html,
      });

      if (error) {
        console.error('⚠️ Resend API error:', error.message || error);
        // Continue to fallback
      } else {
        console.log('✅ OTP sent via Resend to ' + to, data?.id || '');
        return;
      }
    } catch (err) {
      console.error('⚠️ Resend failed:', err.message);
    }
  }

  // ─── Option 3: Gmail SMTP ─────────────────────────────────────────────────
  if (hasGmailCredentials()) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
      await transporter.sendMail({
        from: '"Career Roadmap AI" <' + process.env.EMAIL_USER + '>',
        to,
        subject: subjectMap[purpose],
        html,
      });
      console.log('✅ OTP sent via Gmail to ' + to);
      return;
    } catch (err) {
      console.error('⚠️ Gmail SMTP failed:', err.message);
    }
  }

  // ─── Final Fallback: Console (Only in development) ───────────────────────
  if (process.env.NODE_ENV === 'development') {
    logToConsole(to, otp, purpose);
    return;
  }

  throw new Error('All email sending methods failed. Please check backend logs.');
};

module.exports = { sendOtpEmail };
