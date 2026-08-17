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
// ============================================================================
// TEST ACTIVATED — Email envoyé quand l'admin active le test d'un user
// ============================================================================

interface SendTestActivatedParams {
  to: string;
  firstName: string | null;
  deadline: Date;
  organizationName: string;
  appUrl: string;
  passwordCreated?: boolean;        // NOUVEAU
  magicLinkToken?: string | null;   // NOUVEAU
}

export async function sendTestActivatedEmail({
  to,
  firstName,
  deadline,
  organizationName,
  appUrl,
  passwordCreated = true,
  magicLinkToken = null,
}: SendTestActivatedParams) {
  const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,';
  const formattedDeadline = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(deadline)
    .replace(':', 'h');

  // Si le compte n'est pas encore activé, on envoie sur le magic-link
  // pour qu'il crée son mot de passe puis démarre le test immédiatement.
  const testUrl =
    !passwordCreated && magicLinkToken
      ? `${appUrl}/magic-link/${magicLinkToken}`
      : `${appUrl}/welcome`;

  const ctaLabel =
    !passwordCreated && magicLinkToken
      ? 'Créer mon compte et commencer →'
      : 'Commencer mon diagnostic →';

  const introText =
    !passwordCreated && magicLinkToken
      ? `Votre encadrant à <strong>${organizationName}</strong> a activé votre diagnostic orthographique. Créez votre compte pour commencer.`
      : `Votre encadrant à <strong>${organizationName}</strong> a activé votre diagnostic orthographique. Vous pouvez le passer dès maintenant.`;

  const subject = `Votre diagnostic OHé est disponible`;

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
              <h2 style="margin:0 0 16px; color:#0f172a; font-size:22px;">${greeting}</h2>
              <p style="margin:0 0 24px; color:#475569; font-size:15px; line-height:1.6;">
                ${introText}
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px; background:#f1f5f9; border-radius:8px; width:100%;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0; color:#64748b; font-size:12px; text-transform:uppercase; letter-spacing:0.08em; font-weight:600;">
                      Date limite de passage
                    </p>
                    <p style="margin:6px 0 0; color:#0f172a; font-size:16px; font-weight:600;">
                      ${formattedDeadline}
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 32px; color:#475569; font-size:15px; line-height:1.6;">
                Le diagnostic dure environ 15 minutes. Une fois commencé, il ne peut pas être mis en pause.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#2D3DB5; border-radius:8px;">
                    <a href="${testUrl}" style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-weight:bold; font-size:15px;">
                      ${ctaLabel}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:32px 0 0; color:#94a3b8; font-size:13px; line-height:1.6; text-align:center;">
                Ou copiez ce lien dans votre navigateur :<br>
                <a href="${testUrl}" style="color:#2D3DB5; word-break:break-all;">${testUrl}</a>
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
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error('❌ Resend error (test-activated):', error);
      return { success: false, error: error.message };
    }
    console.log(`✅ Test activation email sent to ${to} (id: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('❌ Email exception (test-activated):', err);
    return { success: false, error: 'Email send failed' };
  }
}
// ============================================================================
// REMINDER J-1 — Rappel envoyé 24h avant la deadline du test
// ============================================================================

interface SendReminderJ1Params {
  to: string;
  firstName: string | null;
  deadline: Date;
  organizationName: string;
  appUrl: string;
}

export async function sendReminderJ1Email({
  to,
  firstName,
  deadline,
  organizationName,
  appUrl,
}: SendReminderJ1Params) {
  const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,';
  const formattedDeadline = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(deadline)
    .replace(':', 'h');

  const testUrl = `${appUrl}/welcome`;
  const subject = `⏰ Rappel — votre diagnostic OHé expire demain`;

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
            <td style="background:#FF6B35; padding:32px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:bold;">
                OHé <span style="background:#ffffff; color:#FF6B35; padding:2px 8px; border-radius:4px; font-size:14px; vertical-align:middle;">DIAG</span>
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px; color:#0f172a; font-size:22px;">${greeting}</h2>
              <p style="margin:0 0 24px; color:#475569; font-size:15px; line-height:1.6;">
                Petit rappel : votre diagnostic orthographique <strong>${organizationName}</strong> expire demain.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px; background:#FFF7ED; border-left:4px solid #FF6B35; border-radius:8px; width:100%;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0; color:#9A3412; font-size:12px; text-transform:uppercase; letter-spacing:0.08em; font-weight:600;">
                      Date limite
                    </p>
                    <p style="margin:6px 0 0; color:#7C2D12; font-size:16px; font-weight:700;">
                      ${formattedDeadline}
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 32px; color:#475569; font-size:15px; line-height:1.6;">
                Le diagnostic dure environ 15 minutes. Passé la date limite, l'accès sera fermé et vous ne pourrez plus passer le test.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#2D3DB5; border-radius:8px;">
                    <a href="${testUrl}" style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-weight:bold; font-size:15px;">
                      Passer mon diagnostic →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:32px 0 0; color:#94a3b8; font-size:13px; line-height:1.6; text-align:center;">
                Ou copiez ce lien dans votre navigateur :<br>
                <a href="${testUrl}" style="color:#2D3DB5; word-break:break-all;">${testUrl}</a>
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
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error('❌ Resend error (reminder-j1):', error);
      return { success: false, error: error.message };
    }
    console.log(`✅ Reminder J-1 email sent to ${to} (id: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('❌ Email exception (reminder-j1):', err);
    return { success: false, error: 'Email send failed' };
  }
}
