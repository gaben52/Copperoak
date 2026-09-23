// Server-side only. Sends the "you've been invited" email carrying a temporary password.
//
// Why not Supabase's own invite email: supabase.auth.admin.inviteUserByEmail() sends Supabase's
// built-in template, but it's a magic-link flow — it doesn't support delivering a temporary
// password (which this module's whole job is), so it can't be used here.
//
// Sends over Gmail SMTP via nodemailer rather than a transactional-email API. Requires
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and EMAIL_FROM in .env (server-side only,
// never NEXT_PUBLIC_) — see the setup note this throws if any are missing.

import nodemailer from 'nodemailer';
import { ACQUIRE_HUB_EMAIL_COLORS } from './theme';

const REQUIRED_ENV_VARS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'EMAIL_FROM'];

function assertConfigured() {
  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      throw new Error(
        `Email is not configured: set ${key} in the root .env (Gmail SMTP needs SMTP_HOST, ` +
        'SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and EMAIL_FROM — see the comment above these keys ' +
        'in .env for how to generate a Gmail App Password).'
      );
    }
  }
}

function buildTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
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
  const c = ACQUIRE_HUB_EMAIL_COLORS;
  const roleLabel = ROLE_LABELS[role] || escapeHtml(role);
  const siteOrigin = new URL('/', loginUrl).toString();
  // Absolute, not relative — email clients load images over the open internet, not from this
  // app's own origin, so the logo has to be a full URL. Derived from loginUrl's own origin
  // (which is SITE_URL, the real acquire-hub.com domain — see app/api/admin/invite/route.js)
  // rather than hardcoded a second time here.
  const logoUrl = new URL('/assets/acquire-hub-logo.png', loginUrl).toString();
  // Table-based layout with inline styles throughout — standard practice for HTML email, since
  // most clients (Outlook especially) don't support flexbox/grid or a <style> block reliably.
  // The header/footer mirror the app's own dark-sidebar brand block (components/shell/
  // AppShell.jsx — logo + "ACQUIRE HUB" wordmark with HUB in gold + a muted tagline) and the
  // temp-password callout deliberately reuses that same dark tone lower in the email, so the
  // whole message reads as one designed system bookended by it, not a plain page with a table
  // dropped in the middle.
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${c.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <!-- Preheader: the snippet inbox list views show next to the subject line. Hidden on open,
         padded with &zwnj;/nbsp so clients don't fall back to rendering the first visible text
         (the logo's alt attribute) as the preview instead. -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
      Your Acquire Hub account is ready — sign in with the temporary password inside.
      ${'&zwnj;&nbsp;'.repeat(40)}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.bg};padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

            <!-- Card -->
            <tr>
              <td style="background:${c.surface};border:1px solid ${c.border};border-radius:14px;overflow:hidden;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

                  <!-- Header -->
                  <tr>
                    <td style="background:${c.headerBg};background-color:${c.headerBg};padding:36px 40px 30px;border-bottom:3px solid ${c.gold};">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-right:14px;vertical-align:middle;">
                            <img src="${logoUrl}" width="42" height="42" alt="Acquire Hub" style="display:block;" />
                          </td>
                          <td style="vertical-align:middle;">
                            <div style="font-size:19px;font-weight:750;letter-spacing:.01em;color:#ffffff;line-height:1.2;">ACQUIRE <span style="color:${c.gold};">HUB</span></div>
                            <div style="font-size:9.5px;font-weight:600;letter-spacing:.14em;color:${c.headerText};text-transform:uppercase;margin-top:5px;">FIND <span style="color:${c.gold};">&middot;</span> ACQUIRE <span style="color:${c.gold};">&middot;</span> SCALE</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Intro -->
                  <tr>
                    <td style="padding:40px 40px 0;">
                      <div style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${c.gold};margin-bottom:10px;">Account Invitation</div>
                      <h1 style="margin:0 0 14px;font-size:24px;font-weight:700;color:${c.text};letter-spacing:-.015em;line-height:1.25;">You're invited to Acquire Hub</h1>
                      <p style="margin:0 0 4px;font-size:14.5px;line-height:1.65;color:${c.textSecondary};">Hello ${escapeHtml(fullName)},</p>
                      <p style="margin:0 0 28px;font-size:14.5px;line-height:1.65;color:${c.textSecondary};">An administrator has created your Acquire Hub account as a <strong style="color:${c.text};">${roleLabel}</strong>. Your sign-in details are below.</p>
                    </td>
                  </tr>

                  <!-- Account details -->
                  <tr>
                    <td style="padding:0 40px;">
                      <div style="font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${c.textMuted};margin-bottom:12px;">Your Sign-In Details</div>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.surface2};border:1px solid ${c.border};border-radius:10px;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding-bottom:4px;font-size:10.5px;font-weight:650;letter-spacing:.06em;text-transform:uppercase;color:${c.textMuted};">Email</td>
                              </tr>
                              <tr>
                                <td style="padding-bottom:14px;font-size:14.5px;font-weight:600;color:${c.text};">${escapeHtml(email)}</td>
                              </tr>
                              <tr>
                                <td style="padding-bottom:4px;font-size:10.5px;font-weight:650;letter-spacing:.06em;text-transform:uppercase;color:${c.textMuted};">Role</td>
                              </tr>
                              <tr>
                                <td>
                                  <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${c.goldSoft};color:${c.goldText};font-size:12.5px;font-weight:650;">${roleLabel}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Temp password — dark callout, echoing the header, since this is the one
                           piece of information the recipient actually needs to act on. -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.headerBg};border-radius:10px;margin-top:12px;">
                        <tr>
                          <td style="padding:20px;text-align:center;">
                            <div style="font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${c.gold};margin-bottom:9px;">Temporary Password</div>
                            <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:.06em;font-family:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace;">${escapeHtml(tempPassword)}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- CTA -->
                  <tr>
                    <td style="padding:30px 40px 0;" align="center">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="border-radius:999px;background-color:${c.gold};background-image:linear-gradient(135deg,${c.goldLight},${c.gold});">
                            <a href="${loginUrl}" style="display:inline-block;padding:15px 40px;font-size:14.5px;font-weight:700;color:${c.goldText};text-decoration:none;border-radius:999px;letter-spacing:.01em;">Sign in to Acquire Hub</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Security note -->
                  <tr>
                    <td style="padding:28px 40px 0;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.surface2};border-left:3px solid ${c.gold};border-radius:6px;">
                        <tr>
                          <td style="padding:14px 18px;">
                            <p style="margin:0 0 6px;font-size:12.5px;line-height:1.6;color:${c.textSecondary};">For security, you'll be required to create your own password the first time you sign in.</p>
                            <p style="margin:0;font-size:12.5px;line-height:1.6;color:${c.textSecondary};">Didn't expect this invitation? Contact your Acquire Hub administrator, or reach Support below.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:32px 40px 36px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${c.border};">
                        <tr>
                          <td style="padding-top:24px;">
                            <div style="font-size:13px;font-weight:700;color:${c.text};margin-bottom:4px;">ACQUIRE <span style="color:${c.gold};">HUB</span></div>
                            <p style="margin:0 0 14px;font-size:12px;line-height:1.6;color:${c.textMuted};">Find opportunity. Acquire with confidence. Scale your portfolio.</p>
                            <p style="margin:0;font-size:11.5px;line-height:1.7;color:${c.textMuted};">
                              <a href="${siteOrigin}" style="color:${c.textMuted};text-decoration:underline;">acquire-hub.com</a>
                              &nbsp;&middot;&nbsp;
                              Support: <a href="mailto:gabe@verticalstackaq.com" style="color:${c.textMuted};text-decoration:underline;">gabe@verticalstackaq.com</a>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
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
  const transport = buildTransport();
  const html = buildEmailHtml({ fullName, email, role, tempPassword, loginUrl });
  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "You're invited to Acquire Hub",
      html,
    });
  } catch (err) {
    throw new Error(err.message || 'Email send failed');
  }
}
