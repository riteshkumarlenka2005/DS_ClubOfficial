import crypto from 'crypto';

const QR_SECRET = process.env.QR_SIGNING_SECRET || 'dsc-gietu-qr-secret-change-me';

export interface QRPayload {
  e: string;   // event_id
  x: number;   // expires_at (unix ms)
  s: string;   // HMAC signature
}

/**
 * Generate a signed QR payload for an event
 */
export function generateQRToken(eventId: string, expiresInMinutes: number = 60): QRPayload {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  const signature = crypto
    .createHmac('sha256', QR_SECRET)
    .update(`${eventId}:${expiresAt}`)
    .digest('hex');

  return {
    e: eventId,
    x: expiresAt,
    s: signature,
  };
}

/**
 * Verify a scanned QR payload
 */
export function verifyQRToken(payload: QRPayload): { valid: boolean; reason?: string; eventId?: string } {
  // Check expiration
  if (Date.now() > payload.x) {
    return { valid: false, reason: 'QR code has expired' };
  }

  // Verify signature
  const expected = crypto
    .createHmac('sha256', QR_SECRET)
    .update(`${payload.e}:${payload.x}`)
    .digest('hex');

  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(payload.s, 'hex')
    );

    if (!isValid) {
      return { valid: false, reason: 'Invalid QR signature' };
    }
  } catch {
    return { valid: false, reason: 'Invalid QR signature' };
  }

  return { valid: true, eventId: payload.e };
}
