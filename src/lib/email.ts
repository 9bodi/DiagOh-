import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'OHé Diagnostic <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://diag-oh.vercel.app';

// ============================================================================
// PALETTE — Alignée sur globals.css (charte OHé)
// ============================================================================

const COLORS = {
  bg: '#F4F6FB',
  panel: '#FFFFFF',
  panelTint: '#EEF2FA',
  ink: '#15171C',
  muted: '#6A6E78',
  line: '#E2E8F0',
  accent: '#1E3A8A',
  accentDark: '#15296B',
  accentSoft: '#EEF2FA',
};

// ============================================================================
// TEMPLATE DE BASE — Header avec logo + footer RGPD unifié
// ============================================================================

interface EmailShellParams {
  subject: string;
  bodyHtml: string;
  rgpdContext: string;
}

function renderEmailShell({ subject, bodyHtml, rgpdContext }: EmailShellParams): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${subject}</title>
</head>
<body style="margin:0; padding:0; background:${COLORS.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:${COLORS.ink};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg}; padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%; max-width:560px; background:${COLORS.panel}; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(21,23,28,0.06);">

          <!-- HEADER : Logo -->
          <tr>
            <td style="background:${COLORS.panel}; padding:32px 32px 24px; text-align:center; border-bottom:1px solid ${COLORS.line};">
              <img src="${APP_URL}/img/logos/ohe-logo.png" alt="OHé" width="140" style="display:inline-block; height:auto; max-width:140px;">
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 32px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- SIGNATURE -->
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0; color:${COLORS.muted}; font-size:14px; line-height:1.6;">
                Bien cordialement,<br>
                <strong style="color:${COLORS.ink};">L'équipe OHé</strong>
              </p>
            </td>
          </tr>

          <!-- FOOTER RGPD -->
          <tr>
            <td style="background:${COLORS.panelTint}; padding:24px 32px; border-top:1px solid ${COLORS.line};">
              <p style="margin:0 0 12px; color:${COLORS.muted}; font-size:11px; line-height:1.6;">
                <strong style="color:${COLORS.ink};">Pourquoi cet email ?</strong><br>
                ${rgpdContext}
              </p>
              <p style="margin:0 0 12px; color:${COLORS.muted}; font-size:11px; line-height:1.6;">
                <strong style="color:${COLORS.ink};">Vos données personnelles</strong><br>
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation et de portabilité de vos données.
                Pour exercer ces droits, contactez-nous à
                <a href="mailto:rgpd@orthographe-heros.fr" style="color:${COLORS.accent}; text-decoration:none;">rgpd@orthographe-heros.fr</a>.
                Consultez notre
                <a href="${APP_URL}/politique-confidentialite" style="color:${COLORS.accent}; text-decoration:none;">politique de confidentialité</a>.
              </p>
              <p style="margin:0; padding-top:12px; border-top:1px solid ${COLORS.line}; color:${COLORS.muted}; font-size:10px; line-height:1.6; text-align:center;">
                <strong style="color:${COLORS.ink};">OHE FORMATION</strong> — SAS au capital de 10 000 €<br>
                12 rue des Carrières, 27110 Le Neubourg, France · SIREN 984 923 102<br>
                <a href="${APP_URL}/mentions-legales" style="color:${COLORS.muted}; text-decoration:underline;">Mentions légales</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}/politique-confidentialite" style="color:${COLORS.muted}; text-decoration:underline;">Confidentialité</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}/cgu" style="color:${COLORS.muted}; text-decoration:underline;">CGU</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ============================================================================
// UTILITAIRES
// ============================================================================

function renderButton(url: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="background:${COLORS.accent}; border-radius:999px;">
          <a href="${url}" style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-weight:600; font-size:15px; letter-spacing:0.01em;">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function renderInfoBox(label: string, value: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px; background:${COLORS.accentSoft}; border-radius:10px; width:100%;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; color:${COLORS.muted}; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; font-weight:600;">
            ${label}
          </p>
          <p style="margin:6px 0 0; color:${COLORS.ink}; font-size:16px; font-weight:600;">
            ${value}
          </p>
        </td>
      </tr>
    </table>
  `;
}

function formatDeadline(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(date)
    .replace(':', 'h');
}

// ============================================================================
// 1. MAGIC LINK — Invitation admin ou participant
// ============================================================================

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
    ? `Votre accès administrateur OHé Diagnostic — ${organizationName}`
    : `Vous êtes invité·e à passer le diagnostic OHé`;

  const introText = isAdmin
    ? `Vous avez été désigné·e <strong>administrateur·rice</strong> de l'organisation <strong>${organizationName}</strong> sur la plateforme OHé Diagnostic.`
    : `<strong>${organizationName}</strong> vous invite à passer le diagnostic OHé pour évaluer vos compétences en orthographe et en français.`;

  const ctaLabel = isAdmin ? 'Activer mon compte administrateur' : 'Commencer le diagnostic';

  const rgpdContext = isAdmin
    ? `Vous recevez cet email car <strong>${organizationName}</strong> vous a désigné·e comme administrateur·rice sur la plateforme OHé Diagnostic. Base légale : exécution du contrat entre OHE FORMATION et votre organisation.`
    : `Vous recevez cet email car <strong>${organizationName}</strong> vous a invité·e à passer un diagnostic d'orthographe sur la plateforme OHé Diagnostic. Base légale : exécution du contrat entre OHE FORMATION et votre organisation.`;

  const bodyHtml = `
    <h2 style="margin:0 0 16px; color:${COLORS.ink}; font-size:22px; font-weight:600;">Bonjour,</h2>
    <p style="margin:0 0 20px; color:${COLORS.ink}; font-size:15px; line-height:1.6;">
      ${introText}
    </p>
    <p style="margin:0 0 32px; color:${COLORS.ink}; font-size:15px; line-height:1.6;">
      Cliquez sur le bouton ci-dessous pour activer votre compte et créer votre mot de passe.
    </p>
    ${renderButton(magicLinkUrl, ctaLabel + ' →')}
    <p style="margin:32px 0 0; color:${COLORS.muted}; font-size:13px; line-height:1.6; text-align:center;">
      Ou copiez ce lien dans votre navigateur :<br>
      <a href="${magicLinkUrl}" style="color:${COLORS.accent}; word-break:break-all;">${magicLinkUrl}</a>
    </p>
    <p style="margin:24px 0 0; color:${COLORS.muted}; font-size:12px; line-height:1.6; text-align:center;">
      Ce lien expire dans 7 jours. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.
    </p>
  `;

  const html = renderEmailShell({ subject, bodyHtml, rgpdContext });

  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error('❌ Resend error (magic-link):', error);
      return { success: false, error: error.message };
    }
    console.log(`✅ Magic link email sent to ${to} (id: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('❌ Email exception (magic-link):', err);
    return { success: false, error: 'Email send failed' };
  }
}

// ============================================================================
// 2. TEST ACTIVATED — Test prêt à passer
// ============================================================================

interface SendTestActivatedParams {
  to: string;
  firstName: string | null;
  deadline: Date;
  organizationName: string;
  appUrl: string;
  passwordCreated?: boolean;
  magicLinkToken?: string | null;
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
      ? `Votre encadrant·e à <strong>${organizationName}</strong> a activé votre diagnostic d'orthographe. Créez votre compte pour commencer.`
      : `Votre encadrant·e à <strong>${organizationName}</strong> a activé votre diagnostic d'orthographe. Vous pouvez le passer dès maintenant.`;

  const subject = `Votre diagnostic OHé est disponible`;
  const rgpdContext = `Vous recevez cet email car votre encadrant·e à <strong>${organizationName}</strong> a activé votre diagnostic sur la plateforme OHé Diagnostic. Base légale : exécution du contrat entre OHE FORMATION et votre organisation.`;

  const bodyHtml = `
    <h2 style="margin:0 0 16px; color:${COLORS.ink}; font-size:22px; font-weight:600;">${greeting}</h2>
    <p style="margin:0 0 24px; color:${COLORS.ink}; font-size:15px; line-height:1.6;">
      ${introText}
    </p>
    ${renderInfoBox('Date limite de passage', formatDeadline(deadline))}
    <p style="margin:0 0 32px; color:${COLORS.ink}; font-size:15px; line-height:1.6;">
      Le diagnostic dure environ <strong>15 minutes</strong>. Une fois commencé, il ne peut pas être mis en pause.
    </p>
    ${renderButton(testUrl, ctaLabel)}
    <p style="margin:32px 0 0; color:${COLORS.muted}; font-size:13px; line-height:1.6; text-align:center;">
      Ou copiez ce lien dans votre navigateur :<br>
      <a href="${testUrl}" style="color:${COLORS.accent}; word-break:break-all;">${testUrl}</a>
    </p>
  `;

  const html = renderEmailShell({ subject, bodyHtml, rgpdContext });

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
// 3. REMINDER J-1 — Rappel 24h avant deadline
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
  const testUrl = `${appUrl}/welcome`;
  const subject = `Rappel — votre diagnostic OHé expire demain`;

  const rgpdContext = `Vous recevez cet email de rappel car votre diagnostic sur la plateforme OHé Diagnostic (organisation <strong>${organizationName}</strong>) n'a pas encore été complété et expire dans 24 heures. Base légale : exécution du contrat entre OHE FORMATION et votre organisation.`;

  const bodyHtml = `
    <h2 style="margin:0 0 16px; color:${COLORS.ink}; font-size:22px; font-weight:600;">${greeting}</h2>
    <p style="margin:0 0 24px; color:${COLORS.ink}; font-size:15px; line-height:1.6;">
      Petit rappel : votre diagnostic d'orthographe pour <strong>${organizationName}</strong> expire demain.
    </p>
    ${renderInfoBox('Date limite', formatDeadline(deadline))}
    <p style="margin:0 0 32px; color:${COLORS.ink}; font-size:15px; line-height:1.6;">
      Le diagnostic dure environ <strong>15 minutes</strong>. Passé la date limite, l'accès sera fermé et vous ne pourrez plus passer le test.
    </p>
    ${renderButton(testUrl, 'Passer mon diagnostic →')}
    <p style="margin:32px 0 0; color:${COLORS.muted}; font-size:13px; line-height:1.6; text-align:center;">
      Ou copiez ce lien dans votre navigateur :<br>
      <a href="${testUrl}" style="color:${COLORS.accent}; word-break:break-all;">${testUrl}</a>
    </p>
  `;

  const html = renderEmailShell({ subject, bodyHtml, rgpdContext });

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

// ============================================================================
// 4. PASSWORD RESET — Mot de passe oublié
// ============================================================================

interface SendPasswordResetParams {
  to: string;
  firstName: string | null;
  resetUrl: string;
}

export async function sendPasswordResetEmail({
  to,
  firstName,
  resetUrl,
}: SendPasswordResetParams) {
  const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,';
  const subject = `Réinitialisation de votre mot de passe OHé Diagnostic`;

  const rgpdContext = `Vous recevez cet email suite à une demande de réinitialisation de mot de passe pour votre compte OHé Diagnostic. Base légale : exécution du contrat vous liant à votre organisation.`;

  const bodyHtml = `
    <h2 style="margin:0 0 16px; color:${COLORS.ink}; font-size:22px; font-weight:600;">${greeting}</h2>
    <p style="margin:0 0 24px; color:${COLORS.ink}; font-size:15px; line-height:1.6;">
      Vous avez demandé à réinitialiser le mot de passe de votre compte OHé Diagnostic. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
    </p>
    ${renderButton(resetUrl, 'Réinitialiser mon mot de passe →')}
    <p style="margin:32px 0 0; color:${COLORS.muted}; font-size:13px; line-height:1.6; text-align:center;">
      Ou copiez ce lien dans votre navigateur :<br>
      <a href="${resetUrl}" style="color:${COLORS.accent}; word-break:break-all;">${resetUrl}</a>
    </p>
    <p style="margin:24px 0 0; color:${COLORS.muted}; font-size:12px; line-height:1.6; text-align:center;">
      Ce lien expire dans <strong>1 heure</strong>. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email — votre mot de passe restera inchangé.
    </p>
  `;

  const html = renderEmailShell({ subject, bodyHtml, rgpdContext });

  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error('❌ Resend error (password-reset):', error);
      return { success: false, error: error.message };
    }
    console.log(`✅ Password reset email sent to ${to} (id: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('❌ Email exception (password-reset):', err);
    return { success: false, error: 'Email send failed' };
  }
}

// ============================================================================
// 5. RESULTS AVAILABLE — Résultats disponibles au participant
// ============================================================================

interface SendResultsAvailableParams {
  to: string;
  firstName: string | null;
  organizationName: string;
  appUrl: string;
}

export async function sendResultsAvailableEmail({
  to,
  firstName,
  organizationName,
  appUrl,
}: SendResultsAvailableParams) {
  const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,';
  const resultsUrl = `${appUrl}/resultats`;
  const subject = `Vos résultats OHé Diagnostic sont disponibles`;

  const rgpdContext = `Vous recevez cet email car vous venez de terminer votre diagnostic sur la plateforme OHé Diagnostic (organisation <strong>${organizationName}</strong>). Base légale : exécution du contrat entre OHE FORMATION et votre organisation.`;

  const bodyHtml = `
    <h2 style="margin:0 0 16px; color:${COLORS.ink}; font-size:22px; font-weight:600;">${greeting}</h2>
    <p style="margin:0 0 24px; color:${COLORS.ink}; font-size:15px; line-height:1.6;">
      Bravo, vous avez terminé votre diagnostic d'orthographe. Vos résultats détaillés sont désormais disponibles sur votre espace personnel.
    </p>
    <p style="margin:0 0 32px; color:${COLORS.ink}; font-size:15px; line-height:1.6;">
      Vous pourrez y consulter votre score, votre niveau CECRL, l'analyse détaillée par bloc de compétence, et télécharger votre bilan complet en PDF ainsi que votre badge de certification.
    </p>
    ${renderButton(resultsUrl, 'Voir mes résultats →')}
    <p style="margin:32px 0 0; color:${COLORS.muted}; font-size:13px; line-height:1.6; text-align:center;">
      Ou copiez ce lien dans votre navigateur :<br>
      <a href="${resultsUrl}" style="color:${COLORS.accent}; word-break:break-all;">${resultsUrl}</a>
    </p>
  `;

  const html = renderEmailShell({ subject, bodyHtml, rgpdContext });

  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error('❌ Resend error (results-available):', error);
      return { success: false, error: error.message };
    }
    console.log(`✅ Results available email sent to ${to} (id: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('❌ Email exception (results-available):', err);
    return { success: false, error: 'Email send failed' };
  }
}

// ============================================================================
// 6. ADMIN COMPLETION — Notif admin qu'un participant a terminé
// ============================================================================

interface SendAdminCompletionParams {
  to: string;
  adminFirstName: string | null;
  participantName: string;
  participantEmail: string;
  organizationName: string;
  appUrl: string;
  cecrlLevel?: string | null;
}

export async function sendAdminCompletionEmail({
  to,
  adminFirstName,
  participantName,
  participantEmail,
  organizationName,
  appUrl,
  cecrlLevel = null,
}: SendAdminCompletionParams) {
  const greeting = adminFirstName ? `Bonjour ${adminFirstName},` : 'Bonjour,';
  const dashboardUrl = `${appUrl}/users`;
  const subject = `${participantName} a terminé son diagnostic OHé`;

  const rgpdContext = `Vous recevez cet email en tant qu'administrateur·rice de l'organisation <strong>${organizationName}</strong> sur la plateforme OHé Diagnostic, pour vous informer qu'un·e participant·e a complété son diagnostic. Base légale : exécution du contrat entre OHE FORMATION et votre organisation.`;

  const levelBadge = cecrlLevel
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px; background:${COLORS.accentSoft}; border-radius:10px; width:100%;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0; color:${COLORS.muted}; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; font-weight:600;">
              Niveau CECRL atteint
            </p>
            <p style="margin:6px 0 0; color:${COLORS.accent}; font-size:22px; font-weight:700;">
              ${cecrlLevel}
            </p>
          </td>
        </tr>
      </table>
    `
    : '';

  const bodyHtml = `
    <h2 style="margin:0 0 16px; color:${COLORS.ink}; font-size:22px; font-weight:600;">${greeting}</h2>
    <p style="margin:0 0 24px; color:${COLORS.ink}; font-size:15px; line-height:1.6;">
      <strong>${participantName}</strong> (${participantEmail}) vient de terminer son diagnostic d'orthographe sur la plateforme OHé Diagnostic.
    </p>
    ${levelBadge}
    <p style="margin:0 0 32px; color:${COLORS.ink}; font-size:15px; line-height:1.6;">
      Vous pouvez consulter le détail des résultats et télécharger le bilan complet depuis votre espace administrateur.
    </p>
    ${renderButton(dashboardUrl, 'Voir les résultats →')}
    <p style="margin:32px 0 0; color:${COLORS.muted}; font-size:13px; line-height:1.6; text-align:center;">
      Ou copiez ce lien dans votre navigateur :<br>
      <a href="${dashboardUrl}" style="color:${COLORS.accent}; word-break:break-all;">${dashboardUrl}</a>
    </p>
  `;

  const html = renderEmailShell({ subject, bodyHtml, rgpdContext });

  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error('❌ Resend error (admin-completion):', error);
      return { success: false, error: error.message };
    }
    console.log(`✅ Admin completion email sent to ${to} (id: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('❌ Email exception (admin-completion):', err);
    return { success: false, error: 'Email send failed' };
  }
}
