import { Resend } from 'resend';

export interface SendOtpOptions {
  to: string;
  otp: string;
  expiresMinutes?: number;
}

export interface MailerResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Server-side mailer module for transactional emails via Resend.
 * Strictly server-side only: NEVER import in client bundle.
 */
export async function sendPasswordResetOtp({
  to,
  otp,
  expiresMinutes = 10,
}: SendOtpOptions): Promise<MailerResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const rawEmailFrom = process.env.EMAIL_FROM?.trim();
  const fromAddress = rawEmailFrom || 'EcoViG <no-reply@ecovig.net>';

  console.log(`[RESEND DIAGNOSTIC] RESEND_API_KEY_CONFIGURED: ${apiKey ? 'YES' : 'NO'}`);
  console.log(`[RESEND DIAGNOSTIC] EMAIL_FROM_CONFIGURED: ${rawEmailFrom ? 'YES' : 'NO'}`);
  console.log(`[RESEND DIAGNOSTIC] EMAIL_FROM: ${fromAddress}`);

  if (!apiKey) {
    console.error('[RESEND DIAGNOSTIC] RESEND_CALL_STARTED: NO (RESEND_API_KEY_MISSING)');
    return {
      success: false,
      error: 'RESEND_API_KEY_MISSING',
    };
  }

  if (!fromAddress) {
    console.error('[RESEND DIAGNOSTIC] RESEND_CALL_STARTED: NO (EMAIL_FROM_MISSING)');
    return {
      success: false,
      error: 'EMAIL_FROM_MISSING',
    };
  }

  try {
    console.log('[RESEND DIAGNOSTIC] RESEND_CALL_STARTED: YES');
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromAddress,
      to: to.toLowerCase().trim(),
      subject: 'Código de recuperación de EcoViG',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Código de recuperación de EcoViG</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 32px 16px; color: #111827;">
          <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
            <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">EcoViG</h1>
              <p style="margin: 4px 0 0 0; color: #d1fae5; font-size: 13px; font-weight: 500;">Plataforma de Vigilancia y Gestión Ecológica</p>
            </div>
            
            <div style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">Recuperación de contraseña</h2>
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en EcoViG.
              </p>
              
              <div style="margin: 28px 0; padding: 20px; background-color: #f9fafb; border: 2px dashed #059669; border-radius: 12px; text-align: center;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Tu código de verificación es:</p>
                <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #047857; font-family: 'Courier New', Courier, monospace;">
                  ${otp}
                </div>
              </div>
              
              <div style="margin-bottom: 24px; padding: 12px 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 500;">
                  ⏱️ Este código expirará en <strong>${expiresMinutes} minutos</strong>.
                </p>
              </div>

              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña actual no cambiará.
              </p>
              <p style="margin: 0; color: #ef4444; font-size: 12px; font-weight: 600;">
                ⚠️ No compartas este código con nadie por ningún motivo.
              </p>
            </div>
            
            <div style="padding: 20px 32px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                &copy; ${new Date().getFullYear()} EcoViG. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`[RESEND DIAGNOSTIC] RESEND_DATA_ID: ${result.data?.id ?? null}`);
    console.log(`[RESEND DIAGNOSTIC] RESEND_ERROR_NAME: ${result.error?.name ?? null}`);
    console.log(`[RESEND DIAGNOSTIC] RESEND_ERROR_MESSAGE: ${result.error?.message ?? null}`);

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      id: result.data?.id,
    };
  } catch (err: any) {
    console.error(`[RESEND DIAGNOSTIC] RESEND_EXCEPTION: ${err.name || 'Error'} - ${err.message}`);
    return {
      success: false,
      error: err.message || 'unknown_resend_error',
    };
  }
}

export interface SendDeletionVerificationOptions {
  to: string;
  userName: string;
  verificationToken: string;
  trackingId: string;
  expiresMinutes?: number;
}

/**
 * Server-side mailer for public account deletion verification link.
 * Strictly server-side only: NEVER import in client bundle.
 */
export async function sendAccountDeletionVerificationEmail({
  to,
  userName,
  verificationToken,
  trackingId,
  expiresMinutes = 30,
}: SendDeletionVerificationOptions): Promise<MailerResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const rawEmailFrom = process.env.EMAIL_FROM?.trim();
  const fromAddress = rawEmailFrom || 'EcoViG <no-reply@ecovig.net>';

  if (!apiKey) {
    console.error('[RESEND DELETION] RESEND_API_KEY is missing');
    return { success: false, error: 'RESEND_API_KEY_MISSING' };
  }

  const verifyUrl = `https://ecovig.net/eliminar-cuenta?token=${encodeURIComponent(verificationToken)}&tracking=${encodeURIComponent(trackingId)}`;

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromAddress,
      to: to.toLowerCase().trim(),
      subject: 'Confirmación de solicitud de eliminación de cuenta — EcoViG',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de solicitud de eliminación de cuenta</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 32px 16px; color: #111827;">
          <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
            <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">EcoViG</h1>
              <p style="margin: 4px 0 0 0; color: #d1fae5; font-size: 13px; font-weight: 500;">Plataforma de Vigilancia y Gestión Ecológica</p>
            </div>
            
            <div style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 700;">Solicitud de Eliminación de Cuenta</h2>
              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Hola <strong>${userName}</strong>, recibimos una solicitud desde la página web pública de EcoViG para eliminar tu cuenta y los datos personales asociados.
              </p>
              
              <div style="margin: 24px 0; padding: 16px; background-color: #fef2f2; border: 1px solid #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px;">
                <p style="margin: 0; color: #991b1b; font-size: 13px; font-weight: 600;">
                  ⚠️ Atención: La eliminación de tu cuenta borrará permanentemente tu usuario en Firebase, tus evidencias, progreso y registros personales.
                </p>
              </div>

              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Para verificar que eres el legítimo titular de esta cuenta y confirmar que deseas tramitar la eliminación, haz clic en el siguiente botón:
              </p>
              
              <div style="text-align: center; margin: 28px 0;">
                <a href="${verifyUrl}" style="background-color: #dc2626; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.25);">
                  Confirmar Eliminación de Mi Cuenta
                </a>
              </div>

              <div style="margin-bottom: 24px; padding: 12px 16px; background-color: #f9fafb; border-radius: 8px; font-size: 12px; color: #6b7280; line-height: 1.5;">
                <p style="margin: 0 0 4px 0;"><strong>Identificador de seguimiento:</strong> <code style="font-family: monospace; color: #111827;">${trackingId}</code></p>
                <p style="margin: 0;">⏱️ Este enlace de verificación es válido durante <strong>${expiresMinutes} minutos</strong>.</p>
              </div>

              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                Si tú no solicitaste eliminar tu cuenta, <strong>ignora este mensaje</strong>. Tu cuenta continuará activa y segura sin ningún cambio.
              </p>
            </div>
            
            <div style="padding: 20px 32px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                &copy; ${new Date().getFullYear()} EcoViG — Gestión de Privacidad y Cumplimiento de Políticas.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }
    return { success: true, id: result.data?.id };
  } catch (err: any) {
    console.error(`[RESEND DELETION EXCEPTION]:`, err.message);
    return { success: false, error: err.message || 'unknown_resend_error' };
  }
}

/**
 * Diagnostic Direct Test Runner
 */
export async function runDirectResendTest(): Promise<{
  dataId: string | null;
  errorName: string | null;
  errorMessage: string | null;
  success: boolean;
}> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const rawEmailFrom = process.env.EMAIL_FROM?.trim();
  const fromAddress = rawEmailFrom || 'EcoViG <no-reply@ecovig.net>';

  if (!apiKey) {
    return {
      dataId: null,
      errorName: 'MissingApiKey',
      errorMessage: 'RESEND_API_KEY is not configured in process.env',
      success: false,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromAddress,
      to: 'delivered@resend.dev',
      subject: 'EcoViG Resend Diagnostic Test',
      html: '<p>EcoViG Resend diagnostic test</p>',
    });

    return {
      dataId: result.data?.id ?? null,
      errorName: result.error?.name ?? null,
      errorMessage: result.error?.message ?? null,
      success: !!result.data?.id && !result.error,
    };
  } catch (err: any) {
    return {
      dataId: null,
      errorName: err.name || 'Exception',
      errorMessage: err.message || 'Unknown error occurred',
      success: false,
    };
  }
}
