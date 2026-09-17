// Server-side only. Sends the "you've been invited" email carrying a temporary password.
//
// Why not Supabase's own invite email: supabase.auth.admin.inviteUserByEmail() sends Supabase's
// built-in template, but it's a magic-link flow — it doesn't support delivering a temporary
// password (which this module's whole job is), so it can't be used here. Nothing else in this
// project sends transactional email today, so this integrates Resend fresh, per the task's own
// instruction to use it if nothing else is configured.
//
// Requires RESEND_API_KEY and EMAIL_FROM in .env (server-side only, never NEXT_PUBLIC_). Neither
// is configured yet — see the setup note this throws if they're missing.

import { Resend } from 'resend';
import { OAKFLOW_EMAIL_COLORS } from './theme';

function assertConfigured() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      'Email is not configured: set RESEND_API_KEY in the root .env (create a free account at ' +
      'resend.com, verify a sending domain, and copy an API key). Also set EMAIL_FROM to an ' +
      'address on that verified domain, e.g. "OakFlow <noreply@yourdomain.com>".'
    );
  }
  if (!process.env.EMAIL_FROM) {
    throw new Error('Email is not configured: set EMAIL_FROM in the root .env alongside RESEND_API_KEY.');
  }
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

const ROLE_LABELS = {
  admin: 'Admin',
  acquisition: 'Acquisition',
  disposition: 'Disposition',
  title: 'Title',
  partner: 'Partner',
};

function buildEmailHtml({ fullName, email, role, tempPassword, loginUrl }) {
  const c = OAKFLOW_EMAIL_COLORS;
  const roleLabel = ROLE_LABELS[role] || escapeHtml(role);
  // Table-based layout with inline styles throughout — standard practice for HTML email, since
  // most clients (Outlook especially) don't support flexbox/grid or a <style> block reliably.
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${c.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:${c.surface};border:1px solid ${c.border};border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:18px;font-weight:700;color:${c.text};letter-spacing:-.01em;">
                      Oak<span style="color:${c.textMuted};font-weight:500;">Flow</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 0;">
                <h1 style="margin:0 0 14px;font-size:19px;font-weight:650;color:${c.text};letter-spacing:-.01em;">You're invited to OakFlow</h1>
                <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${c.textSecondary};">Hello ${escapeHtml(fullName)},</p>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${c.textSecondary};">Your OakFlow account has been created. You can sign in using the credentials below.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.surface2};border:1px solid ${c.border};border-radius:6px;">
                  <tr>
                    <td style="padding:14px 16px;font-size:13px;color:${c.textMuted};width:120px;border-bottom:1px solid ${c.border};">Role</td>
                    <td style="padding:14px 16px;font-size:13px;color:${c.text};font-weight:600;border-bottom:1px solid ${c.border};">${roleLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 16px;font-size:13px;color:${c.textMuted};border-bottom:1px solid ${c.border};">Email</td>
                    <td style="padding:14px 16px;font-size:13px;color:${c.text};font-weight:600;border-bottom:1px solid ${c.border};">${escapeHtml(email)}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 16px;font-size:13px;color:${c.textMuted};">Temporary password</td>
                    <td style="padding:14px 16px;font-size:14px;color:${c.text};font-weight:700;font-family:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace;">${escapeHtml(tempPassword)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:6px;background:${c.accent};">
                      <a href="${loginUrl}" style="display:inline-block;padding:11px 22px;font-size:14px;font-weight:600;color:${c.accentText};text-decoration:none;border-radius:6px;">Sign in to OakFlow</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 0;">
                <p style="margin:0 0 10px;font-size:12.5px;line-height:1.6;color:${c.textMuted};">For security, you'll be required to create a new password the first time you sign in.</p>
                <p style="margin:0;font-size:12.5px;line-height:1.6;color:${c.textMuted};">If you weren't expecting this invitation, please contact your OakFlow administrator.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 28px;margin-top:8px;border-top:1px solid ${c.border};">
                <p style="margin:16px 0 0;font-size:12.5px;line-height:1.6;color:${c.textMuted};">Welcome to OakFlow,<br/>The OakFlow Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// Never logs `tempPassword` — the caller passes it in, this renders it into the email body only,
// and neither this function nor its caller should ever pass the resolved HTML (or the password
// itself) to console.log/console.error. Errors thrown here carry only the failure reason.
export async function sendInviteEmail({ fullName, email, role, tempPassword, loginUrl }) {
  assertConfigured();
  const resend = new Resend(process.env.RESEND_API_KEY);
  const html = buildEmailHtml({ fullName, email, role, tempPassword, loginUrl });
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "You're invited to OakFlow",
    html,
  });
  if (error) {
    throw new Error(error.message || 'Email send failed');
  }
}
