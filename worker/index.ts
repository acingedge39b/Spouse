import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { DatabaseService } from './db';
import { sendOtpEmailWithGmail } from './smtp';
import { RateLimiter } from './auth';

export interface Env {
  DB: D1Database;
  GMAIL_USER?: string;
  GMAIL_APP_PASSWORD?: string;
  GMAIL_FROM_NAME?: string;
  IRB_PROTOCOL?: string;
  ENVIRONMENT?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for local Vite and production domains
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Helper to extract client IP from Cloudflare or fallback
function getClientIp(c: any): string {
  return c.req.header('cf-connecting-ip') || 
         c.req.header('x-real-ip') || 
         c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 
         '127.0.0.1';
}

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    backend: 'cloudflare-workers-d1',
    timestamp: new Date().toISOString()
  });
});

// ----------------- OTP & PARTICIPANT AUTHENTICATION -----------------

// Send OTP with Rate Limiting (Max 3 OTP requests per 5 minutes per email/IP)
app.post('/api/otp/send', async (c) => {
  try {
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    if (!cleanEmail || !cleanEmail.endsWith('@gmail.com')) {
      return c.json({ 
        success: false, 
        error: 'Only @gmail.com email addresses are accepted for study verification.' 
      }, 400);
    }
    const clientIp = getClientIp(c);
    const limiter = new RateLimiter(c.env.DB);

    // Rate limit check: max 3 per 5 mins, block for 10 mins if abused
    const rateCheck = await limiter.check(`otp:${cleanEmail}:${clientIp}`, 3, 5 * 60 * 1000, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return c.json({
        success: false,
        error: `Rate limit reached. Too many passcode requests for this address. Please retry in ${rateCheck.retryAfterSeconds} seconds.`
      }, 429);
    }

    const db = new DatabaseService(c.env.DB);

    // Generate cryptographic 6-digit random code
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const code = (100000 + (array[0] % 900000)).toString();

    // Store in Cloudflare D1 with 10-minute expiry
    await db.saveOtp(cleanEmail, code, 10);

    const gmailUser = c.env.GMAIL_USER?.trim();
    const gmailAppPassword = c.env.GMAIL_APP_PASSWORD?.trim();
    const irbProtocol = c.env.IRB_PROTOCOL || 'IRB-2026-SP84';
    const fromName = c.env.GMAIL_FROM_NAME || 'PhD Qualitative Research Study';

    if (gmailUser && gmailAppPassword) {
      const result = await sendOtpEmailWithGmail(
        { user: gmailUser, appPassword: gmailAppPassword, fromName },
        { to: cleanEmail, subject: `Your Study Verification Passcode`, otpCode: code, irbProtocol }
      );

      if (!result.success) {
        console.error('Gmail SMTP Dispatch Error:', result.error);
        return c.json({ 
          success: false, 
          error: `Failed to deliver email through Gmail: ${result.error}. Please check your Gmail App Password.`
        }, 500);
      }

      return c.json({
        success: true,
        message: `Passcode sent to ${cleanEmail}. Please check your inbox or spam folder.`,
        expiresInMinutes: 10,
        remainingAttempts: rateCheck.remaining
      });
    } else {
      console.info(`[IRB RESEARCH SERVER LOG] Passcode generated for ${cleanEmail}: ${code}`);

      return c.json({
        success: true,
        message: `Single-use verification passcode dispatched to ${cleanEmail}. Please check your inbox or spam folder.`,
        expiresInMinutes: 10,
        remainingAttempts: rateCheck.remaining
      });
    }
  } catch (err: any) {
    console.error('Error in /api/otp/send:', err);
    return c.json({ success: false, error: err?.message || 'Internal server error' }, 500);
  }
});

// Verify OTP
app.post('/api/otp/verify', async (c) => {
  try {
    const { email, code } = await c.req.json<{ email: string; code: string }>();
    if (!email || !code) {
      return c.json({ success: false, error: 'Email and passcode are required.' }, 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();
    const db = new DatabaseService(c.env.DB);

    const check = await db.verifyOtp(cleanEmail, cleanCode);
    if (!check.valid) {
      return c.json({ success: false, error: check.reason || 'Invalid passcode.' }, 401);
    }

    // Save to verified users in D1
    const { user, token } = await db.saveVerifiedUser(cleanEmail);

    return c.json({
      success: true,
      message: 'Email successfully verified.',
      token,
      user
    });
  } catch (err: any) {
    console.error('Error in /api/otp/verify:', err);
    return c.json({ success: false, error: err?.message || 'Internal server error' }, 500);
  }
});

// ----------------- ADMIN AUTHENTICATION & RATE LIMITING -----------------

// Admin Login with Brute-Force Rate Limiting (Max 5 attempts per 15 minutes)
app.post('/api/admin/login', async (c) => {
  try {
    const { email, password } = await c.req.json<{ email: string; password: string }>();
    if (!email || !password) {
      return c.json({ success: false, error: 'Institutional email and password are required.' }, 400);
    }

    const clientIp = getClientIp(c);
    const cleanEmail = email.toLowerCase().trim();
    const limiter = new RateLimiter(c.env.DB);
    const db = new DatabaseService(c.env.DB);

    // Rate limit per IP: max 5 failed attempts per 15 mins, block for 15 mins
    const rateCheck = await limiter.check(`login:${clientIp}`, 5, 15 * 60 * 1000, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return c.json({
        success: false,
        error: `Too many failed login attempts from this network. Account access locked for ${Math.ceil(rateCheck.retryAfterSeconds / 60)} minutes to protect research records.`,
        retryAfterSeconds: rateCheck.retryAfterSeconds
      }, 429);
    }

    // Ensure default admin exists
    const defaultEmail = c.env.ADMIN_EMAIL || 'BakingLaw';
    const defaultPass = c.env.ADMIN_PASSWORD || 'LawPHD2026';
    await db.ensureDefaultAdmin(defaultEmail, defaultPass, 'BakingLaw (Lead Investigator)');

    // Verify credentials
    const admin = await db.verifyAdminCredentials(cleanEmail, password);
    if (!admin) {
      return c.json({
        success: false,
        error: `Invalid credentials. ${rateCheck.remaining} attempt(s) remaining before security lockout.`,
        remainingAttempts: rateCheck.remaining
      }, 401);
    }

    // Successful login: reset rate limit for this IP
    await limiter.reset(`login:${clientIp}`);

    // Create session token (valid for 24 hours)
    const token = await db.createAdminSession(admin.id, 24);

    return c.json({
      success: true,
      message: 'Authentication successful. Welcome, Investigator.',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err: any) {
    console.error('Error in /api/admin/login:', err);
    return c.json({ success: false, error: err?.message || 'Login failed.' }, 500);
  }
});

// Admin Me / Check Session
app.get('/api/admin/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return c.json({ authenticated: false }, 401);
    }

    const db = new DatabaseService(c.env.DB);
    const admin = await db.validateAdminSession(token);

    if (!admin) {
      return c.json({ authenticated: false }, 401);
    }

    return c.json({
      authenticated: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err: any) {
    return c.json({ authenticated: false, error: err?.message }, 500);
  }
});

// Admin Logout
app.post('/api/admin/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    if (token) {
      const db = new DatabaseService(c.env.DB);
      await db.revokeAdminSession(token);
    }
    return c.json({ success: true, message: 'Logged out successfully.' });
  } catch (err: any) {
    return c.json({ success: false, error: err?.message }, 500);
  }
});

// Admin Rate Limits inspection
app.get('/api/admin/rate-limits', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    const db = new DatabaseService(c.env.DB);
    const admin = await db.validateAdminSession(token || '');
    if (!admin) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const limiter = new RateLimiter(c.env.DB);
    const limits = await limiter.getAll();
    return c.json({ success: true, limits });
  } catch (err: any) {
    return c.json({ success: false, error: err?.message }, 500);
  }
});

// Admin Clear Rate Limits
app.post('/api/admin/rate-limits/clear', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    const db = new DatabaseService(c.env.DB);
    const admin = await db.validateAdminSession(token || '');
    if (!admin) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const limiter = new RateLimiter(c.env.DB);
    await limiter.clearAll();
    return c.json({ success: true, message: 'All rate-limiting security locks cleared.' });
  } catch (err: any) {
    return c.json({ success: false, error: err?.message }, 500);
  }
});

// ----------------- SUBMISSIONS -----------------

// Get all submissions
app.get('/api/submissions', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const submissions = await db.getAllSubmissions();
    return c.json({ success: true, submissions });
  } catch (err: any) {
    return c.json({ success: false, error: err?.message }, 500);
  }
});

// Save new submission
app.post('/api/submissions', async (c) => {
  try {
    const body = await c.req.json<{
      mediaType: 'video_blurred' | 'audio_only';
      mediaData?: string;
      mediaUrl?: string;
      durationSeconds: number;
      blurAlgorithm: string;
      promptNotes?: string;
      primaryPromptReflected?: string;
      fileSizeBytes?: number;
    }>();

    if (!body.mediaType || body.durationSeconds === undefined) {
      return c.json({ success: false, error: 'Incomplete submission parameters.' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    const created = await db.createSubmission(body);

    // If mediaData is present, chunk and store in submission_media_chunks
    if (body.mediaData) {
      const mediaUrl = `/api/submissions/${created.submission_code}/media`;
      const CHUNK_SIZE = 200000;
      const dataStr = body.mediaData;
      let chunkIdx = 0;
      for (let i = 0; i < dataStr.length; i += CHUNK_SIZE) {
        const chunk = dataStr.slice(i, i + CHUNK_SIZE);
        await db.saveMediaChunk(created.submission_code, chunkIdx++, chunk);
      }
      created.media_url = mediaUrl;
    }

    return c.json({
      success: true,
      submission: created,
      message: 'Submission and recorded media securely stored in database.'
    }, 201);
  } catch (err: any) {
    console.error('Error creating submission:', err);
    return c.json({ success: false, error: err?.message }, 500);
  }
});

// Stream recorded video or audio for playback directly from database
app.get('/api/submissions/:code/media', async (c) => {
  try {
    const code = c.req.param('code');
    const db = new DatabaseService(c.env.DB);
    const sub = await db.getSubmissionByCode(code);
    if (!sub) return c.text('Not found', 404);

    const chunks = await db.getMediaChunks(code);
    if (!chunks || chunks.length === 0) {
      if (sub.media_data) {
        const match = sub.media_data.match(/^data:(.*?);base64,(.*)$/);
        if (match) {
          const mime = match[1];
          const binStr = atob(match[2]);
          const len = binStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);
          return new Response(bytes, {
            headers: {
              'Content-Type': mime,
              'Content-Length': bytes.length.toString(),
              'Accept-Ranges': 'bytes',
              'Cache-Control': 'public, max-age=86400'
            }
          });
        }
      }
      return c.text('No recorded media stream found', 404);
    }

    const fullBase64 = chunks.map(chunk => chunk.chunk_data).join('');
    const match = fullBase64.match(/^data:(.*?);base64,(.*)$/);
    const mime = match ? match[1] : (sub.media_type === 'video_blurred' ? 'video/webm' : 'audio/webm');
    const b64Data = match ? match[2] : fullBase64;

    const binStr = atob(b64Data);
    const len = binStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }

    return new Response(bytes, {
      headers: {
        'Content-Type': mime,
        'Content-Length': bytes.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (err: any) {
    return c.text('Media playback error: ' + err?.message, 500);
  }
});

// Search submission by code
app.get('/api/submissions/:code', async (c) => {
  try {
    const code = c.req.param('code');
    const db = new DatabaseService(c.env.DB);
    const sub = await db.getSubmissionByCode(code);

    if (!sub) {
      return c.json({ success: false, error: 'Submission not found' }, 404);
    }

    return c.json({ success: true, submission: sub });
  } catch (err: any) {
    return c.json({ success: false, error: err?.message }, 500);
  }
});

// Update submission status (Admin action)
app.patch('/api/admin/submissions/:code/status', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    const db = new DatabaseService(c.env.DB);
    const admin = await db.validateAdminSession(token || '');
    if (!admin) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const code = c.req.param('code');
    const { status } = await c.req.json<{ status: string }>();
    const updated = await db.updateSubmissionStatus(code, status);

    if (!updated) {
      return c.json({ success: false, error: 'Submission not found' }, 404);
    }

    return c.json({ success: true, message: `Status updated to ${status}.` });
  } catch (err: any) {
    return c.json({ success: false, error: err?.message }, 500);
  }
});

// Unconditional withdrawal of submission (Participant or Admin)
app.delete('/api/submissions/:code', async (c) => {
  try {
    const code = c.req.param('code');
    const db = new DatabaseService(c.env.DB);
    const deleted = await db.deleteSubmissionByCode(code);

    if (!deleted) {
      return c.json({ success: false, error: 'Submission code not found in database.' }, 404);
    }

    return c.json({
      success: true,
      message: `Submission ${code.toUpperCase()} successfully and permanently purged from database.`
    });
  } catch (err: any) {
    return c.json({ success: false, error: err?.message }, 500);
  }
});

// Export CSV of IRB qualitative dataset
app.get('/api/admin/export/csv', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    const db = new DatabaseService(c.env.DB);
    const admin = await db.validateAdminSession(token || '');
    if (!admin) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const submissions = await db.getAllSubmissions();
    const headers = ['Submission Code', 'Media Type', 'Duration (Seconds)', 'Status', 'Blur Algorithm', 'Prompt', 'Notes', 'Submitted At'];
    const rows = submissions.map(s => [
      s.submission_code,
      s.media_type,
      s.duration_seconds,
      s.status,
      `"${(s.blur_algorithm || '').replace(/"/g, '""')}"`,
      `"${(s.primary_prompt_reflected || '').replace(/"/g, '""')}"`,
      `"${(s.prompt_notes || '').replace(/"/g, '""')}"`,
      s.submitted_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="irb-qualitative-dataset-${Date.now()}.csv"`
      }
    });
  } catch (err: any) {
    return c.json({ success: false, error: err?.message }, 500);
  }
});

// ----------------- APPOINTMENTS -----------------

// Get all appointments
app.get('/api/appointments', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const appointments = await db.getAllAppointments();
    return c.json({ success: true, appointments });
  } catch (err: any) {
    return c.json({ success: false, error: err?.message }, 500);
  }
});

// Book appointment
app.post('/api/appointments', async (c) => {
  try {
    const body = await c.req.json<{
      type: string;
      researcher: string;
      date: string;
      timeSlot: string;
      format: string;
      participantAlias: string;
      participantEmail?: string;
      focusArea?: string;
      notes?: string;
    }>();

    if (!body.date || !body.timeSlot || !body.participantAlias) {
      return c.json({ success: false, error: 'Required booking parameters missing.' }, 400);
    }

    if (body.participantEmail) {
      const cleanEmail = body.participantEmail.toLowerCase().trim();
      if (!cleanEmail.endsWith('@gmail.com')) {
        return c.json({ success: false, error: 'Only @gmail.com email addresses are accepted.' }, 400);
      }
    }

    const db = new DatabaseService(c.env.DB);
    const apt = await db.createAppointment(body);

    return c.json({
      success: true,
      appointment: apt,
      message: 'Appointment confirmed.'
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err?.message }, 500);
  }
});

// Update appointment status (Admin action)
app.patch('/api/admin/appointments/:code/status', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    const db = new DatabaseService(c.env.DB);
    const admin = await db.validateAdminSession(token || '');
    if (!admin) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const code = c.req.param('code');
    const { status } = await c.req.json<{ status: string }>();
    const success = await db.updateAppointmentStatus(code, status);

    if (!success) {
      return c.json({ success: false, error: 'Appointment not found' }, 404);
    }

    return c.json({ success: true, message: `Appointment status updated to ${status}.` });
  } catch (err: any) {
    return c.json({ success: false, error: err?.message }, 500);
  }
});

// Cancel appointment (Public cancellation)
app.patch('/api/appointments/:code/cancel', async (c) => {
  try {
    const code = c.req.param('code');
    const db = new DatabaseService(c.env.DB);
    const success = await db.cancelAppointment(code);

    if (!success) {
      return c.json({ success: false, error: 'Appointment code not found.' }, 404);
    }

    return c.json({ success: true, message: 'Appointment cancelled.' });
  } catch (err: any) {
    return c.json({ success: false, error: err?.message }, 500);
  }
});

// ----------------- CATHARSIS & STATS -----------------

// Log catharsis event
app.post('/api/catharsis', async (c) => {
  try {
    const { wordCount } = await c.req.json<{ wordCount: number }>();
    const db = new DatabaseService(c.env.DB);
    await db.logCatharsis(wordCount || 0);
    return c.json({ success: true, message: 'Cathartic release logged anonymously.' });
  } catch (err: any) {
    return c.json({ success: false, error: err?.message }, 500);
  }
});

// Audit stats
app.get('/api/audit/stats', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const stats = await db.getAuditStats();
    return c.json({ success: true, stats });
  } catch (err: any) {
    return c.json({ success: false, error: err?.message }, 500);
  }
});

// Get all verified users (for Investigator portal audit)
app.get('/api/auth/users', async (c) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const users = await db.getAllVerifiedUsers();
    return c.json({ success: true, users });
  } catch (err: any) {
    return c.json({ success: false, error: err?.message }, 500);
  }
});

export default app;
