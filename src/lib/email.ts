import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'OHé Diag <onboarding@resend.dev>';

interface SendMagicLinkParams {
  to: string;
  magicLinkUrl: string;
  organizationName: string;
  recipientRole: 'ADMIN' | 'USER';
}

export async function sendMagicLinkEmail({
  to,
  magicLinkUrl,
  organizationName,
  recipientRole,
}: SendMagicLinkParams) {
  const isAdmin = recipientRole === 'ADMIN';

  const subject = isAdmin
    ? `Votre accès administrateur OHé Diag - ${organizationName}`
    : `Vous êtes invité à passer le diagnostic OHé`;

  const introText = isAdmin
    ? `Vous avez été désigné <strong>administrateur</strong> de l'organisation <strong>${organizationName}</strong> sur la plateforme OHé Diag.`
    : `<strong>${organizationName}</strong> vous invite à passer le diagnostic OHé pour évaluer vos compétences en orthographe et français.`;

  const ctaLabel = isAdmin ? 'Activer mon compte admin' : 'Commencer le diagnostic';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin:0; padding:0; background:#f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td style="background:#2D3DB5; padding:32px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:bold;">
                OHé <span style="background:#FF6B35; padding:2px 8px; border-radius:4px; font-size:14px; vertical-align:middle;">DIAG</span>
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px; color:#0f172a; font-size:22px;">Bonjour,</h2>
              <p style="margin:0 0 24px; color:#475569; font-size:15px; line-height:1.6;">
                ${introText}
              </p>
              <p style="margin:0 0 32px; color:#475569; font-size:15px; line-height:1.6;">
                Cliquez sur le bouton ci-dessous pour activer votre compte et créer votre mot de passe.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#2D3DB5; border-radius:8px;">
                    <a href="${magicLinkUrl}" style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-weight:bold; font-size:15px;">
                      ${ctaLabel} →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:32px 0 0; color:#94a3b8; font-size:13px; line-height:1.6; text-align:center;">
                Ou copiez ce lien dans votre navigateur :<br>
                <a href="${magicLinkUrl}" style="color:#2D3DB5; word-break:break-all;">${magicLinkUrl}</a>
              </p>
              <p style="margin:24px 0 0; color:#94a3b8; font-size:12px; text-align:center;">
                Ce lien expire dans 7 jours.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f1f5f9; padding:20px; text-align:center; color:#94a3b8; font-size:12px;">
              © OHé Diag · Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Email sent to ${to} (id: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('❌ Email exception:', err);
    return { success: false, error: 'Email send failed' };
  }
}
