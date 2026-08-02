import { OAuth2Client } from 'google-auth-library';
import { env } from './env';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export interface GoogleUserPayload {
  googleId: string;
  email: string;
  fullName: string;
  avatarUrl: string;
}

export async function verifyGoogleToken(
  idToken: string
): Promise<GoogleUserPayload> {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid token payload');
    }

    if (!payload.email) {
      throw new Error('Email not found in token');
    }

    // Domain restriction
    if (!payload.email.endsWith(`@${env.ALLOWED_DOMAIN}`)) {
      throw new Error(
        `Only @${env.ALLOWED_DOMAIN} emails are allowed`
      );
    }

    // Ensure email is verified by Google
    if (!payload.email_verified) {
      throw new Error('Email not verified by Google');
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      fullName: payload.name || 'Unknown User',
      avatarUrl: payload.picture || '',
    };
  } catch (error: any) {
    throw new Error(`Google token verification failed: ${error.message}`);
  }
}

