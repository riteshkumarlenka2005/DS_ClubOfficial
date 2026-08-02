export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isAllowedDomain(
  email: string,
  domain: string
): boolean {
  return email.endsWith(`@${domain}`);
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/<[^>]*>/g, '');
}

export function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

