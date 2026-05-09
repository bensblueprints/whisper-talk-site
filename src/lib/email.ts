import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || 'WisperTalk <licenses@advancedmarketing.co>';

export const resend = apiKey ? new Resend(apiKey) : null;

interface LicenseEmailProps {
  to: string;
  licenseKeys: string[];
  downloadUrl: string;
  amountCents: number;
  currency: string;
}

export async function sendLicenseEmail({
  to,
  licenseKeys,
  downloadUrl,
  amountCents,
  currency
}: LicenseEmailProps) {
  if (!resend) {
    console.warn('Resend not configured — skipping email. Would have sent:', { to, licenseKeys });
    return { skipped: true };
  }

  const isMulti = licenseKeys.length > 1;
  const amount = (amountCents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  });

  const keysHtml = licenseKeys
    .map(
      (k) => `
          <div style="background:#06070d;border:1px solid #2a2d44;border-radius:10px;padding:18px 20px;margin-bottom:10px">
            <div style="font-family:'JetBrains Mono','SF Mono',Consolas,monospace;font-size:18px;color:#ff7a3a;letter-spacing:0.04em">
              ${k}
            </div>
          </div>`
    )
    .join('');

  const headline = isMulti
    ? `Welcome to</em> WisperTalk.`
    : `Welcome to</em> WisperTalk.`;
  const intro = isMulti
    ? `Thanks for buying. Your <strong>${licenseKeys.length}</strong> license keys are below — keep this email; it's the only place we'll send them. Each key activates one device.`
    : `Thanks for buying. Your license is below — keep this email; it's the only place we'll send it.`;

  const keysLabel = isMulti ? `License keys (${licenseKeys.length})` : 'License key';

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#06070d;font-family:'Manrope',-apple-system,'Segoe UI',sans-serif;color:#f4f1ea">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#06070d;padding:48px 16px">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;background:#0d0f1a;border:1px solid #171a2b;border-radius:14px;padding:32px">
        <tr><td>
          <div style="font-family:'Instrument Serif',Georgia,serif;font-size:36px;line-height:1.1;color:#f4f1ea;margin-bottom:8px">
            <em>${headline}
          </div>
          <p style="color:#9ea0b8;font-size:14px;line-height:1.6;margin:0 0 24px">
            ${intro}
          </p>

          <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6a6d85;margin-bottom:8px">${keysLabel}</div>
          ${keysHtml}

          <a href="${downloadUrl}" style="display:inline-block;background:#ff7a3a;color:#06070d;padding:14px 22px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:0.02em;margin-top:16px">
            Download WisperTalk →
          </a>

          <hr style="border:0;border-top:1px solid #171a2b;margin:32px 0" />

          <div style="font-size:13px;color:#9ea0b8;line-height:1.7">
            <strong style="color:#f4f1ea">How it works:</strong><br/>
            1. Install the app and open it.<br/>
            2. Paste ${isMulti ? 'a license key (one per device)' : 'your license key'} when prompted.<br/>
            3. Hold your hotkey and start dictating.<br/><br/>
            One key = one device at a time. To move a key to a new computer, deactivate the old one in the app's Settings → License panel.
          </div>

          <div style="font-size:12px;color:#6a6d85;margin-top:32px;padding-top:20px;border-top:1px solid #171a2b">
            Order: ${amount} · WisperTalk lifetime${isMulti ? ` · ${licenseKeys.length} licenses` : ''}<br/>
            Questions? Reply to this email.
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const keysText = licenseKeys.map((k, i) => (isMulti ? `${i + 1}. ${k}` : k)).join('\n');
  const text = `WisperTalk — ${isMulti ? `Your ${licenseKeys.length} license keys` : 'License key'}

${keysText}

Download: ${downloadUrl}

Open the app, paste ${isMulti ? 'a key (one per device)' : 'your key'} when prompted, and hold your hotkey to dictate. One key = one device at a time; you can move a key from the in-app License panel.

Order: ${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}.

Reply to this email if anything goes wrong.`;

  const subject = isMulti
    ? `Your ${licenseKeys.length} WisperTalk licenses`
    : `Your WisperTalk license — ${licenseKeys[0]}`;

  return resend.emails.send({ from, to, subject, html, text });
}
