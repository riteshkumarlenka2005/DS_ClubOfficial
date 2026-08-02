import { v4 as uuidv4 } from 'uuid';

export function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')      // Remove special chars
    .replace(/[\s_]+/g, '-')        // Replace spaces with -
    .replace(/-+/g, '-')            // Remove consecutive -
    .replace(/^-|-$/g, '');         // Trim leading/trailing -

  // Add short unique suffix to prevent collisions
  const shortId = uuidv4().split('-')[0];

  return `${baseSlug}-${shortId}`;
}

