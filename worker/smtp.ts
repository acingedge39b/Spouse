import { connect } from 'cloudflare:sockets';

export interface EmailOptions {
  to: string;
  subject: string;
  otpCode: string;
  senderName?: string;
  irbProtocol?: string;
}

export interface SmtpConfig {
  user: string;
  appPassword: string; // Google App Password (16 chars)
  fromName?: string;
}

/**
 * Sends OTP Email via Gmail SMTP (port 465 SSL/TLS) using Cloudflare Workers Sockets.
 * Runs completely on Cloudflare Free Tier with zero external third-party paid dependencies.
 */
export async function sendOtpEmailWithGmail(
  config: SmtpConfig,
  options: EmailOptions
): Promise<{ success: boolean; error?: string }> {
  const { user, appPassword, fromName = 'PhD Research Study - Spousal Pressure' } = config;
  const { to, otpCode, irbProtocol = 'IRB-2026-SP84' } = options;

  if (!user || !appPassword) {
    return {
      success: false,
      error: 'Gmail credentials not configured (GMAIL_USER or GMAIL_APP_PASSWORD missing)'
    };
  }

  const cleanAppPassword = appPassword.replace(/\s+/g, '');
  const boundary = '----=_Part_' + Math.random().toString(36).substring(2);

  const subject = `Your Verification Passcode: ${otpCode} [${irbProtocol}]`;

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 24px; color: #121212; }
    .card { max-width: 520px; margin: 0 auto; background: #FFFDF7; border: 2px solid #000000; border-radius: 16px; padding: 32px; box-shadow: 4px 4px 0px #000000; }
    .badge { display: inline-block; background-color: #FFE600; color: #121212; font-size: 11px; font-weight: 800; padding: 4px 10px; border: 1.5px solid #000000; border-radius: 6px; text-transform: uppercase; margin-bottom: 12px; }
    .code-box { background: #FFEFEA; border: 2px dashed #FF5A36; border-radius: 12px; text-align: center; padding: 20px; margin: 24px 0; }
    .code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #FF5A36; margin: 0; }
    .security-note { font-size: 12px; color: #666666; line-height: 1.5; background: #F3F4F6; border-radius: 8px; padding: 12px; margin-top: 20px; }
    .footer { text-align: center; font-size: 11px; color: #888888; margin-top: 24px; border-top: 1px solid #E5E7EB; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">IRB Protocol #${irbProtocol}</div>
    <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #121212;">Single-Use Verification Passcode</h2>
    <p style="margin: 0; font-size: 14px; color: #4B5563; line-height: 1.5;">
      You requested access to participate in the qualitative research study on marital pressures and coping mechanisms. Use this verification passcode to confirm your eligibility:
    </p>

    <div class="code-box">
      <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #9A3412; margin-bottom: 6px;">Your 6-Digit Passcode</div>
      <div class="code">${otpCode}</div>
      <div style="font-size: 11px; color: #78350F; margin-top: 6px;">Passcode expires in 10 minutes.</div>
    </div>

    <div class="security-note">
      <strong>Decoupled Privacy Guarantee:</strong>
      This email is used solely to prevent automated web bots. It is stored in an isolated verification table with <em>zero foreign keys</em> to your video/audio diaries.
    </div>

    <div class="footer">
      Doctoral Qualitative Research Project • University Institutional Review Board<br>
      24/7 Crisis Hotline: Call or text <strong>988</strong> if you are experiencing distress.
    </div>
  </div>
</body>
</html>`;

  const rawMessage = [
    `From: "${fromName.replace(/"/g, '')}" <${user}>`,
    `To: <${to}>`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    `PhD Qualitative Research Study (${irbProtocol})`,
    `Your Single-Use Verification Passcode: ${otpCode}`,
    `This passcode expires in 10 minutes.`,
    ``,
    `If you did not request this, please disregard this email.`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    htmlBody,
    ``,
    `--${boundary}--`,
    ``
  ].join('\r\n');

  let socket: any = null;

  try {
    // Connect directly to Gmail SMTP over TLS on port 465
    socket = connect(
      { hostname: 'smtp.gmail.com', port: 465 },
      { secureTransport: 'on' }
    );

    const reader = socket.readable.getReader();
    const writer = socket.writable.getWriter();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    let buffer = '';

    const readLine = async (): Promise<string> => {
      while (!buffer.includes('\n')) {
        const { value, done } = await reader.read();
        if (done) throw new Error('SMTP connection closed unexpectedly');
        buffer += decoder.decode(value, { stream: true });
      }
      const idx = buffer.indexOf('\n');
      const line = buffer.slice(0, idx + 1);
      buffer = buffer.slice(idx + 1);
      return line.trim();
    };

    const expectCode = async (expected: string | string[]): Promise<string> => {
      const allowed = Array.isArray(expected) ? expected : [expected];
      let line = '';
      while (true) {
        line = await readLine();
        const code = line.substring(0, 3);
        const sep = line.charAt(3);
        // multi-line response check: e.g. '250-...'
        if (sep === ' ' || line.length === 3) {
          if (!allowed.includes(code)) {
            throw new Error(`SMTP Error [Expected ${allowed.join('/')}]: ${line}`);
          }
          return line;
        }
      }
    };

    const sendCommand = async (cmd: string): Promise<void> => {
      await writer.write(encoder.encode(cmd + '\r\n'));
    };

    // 1. Initial greeting
    await expectCode('220');

    // 2. EHLO
    await sendCommand('EHLO localhost');
    await expectCode('250');

    // 3. AUTH LOGIN
    await sendCommand('AUTH LOGIN');
    await expectCode('334');

    // 4. Send Base64 Username
    await sendCommand(btoa(user));
    await expectCode('334');

    // 5. Send Base64 App Password
    await sendCommand(btoa(cleanAppPassword));
    await expectCode('235');

    // 6. MAIL FROM
    await sendCommand(`MAIL FROM:<${user}>`);
    await expectCode('250');

    // 7. RCPT TO
    await sendCommand(`RCPT TO:<${to}>`);
    await expectCode('250');

    // 8. DATA
    await sendCommand('DATA');
    await expectCode('354');

    // 9. Send Payload
    await sendCommand(rawMessage + '\r\n.');
    await expectCode('250');

    // 10. QUIT
    await sendCommand('QUIT');

    try {
      reader.releaseLock();
      writer.releaseLock();
      await socket.close();
    } catch {}

    return { success: true };
  } catch (err: any) {
    if (socket) {
      try {
        await socket.close();
      } catch {}
    }
    return { success: false, error: err?.message || String(err) };
  }
}
